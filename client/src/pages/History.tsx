/*
  DESIGN: "Blueprint Técnico" — histórico consolidado do Sandbox Framework.
  Linguagem de "archive record": linha do tempo editorial com fases à esquerda,
  decisões (DD-*) cruzadas às versões à direita, contadores mono na faixa de métricas.
  Papel quente, tinta grafite, acento verde-engineering, carimbos de versão.
*/
import { useState } from "react";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { AuditNote, PhaseStamp, TechRule } from "@/components/Primitives";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock, Share2 } from "lucide-react";
import { PHASES } from "@/lib/siteData";

/* Camada estrutural de cada fase homologada — espelha a topologia de plugins do framework:
   foundation (F1–F9), gameplay-base (F10–11: predição + suíte), gameplay-ext (F12–16: interação,
   inventário, stack, save, habilidades), presentation (F17: debugger), tools (F19: planejamento). */
type Layer = "todas" | "foundation" | "gameplay-base" | "gameplay-ext" | "presentation" | "tools";

const LAYERS: { id: Layer; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "foundation", label: "Foundation (F1–F9)" },
  { id: "gameplay-base", label: "Gameplay Base (F10–11)" },
  { id: "gameplay-ext", label: "Gameplay Ext (F12–16)" },
  { id: "presentation", label: "Presentation (F17)" },
  { id: "tools", label: "Tools (F19)" },
];

function layerOf(phase: number, status: string): Layer {
  if (phase <= 9) return "foundation";
  if (phase <= 11) return "gameplay-base";
  if (phase <= 16) return "gameplay-ext";
  if (status === "Em planejamento") return "tools"; // F19 em homologação
  return "presentation"; // F17 e F18
}

const TOC = [
  { id: "linha-do-tempo", label: "Linha do tempo de fases" },
  { id: "decisoes", label: "Decisões por versão" },
  { id: "metricas", label: "Métricas de homologação" },
  { id: "proximo", label: "Próximo passo: Fase 19" },
];

/* Fases 1–9: fundação do framework (antes do registro de homologação digital do site).
   Fases 10–18: registro completo em PHASES (siteData). F19: em planejamento. */
const FOUNDATION_PHASES = [
  { range: "01–04", title: "Foundation", text: "01_SandboxCommon, 02_SandboxInterfaces, 03_SandboxAssets, 04_SandboxCore — padrões Definition/Instance/RuntimeData, Message Router e matriz de interfaces.", version: "—", status: "Homologada por precedência" as const },
  { range: "05", title: "SandboxCharacter", text: "Movimento, câmera, animação, atributos, estado e habilidades com predição client-side + autoridade server-side.", version: "v1.1.x", status: "Homologada por precedência" as const },
  { range: "06–08", title: "Extensões de gameplay", text: "Combate, Interação e Inventário — desacoplados entre si, comunicando via Message Router e interfaces em 02_SandboxInterfaces.", version: "v1.2.x–v1.3.x", status: "Homologada por precedência" as const },
  { range: "09–11", title: "Presentation + Tools", text: "09_SandboxUI (stub até F18), 10_SandboxDebug (F17) e 11_SandboxEditor (editor-only).", version: "v1.7.0–v1.8.0", status: "Concluída" as const },
];

interface DDMilestone {
  id: string;
  version: string;
  title: string;
  page: string;
}

const DD_BY_VERSION: Record<string, DDMilestone[]> = {
  "v1.7.0": [
    { id: "DD-09", version: "v1.7.0", title: "Teste de isolamento por hide de módulos no UBT", page: "/decisoes#dd-09" },
    { id: "DD-10", version: "v1.7.0", title: "GDT expõe ISBDebugInterface — não estado interno", page: "/decisoes#dd-10" },
  ],
  "v1.8.0": [
    { id: "DD-01", version: "v1.8.0", title: "USBUIManager como ULocalPlayerSubsystem", page: "/decisoes#dd-01" },
    { id: "DD-02", version: "v1.8.0", title: "Auto-unsubscribe cirúrgico em NativeDestruct", page: "/decisoes#dd-02" },
    { id: "DD-03", version: "v1.8.0", title: "Payloads em SBEventPayloads.h (04_SandboxCore)", page: "/decisoes#dd-03" },
    { id: "DD-04", version: "v1.8.0", title: "Payloads como classes UObject (GC + Blueprint)", page: "/decisoes#dd-04" },
    { id: "DD-05", version: "v1.8.0", title: "Anti-spill obrigatório em todo widget", page: "/decisoes#dd-05" },
    { id: "DD-06", version: "v1.8.0", title: "Quatro eventos canônicos de inventário preservados", page: "/decisoes#dd-06" },
    { id: "DD-07", version: "v1.8.0", title: "Throttle de 60 Hz no progresso de interação", page: "/decisoes#dd-07" },
    { id: "DD-08", version: "v1.8.0", title: "Indicador de dano adiado para a Fase 19", page: "/decisoes#dd-08" },
    { id: "DD-12", version: "v1.8.0", title: "Header compacto com rótulos curtos de navegação", page: "/decisoes#dd-12" },
    { id: "DD-13", version: "v1.8.0", title: "Banner persistente de acesso por link direto", page: "/decisoes#dd-13" },
    { id: "DD-14", version: "v1.8.0", title: "Redesign de layout com referência fuch.ai", page: "/decisoes#dd-14" },
    { id: "DD-15", version: "v1.9.0 · planejada", title: "Atalhos de produtividade ⌘⇧C e compartilhamento de visualização", page: "/decisoes#dd-15" },
  ],
  "v1.9.0 · planejada": [
    { id: "DD-11", version: "v1.9.0 · planejada", title: "Deduplicação client-side do indicador de dano via AttackId", page: "/decisoes#dd-11" },
    { id: "DD-16", version: "v1.9.0 · planejada", title: "Portas de homologação com slots auditáveis (padrão reutilizável)", page: "/decisoes#dd-16" },
    { id: "DD-17", version: "v1.9.0 · planejada", title: "Divergência de escopo plano UMG vs. DD-08 — Rota A prevalece", page: "/decisoes#dd-17" },
    { id: "DD-18", version: "v1.9.0 · planejada", title: "Linha do Tempo & Roadmap como página permanente do site", page: "/decisoes#dd-18" },
  ],
};

const METRICS = [
  { value: "11", label: "plugins implementados · 0 em backlog" },
  { value: "32/32", label: "SBUITests verdes (F18)" },
  { value: "31/31", label: "specs verdes (F17)" },
  { value: "18", label: "decisões DD-* registradas" },
];

/* Persistência dos filtros — a visualização escolhida sobrevive ao recarregamento.
   Chaves namespaced (sbf-history-*) para não colidir com outros módulos do site. */
const LS_LAYER_KEY = "sbf-history-layer";
const LS_DDFILTER_KEY = "sbf-history-dd-filter";
const LAYER_IDS: Layer[] = ["todas", "foundation", "gameplay-base", "gameplay-ext", "presentation", "tools"];

function readStored<T extends string>(key: string, valid: T[], fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw && valid.includes(raw as T)) return raw as T;
  } catch {
    // storage indisponível — degrade silencioso
  }
  return fallback;
}

/* Filtro compartilhável via URL: ?layer=<id>&dd=<versão> espelham os filtros
   (prevalecem sobre localStorage na entrada; toda mudança reescreve a query
   sem poluir o histórico do navegador — replaceState, não push). */
function readUrlParams(): { layer: string | null; dd: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const layer = params.get("layer");
    const dd = params.get("dd");
    return { layer, dd };
  } catch {
    return { layer: null, dd: null };
  }
}

function writeUrlParams(layer: Layer, ddFilter: string | null) {
  try {
    const params = new URLSearchParams();
    if (layer !== "todas") params.set("layer", layer);
    if (ddFilter) params.set("dd", ddFilter);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  } catch {
    /* History API indisponível — persistência segue só em localStorage */
  }
}

export default function History() {
  const active = useActiveSection(TOC.map((t) => t.id));
  const urlParams = readUrlParams();
  const [layer, setLayer] = useState<Layer>(() =>
    readStored<Layer>(LS_LAYER_KEY, LAYER_IDS, urlParams.layer && LAYER_IDS.includes(urlParams.layer as Layer) ? (urlParams.layer as Layer) : "todas")
  );
  const foundationVisible = layer === "todas" || layer === "foundation";
  const ddVersions = Object.keys(DD_BY_VERSION);
  const [ddFilter, setDdFilter] = useState<string | null>(() => {
    const stored = readStored<string>(LS_DDFILTER_KEY, ["Todas as versões", ...ddVersions], "Todas as versões");
    // null explícito = filtro removido (localStorage.removeItem), "Todas as versões" = sem filtro ativo.
    try {
      const raw = localStorage.getItem(LS_DDFILTER_KEY);
      const storedValue: string | null = raw && ["Todas as versões", ...ddVersions].includes(raw) ? raw : null;
      if (urlParams.dd && (urlParams.dd === "Todas as versões" || ddVersions.includes(urlParams.dd))) return urlParams.dd;
      return storedValue;
    } catch {
      return stored;
    }
  });
  // Espelhar a seleção inicial (incluindo vinda da URL) de volta para localStorage e query.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const synced = layer !== readStored<Layer>(LS_LAYER_KEY, LAYER_IDS, "todas") || ddFilter !== null;
  if (synced) {
    try {
      localStorage.setItem(LS_LAYER_KEY, layer);
      if (ddFilter) localStorage.setItem(LS_DDFILTER_KEY, ddFilter);
      else localStorage.removeItem(LS_DDFILTER_KEY);
    } catch { /* storage indisponível — comportamento segue normal */ }
    writeUrlParams(layer, ddFilter);
  }

  const persistLayer = (next: Layer) => {
    try {
      localStorage.setItem(LS_LAYER_KEY, next);
    } catch {
      /* storage indisponível — comportamento segue normal */
    }
    setLayer(next);
    writeUrlParams(next, ddFilter);
  };
  const persistDd = (next: string | null) => {
    try {
      if (next) localStorage.setItem(LS_DDFILTER_KEY, next);
      else localStorage.removeItem(LS_DDFILTER_KEY);
    } catch {
      /* storage indisponível — comportamento segue normal */
    }
    setDdFilter(next);
    writeUrlParams(layer, next);
  };
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante (padrão fuch.ai) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(3.5rem, 12vw, 13rem)" }}>
            HISTÓRICO
          </span>
        </div>
        <div className="container relative py-12 lg:py-16 max-w-5xl">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 00 · consolidated archive
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="00" version="v1.8.0" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                registro consolidado · Vault ↔ site
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Linha do Tempo do{" "}
            <em className="not-italic text-engineering">Framework</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Fases homologadas, decisões cruzadas por versão e métricas de aceite — o arquivo
            único que conecta o Vault ao site.
          </p>
          {/* Faixa de métricas mono (mesmo padrão das demais páginas) */}
          <div className="mt-8 border border-border bg-card divide-y divide-border sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m, i) => (
              <div key={m.label} className="flex items-baseline gap-3 px-5 py-3">
                <span className="font-display text-3xl font-bold text-engineering tabular-nums">{m.value}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground leading-snug">{m.label}</span>
                {i < METRICS.length - 1 && <span className="hidden sm:block ml-auto h-8 w-px bg-border/70" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">
        <TechRule label="Arquivo consolidado" />

        {/* ========== L2: Linha do tempo ========== */}
        <h2 id="linha-do-tempo" className="mt-10 font-serif text-2xl font-bold scroll-mt-24">
          01 · Linha do tempo de fases
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          As fases 1–9 formam a fundação homologada por precedência (a base do site registra a partir da
          Fase 10); da Fase 10 em diante, cada homologação carrega versão, sumário e destaques verificáveis.
        </p>

        {/* Fundação (visível quando "Todas" ou "Foundation") */}
        {foundationVisible && (
        <div className="mt-6 space-y-3">
          {FOUNDATION_PHASES.map((f) => (
            <div key={f.range} className="border border-border bg-card">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-secondary/60">
                <span className="font-mono text-[11px] text-engineering">F {f.range} · {f.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {f.version}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
        )}
        {layer !== "todas" && layer !== "foundation" && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Fundação oculta pelo filtro ativo — <button type="button" onClick={() => persistLayer("foundation")} className="underline hover:text-engineering">ver fundação</button>
          </p>
        )}

        {/* Fases 10–18 + F19 */}
        <div className="mt-6 flex flex-wrap gap-2">
          {LAYERS.map((l) => {
            const count = l.id === "todas" ? PHASES.length : PHASES.filter((p) => layerOf(p.phase, p.status) === l.id).length;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => persistLayer(l.id)}
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 border transition-colors active:scale-[0.97] ${
                  layer === l.id
                    ? "border-engineering/60 bg-engineering/8 text-engineering"
                    : "border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering"
                }`}
              >
                {l.label} · {count}
              </button>
            );
          })}
          {/* Compartilhar visualização — copia a URL com os filtros atuais (?layer=&dd=) */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  toast("Visualização compartilhada", {
                    description: "URL com os filtros atuais copiada — quem abrir o link verá a mesma seleção.",
                  });
                })
                .catch(() => {
                  toast("Falha ao copiar", {
                    description: "O navegador bloqueou o acesso à área de transferência.",
                  });
                });
            }}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 border border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering transition-colors active:scale-[0.97] inline-flex items-center gap-2"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartilhar visualização
          </button>
        </div>
        <div className="mt-8 relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />
          <ul className="space-y-5">
            <AnimatePresence mode="popLayout">
            {PHASES.filter((p) => layer === "todas" || layerOf(p.phase, p.status) === layer).map((p) => (
              <motion.li
                key={p.phase}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="relative pl-8"
              >
                <span
                  className={`absolute left-0 top-1.5 h-[15px] w-[15px] border ${
                    p.status === "Em planejamento"
                      ? "border-amber-warn/70 bg-amber-warn/10"
                      : p.status === "Concluída"
                        ? "border-engineering bg-engineering/15"
                        : "border-muted-foreground/60 bg-muted/40"
                  }`}
                />
                <Link
                  href={p.phase === 17 ? "/fase-17" : p.phase === 18 ? "/fase-18" : p.phase === 19 ? "/fase-19" : "/"}
                  className="group block border border-border bg-card hover:border-engineering/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-secondary/60">
                    <span className="font-mono text-[11px] text-engineering">
                      F{p.phase} · {p.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {p.version}
                      </span>
                      <span
                        className={`font-mono text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 border ${
                          p.status === "Em planejamento"
                            ? "border-amber-warn/60 text-amber-warn"
                            : p.status === "Concluída"
                              ? "border-engineering/60 text-engineering"
                              : "border-muted-foreground/60 text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.summary}</p>
                    <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-[12px] text-foreground/80">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-engineering" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </motion.li>
            ))}
              {/* Nota paralela — execução UMG no editor (DD-17, fora do escopo da homologação v1.9.0) */}
              <motion.li
                className="relative pl-8"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="absolute left-0 top-1.5 h-[15px] w-[15px] border border-dashed border-muted-foreground/60 bg-muted/30" />
                <Link
                  href="/fase-19-umg"
                  className="group block border border-dashed border-border bg-secondary/40 hover:border-engineering/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60">
                    <span className="font-mono text-[11px] text-muted-foreground">Nota paralela · Widgets UMG</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] border border-dashed border-muted-foreground/60 px-1.5 py-0.5 text-muted-foreground">
                      execução no editor · DD-17
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Montagem e verificação PIE dos WBPs (WBP_StatusHUD, WBP_InteractionPrompt, WBP_AbilityBar,
                      WBP_InventoryGrid) — conteúdo paralelo que consome a infraestrutura da Fase 18 homologada,
                      sem alterar o escopo da homologação v1.9.0 (indicador de dano).
                    </p>
                  </div>
                </Link>
              </motion.li>
            </AnimatePresence>
          </ul>
        </div>

        {/* ========== L3: Decisões por versão ========== */}
        <TechRule label="Decisões cruzadas por versão" />

        <h2 id="decisoes" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          02 · Decisões DD-* por versão
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Cada decisão homologada nasce dentro de uma versão — o registro abaixo cruza as 18 decisões com
          as fases que as originaram. Decisões pendentes aparecem sempre no topo da listagem.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => persistDd(null)}
            className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 border transition-colors active:scale-[0.97] ${
              ddFilter === null
                ? "border-engineering/60 bg-engineering/8 text-engineering"
                : "border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering"
            }`}
          >
            Todas as versões · 14
          </button>
          {ddVersions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => persistDd(v)}
              className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 border transition-colors active:scale-[0.97] ${
                ddFilter === v
                  ? "border-engineering/60 bg-engineering/8 text-engineering"
                  : "border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering"
              }`}
            >
              {v} · {DD_BY_VERSION[v].length}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-6">
          <AnimatePresence mode="popLayout">
          {Object.entries(DD_BY_VERSION)
            .filter(([v]) => ddFilter === null || ddFilter === v)
            .map(([version, dds]) => (
            <motion.div
              key={version}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="border border-border bg-card"
            >
              <div className="px-4 py-2 border-b border-border bg-secondary/60 flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-engineering">{version}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {dds.length} {dds.length === 1 ? "decisão" : "decisões"}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {dds.map((d) => (
                  <li key={d.id}>
                    <Link href={d.page} className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent/60 transition-colors group">
                      <span className="font-mono text-[11px] text-engineering mt-0.5 shrink-0">{d.id}</span>
                      <span className="text-sm text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
                        {d.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 mt-1 ml-auto shrink-0 text-muted-foreground group-hover:text-engineering transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          </AnimatePresence>
          {ddFilter !== null && (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Filtrando {ddFilter} — <button type="button" onClick={() => persistDd(null)} className="underline hover:text-engineering">mostrar todas</button>
            </p>
          )}
        </div>

        <AuditNote tone="info">
          A cronologia é bidirecional: clicar em uma fase abre a página da fase; clicar em uma decisão abre
          o registro correspondente com âncora e banner de link direto. A Fase 19 (v1.9.0) permanece em
          planejamento — o próximo passo do arquivo está abaixo.
        </AuditNote>

        {/* ========== L4: Métricas de homologação ========== */}
        <TechRule label="Métricas de homologação" />

        <h2 id="metricas" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          03 · Métricas de homologação
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Números que fecham cada versão: specs verdes da suíte de automação, cenários da SBUITests e
          contagem de decisões. A Fase 19 elevará a suíte de 32 para 34 cenários (Cenários 7 e 8 de dano).
        </p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { value: "34/34", label: "SBUITests alvo da Fase 19" },
            { value: "32/32", label: "SBUITests — Fase 18 (31 + Cenário anti-spill)" },
            { value: "31/31", label: "Specs — Fase 17 (Exit Code 0)" },
            { value: "0", label: "bypasses de teste em produção (F11)" },
          ].map((m) => (
            <div key={m.label} className="border border-border bg-card px-5 py-4">
              <div className="font-display text-2xl font-bold text-engineering tabular-nums">{m.value}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground leading-snug">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* ========== L5: Próximo passo ========== */}
        <TechRule label="Próximo passo" />

        <h2 id="proximo" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          04 · Próximo passo: Fase 19
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          A Fase 19 (Indicador Direcional de Dano) está em planejamento — pré-requisitos homologados
          (DD-08, DD-03, DD-04, DD-05, DD-11) e escopo proposto documentado. A homologação exige o corpo
          real do código em C++, SBUITests 34/34 e teste de isolamento simétrico — nunca prosa.
        </p>
        <div className="mt-6 border border-dashed border-engineering/50 bg-engineering/[0.04] px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-warn" />
            <span className="text-sm text-muted-foreground">
              Status: <span className="font-mono text-[11px] text-amber-warn uppercase tracking-wider">em planejamento · aguardando execução</span>
            </span>
          </div>
          <Link
            href="/fase-19"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm font-mono hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            Abrir /fase-19 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Índice lateral (mesmo padrão numerado das páginas longas) */}
      <div className="container py-10 max-w-6xl -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Índice · Arquivo 00
              </div>
              <ul className="mt-3 space-y-2">
                {TOC.map((t, i) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={`text-sm transition-colors ${
                        active === t.id
                          ? "text-engineering font-semibold"
                          : "text-muted-foreground hover:text-engineering"
                      }`}
                    >
                      <span className="font-mono text-[10px] mr-2 text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
