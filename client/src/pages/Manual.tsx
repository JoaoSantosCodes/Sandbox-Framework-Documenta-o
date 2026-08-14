/*
  DESIGN: "Blueprint Técnico" — página do Manual de Uso (manual_de_uso.md, v1.8.0).
  Coluna assimétrica: guia do operador à esquerda, sumário sticky à direita.
  Mesma linguagem spec-sheet das demais páginas: TechRule, AuditNote, tabelas mono.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, TechRule } from "@/components/Primitives";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { CheckCircle2, Circle } from "lucide-react";

const TOC = [
  { id: "pre", label: "Pré-requisitos" },
  { id: "data", label: "Data Assets" },
  { id: "input", label: "Inputs" },
  { id: "single", label: "Playtest single-player" },
  { id: "multi", label: "Playtest multiplayer" },
  { id: "gdt", label: "Gameplay Debugger" },
  { id: "checklist", label: "Checklist de aceite" },
  { id: "limitacoes", label: "Limitações conhecidas" },
  { id: "integracao", label: "Integração incremental" },
  { id: "sample", label: "GameAnimationSample" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export default function Manual() {
  const active = useActiveSection(TOC.map((t) => t.id));
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(3.5rem, 12vw, 12rem)" }}>
            MANUAL
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. mnu · operador
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="phase-stamp">MNU · v1.8.0</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                guia prático no unreal editor
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Manual de Uso — Guia Prático no{" "}
            <em className="not-italic text-engineering">Unreal Editor</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Guia operacional para configurar, rodar e testar o Sandbox Framework no Unreal Editor —
            com os 11 plugins compilando e a suíte verde (32/32 specs).
          </p>
        </div>
      </section>

      <div className="container py-12 lg:py-16 grid lg:grid-cols-[1fr_240px] gap-10">
        <article className="min-w-0">
          <TechRule label="06.1 · Ambiente" />
          <h2 id="pre" className="font-display text-2xl font-bold scroll-mt-24">
            Pré-requisitos de ambiente
          </h2>
          <ul className="mt-5 space-y-2.5 max-w-3xl text-sm leading-relaxed">
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Unreal Engine 5.8 com o plugin <strong>ModularGameplayActors</strong> habilitado no <code className="font-mono text-xs">.uproject</code> (<code className="font-mono text-xs">Edit → Plugins</code>).
            </li>
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Projeto compilando em <strong>Development Editor</strong> sem erros no Visual Studio / Rider.
            </li>
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Todas as extensões referenciam <code className="font-mono text-xs">05_SandboxCharacter</code>; nenhuma extensão depende de outra — comunicação exclusivamente via <code className="font-mono text-xs">USBEventSubsystem</code>.
            </li>
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              <code className="font-mono text-xs">10_SandboxDebug</code> referencia apenas <code className="font-mono text-xs">02_SandboxInterfaces</code> e <code className="font-mono text-xs">04_SandboxCore</code>.
            </li>
          </ul>
          <AuditNote tone="warn">
            <code className="font-mono text-xs">10_SandboxDebug</code> é compilado condicionalmente via{" "}
            <code className="font-mono text-xs">#if WITH_GAMEPLAY_DEBUGGER</code> — em builds{" "}
            <strong>Shipping</strong> o módulo inteiro é removido, com custo zero em produção.
          </AuditNote>
          <AuditNote tone="info">
            Se a compilação falhar com{" "}
            <code className="font-mono text-xs">Unable to find parent class type for 'X' named 'AModularY'</code>,
            o problema é o ModularGameplayActors ausente ou fora do <code className="font-mono text-xs">Build.cs</code>{" "}
            — não é erro de lógica do framework.
          </AuditNote>

          <TechRule label="06.2 · Configuração obrigatória" />
          <h2 id="data" className="font-display text-2xl font-bold scroll-mt-24">
            Data Assets — obrigatório antes de qualquer teste
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O framework é inteiramente <em>data-driven</em>: nada funciona com classes C++ "puras" sem os
            assets correspondentes configurados no editor.
          </p>

          <h3 className="mt-6 font-mono text-sm font-semibold uppercase tracking-wider">
            2.1 · PawnData e ComponentSet
          </h3>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed max-w-3xl list-none">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-engineering font-semibold w-5 shrink-0 text-right">1</span>
              Crie um <code className="font-mono text-xs">USBComponentSetDataAsset</code> (<code className="font-mono text-xs">BP_ComponentSet_Hero</code>) listando os componentes:
              <strong>Base</strong> — <code className="font-mono text-xs">USBAttributeComponent</code>,{" "}
              <code className="font-mono text-xs">USBStateComponent</code>,{" "}
              <code className="font-mono text-xs">USBAbilityComponent</code>;{" "}
              <strong>Movimento</strong> — <code className="font-mono text-xs">USBMovementComponent</code>,{" "}
              <code className="font-mono text-xs">USBCameraComponent</code>,{" "}
              <code className="font-mono text-xs">USBAnimLayerManagerComponent</code>;{" "}
              <strong>Extensões</strong> conforme o que for testar — Combat, Interaction, Inventory.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-engineering font-semibold w-5 shrink-0 text-right">2</span>
              Crie um <code className="font-mono text-xs">USBPawnDataAsset</code> (<code className="font-mono text-xs">BP_PawnData_Hero</code>) referenciando o ComponentSet.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-engineering font-semibold w-5 shrink-0 text-right">3</span>
              Crie um Blueprint derivado de <code className="font-mono text-xs">ASBCharacter</code> e atribua o PawnData no painel de detalhes.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-engineering font-semibold w-5 shrink-0 text-right">4</span>
              No <code className="font-mono text-xs">ASBGameMode</code> do nível, defina <code className="font-mono text-xs">DefaultPawnClass = BP_SBCharacter_Hero</code>.
            </li>
          </ol>
          <AuditNote tone="warn">
            Sem o PawnData, <code className="font-mono text-xs">InitializeFromPawnData()</code> roda com{" "}
            <code className="font-mono text-xs">nullptr</code>, loga um warning e nenhum componente de gameplay é injetado.
          </AuditNote>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">
            2.2 · Movimento (Sprint / Crouch)
          </h3>
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Asset</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Campos obrigatórios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                    USBMovementBehaviorDefinition (Sprint)
                  </td>
                  <td className="px-4 py-3">
                    BehaviorTag = Movement.Sprint · StackPriority = 50 · ExclusivityGroup = Movement.Group.Stance ·
                    RequiredTags = State.Character.Grounded · BlockedTags = State.Character.Dead ·
                    MovementModifiers (TargetStatTag = Movement.Stat.Speed, Operation = Multiply, Value = 1.5) · StaminaCostPerSecond
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                    USBMovementBehaviorCrouchDefinition
                  </td>
                  <td className="px-4 py-3">
                    BehaviorTag = Movement.Crouch · StackPriority = 20 · ExclusivityGroup = Movement.Group.Stance ·
                    BlockedTags incluindo State.Character.Sprinting · CrouchedHalfHeight
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">
                    USBMovementConfigDataAsset
                  </td>
                  <td className="px-4 py-3">
                    Lista as duas Definitions acima, registradas no USBMovementComponent do personagem.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.3 · Câmera</h3>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            Crie um <code className="font-mono text-xs">USBCameraModeDefinition</code> por estado:{" "}
            <strong>Walk</strong> (FOV 90, ArmLength 300, StackPriority 10),{" "}
            <strong>Sprint</strong> (FOV 100, ArmLength 350, ActivationTag = State.Character.Sprinting,
            StackPriority 50) e <strong>Aim</strong> (FOV 65, ArmLength 150, ActivationTag =
            State.Character.Aiming, StackPriority 100).
          </p>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.4 · Combate</h3>
          <ul className="mt-3 space-y-2 max-w-3xl text-sm leading-relaxed list-none">
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Um <code className="font-mono text-xs">USBWeaponBehaviorDefinition</code> por arma: BehaviorTag = Combat.Action.FirePrimary,
              ExclusivityGroup = Combat.Slot.Primary, Damage, FireRate, AmmoCost e BlockedTags.
            </li>
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Registre a tag <code className="font-mono text-xs">Attribute.Character.Health</code> no{" "}
              <code className="font-mono text-xs">USBAttributeComponent</code> de qualquer alvo — sem isso o Hitscan
              falha silenciosamente.
            </li>
          </ul>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.5 · Interação</h3>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            Posicione atores implementando <code className="font-mono text-xs">ISBInteractableInterface</code> —
            Blueprints derivados ou classes C++ baseadas nos mocks de teste (ex:{" "}
            <code className="font-mono text-xs">ASBTestInstantPickup</code>,{" "}
            <code className="font-mono text-xs">ASBTestLockedChest</code>). Confirme que{" "}
            <code className="font-mono text-xs">GetInteractionPrompt</code> e <code className="font-mono text-xs">GetInteractionDuration</code>{" "}
            retornam valores sensatos e que objetos compartilhados implementam{" "}
            <code className="font-mono text-xs">LockInteraction</code> / <code className="font-mono text-xs">UnlockInteraction</code>.
          </p>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.6 · Inventário</h3>
          <ul className="mt-3 space-y-2 max-w-3xl text-sm leading-relaxed list-none">
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Assets <code className="font-mono text-xs">USBItemDefinition</code> por item (MaxStackCount + Fragments), com{" "}
              <code className="font-mono text-xs">USBItemFragment_Equippable</code> apontando para o{" "}
              <code className="font-mono text-xs">USBWeaponBehaviorDefinition</code> da arma.
            </li>
            <li className="flex gap-3">
              <Circle className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
              Pickups no nível implementando <code className="font-mono text-xs">ISBInteractableInterface</code>, cujo{" "}
              <code className="font-mono text-xs">Interact_Implementation</code> chama <code className="font-mono text-xs">ServerAddItem</code>{" "}
              no inventário do personagem que interagiu.
            </li>
          </ul>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.7 · Habilidades</h3>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            Crie um <code className="font-mono text-xs">USBAbilitySetDataAsset</code> e, por habilidade, vincule{" "}
            <strong>InputTag</strong> (ex: <code className="font-mono text-xs">Input.Action.Ability1</code>), a{" "}
            <strong>Definition</strong> (<code className="font-mono text-xs">USBGameplayBehaviorDefinition</code>) e a{" "}
            <strong>AbilityClass</strong> (Blueprint derivado de <code className="font-mono text-xs">USBAbility</code>).
            No Blueprint da habilidade configure AbilityTag, tags ativas,{" "}
            <code className="font-mono text-xs">ResourceTag = Attribute.Mana</code>,{" "}
            <code className="font-mono text-xs">ResourceCost = 25.0</code> e{" "}
            <code className="font-mono text-xs">CooldownDuration = 5.0</code>. Vincule o AbilitySet no PawnData do personagem.
          </p>
          <AuditNote tone="info">
            <strong>Decisão de design — superfície de configuração:</strong> diferente de Movimento e Combate
            (parametrização integral nas Definitions), Habilidades configuram custo, recurso e cooldown
            diretamente no Blueprint da classe derivada de <code className="font-mono text-xs">USBAbility</code> —
            o designer já cria o Blueprint para efeitos e animações, e centralizar os parâmetros evita
            proliferação de Data Assets (workflow próximo ao GAS nativo).
          </AuditNote>

          <h3 className="mt-8 font-mono text-sm font-semibold uppercase tracking-wider">2.8 · Persistência</h3>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            O subsistema serializa automaticamente componentes assinando{" "}
            <code className="font-mono text-xs">ISBSaveInterface</code> —{" "}
            <code className="font-mono text-xs">USBAttributeComponent</code> e{" "}
            <code className="font-mono text-xs">USBInventoryComponent</code> já vêm pré-configurados. No Event Graph do
            personagem, configure atalhos: <strong>F5</strong> chama{" "}
            <code className="font-mono text-xs">GetSubsystem&lt;SBSaveSubsystemConcrete&gt;()</code> com{" "}
            <code className="font-mono text-xs">SaveGame("SlotPlaytest", 0)</code>; <strong>F9</strong> com{" "}
            <code className="font-mono text-xs">LoadGame("SlotPlaytest", 0)</code>.
          </p>

          <TechRule label="06.3 · Inputs" />
          <h2 id="input" className="font-display text-2xl font-bold scroll-mt-24">
            Roteamento de inputs (Enhanced Input)
          </h2>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Tecla / Ação</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Ação esperada no componente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">Sprint (Hold)</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">Input.Action.Sprint</code> → <code className="font-mono text-xs">RequestBehavior(Movement.Sprint)</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">Crouch (Toggle/Hold)</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">Input.Action.Crouch</code> → <code className="font-mono text-xs">RequestBehavior(Movement.Crouch)</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">Fire (Press/Hold)</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">Input.Action.Fire</code> → <code className="font-mono text-xs">RequestWeaponBehavior(...)</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">Interact (Hold/Press)</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">Input.Action.Interact</code> → <code className="font-mono text-xs">ServerStartInteract(Target)</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">Habilidades (Press)</td>
                  <td className="px-4 py-3">Mapeadas no IMC para <code className="font-mono text-xs">Input.Action.Ability1</code>...; binding genérico via <code className="font-mono text-xs">USBAbilityComponent::BindInputActions</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <AuditNote tone="info">
            <strong>Dica prática no Blueprint Editor:</strong> para encontrar as funções herdadas dos componentes
            no Event Graph, desmarque <strong>"Context Sensitive"</strong> no canto superior direito da janela de
            busca — sem isso, a engine não lista os métodos C++ nativos expostos à reflexão. Busque por{" "}
            <code className="font-mono text-xs">Fire</code>, <code className="font-mono text-xs">Interact</code>,{" "}
            <code className="font-mono text-xs">ActivateAbilityByTag</code>.
          </AuditNote>

          <TechRule label="06.4 · Playtest local" />
          <h2 id="single" className="font-display text-2xl font-bold scroll-mt-24">
            Roteiro de playtest — Single Player (PIE simples)
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            Objetivo: validar a configuração dos assets antes de testar a sincronização em rede.
          </p>
          <ol className="mt-4 space-y-2 max-w-3xl text-sm leading-relaxed list-none">
            {[
              "Play (▶) no nível de teste.",
              "Sprint: velocidade aumenta, câmera afasta (FOV de SprintMode) e a animação de corrida ativa via Anim Layer.",
              "Crouch: cápsula encolhe e a pose muda.",
              "Sprint agachado: Crouch é ejetado e Sprint assume (conflito de ExclusivityGroup).",
              "Crouch correndo: nada acontece — ação bloqueada por BlockedTags, corrida mantida.",
              "Aproximar-se de um interativo: o prompt aparece (se a UI escutar Event.Interaction.Available).",
              "Segurar Interact em objeto com duração: barra de progresso avança; soltar antes de preencher reseta e cancela a interação.",
              "Disparar a arma equipada: munição decresce e o dano é aplicado via Hitscan.",
              "Ativar habilidade: mana decrementa (ex: 25), tags entram na pilha; reativar em 5s mostra o bloqueio de cooldown.",
              "Persistência: consumir mana ou coletar itens, F5 (Salvar) → conferir logs (LogSandboxCore: Saving component...), sair do Play, F9 (Carregar) → atributos e inventário retornam ao estado salvo.",
            ].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="font-mono text-xs text-engineering font-semibold w-6 shrink-0 pt-0.5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>

          <TechRule label="06.5 · Playtest em rede" />
          <h2 id="multi" className="font-display text-2xl font-bold scroll-mt-24">
            Roteiro de playtest — Multiplayer
          </h2>
          <h3 className="mt-5 font-mono text-sm font-semibold uppercase tracking-wider">5.1 · Configuração do PIE</h3>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            No dropdown ao lado do botão Play: <strong>Number of Players = 2</strong>, Net Mode ={" "}
            <em>Play As Listen Server</em>. No console de um dos clientes (tecla <code className="font-mono text-xs">~</code>),
            simule latência:
          </p>
          <div className="mt-3 border border-border bg-card p-4 font-mono text-xs leading-relaxed max-w-xl">
            <div>net PktLag=100</div>
            <div>net PktLagVariance=30</div>
          </div>
          <AuditNote tone="info">
            Sem latência artificial, condições de corrida causadas pelo RTT de rede não se manifestam localmente.
          </AuditNote>
          <h3 className="mt-6 font-mono text-sm font-semibold uppercase tracking-wider">5.2 · Cenários de validação</h3>
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Cenário</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Validação esperada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">1 · Rejeição de Sprint</td>
                  <td className="px-4 py-3">Correr sem stamina no Cliente 2: cliente prevê, servidor rejeita e reverte velocidade e tag; sem modificadores órfãos no Aggregator.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">2 · Tiro sem munição</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">ClientRollbackFire</code> reverte a munição local e cancela a animação iniciada.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">3 · Disputa de interação</td>
                  <td className="px-4 py-3">Dois clientes no mesmo baú no mesmo frame: servidor atribui o lock a um só; o outro recebe <code className="font-mono text-xs">ClientCancelInteraction</code> imediatamente.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">4 · Replicação de inventário</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">USBItemInstance</code> replica para o Cliente 1, que visualiza o modelo da arma anexado no Cliente 2.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">5 · Ejeção de arma</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs">USBWeaponBehavior</code> ejetado simetricamente em servidor e clientes, sem resíduos na pilha.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">6 · Habilidade e mana</td>
                  <td className="px-4 py-3">Mana decrementada localmente jitter-free; recusa do servidor restaura o mana limpo via <code className="font-mono text-xs">ClientRollbackPrediction</code>.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">7 · Persistência autoritativa</td>
                  <td className="px-4 py-3">F9 executado apenas no servidor (<code className="font-mono text-xs">ROLE_Authority</code>); atributos e instâncias replicam para todos os clientes.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <TechRule label="06.6 · Auditoria ao vivo" />
          <h2 id="gdt" className="font-display text-2xl font-bold scroll-mt-24">
            Gameplay Debugger (SandboxDebug) — v1.7.0
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            O plugin <code className="font-mono text-xs">10_SandboxDebug</code> integra o framework ao Gameplay
            Debugger nativo (<code className="font-mono text-xs">Shift + '</code>). O coletor{" "}
            <code className="font-mono text-xs">FGameplayDebuggerCategory_Sandbox</code> varre os componentes do ator
            sob a mira e chama <code className="font-mono text-xs">ISBDebugInterface::Execute_GetDebugDescription</code> —
            sem o framework ter qualquer dependência de compilação contra o plugin de debug.
          </p>
          <p className="mt-4 leading-relaxed max-w-3xl text-sm">
            Pré-requisito: habilite o plugin nativo <strong>GameplayDebugger</strong> no <code className="font-mono text-xs">.uproject</code>.
            Em PIE, aperte <code className="font-mono text-xs">Shift + '</code>, depois <code className="font-mono text-xs">.</code>{" "}
            e clique no alvo — a categoria <strong>Sandbox</strong> mostra os pares Label/Value de cada componente.
          </p>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Componente / Ator</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Telemetria exposta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBBehaviorStackComponent</td>
                  <td className="px-4 py-3">Pilha ativa, prioridades, profundidade de mutação e queues deferidas — diagnóstico de reentrância do FSBStackMutationGuard.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBAttributeComponent</td>
                  <td className="px-4 py-3">Base vs Current, modificadores ativos e transações preditivas pendentes por PredictionId.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBStateComponent</td>
                  <td className="px-4 py-3">Tags de estado ativas e preditas.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBAbilityComponent</td>
                  <td className="px-4 py-3">Cooldowns em segundos decrescentes e mapeamento InputTag → AbilityTag.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBInventoryComponent</td>
                  <td className="px-4 py-3">Grid de slots replicados sincronizado (item, quantidade, tags transientes).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBCombatComponent</td>
                  <td className="px-4 py-3">Behaviors de armas por ExclusivityGroup.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">ASBTestInteractableActor / LockedChest</td>
                  <td className="px-4 py-3">Duração da interação, dono do lock atual e contagem cumulativa de ativações.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <AuditNote tone="info">
            <strong>Dedicated Server:</strong> o GDT inspeciona a visão do servidor — valores autoritativos no overlay
            servem para auditar divergências client/server lado a lado.
          </AuditNote>
          <AuditNote tone="info">
            <strong>Teste de desacoplamento em runtime:</strong> desabilite o 10_SandboxDebug no .uproject e
            recompile — nenhum outro plugin deve quebrar.
          </AuditNote>

          <TechRule label="06.7 · Ferramentas" />
          <h2 id="checklist" className="font-display text-2xl font-bold scroll-mt-24">
            Checklist de aceite por domínio
          </h2>
          <ul className="mt-5 space-y-2.5 max-w-3xl">
            {[
              ["Movimento", "Sprint e Crouch mutuamente exclusivos, respeitam BlockedTags e limpam modificadores no Aggregator sem órfãos."],
              ["Animação", "Anim Layers e poses trocam dinamicamente, sem travamento ou atraso perceptível."],
              ["Câmeras", "Transições de FOV e ArmLength fluidas."],
              ["Combate", "Disparos sem munição sofrem rollback imediato; dano validado unicamente no servidor."],
              ["Interação", "Lock autoritativo resolve disputas por recursos."],
              ["Inventário", "Equipar/desequipar instancia a arma, associa behaviors via interface e limpa o estado sem resíduos."],
              ["Habilidades", "Validação preditiva de mana e cooldowns no frame do cliente, com rollbacks precisos e replicados."],
              ["Persistência", "Carregar a sessão recupera o estado de atributos e slots respeitando a prioridade de carregamento."],
              ["Debug (v1.8.0)", "GDT exibe a categoria Sandbox com pilha, atributos, tags, cooldowns, slots e lock; desabilitar o plugin não altera os demais."],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-3 text-sm leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
                <span>
                  <strong>{k}:</strong> {v}
                </span>
              </li>
            ))}
          </ul>

          <TechRule label="06.8 · Dívida técnica" />
          <h2 id="limitacoes" className="font-display text-2xl font-bold scroll-mt-24">
            Limitações conhecidas
          </h2>
          <ol className="mt-4 space-y-2 max-w-3xl text-sm leading-relaxed list-none">
            {[
              "Sem compensação de lag no Hitscan: detecção usa o frame do servidor, sem histórico de colisão retroativo.",
              "RPC rate-limiting simplificado: as validações _Validate são stubs; a validação real ocorre em CanEnter().",
              "Sem Motion Warping ou IK completo de mãos/pés.",
              "Sem restauração visual do item equipado ao recarregar a sessão — apenas o inventário lógico é salvo.",
              "Perda de PredictionId em habilidades cascateadas via deferral: mutações diferidas resolvem após a reentrância limpar a CurrentServerPredictionId.",
              "09_SandboxUI lógica completa, exibição pendente no UMG: o plugin tem a lógica dinâmica de HUD e camadas de widgets com assinaturas assíncronas automáticas; a renderização física herda das backing classes (USBStatusHUDWidget, USBInteractionPromptWidget, USBAbilityBarWidget, USBInventoryGridWidget).",
            ].map((l, i) => (
              <li key={l} className="flex gap-3">
                <span className="font-mono text-xs text-muted-foreground font-semibold w-6 shrink-0 pt-0.5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l}
              </li>
            ))}
          </ol>

          <TechRule label="06.9 · Caminho recomendado" />
          <h2 id="integracao" className="font-display text-2xl font-bold scroll-mt-24">
            Guia de integração incremental
          </h2>
          <ol className="mt-4 space-y-2 max-w-3xl text-sm leading-relaxed list-none">
            {[
              "Configure apenas as dependências básicas: PawnData e ComponentSet somente com Movimento.",
              "PIE Single-Player para validar exclusão mútua de Sprint e Crouch.",
              "Adicione Câmera e Anim Layers, testando as transições visuais.",
              "Rede com 2 jogadores locais, sem latência.",
              "Latência simulada (net PktLag=100) para auditar os rollbacks.",
              "Habilite Combate, Interação, Inventário, Habilidades e Persistência de forma sequencial, com os testes específicos de cada etapa.",
              "Habilite o Gameplay Debugger e valide a telemetria ao vivo de cada domínio; ao final, desative o plugin e recompile — fechando a validação de desacoplamento em runtime.",
            ].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="font-mono text-xs text-engineering font-semibold w-6 shrink-0 pt-0.5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>

          <TechRule label="06.10 · GameAnimationSample" />
          <h2 id="sample" className="font-display text-2xl font-bold scroll-mt-24">
            Integração com o GameAnimationSample
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl text-sm">
            O Sandbox Framework também está disponível integrado de forma híbrida no projeto{" "}
            <strong>GameAnimationSample</strong> (<code className="font-mono text-xs">D:\Unreal\GameAnimationSample</code>).
          </p>
          <div className="mt-4 max-w-3xl text-sm leading-relaxed">
            <p className="mt-1"><strong>Target no editor:</strong> <code className="font-mono text-xs">GameAnimationSampleEditor</code> (Win64 Development).</p>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider">Compilação do editor integrado</p>
            <pre className="mt-2 overflow-x-auto bg-card border border-border p-4 font-mono text-xs leading-relaxed">{`dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" GameAnimationSampleEditor Win64 Development "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -waitmutex`}</pre>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider">Suíte de testes de conformidade</p>
            <pre className="mt-2 overflow-x-auto bg-card border border-border p-4 font-mono text-xs leading-relaxed">{`& "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -NullRHI -NoSound -NoSplash -stdout -ExecCmds="Automation RunTest Sandbox; Quit" -log`}</pre>
            <div className="mt-4">
            <AuditNote tone="info">
              O código e os arquivos de regras de build deste projeto estão sob controle de versão no GitHub:{" "}
              <a
                href="https://github.com/JoaoSantosCodes/GameAnimationSampleSandbox-Framework"
                target="_blank"
                rel="noopener noreferrer"
                className="text-engineering underline underline-offset-2"
              >
                GameAnimationSampleSandbox-Framework
              </a>
            </AuditNote>
            </div>
          </div>
        </article>
        {/* Sumário sticky */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 border border-border bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Índice · Manual
            </div>
            <ul className="mt-3 space-y-2">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    onClick={(e) => scrollToSection(e, t.id)}
                    className={`text-sm transition-colors ${
                      active === t.id
                        ? "text-engineering font-semibold"
                        : "text-muted-foreground hover:text-engineering"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-engineering mr-2">{String(i + 1).padStart(2, "0")} ·</span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
