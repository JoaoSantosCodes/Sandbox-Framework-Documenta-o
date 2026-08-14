# sync-audit.py — Mitigador C2 (Vault ↔ GitHub)

Script de auditoria contínua que detecta divergências entre o **Vault** (fonte de
verdade, `B01 PROJECTS\Sandbox_Framework` no Windows local) e o conteúdo homologado
publicado no repositório do site (`JoaoSantosCodes/Sandbox-Framework-Documenta-o`).

## Por que existe

O parecer técnico da v1.9.0-prep identificou o **"Manual Sync" (C2)** como a fraqueza
processual mais arriscada do projeto: nada impedia um carimbo de versão no site sem o
correspondente no Vault, ou vice-versa. Este script fecha o ciclo com verificação
mecânica antes de qualquer nova homologação, seguindo a regra do Manifesto:

> O Vault é a FONTE DE VERDADE. Divergência = site desatualizado. Sincronize o site
> ANTES de carimbar nova versão — e nunca aceite divergência como homologação.

## O que é comparado

| Documento do Vault | Espelho no site | Método |
|---|---|---|
| `manual_de_uso.md` | `Manual.tsx` (stamp `MNU · v…`) | Carimbo H1 do Vault vs phase-stamp da página |
| `walkthrough.md` | `History.tsx` | Maior versão do arquivo vs texto visível |
| `task.md` | snippets de Vault em `Phase18/19.tsx` | Cobertura lexical dos tokens |
| `00_Sandbox_Framework_Dashboard.md` | snippets de Vault em `Phase17/18/19.tsx` | Cobertura lexical |
| `implementation_plan.md` | planos embutidos em `Phase17/18/19.tsx` | Cobertura lexical |
| `sfdg_guide.md` | `Guide.tsx` (stamp `SFDG · v…`) | Carimbo H1 vs phase-stamp |
| `sfps_specification.md` | `Spec.tsx` (stamp `SFPS · v…`) | Carimbo H1 vs phase-stamp |
| `manifesto_and_coding_standards.md` | `Manifesto.tsx` (stamp `norma v1.0.0 · imutável`) | Carimbo H1 vs phase-stamp |

O diagnóstico usa três sinais, em ordem de confiança: (1) carimbo de versão do título
H1 do documento do Vault contra o phase-stamp da página; (2) cobertura lexical
(fração de tokens de 8+ caracteres do Vault presentes no texto visível da página);
(3) presença das páginas espelho no repositório. O relatório classifica cada documento
como `OK` ou `DIVERGENTE`, distinguindo "Vault avançou, site desatualizado" de
"site carimbado além do título do Vault — revisar título do Vault".

## Uso local

```bash
# Requer gh autenticado (o script usa a API do GitHub; fallback ao gh CLI)
python3 scripts/sync-audit.py                      # relatório texto
python3 scripts/sync-audit.py --json               # saída JSON (parseável por CI)
python3 scripts/sync-audit.py --fail-on-diff       # exit code != 0 se houver divergência
python3 scripts/sync-audit.py --vault /pasta/vault # caminho alternativo do Vault
```

Na janela WSL/Ubuntu: aponte `--vault` para o caminho do Junction do Vault
(`mnt/<letra>/B01 PROJECTS/Sandbox_Framework` ou cópia local) e o script roda
normalmente — o repositório é lido via HTTPS público, sem dependência do vault físico.

## Uso em CI (GitHub Actions)

Workflow sugerido em `.github/workflows/sync-audit.yml` (a criar):

```yaml
name: Sync Audit (Vault mirror)
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 9 * * 1,4"   # seg/qui 09:00 UTC
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: espelhar o Vault
        uses: actions/checkout@v4
        with:
          repository: JoaoSantosCodes/Sandbox-Framework-Vault   # repo espelho do Vault
          path: vault-mirror
      - name: auditoria
        run: python3 scripts/sync-audit.py --vault vault-mirror --fail-on-diff
```

Como o Vault real vive no Windows do usuário, o CI exige um **espelho de leitura** do
Vault em repositório privado (ou o upload dos `.md` via action de release). Em uso
manual, rode o script localmente **antes de qualquer commit de carimbo de versão**.

## Limiares e falsos positivos

A cobertura lexical usa limiar conservador de 8%: páginas de fase espelham os
documentos por resumo/snippet (não replicam o texto integral), então valores baixos
são esperados nesses modos. Carimbos divergentes entre títulos de Vault desatualizados
e site atualizado são reportados como "revisar título do Vault" — o Vault deve ser o
espelho mais recente, nunca o contrário.

## Manutenção

Ao adicionar uma nova página que espelhe um documento do Vault (nova fase, nova
decisão DD com efeito documental), atualize `DOC_PAGES` neste script — ele é o
contrato auditável da sincronização, no mesmo espírito da DD-16 (portas de
homologação com slots auditáveis).
