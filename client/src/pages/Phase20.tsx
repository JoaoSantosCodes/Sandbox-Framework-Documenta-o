/*
  DESIGN: "Blueprint Técnico" — página de planejamento de fase futura (padrão DD-16/DD-18).
  Linguagem de "plano de implantação em rascunho": espaço reservado com pré-requisitos
  homologados citados por precedente (DD-*), escopo proposto em tabela de dependência,
  checklist interativo e critérios de aceite preliminares.
  Papel quente, tinta grafite, acento verde-engineering. Carimbo "planejada".
*/
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { DocsLayout } from "@/components/DocsLayout";
import { PhaseChecklist, decodeChecklistProgress } from "@/components/PhaseChecklist";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { AuditNote, PhaseStamp, TechRule } from "@/components/Primitives";

const CHECKLIST_KEY = "sbf-phase20-checklist";

const TOC = [
  { id: "por-que-f20", label: "Por que a Fase 20 — e o momento dela" },
  { id: "pre-requisitos", label: "Pré-requisitos homologados" },
  { id: "escopo", label: "Escopo proposto (contrato de homologação)" },
  { id: "aceite", label: "Critérios de aceite preliminares" },
  { id: "checklist", label: "Checklist interativo" },
];

interface Prerequisite {
  id: string;
  title: string;
  source: string;
  oqueGarante: string;
}

/* Todos os itens abaixo são precedentes homologados — nenhum depende de nova decisão.
   A Fase 20 monta persistência transacional de atributos sobre a disciplina DD-10
   (PredictionId) e a chave estável da DD-02, nunca por índice de array. */
const PREREQUISITES: Prerequisite[] = [
  {
    id: "DD-02",
    title: "Chave estável e upsert — nunca índice de array",
    source: "Registro de Decisões · v1.3.0",
    oqueGarante:
      "Toda estrutura replicada endereça entradas por chave estável (upsert), garantindo que reordenação ou remoção no servidor nunca corrompa o mapeamento client-side.",
  },
  {
    id: "DD-03",
    title: "Predição client-side + autoridade server-side",
    source: "Registro de Decisões · v1.4.0",
    oqueGarante:
      "Toda ação de gameplay é predita localmente e validada pelo servidor, que confirma ou reverte via RPC. Base da persistência: o cliente deve poder reverter mudanças de atributo que o servidor rejeitar.",
  },
  {
    id: "DD-04 · DD-05 · DD-06",
    title: "Payloads UObject via USBEventSubsystem",
    source: "Registro de Decisões · v1.7.0 · v1.8.0",
    oqueGarante:
      "Ciclo de vida por GC e reflexão amigável a UMG; eventos canônicos com filtros de escopo local (anti-spill) e subscrição com auto-unsubscribe no NativeDestruct.",
  },
  {
    id: "DD-10",
    title: "Consumo transacional de atributos via PredictionId",
    source: "Registro de Decisões · v1.9.0 · homologada com nota",
    oqueGarante:
      "TryConsumeAttribute associa cada mutação de atributo a um PredictionId, permitindo que o rollback identifique exatamente qual predição reverter — o pré-requisito central da persistência transacional.",
  },
  {
    id: "DD-11",
    title: "Deduplicação client-side via AttackId",
    source: "Registro de Decisões · v1.9.0",
    oqueGarante:
      "Mecanismo de identidade estável para dedupe de eventos replicados — padrão reutilizável para evitar gravações duplicadas no transaction log.",
  },
  {
    id: "DD-16",
    title: "Portas de homologação com slots auditáveis",
    source: "Registro de Decisões · v1.9.0-prep",
    oqueGarante:
      "A homologação da Fase 20 seguirá o mesmo formato da Fase 19: slots A–D com contratos explícitos e corpo de código auditável, sem aceitar prosa como prova.",
  },
  {
    id: "DD-18",
    title: "Padrão Roadmap & Timeline",
    source: "Registro de Decisões · v1.9.0",
    oqueGarante:
      "Esta página nasce conectada à linha do tempo: o status 'Em curso' do roadmap reflete a homologação da Fase 19, e o progresso da Fase 20 atualizará a régua da v2.0.0.",
  },
];

interface ScopeItem {
  item: string;
  descricao: string;
  precedencia: string;
}

/* Rascunho do plano — para revisão antes de qualquer implementação em C++.
   Mesma ordem de dependência que fechou as Fases 18 e 19: dados primeiro,
   produtor autoritativo depois, consumidor por último, testes sempre. */
const SCOPE: ScopeItem[] = [
  {
    item: "F20-1",
    descricao:
      "USBAttributePersistenceDefinition / USBAttributePersistenceInstance (04_SandboxCore ou plugin novo 12_SandboxPersistence): Definition/Instance/RuntimeData para atributos persistíveis, com chave estável e lista branca de atributos opt-in.",
    precedencia: "DD-02 · DD-04",
  },
  {
    item: "F20-2",
    descricao:
      "TransactionLog transacional: cada mutação de atributo registrada com PredictionId e chave estável (upsert), permitindo replay e rollback completo até o último checkpoint confirmado pelo servidor.",
    precedencia: "DD-10 · DD-03",
  },
  {
    item: "F20-3",
    descricao:
      "Checkpoint e save: serialização do estado confirmado via USaveGame com fallback de gravação, e restore com validação de autoridade — HasAuthority() explícito em todo caminho de gravação.",
    precedencia: "F20-1 · F20-2",
  },
  {
    item: "F20-4",
    descricao:
      "SBAttributePersistenceTests: cenários de rollback simétrico (toda entrada tem saída), concorrência de duas mutações sobre a mesma chave estável, e anti-spill entre local players.",
    precedencia: "DD-16 · DD-03",
  },
  {
    item: "F20-5",
    descricao:
      "Playtest Dedicated Server: sessão salva e restaurada com persistência íntegra; teste de isolamento simétrico com hide do novo plugin, Exit Code 0.",
    precedencia: "F20-1 · F20-4",
  },
];

/* Checklist interativo — persistido em localStorage (padrão F17/F18/F19). */
const CHECKLIST_ITEMS = [
  { key: "deficao", label: "USBAttributePersistenceDefinition/Instance com chave estável e opt-in" },
  { key: "translog", label: "TransactionLog por PredictionId com rollback completo" },
  { key: "checkpoint", label: "Checkpoint/save via USaveGame com HasAuthority() em toda gravação" },
  { key: "restore", label: "Restore validado por autoridade + rejeição de saves corrompidos" },
  { key: "rollback", label: "SBAttributePersistenceTests: rollback simétrico (Entry/Exit)" },
  { key: "concurrence", label: "Cenário de concorrência: duas mutações na mesma chave estável" },
  { key: "antiSpill", label: "Anti-spill entre local players no mesmo saveslot" },
  { key: "isolamento", label: "Isolamento simétrico: hide do plugin de persistência, Exit Code 0" },
  { key: "playtest", label: "Playtest Dedicated Server: save/restore íntegro" },
  { key: "dd19", label: "Novo registro DD-19 homologando o mecanismo transacional" },
  { key: "vault", label: "Vault e site carimbados v2.0.0 (Dashboard, task.md, siteData)" },
];

const CHECKLIST_META = {
  phase: "Fase 20",
  title: "Persistência Transacional de Atributos (v2.0.0 · planejada)",
  storageKey: "sbf-phase20-checklist",
  items: CHECKLIST_ITEMS,
};

/* Animação suave do traço de progresso (padrão Blueprint: ease-out custom, sem keyframes).
   A animação cobre apenas transform/width via transition, <300 ms, respeita prefers-reduced-motion. */
const F20_BAR_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/* Contador animado: anima o número de itens concluídos entre ticks do checklist. */
function useAnimatedCount(target: number): number {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    const from = display;
    if (from === target) return;
    const dur = Math.min(420, Math.max(180, Math.abs(target - from) * 120));
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return display;
}

/* Barra de progresso visual da Fase 20 — lê o checklist persistido em localStorage
   (mesma chave do PhaseChecklist) e reage a alterações de outras abas via storage event. */
function F20ProgressBanner() {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHECKLIST_KEY) setRevision((r) => r + 1);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", () => setRevision((r) => r + 1));
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Recalcula done/pending a cada tick de revisão (localStorage ou focus).
  const { done: doneNow, pending: pendingNow } = decodeChecklistProgress(CHECKLIST_META);
  const total = CHECKLIST_ITEMS.length;
  const pct = Math.round((doneNow.length / total) * 100);
  const doneAnimated = useAnimatedCount(doneNow.length);
  const doneAll = doneNow.length === total;

  return (
    <div className="mt-4 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Progresso da Fase 20
          </span>
          <span
            className="font-mono text-[11px] text-engineering font-semibold tabular-nums"
            style={{
              transition: `transform 200ms ${F20_BAR_EASE}, color 200ms ${F20_BAR_EASE}`,
            }}
          >
            {doneAnimated}/{total} itens concluídos ({pct}%)
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {pendingNow.length} pendente{pendingNow.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="h-2 w-full bg-secondary overflow-hidden">
        <div
          className="h-2 bg-engineering"
          style={{
            width: `${pct}%`,
            transition: `width 380ms ${F20_BAR_EASE}`,
          }}
        />
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-4 py-3 font-mono text-[10px] uppercase tracking-wider">
        <span className="text-engineering">■ concluído</span>
        <span className="text-muted-foreground">{doneNow.length} de {total}</span>
        <span className="text-border">■ pendente</span>
        <span className="text-muted-foreground">{pendingNow.length} de {total}</span>
      </div>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: doneAll ? "3.5rem" : "0rem",
          opacity: doneAll ? 1 : 0,
          transition: `max-height 320ms ${F20_BAR_EASE}, opacity 240ms ${F20_BAR_EASE}`,
        }}
      >
        <div className="px-4 py-3 border-t border-engineering/50 bg-engineering/5 font-mono text-[11px] uppercase tracking-wider text-engineering">
          Plano de implantação concluído — pronto para homologação da v2.0.0
        </div>
      </div>
    </div>
  );
}

export default function Phase20() {
  const active = useActiveSection(TOC.map((t) => t.id));

  return (
    <DocsLayout>
      {/* BANNER — fase planejada (padrão DD-18). O status da régua do /roadmap atualiza
          quando a Fase 19 fechar (4/4 slots) e esta página entrar em execução. */}
      <div className="border-b border-border bg-secondary/40">
        <div className="container py-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="text-sm leading-relaxed">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                v2.0.0 · fase planejada — aguardando a homologação da Fase 19
              </span>
              <p className="mt-1 text-muted-foreground max-w-3xl">
                Esta página é o convite para homologação da{" "}
                <strong className="text-foreground">Fase 20 — Persistência Transacional de Atributos</strong>.
                Ela entra em execução quando a Fase 19 fechar os quatro slots (v1.9.0 homologada); a partir
                daí, a régua do{" "}
                <Link href="/roadmap" className="text-engineering underline underline-offset-4">
                  roadmap
                </Link>{" "}
                passa a rastreá-la como próxima fase de gameplay.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span
            className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            FASE 20
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 20 · v2.0.0 · planning gate
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="20" version="v2.0.0 · planejada" warn />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                persistência transacional de atributos · 11 plugins atuais · 0 em backlog
              </span>
            </div>
            <h1 className="mt-6 font-display font-black text-4xl md:text-5xl leading-[1.05] max-w-3xl">
              Persistência Transacional de Atributos
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              O jogador deve poder sair da partida e voltar encontrando exatamente o estado que deixou —
              atributos, inventário e progresso confirmados pelo servidor, nunca a última predição local. A
              Fase 20 introduz o{" "}
              <strong className="text-foreground">TransactionLog transacional</strong> ancorado no
              PredictionId da DD-10, fechado pelo checkpoint autorizado via SaveGame.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TOC.map((t, i) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:border-engineering/60 hover:text-engineering transition-colors"
                >
                  <span className="text-[9px]">{String(i + 1).padStart(2, "0")}</span>
                  {t.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container py-10 max-w-5xl">
        <TechRule label="Convite à homologação" />
        <h2 id="por-que-f20" className="mt-12 font-serif text-2xl font-bold">
          Por que a Fase 20 — e o momento dela
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          O framework já fecha as duas pontas que a persistência exige: a{" "}
          <strong>chave estável</strong> da DD-02 (nunca índice de array) e o{" "}
          <strong>PredictionId</strong> da DD-10, que identifica cada mutação predita e permite o rollback
          cirúrgico. O que falta é o <em>sistema</em>: um log transacional que transforme mutações
          confirmadas em checkpoints graváveis e que rejeite, com autoridade explícita, qualquer write
          local no caminho de save.
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          O momento também é certo por razões de risco: a Fase 19 estabilizou o último ponto sensível do
          caminho de dano, e a Fase 20 abre um novo subsistema <strong>sem tocar nos plugins existentes</strong> —
          ou fica um plugin novo 12_SandboxPersistence isolado em compilação, ou a definição/instância entra
          no 04_SandboxCore como os payloads da Fase 19. A decisão será registrada em DD-19 antes da
          implementação.
        </p>
        <AuditNote tone="info">
          Esta página é convite para homologação, não especificação fechada. Quando o plano executado da
          Fase 20 for submetido, a revisão segue o fluxo padrão: auditoria documental → simetria
          Entry/Exit → autoridade e replicação → testes → OK final → promoção de "planejada" para o estado
          homologado em <code className="font-mono text-[12px]">/fase-19</code>, task.md e Dashboard.
        </AuditNote>

        <h2 id="pre-requisitos" className="mt-12 font-serif text-2xl font-bold">
          Pré-requisitos homologados
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Nenhum item abaixo depende de nova decisão — todos são precedentes citáveis do Registro de
          Decisões e da tabela canônica do Message Router.
        </p>
        <div className="mt-6 space-y-4">
          {PREREQUISITES.map((p) => (
            <div key={p.id} className="border border-border bg-card">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-secondary/60">
                <span className="font-mono text-[11px] text-engineering">{p.id}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground text-right">
                  {p.source}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.oqueGarante}</p>
              </div>
            </div>
          ))}
        </div>

        <TechRule label="Proposta de escopo" />
        <h2 id="escopo" className="mt-12 font-serif text-2xl font-bold">
          Escopo proposto (contrato de homologação)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Rascunho do plano, para revisão antes de qualquer implementação em C++. Os cinco itens seguem a
          ordem de dependência: definição de dados primeiro, log transacional depois, checkpoint, testes e,
          por fim, playtest — mesmo padrão que fechou as Fases 18 e 19.
        </p>
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Item
                </th>
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Descrição
                </th>
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Precedência
                </th>
              </tr>
            </thead>
            <tbody>
              {SCOPE.map((s) => (
                <tr key={s.item} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap">{s.item}</td>
                  <td className="px-4 py-3 text-muted-foreground leading-relaxed">{s.descricao}</td>
                  <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">{s.precedencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="aceite" className="mt-12 font-serif text-2xl font-bold">
          Critérios de aceite preliminares
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          A homologação da Fase 20 exigirá, no mínimo: (1) rollback simétrico completo — toda entrada no
          TransactionLog com saída correspondente em todos os caminhos de falha; (2) teste de concorrência
          com duas mutações preditas sobre a mesma chave estável, resolvidas pelo servidor sem corromper o
          estado; (3) playtest multiplayer com Dedicated Server validando save/restore íntegro; (4) teste de
          isolamento simétrico com hide do novo plugin, Exit Code 0; (5) carimbo v2.0.0 em todos os
          documentos do Vault e neste site; (6) novo registro DD-19 documentando o mecanismo transacional
          homologado.
        </p>
        <AuditNote tone="warn">
          Ponto sensível: a autoridade do checkpoint. O cliente pode predizer o save, mas a gravação é{" "}
          <strong>sempre server-side</strong> com HasAuthority() explícito — um save escrito pelo cliente
          sem validação de autoridade é exatamente o tipo de bypass que o Manifesto proíbe. A revisão do
          plano executado exigirá o corpo real do código, não a descrição em prosa.
        </AuditNote>

        <TechRule label="Checklist interativo da Fase 20" />
        <h2 id="checklist" className="sr-only">
          Checklist interativo
        </h2>
        <F20ProgressBanner />
        <PhaseChecklist
          phaseLabel="Fase 20 — Persistência Transacional de Atributos (v2.0.0 · planejada)"
          storageKey={CHECKLIST_KEY}
          items={CHECKLIST_ITEMS}
          completeMessage="Checklist completo — pronto para submeter o plano executado da Fase 20 à revisão."
        />

        <TechRule label="Navegação" />
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Linha do Tempo & Roadmap
          </Link>
                    <Link
            href="/decisoes#dd-19"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <FileText className="h-4 w-4" /> DD-19 · Persistência transacional
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/fase-19"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <FileText className="h-4 w-4" /> Fase 19 · Porta de homologação v1.9.0
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {/* Índice lateral (mesmo padrão numerado das páginas longas do Manual/SFPS) */}
      <div className="container py-10 max-w-6xl -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Índice · Plano F20
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
