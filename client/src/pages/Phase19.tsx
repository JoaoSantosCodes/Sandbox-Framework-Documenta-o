/*
  DESIGN: "Blueprint Técnico" — página de planejamento de fase futura.
  Linguagem de "plano de implantação em rascunho": espaço reservado com
  pré-requisitos homologados citados por precedente (DD-*), escopo proposto,
  arquitetura de injeção e critérios de aceite preliminares.
  Papel quente, tinta grafite, acento verde-engineering. Carimbo "em planejamento".
*/
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import { PhaseChecklist } from "@/components/PhaseChecklist";
import { AuditNote, PhaseStamp, TechRule } from "@/components/Primitives";

interface Prerequisite {
  id: string;
  title: string;
  source: string;
  oqueGarante: string;
}

const PREREQUISITES: Prerequisite[] = [
  {
    id: "DD-08",
    title: "Escopo adiado por disciplina de homologação",
    source: "Registro de Decisões DD-08 (v1.8.0)",
    oqueGarante:
      "A Fase 18 foi fechada sem nova superfície de publicação — o ponto autoritativo de dano não existe ainda; a Fase 19 o cria como requisito explícito, não como acréscimo de última hora.",
  },
  {
    id: "DD-03",
    title: "Payloads vivem em 04_SandboxCore",
    source: "Registro de Decisões DD-03 (v1.8.0)",
    oqueGarante:
      "SBEventPayloads.h já é o único local de novos payloads. A Fase 19 adiciona USBDamageEventPayload (UObject, GC) lá — nunca dentro de 06_SandboxCombat ou 09_SandboxUI.",
  },
  {
    id: "DD-04",
    title: "Payloads como classes UObject",
    source: "Registro de Decisões DD-04 (v1.8.0) · homologada com nota",
    oqueGarante:
      "O widget de dano reage via Blueprint; cast direto para USBDamageEventPayload sem reflexão por string. Nota da decisão: custo maior por evento, aceitável porque UI é prioridade Low (20).",
  },
  {
    id: "DD-05",
    title: "Anti-spill obrigatório em todo widget",
    source: "Registro de Decisões DD-05 (v1.8.0)",
    oqueGarante:
      "O indicador só renderiza quando o evento carrega TargetPawn == owning pawn do local player. Mesmo padrão dos widgets da Fase 18; Cenário 2 da SBUITests cobre o mismatch.",
  },
  {
    id: "Event.Combat.DamageReceived",
    title: "Evento canônico já especificado",
    source: "Message Router — Tabela canônica / Spec v1.0.0",
    oqueGarante:
      "O evento existe na referência como '06_SandboxCombat (ponto autoritativo) → UI: indicador direcional por 2,5 s, exigindo posição no ponto autoritativo de dano'. O que falta é o produtor em C++ publicá-lo.",
  },
];

interface ProposedItem {
  item: string;
  descricao: string;
  dependencia: string;
}

const SCOPE: ProposedItem[] = [
  {
    item: "SBEventPayloads.h — USBDamageEventPayload",
    descricao:
      "UObject com DamageAmount (float), Direction (FVector), bIsFatal (bool), AttackId (string estável para deduplicação client-side).",
    dependencia: "Precedente DD-03 + DD-04",
  },
  {
    item: "Ponto autoritativo de publicação no Hitscan",
    descricao:
      "Dentro do caminho existente de validação autoritativa de dano (já protegido por HasAuthority()), inserir GetSubsystem<USBEventSubsystem>()->BroadcastMessage<>(Event.Combat.DamageReceived, payload) — sem duplicar escritas nem tocar replicação de atributos.",
    dependencia: "USBInteractionComponent::Validate autoritativo (06_SandboxCombat)",
  },
  {
    item: "USBUIDamageIndicator (09_SandboxUI)",
    descricao:
      "Widget de 09 que assina o evento com prioridade Low (20), filtra anti-spill, converte o vetor de direção em ângulo no espaço do HUD e exibe o indicador com fade de 2,5 s (animação de Slate, sem Timer pesado).",
    dependencia: "Camadas Game do USBUIManager (ULocalPlayerSubsystem)",
  },
  {
    item: "SBUITests — Cenário 7 e 8",
    descricao:
      "Cenário 7: dano recebido exibe o indicador no ângulo esperado; Cenário 8: dano recebido por outro jogador (TargetPawn mismatch) não renderiza nada no local player.",
    dependencia: "Suíte SBUITests da Fase 18 (6 cenários verdes)",
  },
  {
    item: "Teste de isolamento simétrico",
    descricao:
      "Hide de 06_SandboxCombat: 09_SandboxUI continua compilando (payloads em 04). Hide de 09: gameplay continua compilando. UBT sem warnings novos.",
    dependencia: "DD-09 · método DD-09: renome de pasta + .uplugin_disabled",
  },
];

const CHECKLIST_KEY = "sbf-phase19-checklist";

const CHECKLIST_ITEMS = [
  { key: "payload", label: "SBEventPayloads.h — USBDamageEventPayload (AttackId, Direction, bIsFatal)" },
  { key: "produtor", label: "Ponto autoritativo de publicação no Hitscan (HasAuthority já ativo)" },
  { key: "widget", label: "USBUIDamageIndicator assinando com prioridade Low + anti-spill" },
  { key: "dedupe", label: "Deduplicação client-side via AttackId (TTL ou bSkipClientNotify)" },
  { key: "cenario7", label: "SBUITests Cenário 7: indicador no ângulo esperado" },
  { key: "cenario8", label: "SBUITests Cenário 8: TargetPawn mismatch não renderiza" },
  { key: "isolamento", label: "Teste de isolamento simétrico (hide 06 + hide 09, Exit Code 0)" },
  { key: "playtest", label: "Playtest Dedicated Server: indicador só no pawn afetado" },
  { key: "dd11", label: "DD-11 registrado e homologado: deduplicação client-side via AttackId (Ver DD-11)" },
  { key: "vault", label: "Vault + site carimbados v1.9.0 (Dashboard, task.md, siteData)" },
];

export default function Phase19() {
  return (
    <DocsLayout>
      <div className="container py-10 max-w-4xl">
        <div className="mb-2">
          <PhaseStamp phase="19" version="v1.9.0 · em planejamento" warn />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Rascunho de planejamento · aguardando homologação da Fase 18 no Vault
          </span>
        </div>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-tight">
          Fase 19 — Indicador Direcional de Dano
        </h1>
        <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-3xl">
          A Fase 19 implementa o{" "}
          <code className="font-mono text-[13px] text-foreground">USBUIDamageIndicator</code> adiado pela
          decisão DD-08 da Fase 18: feedback visual direcional no HUD quando o pawn local sofre dano, com o
          novo ponto de publicação autoritativa em{" "}
          <code className="font-mono text-[13px] text-foreground">06_SandboxCombat</code>. Esta página é o
          espaço reservado — o escopo, a injeção e os critérios de aceite ainda não foram homologados por
          revisão; os pré-requisitos, sim, são todos precedentes já homologados.
        </p>

        <TechRule label="Contrato estrutural" />

        <h2 id="DD-08" className="mt-12 font-serif text-2xl font-bold">
          Por que adiar — e o que isso garante
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          A DD-08 (v1.8.0, homologada com nota) rejeitou incluir o indicador na Fase 18 porque ele exige um{" "}
          <strong>novo ponto autoritativo de publicação</strong> dentro do caminho de validação de dano do
          hitscan — o caminho mais sensível do framework, protegido por{" "}
          <code className="font-mono text-[12px]">HasAuthority()</code> e predição client-side. Abrir esse
          caminho junto com widgets novos teria elevado o risco de regressão. A Fase 19 nasce exatamente
          desse precedente: o escopo da UI já está estabilizado, e resta introduzir uma única superfície de
          publicação nova, sob revisão.
        </p>
        <AuditNote tone="info">
          Esta página é convite para homologação, não especificação fechada. Quando o plano executado da Fase
          19 for submetido, a revisão segue o fluxo padrão: auditoria documental → simetria Entry/Exit →
          autoridade e replicação → testes → OK final → promoção desta página de "em planejamento" para o
          estado homologado em <code className="font-mono text-[12px]">/fase-18</code> e task.md.
        </AuditNote>

        <h2 id="pre-requisitos" className="mt-12 font-serif text-2xl font-bold">
          Pré-requisitos homologados
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Nenhum item abaixo depende de nova decisão — todos são precedentes citáveis do Registro de Decisões
          e da tabela canônica do Message Router.
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
          Escopo proposto (não homologado)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Rascunho do plano, para revisão antes de qualquer implementação em C++. Os cinco itens abaixo
          seguem a ordem de dependência: payload primeiro, depois o produtor autoritativo, depois o widget,
          depois os testes — mesmo padrão que fechou a Fase 18.
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
                  <td className="px-4 py-3 font-mono text-[11px] text-engineering whitespace-nowrap">
                    {s.dependencia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TechRule label="Checklist interativo da Fase 19" />

        <PhaseChecklist
          phaseLabel="Fase 19 — Indicador Direcional de Dano (planejamento)"
          storageKey={CHECKLIST_KEY}
          items={CHECKLIST_ITEMS}
          completeMessage="Checklist completo — pronto para submeter o plano executado da Fase 19 à revisão."
        />

        <AuditNote tone="warn">
          Ponto sensível: a deduplicação client-side via AttackId. O cliente prediz o indicador localmente
          enquanto o servidor confirma — se o servidor publicar o evento antes do cliente, o HUD não deve
          exibir dois indicadores sobrepostos. A revisão do plano executado exigirá o mecanismo concreto
          (mapa de AttackId recentes com TTL ou bSkipClientNotify no caminho feliz), não a descrição em prosa.
        </AuditNote>

        <h2 id="aceite" className="mt-12 font-serif text-2xl font-bold">
          Critérios de aceite preliminares
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          A homologação da Fase 19 exigirá, no mínimo: (1) SBUITests com os 8 cenários verdes (6 existentes +
          2 novos de dano); (2) teste de isolamento simétrico com hide de 06 e de 09, ambos Exit Code 0; (3)
          playtest multiplayer com Dedicated Server validando o indicador apenas no pawn afetado; (4)
          carimbo v1.9.0 em todos os documentos do Vault e neste site; (5) novo registro DD-11 documentando
          a deduplicação client-side homologada.
        </p>

        <TechRule label="Navegação" />

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/decisoes"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Registro de Decisões
          </Link>
          <Link
            href="/message-router"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <FileText className="h-4 w-4" /> Tabela canônica de eventos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </DocsLayout>
  );
}
