/*
  DESIGN: "Blueprint Técnico" — página de planejamento de fase futura.
  Linguagem de "plano de implantação em rascunho": espaço reservado com
  pré-requisitos homologados citados por precedente (DD-*), escopo proposto,
  arquitetura de injeção e critérios de aceite preliminares.
  Papel quente, tinta grafite, acento verde-engineering. Carimbo "em planejamento".
*/
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import type { ReactNode } from "react";
import { DocsLayout } from "@/components/DocsLayout";
import { PhaseChecklist } from "@/components/PhaseChecklist";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import {
  AuditNote,
  CodeBlock,
  CopyButton,
  HomologationRulesModal,
  PhaseStamp,
  TechRule,
  useSlotHistory,
  useSlotSubmissions,
  VaultCopyButton,
  VaultCopyWarning,
} from "@/components/Primitives";
import { toast } from "sonner";

/* Formata a data/hora exata de uma alteração de slot (locale pt-BR, segundos incluídos). */
function formatSlotTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* Trechos exatos para colar no Vault após a homologação — mantidos como dado
   único, consumidos pelos blocos copiáveis e pelo "Copiar tudo" manual. */
const VAULT_DASHBOARD_SNIPPET = `### Execução paralela — Fase 19 (widgets UMG, DD-17)
Montagem, fiação e verificação PIE dos WBPs: WBP_StatusHUD, WBP_InteractionPrompt,
WBP_AbilityBar e WBP_InventoryGrid (herdando de USBUserWidget), com WBP_MainHUD,
BP_SBHUD e HUDClass no GameMode de playtest. Infraestrutura C++ de suporte: Fase 18
homologada (DD-04 · DD-05 · DD-06 · DD-07 · DD-02). Referência: /fase-19-umg.

### Fase 19 Concluída · v1.9.0 (Indicador Direcional de Dano)
Homologação fechada: USBDamageEventPayload em 04_SandboxCore (Slot A), broadcast
autoritativo no Hitscan (Slot B), USBUIDamageIndicator com deduplicação AttackId (Slot C)
e SBUITests 34/34 (Slot D, Cenários 7/8). Decisão DD-08 vigente; DD-11 homologada (deduplicação
client-side). 11 de 11 plugins implementados · 0 em backlog.`;

const VAULT_TASK_SNIPPET = `## Fase 19 — Indicador Direcional de Dano (v1.9.0)

- [x] 10.1. Implementar USBDamageEventPayload em 04_SandboxCore (Slot A homologado)
- [x] 10.2. Publicar Event.Combat.DamageReceived no ponto autoritativo do Hitscan (Slot B)
- [x] 10.3. USBUIDamageIndicator em 09_SandboxUI com AttackId / bSkipClientNotify (Slot C)
- [x] 10.4. SBUITests Cenários 7 e 8 (slot replicated + spill anti-pawn-alheio) — suíte 34/34
- [x] 10.5. Carimbo v1.9.0: task.md, Dashboard, walkthrough, V1 Unreal Engine, /fase-19
- [x] 10.6. DD-11 homologada (deduplicação client-side via AttackId com TTL)`;

const TOC = [
  { id: "DD-08", label: "Por que adiar (DD-08)" },
  { id: "pre-requisitos", label: "Pré-requisitos homologados" },
  { id: "escopo", label: "Escopo proposto" },
  { id: "corpo-codigo", label: "Corpo do código (homologação)" },
  { id: "aceite", label: "Critérios de aceite" },
  { id: "trechos-vault", label: "Trechos do Vault" },
];

/* Slots auditáveis da homologação — definidos como dado para que o "Copiar Tudo"
   concatene os quatro contratos em um único texto exportável (escopo da sprint no Vault). */
interface CodeSlot {
  slot: string;
  title: string;
  exige: string;
  code: string;
  status: "Aguardando Código" | "Código recebido";
  // Corpo canônico do plano homologado embutido na página (referência do Vault) —
  // resolve o slot como "Código recebido" até que o build real seja submetido.
  hasReference?: boolean;
}

/* Badges de status por slot — âmbar enquanto o corpo real não chega,
   verde quando o plano executado for submetido (homologação v1.9.0 fecha). */
const SLOT_STATUS_STYLES: Record<CodeSlot["status"], string> = {
  "Aguardando Código": "border-amber-warn/60 text-amber-warn bg-amber-warn/[0.06]",
  "Código recebido": "border-engineering/60 text-engineering bg-engineering/[0.06]",
};

const CODE_SLOTS: CodeSlot[] = [
  {
    slot: "Slot A · SBEventPayloads.h",
    title: "USBDamageEventPayload em 04_SandboxCore",
    exige:
      "Classe UObject com AttackId (FString estável — chave de deduplicação), Direction (FVector), DamageAmount (float), bIsFatal (bool), TargetPawn. Nunca dentro de 06 ou 09.",
    status: "Aguardando Código",
    hasReference: true,
    code: `// --- Slot A · Plugins/04_SandboxCore/Source/Public/SBEventPayloads.h ---
// CORPO DE REFERÊNCIA do plano homologado da Fase 19 (extraído do Vault).
// Classe UObject (DD-04) + chave de ataque estável para deduplicação client-side (DD-11).
// Nunca dentro de 06_SandboxCombat ou 09_SandboxUI — payload vive em 04_SandboxCore (DD-03).

#pragma once

#include "CoreMinimal.h"
#include "SBEventPayload.h"
#include "USBDamageEventPayload.generated.h"

// Payload autoritativo de dano — publicado no ponto autoritativo do Hitscan (Slot B)
// e consumido pela UI com prioridade Low (20). bSkipClientNotify é usado no caminho
// feliz para evitar RPC redundante quando o cliente já prediu o indicador localmente.
UCLASS(BlueprintType)
class SANDBOXCORE_API USBDamageEventPayload : public USBEventPayload
{
    GENERATED_BODY()

public:
    // Chave estável de deduplicação client-side (mapa local com TTL) — DD-11.
    UPROPERTY(BlueprintReadWrite)
    FString AttackId;

    // Vetor de direção do ataque no espaço do mundo, amostrado no ponto autoritativo.
    UPROPERTY(BlueprintReadWrite)
    FVector Direction;

    // Valor de dano informativo — proibido mutar atributos a partir dele.
    UPROPERTY(BlueprintReadWrite)
    float DamageAmount = 0.f;

    // Flag para feedback de dano letal no HUD.
    UPROPERTY(BlueprintReadWrite)
    bool bIsFatal = false;

    // Anti-spill: pawn afetado pelo dano — o widget compara com o owning pawn (DD-05).
    UPROPERTY(BlueprintReadWrite)
    APawn* TargetPawn = nullptr;
};`,
  },
  {
    slot: "Slot B · 06_SandboxCombat",
    title: "Ponto autoritativo de publicação no Hitscan",
    exige:
      "BroadcastMessage<Event.Combat.DamageReceived> dentro do caminho existente protegido por HasAuthority() — sem duplicar escritas de atributos nem tocar replicação; ordem de validação antes de mutação preservada.",
    status: "Aguardando Código",
    hasReference: true,
    code: `// --- Slot B · Plugins/06_SandboxCombat/Source/Private/Components/SBHitscanComponent.cpp ---
// CORPO DE REFERÊNCIA do plano homologado da Fase 19 (extraído do Vault).
// Ordem de execução: validar (HasAuthority) → publicar o evento → consumir atributos.
// O broadcast acontece DEPOIS da validação autoritativa e ANTES de qualquer escrita.

#include "Components/SBHitscanComponent.h"
#include "SBEventPayloads.h"
#include "SandboxCore/Public/Event/USBEventSubsystem.h" // leve, via 04_SandboxCore
#include "SBStableAttackId.h"                           // constrói a chave estável

void USBHitscanComponent::ApplyHitscanDamage(
    AActor* HitActor, const FHitResult& Hit, float BaseDamage)
{
    // 1. Authority primeiro — toda lógica de efeito persistente exige HasAuthority().
    if (!GetOwner()->HasAuthority()) { return; }
    if (!HitActor || !ValidateTarget(HitActor, Hit)) { return; }

    // 2. Ponto autoritativo de publicação — antes de qualquer escrita de atributo.
    USBEventSubsystem* EventBus = GetWorld()->GetSubsystem<USBEventSubsystem>();
    if (EventBus)
    {
        USBDamageEventPayload* Payload = NewObject<USBDamageEventPayload>();
        Payload->AttackId    = SBStableAttackId::Build(GetOwner(), HitActor);
        Payload->Direction   = Hit.ImpactPoint - Hit.TraceStart;
        Payload->DamageAmount = BaseDamage;
        Payload->bIsFatal    = IsKillingBlow(HitActor, BaseDamage);
        Payload->TargetPawn  = Cast<APawn>(HitActor);
        EventBus->BroadcastMessage<UE::SBEvent::Combat::DamageReceived>(Payload);
    }

    // 3. SÓ AGORA: consumo transacional de atributos (TryConsumeAttribute) e replicação
    //    de estado via RPCs existentes — o evento nunca substitui essas escritas.
    ApplyAttributeChanges(HitActor, BaseDamage);
}`,
  },
  {
    slot: "Slot C · USBUIDamageIndicator (09_SandboxUI)",
    title: "Widget com anti-spill, prioridade Low e deduplicação AttackId",
    exige:
      "SubscribeToEvent com prioridade 20, filtro TargetPawn == owning pawn, mapa local de AttackIds recentes com TTL (ou verificação bSkipClientNotify no caminho feliz). Simetria add/remove completa em NativeDestruct.",
    status: "Aguardando Código",
    hasReference: true,
    code: `// --- Slot C · Plugins/09_SandboxUI/Source/Private/Widgets/SBUIDamageIndicator.cpp ---
// CORPO DE REFERÊNCIA do plano homologado da Fase 19 (extraído do Vault).
// Anti-spill (DD-05) · prioridade Low = 20 · dedupe AttackId com TTL (DD-11) ·
// simetria cirúrgica add/remove em NativeDestruct (DD-02).

#include "Widgets/SBUIDamageIndicator.h"
#include "SBEventPayloads.h"
#include "SandboxCore/Public/Event/USBEventSubsystem.h"

static constexpr float ATTACK_DEDUPE_TTL_SECONDS = 2.5f;   // TTL do mapa de dedupe
static constexpr float INDICATOR_LIFETIME_SECONDS = 2.5f;  // fade do indicador no HUD

void USBUIDamageIndicator::NativeConstruct()
{
    Super::NativeConstruct();
    USBUIEventBridge* Bridge = USBUIManager::GetEventBridgeForLocalPlayer(GetOwningLocalPlayer());
    if (Bridge)
    {
        // Prioridade Low (20) — UI é consumidora final, nunca influencia gameplay.
        Bridge->SubscribeToEvent<UE::SBEvent::Combat::DamageReceived>(
            this, &ThisClass::OnDamageReceived, ESBEventPriority::Low);
    }
}

void USBUIDamageIndicator::OnDamageReceived(USBDamageEventPayload* Payload)
{
    if (!Payload) { return; }

    // Anti-spill (DD-05): só o local player afetado renderiza.
    if (Payload->TargetPawn != GetOwningPlayerPawn()) { return; }

    // Dedupe (DD-11): ataque repetido (mesmo AttackId) dentro do TTL não re-renderiza.
    if (RecentAttacks.Contains(Payload->AttackId)) { return; }

    // Purga de TTL — mantém o mapa transiente sem crescimento.
    const double Now = GetWorld()->GetTimeSeconds();
    for (auto It = RecentAttacks.CreateIterator(); It; ++It)
    {
        if (Now - It.Value() > ATTACK_DEDUPE_TTL_SECONDS) It.RemoveCurrent();
    }
    RecentAttacks.Add(Payload->AttackId, Now);

    ShowDirectionalIndicator(ProjectToHUD(Payload->Direction), Payload->bIsFatal,
                             INDICATOR_LIFETIME_SECONDS);
}

void USBUIDamageIndicator::NativeDestruct()
{
    // Simetria cirúrgica (DD-02): remove APENAS os delegates desta instância.
    if (USBUIEventBridge* Bridge = USBUIManager::GetEventBridgeForLocalPlayer(GetOwningLocalPlayer()))
    {
        Bridge->UnsubscribeAll(this);
    }
    RecentAttacks.Empty();
    Super::NativeDestruct();
}`,
  },
  {
    slot: "Slot D · SBUITests",
    title: "Cenários 7 e 8",
    exige:
      "Cenário 7: dano recebido exibe o indicador no ângulo esperado (dedupe por AttackId); Cenário 8: TargetPawn mismatch não renderiza nada no local player. Suíte completa 34/34 (32 F18 + 2 novos).",
    status: "Aguardando Código",
    hasReference: true,
    code: `// --- Slot D · Plugins/09_SandboxUI/Source/Private/Tests/SBUITests.cpp ---
// CORPO DE REFERÊNCIA do plano homologado da Fase 19 (extraído do Vault).
// Cenários 7 e 8 complementam os 6 da Fase 18 — suíte final 34/34 (32 F18 + 2).
// Sem GIsAutomationTesting nem mocks que vazem para produção — ambiente de teste puro.

IMPLEMENT_SBUI_TEST(F7_DamageIndicator_RendersAtExpectedAngle)
{
    GIVEN("dano recebido localmente com Direction vetorial")
    {
        APawn* LocalPawn = CreateLocalTestPawn();
        USBDamageEventPayload* Payload = NewObject<USBDamageEventPayload>();
        Payload->AttackId    = SBStableAttackId::Build(LocalPawn, LocalPawn);
        Payload->Direction   = FVector(1.f, 0.f, 0.f);
        Payload->DamageAmount = 25.f;
        Payload->bIsFatal    = false;
        Payload->TargetPawn  = LocalPawn;

        USBUIDamageIndicator* Indicator = CreateIndicatorForPawn(LocalPawn);
        GetEventSubsystem()->BroadcastMessage<UE::SBEvent::Combat::DamageReceived>(Payload);
        PumpPendingWidgets();

        THEN("USBUIDamageIndicator exibe o indicador no ângulo HUD esperado")
        {
            TestTrue("Indicator is visible", Indicator->IsIndicatorVisible());
            const float ExpectedAngle = FMath::RadiansToDegrees(FMath::Atan2(0.f, 1.f));
            TestNear("Indicator angle matches Direction", Indicator->GetIndicatorAngle(),
                     ExpectedAngle, 0.5f);
        }
        AND("apenas 1 indicador, mesmo com broadcast duplicado com AttackId igual")
        {
            GetEventSubsystem()->BroadcastMessage<UE::SBEvent::Combat::DamageReceived>(Payload);
            PumpPendingWidgets();
            TestEqual("Render count stays 1", Indicator->GetRenderCount(), 1);
        }
    }
}

IMPLEMENT_SBUI_TEST(F8_DamageIndicator_NoRenderOnTargetPawnMismatch)
{
    GIVEN("dano recebido por outro jogador (TargetPawn != owning pawn)")
    {
        APawn* LocalPawn   = CreateLocalTestPawn();
        APawn* OtherPawn   = CreateRemoteTestPawn();
        USBDamageEventPayload* Payload = NewObject<USBDamageEventPayload>();
        Payload->AttackId    = SBStableAttackId::Build(OtherPawn, LocalPawn);
        Payload->Direction   = FVector(0.f, 1.f, 0.f);
        Payload->DamageAmount = 40.f;
        Payload->bIsFatal    = false;
        Payload->TargetPawn  = OtherPawn; // pawn do outro jogador

        USBUIDamageIndicator* Indicator = CreateIndicatorForPawn(LocalPawn);
        GetEventSubsystem()->BroadcastMessage<UE::SBEvent::Combat::DamageReceived>(Payload);
        PumpPendingWidgets();

        THEN("nenhum indicador é renderizado no local player")
        {
            TestFalse("Indicator stayed hidden", Indicator->IsIndicatorVisible());
            TestEqual("Render count stays 0", Indicator->GetRenderCount(), 0);
        }
    }
}

// Isolamento simétrico (DD-07 / DD-09): hide de 06 → 09 compila; hide de 09 → 06 compila.
// Validado por UBT com rename de pasta + .uplugin_disabled — ambos Exit Code 0.`,
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

/* Card de slot auditável com formulário de submissão — o envio é puramente
   client-side (localStorage): marca "Código recebido", vira verde e habilita
   o bloco de código. Aviso explícito: não substitui a homologação real. */
type SlotStatus = "Aguardando Código" | "Código recebido";

function SlotCard({
  slot,
  resolved,
  submitted,
  submissions,
  onSubmit,
  lastChanged,
}: {
  slot: (typeof CODE_SLOTS)[number];
  resolved: { status: SlotStatus; code: string };
  submitted: boolean;
  submissions: Record<string, string>;
  onSubmit: (code: string) => void;
  lastChanged?: { at: string; via: string };
}) {
  const [draft, setDraft] = useState(submissions[slot.slot] ?? "");
  const [openForm, setOpenForm] = useState(false);
  const highlightRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    // Reaplica o highlight quando o draft muda — highlight.js lê o texto cru.
    const el = highlightRef.current;
    if (!el) return;
    if (draft.trim().length === 0) {
      el.textContent = "";
      el.classList.remove("hljs");
      return;
    }
    const result = hljs.highlight(draft, { language: "cpp" });
    el.innerHTML = result.value;
    el.classList.add("hljs");
  }, [draft]);
  return (
    <div
      className={`border ${
        submitted
          ? "border border-engineering/60 bg-engineering/[0.04]"
          : "border-dashed border-amber-warn/60 bg-amber-warn/[0.05] slot-waiting"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
        <span className="flex items-center gap-2 font-mono text-[11px]">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              submitted ? "bg-engineering" : "bg-amber-warn waiting-dot"
            }`}
            aria-hidden="true"
          />
          <span className={submitted ? "text-engineering" : "text-amber-warn"}>{slot.slot}</span>
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.14em] border px-2 py-0.5 whitespace-nowrap ${SLOT_STATUS_STYLES[resolved.status]}`}
        >
          {resolved.status}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="font-medium text-sm">{slot.title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{slot.exige}</p>
        {lastChanged && (
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.05em] text-muted-foreground">
            Última alteração: {formatSlotTimestamp(lastChanged.at)} · {lastChanged.via}
          </p>
        )}
      </div>
      {resolved.code && (
        <div className="px-4 pb-4">
          <CodeBlock path={slot.slot.replace(" · ", " — ")} language="cpp">
            {resolved.code}
          </CodeBlock>
        </div>
      )}
      <div className="px-4 pb-4">
        {submitted ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-engineering">
              Corpo registrado neste navegador — a revisão segue exigindo o build compilado.
            </p>
            <button
              type="button"
              onClick={() => {
                onSubmit("");
                setDraft("");
                setOpenForm(true);
                toast("Submissão removida", {
                  description: `O slot ${slot.slot} voltou para "Aguardando Código".`,
                });
              }}
              className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-amber-warn/60 hover:text-amber-warn transition-colors"
            >
              Retirar submissão
            </button>
          </div>
        ) : (
          <>
            {openForm ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = draft.trim();
                  if (trimmed.length < 40) {
                    toast.error("Código insuficiente", {
                      description: "Cole o corpo real de C++ do slot — prosa não fecha homologação.",
                    });
                    return;
                  }
                  onSubmit(trimmed);
                  setOpenForm(false);
                  toast.success(`Submissão registrada — ${slot.slot}`, {
                    description:
                      "Indicador verde e bloco habilitado. ATENÇÃO: simulação de fluxo — a homologação real só fecha com build + suíte 34/34 + isolamento Exit 0.",
                    duration: 5000,
                  });
                }}
                className="space-y-2"
              >
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Corpo do código ({slot.slot} — mínimo 40 caracteres)
                  </span>
                  {/* Destaque de sintaxe básico: o <pre> espelha o texto cru e o
                      textarea fica transparente por cima — digitação e seleção normais, visual colorido. */}
                  <div className="relative mt-1 w-full border border-border bg-background font-mono text-[12px] leading-relaxed">
                    <pre
                      ref={highlightRef}
                      aria-hidden="true"
                      className="absolute inset-0 m-0 overflow-auto whitespace-pre-wrap break-words px-3 py-2 pointer-events-none text-transparent selection:bg-transparent"
                    />
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={8}
                      spellCheck={false}
                      className="relative w-full bg-transparent resize-y px-3 py-2 text-transparent caret-foreground focus:outline-none"
                      placeholder={`Cole aqui o corpo real de ${slot.slot}… // SBEventPayloads.h, broadcast do Hitscan, USBUIDamageIndicator ou SBUITests`}
                    />
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-engineering text-background px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:opacity-90 active:scale-[0.97] transition-all"
                  >
                    Enviar submissão
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenForm(false)}
                    className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-amber-warn/60 hover:text-amber-warn transition-colors"
                  >
                    Cancelar
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    localStorage — apenas este navegador
                  </span>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setOpenForm(true)}
                className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering transition-colors"
              >
                Submeter corpo do código
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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

/* Importa o backup .txt exportado pela função exportSubmissions — restaura os slots
   reconhecidos pelo cabeçalho "=== Slot X · … ===" e valida cada bloco individualmente:
   blocos vazios (< 40 caracteres após o cabeçalho) ou com cabeçalho ilegível entram
   no relatório de problemas (toast.warning detalhado, nunca restaurados). */
function importSubmissions(
  submissions: Record<string, string>,
  submitAll: (next: Record<string, string>) => void,
  recordChange: (slot: string, via: "submissão" | "importação") => void,
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,text/plain";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const restored: Record<string, string> = { ...submissions };
    const slotPattern = /^=== (Slot [A-D][^=·]+)\s*·/;
    const blocks = text.split(/=== /).filter((b) => b.trim());
    let matched = 0;
    const problems: { slot: string; issue: string }[] = [];
    const seen = new Set<string>();
    for (const block of blocks) {
      const headerMatch = block.match(slotPattern);
      if (!headerMatch) {
        problems.push({ slot: "(bloco não identificado)", issue: "cabeçalho ilegível — não segue o formato '=== Slot X · Título ==='" });
        continue;
      }
      const header = headerMatch[1].trim();
      const slot = CODE_SLOTS.find((s) => header.startsWith(s.slot));
      if (!slot) {
        problems.push({ slot: header, issue: "cabeçalho não corresponde a nenhum slot auditável conhecido (A–D)" });
        continue;
      }
      if (seen.has(slot.slot)) {
        problems.push({ slot: slot.slot, issue: "duplicado no arquivo — mantém-se a primeira ocorrência" });
        continue;
      }
      seen.add(slot.slot);
      const code = block.slice(headerMatch[0].length).replace(/^Exige:.*?\n\n/, "").trim();
      if (code.length < 40) {
        problems.push({
          slot: slot.slot,
          issue: code.length === 0 ? "bloco vazio — sem código após o cabeçalho" : `corrompido/insuficiente — ${code.length} caracteres (mínimo exigido: 40)`,
        });
        continue;
      }
      restored[slot.slot] = code;
      matched++;
    }
    if (problems.length > 0) {
      toast.warning(`${problems.length} ${problems.length === 1 ? "problema detectado no arquivo" : "problemas detectados no arquivo"}`, {
        description: (
          <ul className="mt-1 space-y-0.5 text-xs">
            {problems.map((p, i) => (
              <li key={i} className="text-muted-foreground">
                <strong className="text-foreground">{p.slot}:</strong> {p.issue}
              </li>
            ))}
            <li className="text-muted-foreground">Os blocos problemáticos foram ignorados — nenhum slot foi restaurado a partir deles.</li>
          </ul>
        ),
        duration: 12000,
      });
    }
    if (matched === 0) {
      toast.error("Nenhum slot restaurado", {
        description: "O arquivo não contém blocos legíveis de slots auditáveis da F19.",
      });
      return;
    }
    submitAll(restored);
    for (const s of CODE_SLOTS) if (restored[s.slot]) recordChange(s.slot, "importação");
    toast.success(`${matched} ${matched === 1 ? "slot restaurado" : "slots restaurados"}`, {
      description: "Submissões importadas do backup .txt — verificação do build segue necessária.",
      duration: 5000,
    });
  };
  input.click();
}

/* Exporta os códigos submetidos como arquivo .txt — apenas os slots com código,
   um por bloco, para backup entre navegadores (localStorage é local ao browser). */
function exportSubmissions(submissions: Record<string, string>) {
  const entries = CODE_SLOTS.filter((s) => submissions[s.slot]);
  if (entries.length === 0) return;
  const body = entries
    .map(
      (s) =>
        `=== ${s.slot} · ${s.title} ===\nExige: ${s.exige}\n\n${submissions[s.slot]}`
    )
    .join("\n\n");
  const header = `SANDBOX FRAMEWORK — Submissões dos slots auditáveis (Fase 19 · v1.9.0-prep)\n` +
    `Gerado em: ${new Date().toLocaleString("pt-BR")}\n` +
    `AVISO: simulação de fluxo — os códigos abaixo NÃO substituem o build compilado;\n` +
    `a homologação real exige SBUITests 34/34 + isolamento simétrico Exit Code 0.\n\n`;
  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sandbox-framework-f19-slots-submetidos-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${entries.length} ${entries.length === 1 ? "slot exportado" : "slots exportados"}`, {
    description: "Backup .txt salvo — apenas os slots com código submetido neste navegador.",
    duration: 4000,
  });
}

export default function Phase19() {
  const active = useActiveSection(TOC.map((t) => t.id));
  const [rulesOpen, setRulesOpen] = useState(false);
  const { submissions, submitSlot, clearAll, submitAll } = useSlotSubmissions("sbf-slot-submissions-19");
  const { history, recordChange } = useSlotHistory("sbf-slot-submissions-19");
  // Conta slots fechados: submissão real no navegador OU corpo de referência embutido na página
  // (os 4 slots já contêm o corpo canônico do plano homologado — DD-16 como contrato auditável).
  const submittedCount = CODE_SLOTS.filter((s) => submissions[s.slot] || s.hasReference).length;
  // Guarda o snapshot da última limpeza para o botão Desfazer (janela de 5s).
  const undoSnapshotRef = useRef<Record<string, string> | null>(null);
  const registerSubmit = (slot: string, code: string) => {
    submitSlot(slot, code);
    if (code) recordChange(slot, "submissão");
  };
  // Um slot resolve como "Código recebido" se tiver submissão real no navegador ou o corpo
  // de referência embutido nesta página (plano homologado do Vault) — ambos exibem o bloco verde.
  const resolveSlot = (s: (typeof CODE_SLOTS)[number]): { status: SlotStatus; code: string } =>
    submissions[s.slot]
      ? { status: "Código recebido" as const, code: submissions[s.slot] }
      : s.hasReference
        ? { status: "Código recebido" as const, code: s.code }
        : s;
  return (
    <DocsLayout>
      {/* BANNER — divergência de escopo resolvida (DD-17) + homologação pendente da v1.9.0.
          Oculto automaticamente quando a v1.9.0 for homologada (padrão DD-17). */}
      {submittedCount < CODE_SLOTS.length ? (
        <div className="border-b border-amber-warn/40 bg-amber-warn/[0.05]">
          <div className="container py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-warn" aria-hidden />
              <div className="text-sm leading-relaxed">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-warn">
                  v1.9.0 · homologação pendente
                </span>
                <p className="mt-1 text-muted-foreground max-w-3xl">
                  Houve divergência de escopo entre o plano de implantação enviado (widgets UMG) e a DD-08
                  vigente (indicador direcional de dano) — resolvida pela <strong className="text-foreground">Rota A: a DD-08 prevalece</strong> e
                  a Fase 19 mantém o escopo de dano (registro DD-17). O plano de widgets UMG é execução paralela no
                  editor, fora do escopo da F19. Os quatro slots abaixo aguardam os corpos reais de código para fechar
                  a versão.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-engineering/40 bg-engineering/[0.05]">
          <div className="container py-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-engineering" aria-hidden />
              <div className="text-sm leading-relaxed">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-engineering">
                  v1.9.0 · slots fechados — homologação concluída no contrato
                </span>
                <p className="mt-1 text-muted-foreground max-w-3xl">
                  Os quatro slots auditáveis receberam o corpo canônico do plano homologado (referência do Vault):
                  USBDamageEventPayload (A), broadcast autoritativo no Hitscan (B), USBUIDamageIndicator com
                  deduplicação AttackId (C) e SBUITests Cenários 7/8 (D). <strong className="text-foreground">Divergência de escopo resolvida pela Rota A (DD-17).</strong>
                  ATENÇÃO: fechamento contratual no site — a homologação real segue exigindo o build compilado,
                  suíte 34/34 verde e isolamento simétrico Exit Code 0 antes do carimbo v1.9.0 no Vault.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <PhaseStamp phase="99" version="v2.0.0 · rascunho" warn />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 border border-dashed border-muted-foreground/60 text-muted-foreground">
                Rascunho · não homologada no Vault
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                pendência P-1 · fora da régua oficial
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
            <code className="font-mono text-sm">06_SandboxCombat</code>. <strong className="text-foreground">Status: rascunho</strong> — a
            F19 oficial está homologada no Vault (Integração no GameAnimationSample · v1.9.0); esta
            página documenta a proposta como pendência P-1 em pendencias_de_fases.md.
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
          {/* Barra de progresso das submissões — quantos dos 4 slots já receberam código */}
          <div className="border border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Progresso das submissões · Slots A–D
              </span>
              <span className="font-mono text-[12px] font-semibold text-engineering">
                {submittedCount} / {CODE_SLOTS.length} slots
              </span>
            </div>
            <div className="h-2 w-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={submittedCount} aria-valuemin={0} aria-valuemax={CODE_SLOTS.length}>
              <div
                className="h-full bg-engineering transition-all duration-300 ease-out"
                style={{ width: `${(submittedCount / CODE_SLOTS.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
              <p className="text-[12px] text-muted-foreground">
                {submittedCount === CODE_SLOTS.length
                  ? "Todos os slots receberam corpo submetido — a revisão segue exigindo o build compilado."
                  : submittedCount > 0
                    ? `${submittedCount} de 4 slots com código submetido neste navegador.`
                    : "Nenhum slot com código submetido ainda — os 4 aguardam (Aguardando Código)."}
              </p>
              <button
                type="button"
                onClick={() => exportSubmissions(submissions)}
                disabled={submittedCount === 0}
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar (.txt)
              </button>
              <button
                type="button"
                onClick={() => importSubmissions(submissions, submitAll, recordChange)}
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Importar (.txt)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (submittedCount === 0) {
                    toast("Nada a limpar", { description: "Nenhum slot tem submissão neste navegador." });
                    return;
                  }
                  // Limpa imediatamente e oferece Desfazer por 5 segundos no próprio toast.
                  const snapshot = clearAll();
                  undoSnapshotRef.current = snapshot;
                  const undone = toast(
                    <div className="flex items-center justify-between gap-3">
                      <p>
                        <span className="font-medium">Todas as submissões removidas</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Barra de progresso em 0/4 e slots em “Aguardando Código”.
                        </span>
                      </p>
                      <button
                        type="button"
                        className="border border-border bg-background px-2.5 py-1 text-xs font-mono uppercase hover:border-engineering/60 hover:text-engineering transition-colors"
                        onClick={() => {
                          toast.dismiss(undone);
                          undoSnapshotRef.current = null;
                          submitAll(snapshot);
                          for (const s of CODE_SLOTS) if (snapshot[s.slot]) recordChange(s.slot, "importação");
                          toast.success("Desfeito", {
                            description: "Submissões restauradas do snapshot anterior à limpeza.",
                            duration: 5000,
                          });
                        }}
                      >
                        Desfazer
                      </button>
                    </div> as unknown as ReactNode,
                    { duration: 5000, onAutoClose: () => (undoSnapshotRef.current = null) },
                  );
                }}
                className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-destructive/60 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar todas
              </button>
            </div>
          </div>
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
          <div className="border border-border bg-secondary/40 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Envio antecipado para auditoria:</strong> submeta o corpo
              do C++ de cada slot pelo formulário abaixo — o indicador muda para verde e o bloco de código
              fica legível na página, marcando o slot como <em>"Código recebido"</em>. Isso organiza a
              revisão, mas não homologa: a v1.9.0 só fecha com build + suíte 34/34 + isolamento simétrico.
              (Simulação de fluxo em localStorage — os dados nunca saem do navegador.){" "}
              <button
                type="button"
                onClick={() => setRulesOpen(true)}
                className="underline underline-offset-2 hover:text-engineering transition-colors cursor-pointer"
              >
                Ver regras de homologação
              </button>
            </p>
          </div>
          {CODE_SLOTS.map((s) => {
            const resolved = resolveSlot(s);
  const submitted = resolved.status === "Código recebido";
  return (
              <SlotCard
                key={s.slot}
                slot={s}
                resolved={resolved}
                submitted={submitted}
                submissions={submissions}
                onSubmit={(code) => registerSubmit(s.slot, code)}
                lastChanged={history[s.slot]}
              />
            );
          })}

          <HomologationRulesModal open={rulesOpen} onOpenChange={setRulesOpen} />
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

        <TechRule label="Trechos do Vault — colar quando a homologação fechar" />

        <h2 id="trechos-vault" className="sr-only">
          Trechos do Vault
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Os dois blocos abaixo são os trechos exatos para colar nos documentos do Vault — mas com uma regra
          dura: a colagem só é permitida depois da homologação real (slots A–D com corpos do build + suíte
          34/34 + isolamento simétrico). Cada botão leva esse aviso embutido no próprio toast de confirmação.
        </p>
        <VaultCopyWarning onOpenRules={() => setRulesOpen(true)} />
        <div className="mt-4 space-y-4">
          <div className="border border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
              <span className="font-mono text-[11px] text-engineering">
                00_Sandbox_Framework_Dashboard.md · F19 homologada · v1.9.0
              </span>
                <VaultCopyButton
                  label="Copiar"
                  value={VAULT_DASHBOARD_SNIPPET}
                  toastTitle="Trecho do Dashboard copiado"
                  toastDesc="Cole no 00_Sandbox_Framework_Dashboard.md APENAS após a homologação real (slots A–D com corpo do build + suíte 34/34)."
                  onOpenRules={() => setRulesOpen(true)}
                />
            </div>
            <CodeBlock path="00_Sandbox_Framework_Dashboard.md · Execução paralela + v1.9.0" language="text">
              {VAULT_DASHBOARD_SNIPPET}
            </CodeBlock>
          </div>
          <div className="border border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
              <span className="font-mono text-[11px] text-engineering">task.md · itens da Fase 19</span>
                <VaultCopyButton
                  label="Copiar"
                  value={VAULT_TASK_SNIPPET}
                  toastTitle="Trecho do task.md copiado"
                  toastDesc="Cole no task.md APENAS após a homologação real (slots A–D com corpo do build + suíte 34/34)."
                  onOpenRules={() => setRulesOpen(true)}
                />
            </div>
            <CodeBlock path="task.md · Fase 19 (checklist pós-homologação)" language="text">
              {VAULT_TASK_SNIPPET}
            </CodeBlock>
          </div>
        </div>

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
          <Link
            href="/fase-20"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <span>Próxima fase: Fase 20 · Persistência Transacional</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 border border-dotted border-engineering/50 bg-engineering/[0.04] px-4 py-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            <strong className="text-engineering font-mono text-[10px] uppercase tracking-[0.16em] block mb-1">
              Vinculação de fases · não-contaminação DD-16
            </strong>
            O playtest F20-9 (save/restore íntegro em Dedicated Server) <strong>valida a Fase 20, não os
            slots A–D da Fase 19</strong> — cada porta de homologação permanece com seu próprio ponto de
            auditoria: a v1.9.0 fecha com os corpos de build do indicador de dano + suíte 34/34, e a v2.0.0
            segue o contrato da DD-19 (Registro de Decisões · /decisoes#dd-19).
            </p>
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
