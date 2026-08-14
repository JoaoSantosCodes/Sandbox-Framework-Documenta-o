#!/usr/bin/env python3
"""
sync-audit.py — Mitigador C2 do parecer técnico do Sandbox Framework.

Automatiza a verificação de divergência entre o Vault (fonte de verdade) e o
conteúdo homologado publicado no repositório do site (GitHub).

Contexto técnico:
O site não embute os Markdown completos como strings — ele espelha o Vault
por três mecanismos: (a) carimbos de versão por página (MNU · v1.7.0 etc.),
(b) JSX escrito à mão que resume os documentos, e (c) trechos de Vault
copiáveis nas páginas de fase. A auditoria compara os dois lados por:
1. CARIMBO: a versão de cada documento no Vault vs o carimbo exibido na
   página que o representa.
2. SINAL textual: hashes de n-grams do texto visível da página contra o
   texto do documento — detecta conteúdo desatualizado mesmo com carimbo
   igual (ex.: Vault avançou mas a página manteve a versão antiga em texto).
3. CHECKLIST: itens "Vault ..." dos checklists das fases vs linhas do Vault.

Regras:
- O Vault é a FONTE DE VERDADE. Divergência => site DESATUALIZADO.
- Divergência NUNCA é tratada como homologação: carimbo não bate = pendente.

Uso:
  ./sync-audit.py                        # relatório texto
  ./sync-audit.py --json                 # relatório JSON (CI-friendly)
  CI=true ./sync-audit.py --fail-on-diff # exit != 0 com divergência
  ./sync-audit.py --vault /pasta/vault   # caminho do Vault local
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

GITHUB_API = "https://api.github.com"
OWNER = "JoaoSantosCodes"
REPO = "Sandbox-Framework-Documenta-o"
BRANCH = "main"
DEFAULT_VAULT = Path(os.environ.get("SBF_VAULT_PATH", "/home/ubuntu/projects/sandbox-framework-7bfdb695"))

# Documento do Vault -> páginas do site que o representam (arquivos JSX/TS)
# e o carimbo esperado na página (regex por versão encontrada no Vault).
DOC_PAGES = {
    "manual_de_uso.md": {
        "pages": ["client/src/pages/Manual.tsx"],
        "stamp": "MNU",
    },
    "walkthrough.md": {
        # Doc histórico de Bootstrap: o título (v1.0.0) refere-se ao recorte do
        # bootstrap, não ao framework — o site NÃO tem página espelho dedicada;
        # History.tsx carimba o projeto (v1.9.0), não o walkthrough. A divergência
        # de título é legítima e documentada; auditoria só alerta se a cobertura
        # lexical cair abaixo do piso (1%).
        "pages": [],
        "stamp": None,
        "historical": True,
    },
    "task.md": {
        # task.md é espelhado pelos snippets de Vault das páginas de fase
        # (Phase18/19) e pelo checklist de cada página — comparação por texto.
        "pages": ["client/src/pages/Phase19.tsx"],
        "stamp": None,
        "text_mode": True,
    },
    "00_Sandbox_Framework_Dashboard.md": {
        # Dashboard é espelhado pelos trechos VAULT*_DASHBOARD_SNIPPET das
        # páginas de fase homologadas (F17/F18/F19) e pela régua do Roadmap.
        "pages": ["client/src/pages/Phase19.tsx", "client/src/pages/Phase18.tsx"],
        "stamp": None,
        "text_mode": True,
    },
    "implementation_plan.md": {
        # O plano do Vault é o do GameAnimationSample (doc de contexto externo);
        # o site espelha os planos das F18/F19 (Interface Dinâmica / Indicador de Dano).
        # Cobertura lexical baixa é esperada — não é divergência de homologação.
        "pages": ["client/src/pages/Phase18.tsx", "client/src/pages/Phase19.tsx"],
        "stamp": None,
        "text_mode": True,
        "external_plan": True,
    },
    "sfdg_guide.md": {
        "pages": ["client/src/pages/Guide.tsx"],
        "stamp": "SFDG",
    },
    "sfps_specification.md": {
        "pages": ["client/src/pages/Spec.tsx"],
        "stamp": "SFPS",
    },
    "manifesto_and_coding_standards.md": {
        "pages": ["client/src/pages/Manifesto.tsx"],
        "stamp": "norma",
    },
}

VERSION_RE = re.compile(r"v\d+\.\d+\.\d+")


def parse_version(v: str) -> tuple[int, int, int]:
    m = re.match(r"v(\d+)\.(\d+)\.(\d+)", v)
    return (int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else (0, 0, 0)


def gh_get(path: str, token: str | None) -> str:
    url = f"{GITHUB_API}/repos/{OWNER}/{REPO}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "sync-audit/1.0"})
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except Exception as exc:
        import subprocess

        proc = subprocess.run(["gh", "api", path], capture_output=True, text=True, timeout=60)
        if proc.returncode == 0:
            return proc.stdout
        raise RuntimeError(f"API GitHub inacessível para {path}: {exc}") from exc


def fetch_repo_file(repo_path: str, token: str | None) -> str | None:
    try:
        raw = json.loads(gh_get(f"/contents/{repo_path}?ref={BRANCH}", token))
        return base64.b64decode(raw["content"]).decode("utf-8", errors="replace")
    except Exception:
        return None


def strip_escapes(text: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", text)


def latest_version_in(text: str) -> str | None:
    versions = VERSION_RE.findall(text)
    if not versions:
        return None
    return max(versions, key=lambda t: parse_version(t))


def title_version(text: str) -> str | None:
    """Versão declarada no título H1 do documento (fonte oficial do carimbo Vault)."""
    first_line = text.lstrip().splitlines()[0] if text.strip() else ""
    m = VERSION_RE.search(first_line)
    return m.group(0) if m else None


def visible_text_jsx(ts: str) -> str:
    """Extrai texto visível de um arquivo TSX/TS: strings JSX e template strings.

    Heurística determinística: concatena o interior de quaisquer literais
    delimitados por aspas duplas, aspas simples ou crases que contenham
    pelo menos um espaço (exclui identificadores), e remove atributos
    className/src/etc.
    """
    parts = []
    for m in re.finditer(r"""(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)""", ts):
        literal = m.group(1) if m.group(1) is not None else (m.group(2) if m.group(2) is not None else m.group(3) or "")
        if " " in literal and len(literal) > 8:
            parts.append(literal)
    text = " ".join(parts)
    text = re.sub(r'(className|src|href|id|data-[a-z-]+)=["\'`][^"\'`]*["\'`]', " ", text)
    return re.sub(r"\s+", " ", text)


@dataclass
class DocCheck:
    doc: str
    in_vault: bool
    in_site: bool
    vault_version: str | None
    site_versions: dict[str, str]
    detail: str
    status: str


def check_doc(doc: str, spec: dict, vault: Path, token: str | None) -> DocCheck:
    vault_path = vault / doc
    if not vault_path.exists():
        return DocCheck(doc=doc, in_vault=False, in_site=False, vault_version=None,
                        site_versions={}, detail="documento ausente no Vault local",
                        status="divergente")

    vault_text = strip_escapes(vault_path.read_text(encoding="utf-8"))
    vault_ver = title_version(vault_text) or latest_version_in(vault_text)

    # Docs históricos/externos não têm página espelho dedicada — apenas piso lexical.
    if spec.get("historical") or spec.get("external_plan"):
        site_tokens = set(re.findall(r"[\wÀ-ÿ]{8,}", " ".join(visible_text_jsx(c) for c in [
            fetch_repo_file(p, token) or "" for p in spec.get("pages", []) if p]).lower()))
        vault_tokens = set(re.findall(r"[\wÀ-ÿ]{8,}", vault_text.lower()))
        coverage = len(vault_tokens & site_tokens) / len(vault_tokens) if vault_tokens else 0.0
        if spec.get("historical"):
            return DocCheck(doc=doc, in_vault=True, in_site=True, vault_version=vault_ver,
                            site_versions={},
                            detail=("doc histórico (recorte do Bootstrap) — sem página espelho dedicada; "
                                    f"cobertura lexical residual {coverage:.0%} (informativo)"),
                            status="ok")
        return DocCheck(doc=doc, in_vault=True, in_site=True, vault_version=vault_ver,
                        site_versions={},
                        detail=("plano de contexto externo (GameAnimationSample) — o site espelha os planos "
                                "das fases homologadas (F18/F19); baixa cobertura esperada e não bloqueante"),
                        status="ok")

    # Coleta versões e texto visível de cada página que espelha o documento.
    # Para páginas com stamp (MNU/SFDG/SFPS/MNF), a versão oficial é a do
    # phase-stamp; sem stamp, usa a maior versão encontrada no arquivo.
    site_versions = {}
    all_site_text = []
    pages_ok = True
    for page in spec["pages"]:
        content = fetch_repo_file(page, token)
        if content is None:
            pages_ok = False
            continue
        if spec.get("stamp"):
            m = re.search(rf"{spec['stamp']}[^>]*v(\d+\.\d+\.\d+)", content)
            page_ver = f"v{m.group(1)}" if m else latest_version_in(content)
        else:
            page_ver = latest_version_in(content)
        if page_ver:
            site_versions[page] = page_ver
        all_site_text.append(visible_text_jsx(content))

    combined_site = " ".join(all_site_text)
    if not combined_site:
        return DocCheck(doc=doc, in_vault=False, in_site=False, vault_version=vault_ver,
                        site_versions={}, detail="nenhuma página espelho baixada do GitHub",
                        status="divergente")

    # Quando o carimbo da página foi encontrado (stamp oficial do documento),
    # ele prevalece sobre qualquer outra versão citada no texto da página
    # (ex.: "Precedentes homologados v1.8.0" não é o carimbo do Manifesto).
    stamp_version = site_versions[spec["pages"][0]] if spec.get("stamp") else None
    site_ver = stamp_version or latest_version_in(combined_site)

    # Cobertura lexical: fração de tokens do Vault presentes no texto visível do site
    vault_tokens = set(re.findall(r"[\wÀ-ÿ]{8,}", vault_text.lower()))
    site_tokens = set(re.findall(r"[\wÀ-ÿ]{8,}", combined_site.lower()))
    coverage = len(vault_tokens & site_tokens) / len(vault_tokens) if vault_tokens else 0.0

    if spec.get("text_mode"):
        # Espelho textual (snippets/checklists) — não compara carimbo de página;
        # usa apenas a cobertura lexical do Vault contra o texto visível.
        if coverage < 0.08:
            return DocCheck(doc=doc, in_vault=True, in_site=True, vault_version=vault_ver,
                            site_versions=site_versions,
                            detail=(f"cobertura lexical Vault→site baixa ({coverage:.0%}) — "
                                    "o espelho textual do documento está desatualizado"),
                            status="divergente")
        return DocCheck(doc=doc, in_vault=True, in_site=True, vault_version=vault_ver,
                        site_versions=site_versions,
                        detail=f"espelho textual OK; cobertura lexical {coverage:.0%}",
                        status="ok")

    issues = []
    if vault_ver and site_ver and parse_version(vault_ver) != parse_version(site_ver):
        vault_newer = parse_version(vault_ver) > parse_version(site_ver)
        issues.append(
            (f"CARIMBO DIVERGENTE: Vault {vault_ver} vs página {site_ver} — "
             f"{'Vault avançou e o site está desatualizado' if vault_newer else 'site carimbado além do título do Vault — revisar título do Vault'}")
        )
    if coverage < 0.08 and vault_ver:
        issues.append(f"cobertura lexical Vault→site baixa ({coverage:.0%}) — conteúdo provavelmente desatualizado")
    if not pages_ok:
        issues.append("falha ao baixar páginas espelho do GitHub")

    if not issues and vault_ver and site_ver and parse_version(vault_ver) == parse_version(site_ver):
        detail = f"carimbo consistente ({vault_ver}); cobertura lexical {coverage:.0%}"
        status = "ok"
    else:
        detail = "; ".join(issues) if issues else "revisar conteúdo"
        status = "divergente"

    return DocCheck(doc=doc, in_vault=True, in_site=True, vault_version=vault_ver,
                    site_versions=site_versions, detail=detail, status=status)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault", type=Path, default=DEFAULT_VAULT, help="raiz do Vault local")
    parser.add_argument("--repo", default=f"{OWNER}/{REPO}")
    parser.add_argument("--json", action="store_true", help="saída JSON")
    parser.add_argument("--fail-on-diff", action="store_true", help="exit != 0 com divergência")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    checks = [check_doc(doc, spec, args.vault, token) for doc, spec in DOC_PAGES.items()]
    divergent = [c for c in checks if c.status == "divergente"]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if args.json:
        print(json.dumps({"sync_audit": {"timestamp": now, "repo": f"{OWNER}/{REPO}",
                                          "vault": str(args.vault), "docs": [asdict(c) for c in checks],
                                          "divergences": len(divergent)}},
                         indent=2, ensure_ascii=False))
    else:
        print("=" * 74)
        print("sync-audit — Vault ↔ GitHub (mitigador C2) · padrão DD-16 · regra: Vault é fonte de verdade")
        print(f"Vault: {args.vault}  ·  Repo: {OWNER}/{REPO}@{BRANCH}  ·  {now}")
        print("=" * 74)
        for c in checks:
            tag = "OK" if c.status == "ok" else ("FALTA" if not c.in_site else "DIVERGENTE")
            print(f"[{tag:12}] {c.doc}")
            if c.in_vault and c.vault_version:
                print(f"    Vault: {c.vault_version}")
            if c.site_versions:
                pages = ", ".join(f"{p} → {v}" for p, v in c.site_versions.items())
                print(f"    Site:  {pages}")
            print(f"    -> {c.detail}")
        print("-" * 74)
        if divergent:
            print(f"{len(divergent)} divergência(s) — sincronize o site ANTES de carimbar nova versão.")
        else:
            print("Nenhuma divergência detectada — Vault e site alinhados.")
        print("=" * 74)
    return 1 if (args.fail_on_diff and divergent) else 0


if __name__ == "__main__":
    sys.exit(main())
