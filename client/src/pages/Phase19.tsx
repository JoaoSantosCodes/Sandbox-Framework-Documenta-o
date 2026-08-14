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
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { AuditNote, CodeBlock, CopyButton, PhaseStamp, TechRule } from "@/components/Primitives";
import { toast } from "sonner";

const TOC = [
  { id: "DD-08", label: "Por que adiar (DD-08)" },
  { id: "pre-requisitos", label: "Pré-requisitos homologados" },
  { id: "escopo", label: "Escopo proposto" },
  { id: "corpo-codigo", label: "Corpo do código (homologação)" },
  { id: "aceite", label: "Critérios de aceite" },
];

/* Slots auditáveis da homologação — definidos como dado para que o "Copiar Tudo"
   concatene os quatro contratos em um único texto exportável (escopo da sprint no Vault). */
interface CodeSlot {
  slot: string;
  title: string;
  exige: string;
  code: string;
}

const CODE_SLOTS: CodeSlot[] = [
  {
    slot: "Slot A · SBEventPayloads.h",
    title: "USBDamageEventPayload em 04_SandboxCore",
    exige:
      "Classe UObject com AttackId (FString estável — chave de deduplicação), Direction (FVector), DamageAmount (float), bIsFatal (bool). Nunca dentro de 06 ou 09.",
    code: `// --- Slot A · Plugins/04_SandboxCore/Source/Public/SBEventPayloads.h ---
// Aguardando o corpo do build da Fase 19.
// Contrato: classe UObject (DD-04) + ataque id estável para deduplicação (DD-11). Nunca dentro de 06 ou 09.
UCLASS()
class SANDBOXCORE_API USBDamageEventPayload : public USBEventPayload
{
    GENERATED_BODY()
public:
    FString AttackId;      // chave estável — deduplicação client-side (TTL) ou bSkipClientNotify
    FVector Direction;     // vetor mundo no ponto autoritativo, para o ângulo no HUD
    float   DamageAmount;  // informativo — nunca mutar atributos a partir dele
    bool    bIsFatal;      // flag para feedback de dano letal
};`,
  },
  {
    slot: "Slot B · 06_SandboxCombat",
    title: "Ponto autoritativo de publicação no Hitscan",
    exige:
      "BroadcastMessage<Event.Combat.DamageReceived> dentro do caminho existente protegido por HasAuthority() — sem duplicar escritas de atributos nem tocar replicação; ordem de validação antes de mutação preservada.",
    code: `// --- Slot B · Plugins/06_SandboxCombat/Source/Private/Components/SBHitscanComponent.cpp ---
// Aguardando o corpo do build da Fase 19.
// Contrato: broadcast DEPOIS da validação autoritativa (HasAuthority), ANTES de qualquer escrita de atributo.
void USBHitscanComponent::ApplyDamage(...)
{
    if (!HasAuthority()) { return; }
    if (!Validate(authoritative)) { return; }
    auto* EventBus = GetSubsystem<USBEventSubsystem>();
    auto* Payload = NewObject<USBDamageEventPayload>();
    Payload->AttackId = BuildStableAttackId();
    Payload->Direction = GetWorldDirection();
    Payload->DamageAmount = BaseDamage;
    Payload->bIsFatal = bIsKillingBlow;
    EventBus->BroadcastMessage<UE::SBEvent::Combat::DamageReceived>(Payload);
    // SÓ AGORA: consumo transacional de atributos (TryConsumeAttribute) e replicação.
}`,
  },
  {
    slot: "Slot C · USBUIDamageIndicator (09_SandboxUI)",
    title: "Widget com anti-spill, prioridade Low e deduplicação AttackId",
    exige:
      "SubscribeToEvent com prioridade 20, filtro TargetPawn == owning pawn, mapa local de AttackIds recentes com TTL (ou verificação bSkipClientNotify no caminho feliz). Simetria add/remove completa em NativeDestruct.",
    code: `// --- Slot C · Plugins/09_SandboxUI/Source/Private/Widgets/SBUIDamageIndicator.cpp ---
// Aguardando o corpo do build da Fase 19.
// Contrato: anti-spill (DD-05), prioridade Low = 20, dedupe via AttackId (DD-11),
// simetria add/remove em NativeDestruct (DD-02).
void USBUIDamageIndicator::NativeConstruct()
{
    SubscribeToEvent<UE::SBEvent::Combat::DamageReceived>(
        this, &ThisClass::OnDamageReceived, ESBEventPriority::Low);
}
void USBUIDamageIndicator::OnDamageReceived(USBDamageEventPayload* P)
{
    if (!P || P->TargetPawn != GetOwningPlayerPawn()) { return; } // anti-spill (DD-05)
    if (RecentAttacks.Contains(P->AttackId)) { return; }          // dedupe (DD-11)
    RecentAttacks.Add(P->AttackId, GetWorld()->GetTimeSeconds());
    ShowDirectionalIndicator(ProjectToHUD(P->Direction));
}
void USBUIDamageIndicator::NativeDestruct()
{
    UnsubscribeAll(this); // simetria cirúrgica — DD-02
    Super::NativeDestruct();
}`,
  },
  {
    slot: "Slot D · SBUITests",
    title: "Cenários 7 e 8",
    exige:
      "Cenário 7: dano recebido exibe o indicador no ângulo esperado; Cenário 8: TargetPawn mismatch não renderiza nada no local player. Suíte completa 34/34 (6 existentes + 2 novos).",
    code: `// --- Slot D · Plugins/09_SandboxUI/Source/Private/Tests/SBUITests.cpp ---
// Aguardando o corpo do build da Fase 19.
// Contrato: Cenários 7 e 8 complementam os 6 existentes; suíte final 34/34 (32 F18 + 2).
IMPLEMENT_SBUI_TEST(F7_DamageIndicator_RendersAtExpectedAngle,
{
    GIVEN("dano recebido localmente com Direction vetorial")
    THEN("USBUIDamageIndicator exibe o indicador no ângulo HUD esperado")
    AND("apenas 1 indicador, mesmo com broadcast duplicado com AttackId igual")
})
IMPLEMENT_SBUI_TEST(F8_DamageIndicator_NoRenderOnTargetPawnMismatch,
{
    GIVEN("dano recebido por outro jogador (TargetPawn != owning pawn)")
    THEN("nenhum indicador é renderizado no local player")
})`,
  },
];

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
  { key: "suíte", label: "SBUITests completa 34/34 (6 existentes + 2 novos de dano)" },
  { key: "isolamento", label: "Teste de isolamento simétrico (hide 06 + hide 09, Exit Code 0)" },
  { key: "playtest", label: "Playtest Dedicated Server: indicador só no pawn afetado" },
  { key: "dd11", label: "DD-11 homologada: deduplicação client-side via AttackId (Ver DD-11)" },
  { key: "vault", label: "Vault + site carimbados v1.9.0 (Dashboard, task.md, siteData)" },
];

export default function Phase19() {
  const active = useActiveSection(TOC.map((t) => t.id));
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}>
            FASE 19
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 19 · v1.9.0 · homologation gate
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="19" version="v1.9.0 · em homologação" warn />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                porta de homologação · aguardando corpo do build
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Indicador Direcional de{" "}
            <em className="not-italic text-engineering">Dano</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Feedback visual direcional no HUD quando o pawn local sofre dano — o{" "}
            <code className="font-mono text-sm">USBUIDamageIndicator</code> adiado pela decisão DD-08,
            com novo ponto de publicação autoritativa em{" "}
            <code className="font-mono text-sm">06_SandboxCombat</code>.
          </p>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">
        <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-3xl">
          Esta página é o espaço reservado — o escopo, a injeção e os critérios de aceite ainda não foram
          homologados por revisão; os pré-requisitos, sim, são todos precedentes já homologados.
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
          Escopo proposto (contrato de homologação)
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

        <TechRule label="Corpo do código — porta de homologação" />

        <h2 id="corpo-codigo" className="mt-12 font-serif text-2xl font-bold">
          Corpo do código (homologação)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Quatro blocos de código fecham a homologação da Fase 19 — os locais exatos onde a revisão exigirá
          o corpo real, não a descrição em prosa. Até o build ser submetido, cada bloco permanece como
          slot auditável; a prosa não fecha homologação (padrão do projeto: nunca aceitar prosa como prova
          de comportamento).
        </p>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              4 slots auditáveis — concatene o contrato completo para a sprint
            </span>
            <CopyButton
              label="Copiar tudo"
              value={CODE_SLOTS.map((s) => `=== ${s.slot} ===\n${s.title}\n\n${s.code}`).join("\n\n")}
              onCopy={() =>
                toast("Contrato completo copiado", {
                  description: "Os 4 slots de homologação concatenados, prontos para a sprint no Vault.",
                })
              }
            />
          </div>
          {CODE_SLOTS.map((s) => (
            <div key={s.slot} className="border border-dashed border-amber-warn/50 bg-amber-warn/[0.04]">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
                <span className="font-mono text-[11px] text-amber-warn">{s.slot}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  aguardando corpo do build
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="font-medium text-sm">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.exige}</p>
              </div>
              {s.code && (
                <div className="px-4 pb-4">
                  <CodeBlock path={s.slot.replace(" · ", " — ")} language="cpp">
                    {s.code}
                  </CodeBlock>
                </div>
              )}
            </div>
          ))}
        </div>
        <AuditNote tone="info">
          A homologação acontece quando os quatro slots acima recebem os corpos reais de C++, os 34 cenários
          ficarem verdes e o teste de isolamento simétrico passar. A partir daí, o carimbo desta página muda
          de "em homologação" para v1.9.0 — assim como o registro DD-11 foi homologado com data e
          consequências.
        </AuditNote>

        <TechRule label="Checklist interativo da Fase 19" />

        <PhaseChecklist
          phaseLabel="Fase 19 — Indicador Direcional de Dano (v1.9.0 · em homologação)"
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
          Critérios de aceite da homologação
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

      {/* Índice lateral (mesmo padrão numerado das páginas longas do Manual/SFPS) */}
      <div className="container py-10 max-w-6xl -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Índice · Plano F19
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
