/*
  DESIGN: "Blueprint Técnico" — Registro de Decisões homologadas.
  Linguagem de "inspection record": cada decisão é um registro com carimbo de versão,
  contexto, alternativa rejeitada, consequência e precedente citável.
  Papel quente, tinta grafite, acento verde-engineering.
*/
import { AnimatePresence, motion } from "framer-motion";
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, PhaseStamp, TechRule } from "@/components/Primitives";
import { useState } from "react";
import { Search } from "lucide-react";

type DecisionStatus = "Homologada" | "Homologada com nota" | "Pendente";

interface Decision {
  id: string;
  version: string;
  title: string;
  problem: string;
  decision: string;
  rejected: string;
  consequence: string;
  precedent: string;
  status: DecisionStatus;
  /** Data ISO da homologação — pendentes não possuem data. */
  homologatedAt?: string;
}

const DECISIONS: Decision[] = [
  {
    id: "DD-01",
    version: "v1.8.0",
    title: "USBUIManager herdando de ULocalPlayerSubsystem",
    problem:
      "Como isolar instâncias de UI por local player em split-screen e Listen Server sem reescrever isolamento manual por widget?",
    decision:
      "USBUIManager é um ULocalPlayerSubsystem nativo: a engine instancia uma cópia por ULocalPlayer automaticamente, isolando as camadas de widgets de cada jogador.",
    rejected:
      "Uma UHUD por jogador com mapeamento manual de instâncias — introduziria estado paralelo ao que a engine já mantém e exigiria sincronização própria em split-screen.",
    consequence:
      "Widgets e camadas Game/Modal/Debug nascem automaticamente na instância certa do jogador; nenhum código adicional para os dois cenários multi-player.",
    precedent:
      "Consequência direta da Regra 4 do Manifesto (injeção dinâmica de componentes) — deixar a engine manter o estado que já é dela.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-02",
    version: "v1.8.0",
    title: "Auto-unsubscribe cirúrgico em NativeDestruct",
    problem:
      "Widgets podem ser destruídos pelo ciclo de vida UMG sem destruição explícita de tags — como fechar a simetria subscribe/destruir em todos os caminhos de falha?",
    decision:
      "USBUserWidget rastreia cada assinatura em FSBWidgetEventSubscription (tag + delegate) e remove por delegate individual em NativeDestruct; SubscribeToEvent rejeita reinscrição do mesmo delegate (idempotente).",
    rejected:
      "Unsubscribe bruto por tag — derrubaria delegates de outros assinantes se o USBEventSubsystem compartilhar o array de handlers.",
    consequence:
      "Caminhos de falha cobertos: widget fechado via PopWidget, ator destruído, player removido (OnPlayerRemoved/OnOwnerDestroyed). Nenhum delegate órfão permanece.",
    precedent:
      "Mesma disciplina de simetria do FSBStackMutationGuard (Enter/Exit) — toda entrada precisa de saída em TODOS os caminhos, não só no caminho feliz.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-03",
    version: "v1.8.0",
    title: "Payloads em SBEventPayloads.h (04_SandboxCore), nunca em 09_SandboxUI",
    problem:
      "Como manter o 09_SandboxUI 100% isolado de compilação das extensões de gameplay se os eventos carregam dados de domínio?",
    decision:
      "Todos os payloads vivem em SBEventPayloads.h, dentro de 04_SandboxCore. O 09 só conhece as classes leves de payload — nunca cabeçalhos de 05/06/07/08.",
    rejected:
      "Includes diretos de eventos nas classes de gameplay (combate/inventário) — criaria dependência circular de compilação e provaria falsa o teste de isolamento.",
    consequence:
      "O teste de isolamento fica provável: 05+06+07+08 desabilitados simultaneamente e 09_SandboxUI continua compilando (Exit Code 0).",
    precedent:
      "Extensão da Regra 5 do Manifesto (desacoplamento por interfaces): o Message Router é a única superfície de comunicação entre camadas.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-04",
    version: "v1.8.0",
    title: "Payloads como classes UObject (GC + Blueprint), não structs FSB",
    problem:
      "Payloads deveriam seguir o padrão struct FSB* das camadas de gameplay ou adaptar-se ao consumo em UMG Blueprint?",
    decision:
      "Classes derivadas de UObject — ciclo de vida gerenciado pelo GC e casting direto em Blueprint, onde os widgets da Fase 18 vivem.",
    rejected:
      "Structs FSB* passados por evento — mais leves em C++, mas exigiriam reflexão por string ou wrappers em Blueprint, violando a Regra de interface do Manifesto.",
    consequence:
      "Custo maior por evento, aceitável porque UI é consumidora de prioridade Low (20) e gameplay nunca espera pela UI. Ponto de injeção de novos payloads: sempre 04_SandboxCore.",
    precedent:
      "Decisão registrada no plano Fase 18 homologado — design decision explícita, não escondida em Open Questions.",
    status: "Homologada com nota",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-05",
    version: "v1.8.0",
    title: "Anti-spill como requisito obrigatório de todo widget",
    problem:
      "Eventos de interação, atributos e combate são broadcast para todos os clients — como impedir o prompt do Jogador 2 na tela do Jogador 1?",
    decision:
      "Todo widget de gameplay valida TargetPawn == owning pawn antes de renderizar. Requisito obrigatório em todos os widgets e Cenário 2 da SBUITests (mismatch intencional).",
    rejected:
      "Validação por origem do evento no produtor — o produtor é broadcast por natureza (autoritativo); o filtro pertence ao consumidor que conhece seu dono.",
    consequence:
      "Split-screen e Dedicated Server seguros: cada UI só reage a eventos do seu próprio pawn. O teste cobre o cenário de race via TargetPawn mismatch.",
    precedent:
      "Extensão do princípio HasAuthority(): assim como lógica persistente exige authority, renderização de gameplay exige ownership.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-06",
    version: "v1.8.0",
    title: "Quatro eventos canônicos de inventário preservados",
    problem:
      "O plano original propunha um único Event.Inventory.Changed — mas 06_SandboxCombat já assinava eventos específicos. Como preservar compatibilidade?",
    decision:
      "Manter ItemAdded/ItemRemoved/ItemEquipped/ItemUnequipped como contrato canônico — o grid de combate assina os quatro, e a UI assina os mesmos quatro.",
    rejected:
      "Evento único genérico com payload discriminado — quebraria os assinantes existentes e reinventaria o contrato em cada novo sistema.",
    consequence:
      "Compatibilidade reversa garantida: nenhum consumidor de 06_SandboxCombat precisou ser reescrito. Contratos estáveis nunca são quebrados por conveniência.",
    precedent:
      "Regra 3 do manifesto (reaproveitar, não reinventar): o contrato já existia; a UI se adaptou a ele, não o contrário.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-07",
    version: "v1.8.0",
    title: "Throttle de 60 Hz no progresso de interação",
    problem:
      "Event.Interaction.Progress dispara no TickComponent durante o hold — como proteger o Slate de re-render por frame?",
    decision:
      "Acumulador de tempo no TickComponent com taxa máxima de 60 Hz para publicar Event.Interaction.Progress; o widget recebe dirty-flag sem tocar o Slate abaixo disso.",
    rejected:
      "Throttle no consumidor (widget) — moveria a regra para a camada de apresentação e permitiria múltiplos consumidores com políticas divergentes.",
    consequence:
      "Barra de hold suave sem custo de re-render; o throttle vive no produtor autoritativo onde a política é única e auditável.",
    precedent:
      "Consistência com a disciplina de eventos do Gameplay Debugger (Fase 17): dados de observação nunca geram escritas de estado.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-08",
    version: "v1.8.0",
    title: "Filtro de indicadores de dano adiado para Fase 19",
    problem:
      "O indicador direcional de dano exige um novo ponto autoritativo de publicação no hitscan de combate — vale incluí-lo no escopo da Fase 18?",
    decision:
      "Adiar o USBUIDamageIndicator: fechar a Fase 18 com Prompt, Inventário, Arma e Cooldowns (todos com eventos existentes) antes de introduzir nova superfície de publicação.",
    rejected:
      "Implementar junto com a Fase 18 — aumentaria o risco de regressão na validação autoritativa de dano, o caminho mais sensível do framework.",
    consequence:
      "Escopo da Fase 18 fechado com eventos existentes; a Fase 19 herda o precedente de publicação autoritativa já homologado.",
    precedent:
      "Disciplina de scope (Fase 17 → 18): entregar escopo pequeno e verificável é melhor que escopo grande com lacunas.",
    status: "Homologada com nota",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-09",
    version: "v1.7.0",
    title: "Teste de isolamento por hide de módulos no UBT",
    problem:
      "Como provar desacoplamento de compilação sem confiar em declaração de dependência no .uplugin?",
    decision:
      "Renomear a pasta do módulo dependente + .uplugin_disabled força o UBT a remover o plugin do gráfico de build — se o plugin isolado continua compilando, o desacoplamento é real.",
    rejected:
      "Editar apenas o campo de dependência do .uplugin — o UBT ainda linkaria o módulo via dependência implícita e o teste provaria nada.",
    consequence:
      "Método repetível contra as quatro extensões simultaneamente (05+06+07+08 na Fase 18) — versão bilateral: hide de cada lado prova o contrato.",
    precedent:
      "Fase 17 (hide 08_SandboxInventory) → Fase 18 (hide 05+06+07+08 + hide inverso de 09_SandboxUI): o método evolui, mas nunca relaxa.",
    status: "Homologada",
    homologatedAt: "2026-08-12",
  },
  {
    id: "DD-10",
    version: "v1.7.0",
    title: "GDT expõe ISBDebugInterface — não estado interno",
    problem:
      "Como dar observabilidade a todo ator inspecionável sem vazamento de ponteiros ou acoplamento ao Gameplay Debugger nativo?",
    decision:
      "Interface leve ISBDebugInterface com FSBDebugLine (Label/Value/bIsHeader) — cada ator implementa CollectData e a UI do GDT renderiza structs, nunca ponteiros.",
    rejected:
      "Reflexão por string sobre propriedades do ator — violaria a Regra de interface do Manifesto e exporia membros internos não destinados a debug.",
    consequence:
      "Compliance total em Shipping: todo o código de debug fica atrás de #if WITH_GAMEPLAY_DEBUGGER, sem custo em produção.",
    precedent:
      "Mesma disciplina das interfaces em 02_SandboxInterfaces: nunca reflexão por string, sempre contrato leve e explícito.",
    status: "Homologada",
    homologatedAt: "2026-08-11",
  },
  {
    id: "DD-11",
    version: "v1.9.0 (planejada)",
    title: "Deduplicação client-side do indicador de dano via AttackId",
    problem:
      "O cliente prediz o USBUIDamageIndicator localmente enquanto o servidor confirma via Event.Combat.DamageReceived — se o servidor publicar o evento antes da predição expirar, o HUD não pode exibir dois indicadores sobrepostos.",
    decision:
      "Deduplicação client-side por AttackId: cada indicador exibido consome uma entrada em um mapa local de AttackIds recentes; hits duplicados dentro do TTL são ignorados. No caminho feliz, o servidor pode suprimir a publicação redundante via bSkipClientNotify.",
    rejected:
      "Duplicar a validação no widget (comparar timestamp ou posição do hit) — espalharia regra de negócio no consumo e quebraria a simetria predição/autoridade já estabelecida em TryConsumeAttribute.",
    consequence:
      "O HUD exibe exatamente um indicador por hit confirmado, sem re-spawn duplicado; a regra fica no ponto de consumo local (USBUIDamageIndicator), preservando o produtor autoritativo puro.",
    precedent:
      "Mesma mecânica transacional do PredictionId (validar-antes-de-mutar): o cliente consome localmente, o servidor confirma; FSBStackMutationGuard provou o valor de guards locais contra reentrância.",
    status: "Pendente",
  },
];

const STATUS_STYLES: Record<DecisionStatus, string> = {
  Homologada: "border-engineering/60 text-engineering",
  "Homologada com nota": "border-amber-warn/60 text-amber-warn",
  Pendente: "border-muted-foreground/60 text-muted-foreground",
};

function DecisionRecord({ d, index, formatDate }: { d: Decision; index: number; formatDate: (iso?: string) => string | undefined }) {
  return (
    <article className="border border-border bg-card relative overflow-hidden" id={d.id.toLowerCase()}>
      <div className="h-1 bg-[repeating-linear-gradient(-45deg,var(--engineering),var(--engineering) 3px,transparent 3px 9px)] opacity-30" />
      <header className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Registro nº {index + 1} · {d.id}
          </div>
          <h3 className="font-display text-xl font-bold mt-1">{d.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border whitespace-nowrap ${STATUS_STYLES[d.status]}`}>
            {d.status}
          </span>
          {d.homologatedAt && formatDate && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Homologada em {formatDate(d.homologatedAt)}
            </span>
          )}
          <span className="phase-stamp">{d.version}</span>
        </div>
      </header>
      <div className="px-5 pb-4 grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Problema</span>
          <span className="text-foreground">{d.problem}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Decisão homologada</span>
          <span className="text-foreground">{d.decision}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Alternativa rejeitada</span>
          <span className="text-muted-foreground">{d.rejected}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Consequência</span>
          <span className="text-muted-foreground">{d.consequence}</span>
        </p>
      </div>
      <footer className="px-5 py-2.5 border-t border-dashed border-border bg-secondary/40">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Precedente</span>
        <p className="text-sm text-foreground mt-1">{d.precedent}</p>
      </footer>
    </article>
  );
}

const STATUS_FILTERS: (DecisionStatus | "Todas")[] = ["Todas", "Homologada", "Homologada com nota", "Pendente"];

export default function Decisions() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "Todas">("Todas");

  const filtered = DECISIONS.filter((d) => {
    if (statusFilter !== "Todas" && d.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.problem.toLowerCase().includes(q) ||
      d.decision.toLowerCase().includes(q) ||
      d.precedent.toLowerCase().includes(q)
    );
  })
    // Ordenação: pendentes primeiro; homologadas por data de homologação descendente
    // (mais recentes no topo); empates resolvidos pelo identificador DD-*.
    .sort((a, b) => {
      if (a.status === "Pendente" && b.status !== "Pendente") return -1;
      if (a.status !== "Pendente" && b.status === "Pendente") return 1;
      const dateA = a.homologatedAt ?? "";
      const dateB = b.homologatedAt ?? "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.id.localeCompare(a.id);
    });

  const formatDate = (iso?: string) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR") : undefined;

  return (
    <DocsLayout>
      <div className="container py-10 lg:py-14 max-w-5xl">
        <header className="border-b-2 border-foreground pb-6 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PhaseStamp phase="RD" version="v1.8.0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Documento de referência · Registro consolidado de decisões homologadas em auditoria
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Registro de Decisões
            <span className="text-engineering"> — Precedentes homologados</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-3xl">
            Cada decisão de arquitetura com peso de longo prazo foi registrada aqui no momento da homologação:
            o problema, a alternativa rejeitada, a consequência e o precedente citável. Novas fases devem
            reaproveitar estes precedentes em vez de reinventar o contrato — a Regra 3 do Manifesto, tornada auditável.
          </p>
        </header>

        <TechRule label="Como citar" />
        <div className="border-l-2 border-engineering pl-5 max-w-3xl mb-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Referencie decisões pelo identificador (ex.: <span className="font-mono text-foreground">DD-03</span>) em planos
            de nova fase. Se uma decisão registrada precisar ser revertida, a reversão exige auditoria explícita e registro
            no próprio Registro — nunca uma modificação silenciosa.
          </p>
        </div>

        <div className="mb-8 border border-border bg-card">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-secondary/60">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Buscar por identificador, título ou conteúdo
            </span>
            <span className="font-mono text-[11px] text-engineering ml-auto">
              {filtered.length}/{DECISIONS.length} registro(s)
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: DD-03, uilocalplayersubsystem, deduplicação..."
                className="w-full border border-border bg-background px-3 pl-9 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-engineering/60 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`border px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-150 ${
                    statusFilter === s
                      ? "border-engineering bg-engineering/10 text-engineering"
                      : "border-border bg-card text-muted-foreground hover:border-engineering/60 hover:text-engineering"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.length > 0 ? (
              filtered.map((d, i) => (
                <motion.article
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28, opacity: { duration: 0.18 } }}
                  style={{ border: "1px solid var(--border)", background: "var(--card)", position: "relative", overflow: "hidden" }}
                  id={d.id.toLowerCase()}
                >
                  <DecisionRecord d={d} index={i} formatDate={formatDate} />
                </motion.article>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border border-dashed border-border px-6 py-10 text-center font-mono text-sm text-muted-foreground"
              >
                Nenhum registro corresponde à busca "{query}" {statusFilter !== "Todas" && `com status "${statusFilter}"`}.
                Tente outro identificador (DD-01…DD-11) ou amplie o filtro de status.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AuditNote tone="warn">
          Decisões marcadas como "Homologada com nota" carregam custo ou premissa documentada (DD-04: custo de
          UObject por evento; DD-08: indicador de dano adiado). Revisite-as quando o custo se tornar mensurável
          em produção — o registro existe justamente para que a nota não se perca.
        </AuditNote>
      </div>
    </DocsLayout>
  );
}
