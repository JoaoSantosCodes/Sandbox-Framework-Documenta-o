/*
  DESIGN: "Blueprint Técnico" — Editorial de engenharia / spec manual.
  Página: Guia de Desenvolvimento (SFDG v1.0.0) — procedimentos operacionais em C++.
  Linguagem: trilho lateral de seções, carimbos mono, code blocks escuros, notas de auditoria.
*/
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { CodeBlock, AuditNote, TechRule } from "@/components/Primitives";
import { CopySectionButton } from "@/components/CopySectionButton";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";

const DD = [
  { id: "DD-01", title: "USBUIManager herda de ULocalPlayerSubsystem", rule: "Não escreva isolamento manual de UI por jogador — a engine instancia uma cópia por ULocalPlayer (split-screen e Listen Server inclusos)." },
  { id: "DD-02", title: "Auto-unsubscribe cirúrgico em NativeDestruct", rule: "USBUserWidget rastreia cada assinatura em FSBWidgetEventSubscription (tag + delegate) e remove por delegate individual na destruição; SubscribeToEvent é idempotente." },
  { id: "DD-03", title: "Payloads em SBEventPayloads.h (04_SandboxCore)", rule: "Todo payload de evento vive em 04_SandboxCore. O 09_SandboxUI nunca inclui cabeçalhos de 05/06/07/08." },
  { id: "DD-04", title: "Payloads como classes UObject (GC + Blueprint)", rule: "Use classes UObject para consumo em UMG Blueprint; structs FSB* continuam válidas para comunicação interna C++. Custo aceitável: UI é consumidora de prioridade Low (20)." },
  { id: "DD-05", title: "Anti-spill obrigatório em todo widget", rule: "Todo widget de gameplay valida TargetPawn == owning pawn antes de renderizar (Cenário 2 da SBUITests)." },
  { id: "DD-06", title: "Quatro eventos canônicos de inventário", rule: "Event.Inventory.ItemAdded/ItemRemoved/ItemEquipped/ItemUnequipped são contrato estável — nunca substituir por evento genérico discriminado." },
  { id: "DD-07", title: "Throttle de 60 Hz em Event.Interaction.Progress", rule: "O produtor autoritativo (TickComponent do USBInteractionComponent) publica no máximo a 60 Hz; o widget consome com dirty-flag." },
  { id: "DD-08", title: "Indicador de dano adiado para Fase 19", rule: "USBUIDamageIndicator nasce na Fase 19, com novo ponto autoritativo de publicação no hitscan de 06_SandboxCombat." },
];

const BEHAVIOR = `bool USBMovementBehaviorSprint::CanActivate_Implementation(
    const FSBBehaviorContext& Context)
{
    // O contexto unificado absorve novos tipos de contexto sem
    // quebrar a assinatura da função
    const FSBGameplayContext* Gameplay = Context.GameplayContext;
    if (Gameplay && Gameplay->PlayerState)
    {
        // Validação usando PlayerState
    }
    return true;
}`;

const ROUTER = `// 1. Mensagem instantânea (transiente)
FSBWeaponFiredMessage Message;
Message.Instigator = GetOwner();
USBEventSubsystem::Get(GetWorld())->BroadcastMessage(
    FSBGameplayTags::Get().Event_Weapon_Fire, Message);

// 2. Mensagem de estado persistente (stateful)
FSBCharacterStateMessage SprintState;
SprintState.bIsActive = true;
USBEventSubsystem::Get(GetWorld())->PublishState(
    FSBGameplayTags::Get().State_Character_Sprinting, SprintState);

// 3. Limpeza do cache de estado no ciclo de vida do ator
void ASBCharacter::ResetState_Implementation()
{
    // Invalida os caches de estado associados a este Actor no barramento
    if (USBEventSubsystem* Events = GetWorld()->GetSubsystem<USBEventSubsystem>())
    {
        Events->ClearStateCacheForActor(this);
    }
}`;

const REPLICABLE = `// 1. Implementar ISBReplicable no behavior
class USBMovementBehaviorSprint : public USBMovementBehavior,
                                  public ISBReplicable
{
    GENERATED_BODY()
public:
    // Empacotamento de dados para replicação
    virtual void GetLifetimeReplicatedProps(
        TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // Processamento local do estado recebido
    virtual void OnRep_State() override;
};

// 2. O orquestrador intercepta e despacha as atualizações replicadas
void USBMovementComponent::GetLifetimeReplicatedProps(
    TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    // Repassa a replicação para os behaviors ativos
    if (USBBehaviorRegistryBase* Registry = GetBehaviorRegistry())
    {
        Registry->ReplicateActiveBehaviors(OutLifetimeProps);
    }
}`;

const PICKUP = `// SBTestInstantPickup.h — objeto interativo instantâneo (Duração 0)
class ASBTestInstantPickup : public AActor,
                             public ISBInteractableInterface
{
    GENERATED_BODY()

public:
    virtual void Interact_Implementation(AActor* Interactor) override
    {
        // Regra de Ouro: sempre valide se roda sob autoridade do servidor
        if (!HasAuthority()) return;

        // Lógica do pickup (ex: conceder recurso ao Interactor)
        Destroy();
    }

    virtual FText GetInteractionPrompt_Implementation(
        AActor* Interactor) const override
    {
        return NSLOCTEXT("Interaction", "PickupPrompt", "Coletar Item");
    }
};`;

const LOCKED = `// ASBTestLockedChest — hold progressivo + lock de concorrência
class ASBTestLockedChest : public AActor,
                           public ISBInteractableInterface
{
    GENERATED_BODY()

protected:
    // Rastreia quem possui o lock no Servidor
    UPROPERTY(Transient)
    TWeakObjectPtr<AActor> CurrentLockOwner = nullptr;

    UPROPERTY(EditAnywhere)
    float UnlockDuration = 2.0f;

public:
    // 1. Duração necessária para o Hold
    virtual float GetInteractionDuration_Implementation(
        AActor* Interactor) const override
    {
        return UnlockDuration;
    }

    // 2. Verifica se o objeto já está travado por outro jogador
    virtual bool IsInteractionLocked_Implementation(
        AActor* Interactor) const override
    {
        return CurrentLockOwner.IsValid()
            && CurrentLockOwner != Interactor;
    }

    // 3. Adquire o Lock
    virtual void LockInteraction_Implementation(AActor* Interactor) override
    {
        if (HasAuthority() && !CurrentLockOwner.IsValid())
        {
            CurrentLockOwner = Interactor;
        }
    }

    // 4. Libera o Lock (crucial: chamar em todos os fluxos de término)
    virtual void UnlockInteraction_Implementation(AActor* Interactor) override
    {
        if (HasAuthority() && CurrentLockOwner == Interactor)
        {
            CurrentLockOwner = nullptr;
        }
    }

    // 5. Execução lógica final sob autoridade do servidor
    virtual void Interact_Implementation(AActor* Interactor) override
    {
        if (!HasAuthority()) return;
        // Concede a recompensa...
    }
};`;

const PROMPT_WIDGET = `// 09_SandboxUI reagindo aos eventos de interação
void USBUIPromptWidget::InitializeWidget()
{
    if (USBEventSubsystem* EventSubsystem =
        GetWorld()->GetSubsystem<USBEventSubsystem>())
    {
        EventSubsystem->SubscribeToEvent(
            FGameplayTag::RequestGameplayTag("Event.Interaction.Available"),
            ESBEventPriority::Medium,
            FSBBlueprintEventDelegate::CreateUObject(
                this, &USBUIPromptWidget::OnInteractionAvailable));

        EventSubsystem->SubscribeToEvent(
            FGameplayTag::RequestGameplayTag("Event.Interaction.Cleared"),
            ESBEventPriority::Medium,
            FSBBlueprintEventDelegate::CreateUObject(
                this, &USBUIPromptWidget::OnInteractionCleared));

        EventSubsystem->SubscribeToEvent(
            FGameplayTag::RequestGameplayTag("Event.Interaction.Progress"),
            ESBEventPriority::Medium,
            FSBBlueprintEventDelegate::CreateUObject(
                this, &USBUIPromptWidget::OnInteractionProgress));
    }
}

void USBUIPromptWidget::OnInteractionProgress(
    FGameplayTag EventTag, UObject* Payload)
{
    if (USBInteractionProgressEventPayload* Data =
        Cast<USBInteractionProgressEventPayload>(Payload))
    {
        // Atualiza a barra com Data->ProgressPercent (0.0f a 1.0f)
    }
}`;

const ABILITY = `void UPBAbility_Teleport::Enter_Implementation(
    const FSBBehaviorContext& Context)
{
    Super::Enter_Implementation(Context);

    // Implemente a execução da habilidade aqui (efeitos visuais, física)

    // Termina a execução e ejeta a habilidade da pilha de ativação
    if (USBAbilityComponent* Comp = Cast<USBAbilityComponent>(
        Context.GameplayContext->Character->FindComponentByClass<
            USBAbilityComponent>()))
    {
        Comp->StopBehavior(AbilityTag);
    }
}

void UPBAbility_Teleport::Exit_Implementation(
    const FSBBehaviorContext& Context)
{
    // Limpe modificadores temporários e pare animações de habilidade
    Super::Exit_Implementation(Context);
}`;

const SAVE = `// Assinando ISBSaveInterface em qualquer componente persistente
class MYGAME_API UMyComponent : public UActorComponent,
                                public ISBSaveInterface
{
    GENERATED_BODY()

    virtual void SaveComponentData_Implementation(
        USBSavePayload* Payload) override
    {
        // Grava o estado atual sob uma chave única (GetPathName)
        Payload->SerializeObject(GetPathName(), this);
    }

    virtual void LoadComponentData_Implementation(
        USBSavePayload* Payload) override
    {
        // Restaura o estado a partir do buffer binário persistido
        Payload->DeserializeObject(GetPathName(), this);
    }

    virtual int32 GetSavePriority_Implementation() const override
    {
        // Valores maiores executam primeiro:
        // Atributos = 100, Inventário = 50, Padrão = 0
        return 0;
    }
};`;

const UI_SUBSCRIBE = `void USBUIPromptWidget::OnInteractionAvailable(
    FGameplayTag EventTag, UObject* Payload)
{
    // Anti-spill (requisito da Fase 18): escopo local
    if (USBInteractionAvailableEventPayload* Data =
        Cast<USBInteractionAvailableEventPayload>(Payload))
    {
        if (Data->TargetPawn == GetOwningPlayerPawn())
        {
            // Exibe o prompt na tela (Data->PromptText)
            // Se Data->Duration > 0.0f, prepara a barra de progresso
        }
    }
}`;

const SFDG_INDEX = [
  { n: "01", label: "Comportamento de Movimento" },
  { n: "02", label: "Message Router" },
  { n: "03", label: "Ciclo de Vida & Ticks" },
  { n: "04", label: "Sincronização ISBReplicable" },
  { n: "05", label: "Interação Modular" },
  { n: "06", label: "Habilidades (Fase 16)" },
  { n: "07", label: "Save Game (Fase 15)" },
];

export default function Guide() {
  const active = useActiveSection(SFDG_INDEX.map((s) => `sfdg-${s.n}`));
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando as demais páginas) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}>
            SFDG
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. sfdg · sandbox framework development guide
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="phase-stamp">SFDG · v1.0.0</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                guia de desenvolvimento · procedimento operacional em c++
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Guia de
            <em className="not-italic text-engineering"> Desenvolvimento</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Procedimentos operacionais em C++ para criar comportamentos, registrar tags e usar os
            subsistemas do framework. Cada seção é um procedimento verificável: copie o padrão,
            respeite o contrato e prove por compilação e teste.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr] gap-10">
        <nav className="hidden xl:block sticky top-28 self-start border-l border-border pl-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-4">Índice SFDG</p>
          <ol className="space-y-3 text-sm">
            {[
              { n: "01", label: "Comportamento de Movimento" },
              { n: "02", label: "Message Router" },
              { n: "03", label: "Ciclo de Vida & Ticks" },
              { n: "04", label: "Sincronização ISBReplicable" },
              { n: "05", label: "Interação Modular" },
              { n: "06", label: "Habilidades (Fase 16)" },
              { n: "07", label: "Save Game (Fase 15)" },
            ].map((s) => (
              <li key={s.n}>
                <a
                  href={`#sfdg-${s.n}`}
                  className={`group flex items-baseline gap-3 transition-colors ${
                    active === `sfdg-${s.n}`
                      ? "text-engineering font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[10px] text-engineering/70">{s.n}</span>
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <TechRule label="SFDG v1.0.0" />
          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            Siga a{" "}
            <Link href="/especificacao" className="text-engineering underline underline-offset-2 hover:text-foreground">
              SFPS v1.0.0
            </Link>{" "}
            como contrato — este guia mostra o procedimento operacional.
          </p>
        </nav>

        <article className="min-w-0">
          <header className="mb-10">
            <Link
              href="/fase-18"
              className="inline-flex items-center gap-2 border border-border px-3 py-1 text-xs font-semibold text-engineering hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contrato de UI: Fase 18 executada <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          {/* 01 Comportamento de movimento */}
          <section id="sfdg-01" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">01</span>
              Comportamento de Movimentação (05_SandboxCharacter)
              <CopySectionButton sectionId="sfdg-01" label="Movimentação" />
            </h2>
            <ol className="text-sm text-muted-foreground leading-relaxed space-y-2 list-decimal pl-5 mb-5">
              <li>Defina a classe do comportamento herdando de <span className="font-mono text-xs">USBMovementBehavior</span>.</li>
              <li>Defina o Data Asset de definição herdando de <span className="font-mono text-xs">USBMovementBehaviorDefinition</span> com os parâmetros estáticos (prioridade, regras de interrupção).</li>
              <li>Mapeie o Enhanced Input para emitir a tag de ação (ex: <span className="font-mono text-xs">Input.Action.Sprint</span>).</li>
              <li>Implemente a lógica consumindo o contexto unificado <span className="font-mono text-xs">FSBBehaviorContext</span>.</li>
            </ol>
            <CodeBlock path="Movement/Behaviors/SBMovementBehaviorSprint.cpp" language="C++">
              {BEHAVIOR}
            </CodeBlock>
          </section>

          {/* 02 Message Router */}
          <section id="sfdg-02" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">02</span>
              Utilizando o Message Router (USBEventSubsystem)
              <CopySectionButton sectionId="sfdg-02" label="Message Router" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              O subsistema suporta mensagens transientes e de estado persistente. O exemplo abaixo
              cobre o disparo, a publicação de estado e a limpeza do cache no ciclo de vida do ator
              — o contrato completo está na especificação ({""}
              <Link href="/especificacao" className="text-engineering underline underline-offset-2">
                Seção 07
              </Link>
              ).
            </p>
            <CodeBlock path="Character/SBCharacter.cpp · EventSubsystem" language="C++">
              {ROUTER}
            </CodeBlock>
            <div className="mt-5 border border-border divide-y divide-border">
              {[
                { label: "ISBInitializable", text: "Inicialização ordenada no orquestrador (Initialize, Shutdown)." },
                { label: "ISBTickable", text: "Classes C++ puras devem tickar preferencialmente em TG_PrePhysics — mudanças de velocidade computadas antes da simulação física do mesmo frame, prevenindo defasagem visual de 1 frame." },
              ].map((r) => (
                <div key={r.label} className="flex items-baseline gap-5 px-5 py-4">
                  <span className="font-mono text-sm w-36 shrink-0">{r.label}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 03 Ciclo de vida */}
          <section id="sfdg-03" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">03</span>
              Ciclo de Vida, Ticks e Ordem de Execução
              <CopySectionButton sectionId="sfdg-03" label="Ciclo de vida" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              Componentes orquestrados passam por <span className="font-mono text-xs">OnPreInitialize</span>,{" "}
              <span className="font-mono text-xs">OnInitialize</span> (registro no Event Bus),{" "}
              <span className="font-mono text-xs">OnPostInitialize</span>,{" "}
              <span className="font-mono text-xs">OnReady</span> e{" "}
              <span className="font-mono text-xs">OnShutdown</span> (cleanup, remoção de delegates e
              liberação de ponteiros). A simetria da saída é tão obrigatória quanto a entrada —
              delegado registrado sem remoção é vazamento em potencial.
            </p>
          </section>

          <TechRule label="Rede" />

          {/* 04 ISBReplicable */}
          <section id="sfdg-04" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">04</span>
              Sincronização via ISBReplicable
              <CopySectionButton sectionId="sfdg-04" label="ISBReplicable" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Para comportamentos transientes que replicam dados (ex: taxa de munição de uma arma
              temporária ou status de habilidade): implemente <span className="font-mono text-xs">ISBReplicable</span>,
              deixe o orquestrador do componente interceptar e despachar as atualizações, e execute
              mudanças de estado diretamente na autoridade — a replicação atualiza os clientes.
            </p>
            <CodeBlock path="Components/SBMovementComponent.cpp · Replication" language="C++">
              {REPLICABLE}
            </CodeBlock>
            <AuditNote tone="warn">
              Autoridade server-side é a regra de ouro do framework: nunca confie em dados enviados
              pelo cliente para persistir dano, consumo ou lock. A validação acontece no servidor;
              o cliente apenas prediz localmente e reverte quando o servidor contesta.
            </AuditNote>
          </section>

          <TechRule label="Interação modular" />

          {/* 05 Interação */}
          <section id="sfdg-05" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">05</span>
              Objetos Interativos Modulares (07_SandboxInteraction)
              <CopySectionButton sectionId="sfdg-05" label="Interação modular" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              O sistema é baseado em objetos que implementam{" "}
              <span className="font-mono text-xs">ISBInteractableInterface</span> e no{" "}
              <span className="font-mono text-xs">USBInteractionComponent</span> anexado ao
              personagem. Dois padrões de alvo:
            </p>
            <h3 className="font-mono text-sm uppercase tracking-wider text-engineering mb-3">A. Pickup instantâneo — duração 0</h3>
            <CodeBlock path="Tests/SBTestInstantPickup.h" language="C++">
              {PICKUP}
            </CodeBlock>
            <h3 className="font-mono text-sm uppercase tracking-wider text-engineering mb-3 mt-8">B. Hold progressivo + lock de concorrência</h3>
            <CodeBlock path="Tests/SBTestLockedChest.h" language="C++">
              {LOCKED}
            </CodeBlock>
            <h3 className="font-mono text-sm uppercase tracking-wider text-engineering mb-3 mt-8">C. Como a UI reage aos eventos</h3>
            <CodeBlock path="09_SandboxUI · USBUIPromptWidget.cpp" language="C++">
              {PROMPT_WIDGET}
            </CodeBlock>
            <AuditNote tone="info">
              Na versão executada da Fase 18, os handlers de widget adicionam o filtro anti-spill
              (<span className="font-mono">TargetPawn == GetOwningPlayerPawn()</span>) antes de
              renderizar — detalhe documentado no plano da Fase 18, não na SFPS original.
            </AuditNote>
            <CodeBlock path="UI anti-spill (Fase 18 executada)" language="C++">
              {UI_SUBSCRIBE}
            </CodeBlock>
            <AuditNote tone="warn">
              Quando pickups físicos de itens forem adicionados ao mundo, eles deverão implementar{" "}
              <span className="font-mono text-xs">ISBInteractableInterface</span> para reaproveitar o
              mesmo fluxo de lock — isso previne duplicações indesejadas de loot em disputas
              simultâneas.
            </AuditNote>
          </section>

          {/* 06 Habilidades */}
          <section id="sfdg-06" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">06</span>
              Habilidades no Behavior Stack (Fase 16)
              <CopySectionButton sectionId="sfdg-06" label="Habilidades" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Habilidades herdam de <span className="font-mono text-xs">USBAbility</span> (que
              deriva de <span className="font-mono text-xs">USBGameplayBehavior</span>). No painel
              de defaults: <span className="font-mono text-xs">AbilityTag</span>,{" "}
              <span className="font-mono text-xs">AbilityTags</span>,{" "}
              <span className="font-mono text-xs">ResourceTag</span>,{" "}
              <span className="font-mono text-xs">ResourceCost</span> e{" "}
              <span className="font-mono text-xs">CooldownDuration</span>. A simetria Enter/Exit é
              obrigatória — o que <em>Enter</em> ativa, <em>Exit</em> limpa.
            </p>
            <CodeBlock path="Abilities/BP_Ability_Teleport.cpp" language="C++">
              {ABILITY}
            </CodeBlock>
          </section>

          <TechRule label="Persistência" />

          {/* 07 Save */}
          <section id="sfdg-07" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">07</span>
              Integração ao Save Game System (Fase 15)
              <CopySectionButton sectionId="sfdg-07" label="Save Game" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Qualquer ator ou componente que persista estado entre sessões assina{" "}
              <span className="font-mono text-xs">ISBSaveInterface</span> (dependência{" "}
              <span className="font-mono text-xs">"SandboxInterfaces"</span> no <span className="font-mono text-xs">Build.cs</span>).
              A serialização usa <span className="font-mono text-xs">USBSavePayload</span> com a
              chave estável <span className="font-mono text-xs">GetPathName()</span> — nunca índice
              de array. Prioridades de carregamento: Atributos = 100, Inventário = 50, padrão = 0.
            </p>
            <CodeBlock path="Components · ISBSaveInterface" language="C++">
              {SAVE}
            </CodeBlock>
            <AuditNote tone="info">
              O salvamento e o carregamento são executados exclusivamente pelo servidor
              ({""}<span className="font-mono">ROLE_Authority</span>), conforme o roteiro de playtest
              multiplayer do Manual de Uso — os clientes recebem o estado replicado instantaneamente
              após o carregamento autoritativo.
            </AuditNote>
          </section>

          {/* 08 Precedentes homologados */}
          <section id="sfdg-08" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 scroll-mt-24 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">08</span>
              Precedentes Homologados — DD-01 ··· DD-08 (v1.8.0)
              <CopySectionButton sectionId="sfdg-08" label="Precedentes" />
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              As decisões de arquitetura homologadas em auditoria são precedentes citáveis: ao implementar
              nova funcionalidade, reaproveite o precedente em vez de reinventar o contrato (Regra 3 do Manifesto).
              O registro completo vive em{" "}
              <Link href="/decisoes" className="text-engineering underline underline-offset-2">
                Registro de Decisões
              </Link>.
            </p>
            <div className="overflow-x-auto border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-left">
                    <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-4 py-2">ID</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-4 py-2">Decisão</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-4 py-2 min-w-[300px]">Regra prática</th>
                  </tr>
                </thead>
                <tbody>
                  {DD.map((d) => (
                    <tr key={d.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2 font-mono text-xs whitespace-nowrap">{d.id}</td>
                      <td className="px-4 py-2">{d.title}</td>
                      <td className="px-4 py-2 text-muted-foreground">{d.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AuditNote tone="warn">
              DD-04 e DD-08 são "Homologada com nota" — carregam custo (UObject por evento) ou premissa
              (superfície de publicação nova na Fase 19). Reverter qualquer decisão exige auditoria explícita
              e novo registro no Registro de Decisões; modificação silenciosa é proibida.
            </AuditNote>
          </section>
        </article>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
