/*
  Página /roadmap — Linha do Tempo & Roadmap do projeto Sandbox Framework.
  Estilo: Blueprint Técnico (DD-14): hero com wordmark gigante de fundo (Playfair Display),
  TOC lateral com useActiveSection + BackToTop, serif display para títulos, mono para dados,
  separadores 1px dotted, verde-engineering como assinatura e rust âmbar para bloqueantes/pendências.
*/
import { useState, useEffect } from "react";
import {
  Check,
  CircleAlert,
  Compass,
  Lock,
  Map,
  Milestone,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { F19_SLOT_KEYS, useF19SubmittedCount, useSlotSubmissionStatus } from "@/components/Primitives";

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
    tag: "DD-01…DD-18",
    date: "Contínuo",
    title: "Registro de Decisões de design",
    description:
      "Decisões homologadas do manifesto ao redesign fuch.ai: simetria Exit, anti-reflexão por string, DD-11 AttackId, portas de homologação (DD-16), divergência de escopo auditável (DD-17) e o padrão da página de linha do tempo & roadmap (DD-18).",
    status: "done",
    metric: "18 decisões · 16 homologadas",
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
    title: "Damage Indicator — em homologação",
    description:
      "Slots auditáveis A–D: payload em 04_SandboxCore, broadcast autoritativo no Hitscan, USBUIDamageIndicator em 09_SandboxUI (anti-spill + dedup AttackId) e SBUITests cenários 7/8. Suíte precisa fechar 34/34.",
    status: "active",
    metric: "4/4 slots · Aguardando código",
    blocking: true,
  },
  {
    id: "m-f20",
    tag: "v2.0.0",
    date: "Roadmap",
    title: "Fase 20 — a definir pela próxima prioridade",
    description:
      "Pré-requisito: F19 homologada. Candidatas naturais: F20 de gameplay (ex.: persistência de atributos transacionais) ou consolidação de playtest multiplayer como critério de aceite oficial.",
    status: "planned",
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

/* Seção "Em curso" — linhas dos slots A–D da F19 com status em tempo real
   (verde quando submetido no formulário da F19, âmbar pulsante caso contrário). */
const ROADMAP_SLOTS: RoadmapSlot[] = [
  {
    slotKey: "Slot A · SBEventPayloads.h",
    icon: <Milestone className="h-4 w-4" />,
    title: "Slot A · Payload em 04_SandboxCore",
    detail: "USBDamageEventPayload — chave estável, nunca índice",
  },
  {
    slotKey: "Slot B · 06_SandboxCombat",
    icon: <TerminalSquare className="h-4 w-4" />,
    title: "Slot B · Broadcast autoritativo no Hitscan",
    detail: "HasAuthority() explícito · validar → mutar → notificar",
  },
  {
    slotKey: "Slot C · USBUIDamageIndicator (09_SandboxUI)",
    icon: <Map className="h-4 w-4" />,
    title: "Slot C · USBUIDamageIndicator em 09_SandboxUI",
    detail: "Anti-spill por ULocalPlayer + dedup por AttackId",
  },
  {
    slotKey: "Slot D · SBUITests",
    icon: <Check className="h-4 w-4" />,
    title: "Slot D · SBUITests cenários 7 e 8",
    detail: "Anti-spill e deduplicação — elevar a suíte a 34/34",
  },
];

/* Banner automático: aparece quando os 4 slots recebem código (submissão local).
   Texto deixa explícito que é estado local — homologação real exige build + suíte 34/34. */
function RoadmapCompletionBanner() {
  const count = useF19SubmittedCount();
  const allSubmitted = count === 4;
  if (!allSubmitted) return null;
  return (
    <div className="mb-6 border border-engineering/60 bg-engineering/[0.06] px-4 py-3">
      <div className="flex items-start gap-3">
        <Check className="h-4 w-4 mt-0.5 shrink-0 text-engineering" />
        <div className="text-sm leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering block mb-1">
            Homologação concluída · 4/4 slots — submissões locais
          </span>
          <span className="text-muted-foreground">
            Os quatro slots da Fase 19 receberam código neste navegador — a régua abaixo reflete
            o estado local. <strong>A homologação real da v1.9.0 exige</strong> build UBT Exit 0 +
            suíte 34/34 + isolamento simétrico, antes de qualquer carimbo no Vault.
          </span>
        </div>
      </div>
    </div>
  );
}


function RoadmapSlotRow({ row, index }: { row: RoadmapSlot; index: number }) {
  const { status } = useSlotSubmissionStatus(row.slotKey as (typeof F19_SLOT_KEYS)[number]);
  const submitted = status === "Código registrado";
  return (
    <div
      key={row.slotKey}
      className={`flex items-center gap-4 px-5 py-4 ${index > 0 ? "border-t border-dotted" : ""} ${submitted ? "bg-engineering/[0.04]" : ""}`}
    >
      <span className={submitted ? "text-engineering" : "text-warning"}>{row.icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium">{row.title}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{row.detail}</div>
      </div>
      {submitted ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-engineering">
          Código registrado
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-warning animate-pulse">
          Aguardando código
        </span>
      )}
    </div>
  );
}

function RoadmapInProgress() {
  const submittedCount = useF19SubmittedCount();
  return (
    <section id="em-curso" className="scroll-mt-24 mt-14">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="font-display text-3xl font-bold">Em curso</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {submittedCount} / 4 slots neste navegador
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        A Fase 19 (Damage Indicator) é o único trabalho ativo — tudo abaixo é pré-requisito
        do carimbo v1.9.0 e segue a porta de homologação com slots auditáveis A–D. O status
        de cada linha reflete o formulário de submissões da página da Fase 19 em tempo real.
      </p>
      <div className="mt-6 space-y-0 border border-border">
        {ROADMAP_SLOTS.map((row, i) => (
          <RoadmapSlotRow key={row.slotKey} row={row} index={i} />
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-2 border border-dotted border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {submittedCount} / 4 slots com código registrado neste navegador ·
        {submittedCount === 4
          ? " pendência final: build compilado + suíte 34/34 + isolamento Exit 0"
          : " submissões são simulação de fluxo — não homologam a versão"}
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

  const submittedCount = useF19SubmittedCount();
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
            (v1.7.0 · v1.8.0), das decisões de design (DD-01…DD-18) e do que se desbloqueia na v1.9.0.
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
              O projeto em uma página — de Foundation a v2.0.0
            </h2>
            <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                A linha do tempo abaixo consolida o caminho dos 11 plugins UE5.8 C++, das versões
                homologadas (v1.7.0 · v1.8.0) e das decisões de design (DD-01…DD-18) até o estado
                atual — a <b className="text-warning">Fase 19 em homologação</b>, único bloqueante
                para a v1.9.0.
              </p>
              <p>
                O roadmap projeta o que se desbloqueia após o fechamento da F19: a próxima fase de
                gameplay (F20) e a consolidação do playtest multiplayer como critério de aceite
                oficial — mantendo a mesma porta de homologação com slots auditáveis (padrão DD-16).
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border">
              {[
                { label: "Plugins", value: "11/11", detail: "implementados" },
                { label: "Versões", value: "v1.8.0", detail: "homologada" },
                { label: "Decisões DD", value: "18", detail: "registradas" },
                { label: "Próxima", value: "v1.9.0", detail: "em homologação" },
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
                      <h3 className="mt-2 font-display text-xl font-bold">{m.title}</h3>
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

          {/* Em curso — status em tempo real via formulário de submissões da F19 */}
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
                  icon: <Wrench className="h-4 w-4" />,
                  title: "Fechar a v1.9.0",
                  items: [
                    "Submeter corpo real dos slots A–D",
                    "UBT Exit 0 · suíte 34/34",
                    "Grep de acoplamento limpo",
                    "Carimbo simultâneo (site · Vault · GitHub)",
                  ],
                  state: "Depende de: plano executado do Vault",
                },
                {
                  step: "02",
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "Correções de processo (C2–C5)",
                  items: [
                    "Ritual de sync + sync-audit.py",
                    "GitHub Action de build",
                    "Bloco de evidência de homologação na F19",
                    "Banner de modo demonstração",
                  ],
                  state: "Esforço total: ~4–6 h",
                },
                {
                  step: "03",
                  icon: <RotateCcw className="h-4 w-4" />,
                  title: "F20 · próxima fase de gameplay",
                  items: [
                    "Porta de homologação com slots A–D (DD-16)",
                    "Candidata: persistência transacional de atributos",
                    "Playtest multiplayer como critério oficial",
                    "Parecer técnico pré-execução via skill",
                  ],
                  state: "Pré-requisito: v1.9.0 homologada",
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
                  title: "F19 sem corpo real de código",
                  level: "Bloqueante",
                  mitigation:
                    "Roteiro de 4–7 h: plano executado do Vault → validação tripla → carimbo simultâneo.",
                },
                {
                  title: "Sync Vault ↔ site manual",
                  level: "Médio",
                  mitigation:
                    "Ritual de 3 pontos por rodada + script sync-audit.py comparando hashes.",
                },
                {
                  title: "GitHub sem sync automático",
                  level: "Médio",
                  mitigation:
                    "Push por checkpoint + GitHub Action que valida build:vercel antes do deploy Vercel.",
                },
                {
                  title: "Evidência de build não exposta",
                  level: "Baixo",
                  mitigation:
                    "Bloco 'Evidência de homologação' na F19 — carimbo retido sem o bloco.",
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
            Estado de referência: skill sandbox-framework-review v1.9.0-prep ·{" "}
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
