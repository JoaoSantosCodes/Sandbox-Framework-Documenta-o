/*
  Página /roadmap — Linha do Tempo & Roadmap do projeto Sandbox Framework.
  Estilo: Blueprint Técnico (DD-14): hero com wordmark gigante de fundo (Playfair Display),
  TOC lateral com useActiveSection + BackToTop, serif display para títulos, mono para dados,
  separadores 1px dotted, verde-engineering como assinatura e rust âmbar para bloqueantes/pendências.
*/
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Compass,
  Layers,
  Lock,
  Map,
  Paintbrush,
  Milestone,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { Link } from "wouter";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";

const TOC = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "linha-do-tempo", label: "Linha do tempo" },
  { id: "marcos", label: "Marcos homologados" },
  { id: "em-curso", label: "Em curso" },
  { id: "roadmap", label: "Roadmap" },
  { id: "riscos", label: "Riscos & mitigação" },
];

/* ------------------------------------------------------------------ */
/* Dados auditáveis — espelham a skill sandbox-framework-review       */


/* Slot auditável da F19 — usado na seção "Em curso" com status em tempo real. */
interface RoadmapSlot {
  slotKey: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
}

type MilestoneStatus = "done" | "active" | "planned";

interface Milestone {
  id: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  metric?: string;
  blocking?: boolean;
  href?: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "m-foundation",
    tag: "Foundation",
    date: "Início",
    title: "01–04 · Sandbox Foundation",
    description:
      "Common, Interfaces, Assets e Core — contratos de payload, Definition/Instance/RuntimeData e Behavior Stack genérico com FSBStackMutationGuard (RAII anti-reentrância).",
    status: "done",
    metric: "11 plugins · dependências unidirecionais",
  },
  {
    id: "m-character",
    tag: "Gameplay Base",
    date: "—",
    title: "05_SandboxCharacter",
    description:
      "Movimento, câmera, animação, atributos, estado e habilidades sobre USBBehaviorStackComponent — ExclusivityGroup, BlockedTags/RequiredTags, StackPriority.",
    status: "done",
    metric: "Predição client + autoridade server",
  },
  {
    id: "m-extensions",
    tag: "Extensions",
    date: "—",
    title: "06/07/08 · Combat · Interaction · Inventory",
    description:
      "Cada extensão depende só de 05_SandboxCharacter — comunicação via Message Router ou interfaces em 02_SandboxInterfaces, nunca por reflexão por string.",
    status: "done",
    metric: "Isolamento de compilação simétrico",
  },
  {
    id: "m-presentation",
    tag: "Presentation",
    date: "—",
    title: "09_SandboxUI · 10_SandboxDebug",
    description:
      "Presentation isolada do gameplay: UI via USBEventSubsystem + ULocalPlayerSubsystem (anti-spill) e Gameplay Debugger com ISBDebugInterface auto-descritiva.",
    status: "done",
    metric: "11/11 plugins implementados",
  },
  {
    id: "m-f17",
    tag: "v1.7.0",
    date: "Fase 17",
    title: "Gameplay Debugger concluído",
    description:
      "Desacoplamento de compilação absoluto do debugger contra personagens, armas e inventários. Suíte 31/31 specs verdes.",
    status: "done",
    metric: "31/31 · Exit 0",
  },
  {
    id: "m-f18",
    tag: "v1.8.0",
    date: "Fase 18",
    title: "Interface Dinâmica em 09_SandboxUI",
    description:
      "Payloads UObject em 04_SandboxCore, auto-unsubscribe em NativeDestruct, resolução multi-HUD nativa via ULocalPlayerSubsystem e anti-spill de escopo.",
    status: "done",
    metric: "32/32 · Exit 0",
  },
  {
    id: "m-dds",
    tag: "DD-01…DD-20",
    date: "Contínuo",
    title: "Registro de Decisões de design",
    description:
      "Decisões homologadas do manifesto ao redesign fuch.ai: simetria Exit, anti-reflexão por string, DD-11 AttackId, portas de homologação (DD-16), divergência de escopo auditável (DD-17), o padrão da página de linha do tempo & roadmap (DD-18), o contrato da persistência transacional (DD-19) e as pendências como fonte única do backlog de fases (DD-20).",
    status: "done",
    metric: "20 decisões · 17 homologadas",
  },
  {
    id: "m-site",
    tag: "Site",
    date: "Contínuo",
    title: "Documentação viva + deploy independente",
    description:
      "Site React/Tailwind com busca ⌘K, checklists, linha do tempo, slots auditáveis, vercel.json e repositório GitHub sincronizado.",
    status: "done",
    metric: "sandboxdocs-c9yezybu.manus.space",
  },
  {
    id: "m-f19",
    tag: "v1.9.0",
    date: "Fase 19",
    title: "Integração e Replicação no GameAnimationSample",
    description:
      "Portabilidade oficial homologada no Vault (14/08/2026): módulo C++ nativo com Target.cs, 11 plugins habilitados no .uproject, 241 passos de compilação UBT e suíte 32/32 verde no contexto integrado.",
    status: "done",
    metric: "32/32 · Exit 0",
  },
  {
    id: "m-pend",
    tag: "Vault",
    date: "Contínuo",
    title: "Pendências de fases consolidadas",
    description:
      "Documento oficial pendencias_de_fases.md no Vault: propostas sem corpo real (dano · P-1, persistência transacional · P-2), backlog de frentes (UMG · P-3, rede · P-4, polimento · P-5/P-6) e specs normativas desatualizadas (P-7). Nada entra na régua sem build + suíte + isolamento.",
    status: "active",
    metric: "7 pendências · 0 homologadas",
    blocking: true,
  },
];

type StatusFilter = "all" | "done" | "active" | "planned";

const FILTER_META: Record<StatusFilter, { label: string; counter: (n: number) => string }> = {
  all: { label: "Todas", counter: (n) => `${n} marcos` },
  done: { label: "Concluído", counter: (n) => `${n} homologados` },
  active: { label: "Em curso", counter: (n) => `${n} ativos` },
  planned: { label: "Planejado", counter: (n) => `${n} planejados` },
};

/* ------------------------------------------------------------------ */

const STATUS_META: Record<MilestoneStatus, { label: string; color: string }> = {
  done: { label: "Homologado", color: "text-engineering" },
  active: { label: "Em homologação", color: "text-warning" },
  planned: { label: "Planejado", color: "text-muted-foreground" },
};

function StatusBadge({ status }: { status: MilestoneStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${meta.color}`}>
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === "done"
            ? "bg-engineering"
            : status === "active"
              ? "bg-warning animate-pulse"
              : "bg-muted-foreground"
        }`}
      />
      {meta.label}
    </span>
  );
}

/* Seção "Em curso" — pendências oficiais do Vault (pendencias_de_fases.md).
   Não há slots de homologação ativos (nenhuma fase com corpo real em execução). */
const ROADMAP_SLOTS: RoadmapSlot[] = [
  {
    slotKey: "P-3 · Montagem UMG",
    icon: <Paintbrush className="h-4 w-4" />,
    title: "P-3 · Widget Blueprints no UMG Designer",
    detail: "Backing classes C++ do 09_SandboxUI + WatchedAbilityTag",
  },
  {
    slotKey: "P-4 · Segurança de rede",
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "P-4 · RPC Rate-Limiting & Anti-cheat",
    detail: "Validação de distância e posse no frame exato da RPC",
  },
  {
    slotKey: "P-5 · Polimento de gameplay",
    icon: <Layers className="h-4 w-4" />,
    title: "P-5 · Status Effects & Lag Compensation",
    detail: "Buff/debuff genérico + rewind de rede para hitscan",
  },
  {
    slotKey: "P-7 · Specs normativas",
    icon: <TerminalSquare className="h-4 w-4" />,
    title: "P-7 · Specs atualizadas (DD-09…DD-19)",
    detail: "SFPS/SFDG/Manifesto: carimbar versão nova",
  },
];

/* Banner de contexto: F19 oficial concluída no Vault — a régua reflete o estado homologado. */
function RoadmapCompletionBanner() {
  return (
    <div className="mb-6 border border-engineering/60 bg-engineering/[0.06] px-4 py-3">
      <div className="flex items-start gap-3">
        <Check className="h-4 w-4 mt-0.5 shrink-0 text-engineering" />
        <div className="text-sm leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering block mb-1">
            v1.9.0 homologada no Vault oficial · 32/32 · Exit 0
          </span>
          <span className="text-muted-foreground">
            A Fase 19 (Integração e Replicação no GameAnimationSample) está concluída no cofre
            Obsidian — fonte oficial do projeto. <strong>Nenhuma fase entra na régua</strong> sem
            build UBT Exit 0 + suíte verde + isolamento simétrico, conforme as regras de
            homologação em pendencias_de_fases.md.
          </span>
        </div>
      </div>
    </div>
  );
}


function RoadmapSlotRow({ row, index }: { row: RoadmapSlot; index: number }) {
  /* Pendências do Vault — não há formulário de submissão; estado sempre "Pendente". */
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${index > 0 ? "border-t border-dotted" : ""}`}>
      <span className="text-warning">{row.icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium">{row.title}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{row.detail}</div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-warning animate-pulse">
        Pendente
      </span>
    </div>
  );
}

function RoadmapInProgress() {
  const [submittedCount, _setSubmittedCount] = useState(0);
  return (
    <section id="em-curso" className="scroll-mt-24 mt-14">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="font-display text-3xl font-bold">Em curso</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Pendências do Vault oficial
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        A Fase 19 (Integração no GameAnimationSample) foi concluída no Vault oficial — não há
        fase com corpo real em execução. As linhas abaixo vêm do documento
        <code className="mx-1 border border-dotted px-1 py-0.5 font-mono text-[11px]">pendencias_de_fases.md</code>
        e avançam somente com build UBT Exit 0 + suíte verde + isolamento simétrico.
      </p>
      <div className="mt-6 space-y-0 border border-border">
        {ROADMAP_SLOTS.map((row, i) => (
          <RoadmapSlotRow key={row.slotKey} row={row} index={i} />
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-2 border border-dotted border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        4 de 7 pendências do Vault em foco na régua ·
        P-1 (dano) e P-2 (persistência) seguem como rascunhos fora da régua numerada
      </div>
    </section>
  );
}

export default function Roadmap() {
  const activeId = useActiveSection(TOC.map((t) => t.id));
  const [copiedRoute, setCopiedRoute] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCopiedRoute(false), 2000);
    return () => clearTimeout(t);
  }, [copiedRoute]);

  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const saved = localStorage.getItem("sbf-roadmap-filter") as StatusFilter | null;
    if (saved && FILTER_META[saved]) setFilter(saved);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("sbf-roadmap-filter", filter);
    } catch {
      /* ignorado */
    }
  }, [filter]);

  const filteredMilestones = MILESTONES.filter((m) =>
    filter === "all" ? true : m.status === filter,
  );

  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home/F18) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}>
            ROADMAP
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            doc. timeline · project history &amp; roadmap
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Linha do Tempo &amp; <em className="not-italic text-engineering">Roadmap</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Consolidação auditável do caminho dos 11 plugins UE5.8 C++, das versões homologadas
            (v1.7.0 · v1.8.0), das decisões de design (DD-01…DD-20) e do que se desbloqueia na v1.9.0.
          </p>
        </div>
      </section>
      <RoadmapCompletionBanner />
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        {/* TOC lateral */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Índice
            </div>
            <nav className="mt-4 flex flex-col">
              {TOC.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    history.replaceState(null, "", `#${item.id}`);
                  }}
                  className={`flex items-baseline gap-3 border-b border-dotted py-2.5 text-xs transition-colors ${
                    activeId === item.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          {/* Visão geral */}
          <section id="visao-geral" className="scroll-mt-24">
            <h2 className="font-display text-3xl font-bold">
              O projeto em uma página — de Foundation a v1.9.0
            </h2>
            <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                A linha do tempo abaixo consolida o caminho dos 11 plugins UE5.8 C++, das versões
                homologadas (v1.7.0 · v1.8.0 · v1.9.0) e das decisões de design (DD-01…DD-20) até
                o estado atual — a <b className="text-engineering">Fase 19 concluída</b> no Vault
                oficial (Obsidian), com a portabilidade do GameAnimationSample.
              </p>
              <p>
                O roadmap oficial é o backlog de pendências do Vault (pendencias_de_fases.md):
                as frentes de polimento UMG, segurança de rede e lag compensation, além das
                propostas de dano e persistência transacional — que seguem como rascunhos até
                receberem corpo real de código homologado (padrão DD-16).
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border">
              {[
                { label: "Plugins", value: "11/11", detail: "implementados" },
                { label: "Versões", value: "v1.9.0", detail: "homologada" },
                { label: "Decisões DD", value: "19", detail: "registradas" },
                { label: "Próxima", value: "P-3…P-6", detail: "backlog do Vault" },
              ].map((s) => (
                <div key={s.label} className="bg-background px-4 py-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-engineering">
                    {s.value}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{s.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Linha do tempo */}
          <section id="linha-do-tempo" className="scroll-mt-24 mt-14">
            <h2 className="font-display text-3xl font-bold">Linha do tempo</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
              Marcos em ordem de execução. A régua é qualitativa (não cronológica) — cada marco
              só avança com prova de engenharia: build Exit 0 + suíte verde + isolamento simétrico.
              Use os filtros abaixo para isolar por status.
            </p>

            {/* Filtros de status */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {(Object.keys(FILTER_META) as StatusFilter[]).map((key) => {
                const n = MILESTONES.filter((m) => (key === "all" ? true : m.status === key)).length;
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors active:scale-[0.97] ${
                      active
                        ? "border-engineering text-engineering bg-engineering/[0.06]"
                        : "border-border text-muted-foreground hover:border-engineering/50 hover:text-foreground"
                    }`}
                  >
                    {FILTER_META[key].label}
                    <span className={active ? "text-engineering" : "text-border"}>{n}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative mt-10 pl-8">
              {/* régua vertical */}
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border border-l border-dashed" />
              <div className="flex flex-col">
                {filteredMilestones.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">
                    Nenhum marco com o status “{FILTER_META[filter].label.toLowerCase()}” — ajuste
                    o filtro acima.
                  </p>
                )}
                {filteredMilestones.map((m) => (
                  <div key={m.id} className="relative py-5">
                    <div
                      className={`absolute -left-8 top-7 h-[15px] w-[15px] rounded-full border-2 ${
                        m.status === "done"
                          ? "bg-background border-engineering"
                          : m.status === "active"
                            ? "bg-warning border-warning"
                            : "bg-background border-muted-foreground"
                      }`}
                    />
                    <div
                      className={`border-b border-dotted pb-5 ${
                        m.blocking ? "border-warning/50" : "border-border"
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-[11px] text-muted-foreground">{m.date}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-engineering">
                          {m.tag}
                        </span>
                        <StatusBadge status={m.status} />
                      </div>
                      {m.href ? (
                        <Link
                          href={m.href}
                          className="mt-2 block font-display text-xl font-bold hover:text-engineering transition-colors"
                        >
                          {m.title} <ArrowRight className="inline h-4 w-4 align-baseline" />
                        </Link>
                      ) : (
                        <h3 className="mt-2 font-display text-xl font-bold">{m.title}</h3>
                      )}
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                      {m.metric && (
                        <div className="mt-3 inline-flex items-center gap-1.5 border border-dotted border-engineering/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-engineering">
                          <TerminalSquare className="h-3 w-3" />
                          {m.metric}
                        </div>
                      )}
                      {m.blocking && (
                        <div className="mt-3 inline-flex items-center gap-1.5 border border-dotted border-warning/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-warning">
                          <CircleAlert className="h-3 w-3" />
                          Bloqueante da v1.9.0 — slots A–D aguardando corpo real
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Marcos homologados */}
          <section id="marcos" className="scroll-mt-24 mt-14">
            <h2 className="font-display text-3xl font-bold">Marcos homologados</h2>
            <div className="mt-6 grid gap-px bg-border/60 border border-border sm:grid-cols-2">
              {[
                {
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "v1.7.0 · Fase 17 — Debugger",
                  body: "10_SandboxDebug isolado de todo gameplay; 31/31 specs verdes; ISBDebugInterface estendida ao ator de testes de interação.",
                  metric: "31/31 specs",
                },
                {
                  icon: <TerminalSquare className="h-4 w-4" />,
                  title: "v1.8.0 · Fase 18 — Interface Dinâmica",
                  body: "Payloads UObject em 04_SandboxCore, auto-unsubscribe em NativeDestruct, multi-HUD via ULocalPlayerSubsystem e anti-spill local.",
                  metric: "32/32 specs",
                },
                {
                  icon: <Lock className="h-4 w-4" />,
                  title: "DD-01…DD-18 · Registro de Decisões",
                  body: "Decisões de simetria Exit, anti-reflexão por string, deduplicação AttackId (DD-11), slots auditáveis (DD-16), divergência de escopo (DD-17) e a página permanente de linha do tempo & roadmap (DD-18).",
                  metric: "16 homologadas",
                },
                {
                  icon: <Compass className="h-4 w-4" />,
                  title: "Site + deploy independente",
                  body: "Documentação viva com busca ⌘K, checklists e linha do tempo; vercel.json validado e repositório GitHub sincronizado.",
                  metric: "vite build · Exit 0",
                },
              ].map((card) => (
                <div key={card.title} className="bg-background px-5 py-5">
                  <div className="flex items-center gap-2 text-engineering">{card.icon}</div>
                  <h3 className="mt-3 font-display text-lg font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-engineering">
                    {card.metric}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Em curso — pendências oficiais do Vault (não há slots de homologação ativos) */}
          <RoadmapInProgress />

          {/* Roadmap */}
          <section id="roadmap" className="scroll-mt-24 mt-14">
            <h2 className="font-display text-3xl font-bold">Roadmap</h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              Sequência projetada a partir do estado atual. Nenhuma linha avança sem fechar a
              anterior — a ordem abaixo é de dependência, não de datas.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: <Paintbrush className="h-4 w-4" />,
                  title: "Frente 1 · Montagem UMG (P-3)",
                  items: [
                    "Widget Blueprints das backing classes C++ do 09_SandboxUI",
                    "Slots de habilidade com WatchedAbilityTag",
                    "Playtests em Listen Server e Split-Screen local",
                    "Validar anti-spill de escopo local sem vazamento",
                  ],
                  state: "Backlog oficial do Vault",
                },
                {
                  step: "02",
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "Frente 2 · Segurança de rede (P-4)",
                  items: [
                    "RPC Rate-Limiting em chamadas críticas",
                    "Anti-cheat: validação de distância no frame da RPC",
                    "Validação de posse do item no servidor",
                    "Sem branch de teste vazando para produção",
                  ],
                  state: "Backlog oficial do Vault",
                },
                {
                  step: "03",
                  icon: <RotateCcw className="h-4 w-4" />,
                  title: "Frente 3 · Polimento (P-5 · P-6)",
                  items: [
                    "Status Effects genéricos (buff / debuff / DOT)",
                    "Lag compensation (rewind de rede para hitscan)",
                    "Restauração visual de equipamento nos sockets",
                    "Specs normativas atualizadas (P-7 · DD-09…DD-19)",
                  ],
                  state: "Backlog oficial do Vault",
                },
              ].map((col) => (
                <div key={col.step} className="border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-dotted px-5 py-3">
                    <div className="flex items-center gap-2 text-engineering">
                      {col.icon}
                      <span className="font-display text-lg font-bold">{col.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{col.step}</span>
                  </div>
                  <ul className="px-5 py-4 space-y-2.5">
                    {col.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-engineering" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-dotted px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {col.state}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Riscos */}
          <section id="riscos" className="scroll-mt-24 mt-14">
            <h2 className="font-display text-3xl font-bold">Riscos &amp; mitigação</h2>
            <div className="mt-6 border border-border">
              {[
                {
                  title: "Duplicação de numeração F19 (Vault · GameAnimationSample vs site · dano)",
                  level: "Bloqueante",
                  mitigation:
                    "Régua oficial = Vault: F19 portabilidade concluída; proposta de dano vira Pendência P-1, fora da régua numerada.",
                },
                {
                  title: "Propostas sem corpo real (P-1 dano, P-2 persistência)",
                  level: "Alto",
                  mitigation:
                    "Rascunhos mantidos apenas como páginas com selo de proposta; nenhuma entra na régua sem build + suíte + isolamento.",
                },
                {
                  title: "Sync Vault ↔ site manual",
                  level: "Médio",
                  mitigation:
                    "Ritual de 3 pontos por rodada + sync-audit.py — Vault Obsidian é a fonte oficial, site espelha o Vault.",
                },
                {
                  title: "GitHub sem sync automático",
                  level: "Médio",
                  mitigation:
                    "Push por checkpoint + GitHub Action + secret VAULT_MIRROR_REPO para auditoria do Vault privado.",
                },
              ].map((r, i) => (
                <div
                  key={r.title}
                  className={`grid md:grid-cols-[1fr_140px_1fr] gap-3 px-5 py-4 ${
                    i > 0 ? "border-t border-dotted" : ""
                  }`}
                >
                  <div className="text-sm font-medium">{r.title}</div>
                  <div
                    className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
                      r.level === "Bloqueante" ? "text-warning" : "text-muted-foreground"
                    }`}
                  >
                    {r.level}
                  </div>
                  <div className="text-sm text-muted-foreground">{r.mitigation}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-14 border-t border-dotted pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Estado de referência: Vault oficial · pendencias_de_fases.md · v1.9.0 ·{" "}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setCopiedRoute(true);
              }}
              className="underline underline-offset-2 hover:text-engineering"
            >
              {copiedRoute ? "URL copiada ✓" : "Compartilhar esta visualização"}
            </button>
          </div>
        </article>
      </div>

      <BackToTop />
    </DocsLayout>
  );
}
