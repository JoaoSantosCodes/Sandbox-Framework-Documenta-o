/*
  DESIGN: "Blueprint Técnico" — dados de conteúdo do site
  Toda a informação vem dos documentos oficiais do projeto Sandbox Framework.
*/

export const ASSET_URLS = {
  logo: "/manus-storage/sb_logo_141c629e.webp",
  hero: "/manus-storage/sb_hero_34df9f7d.webp",
  widgets: "/manus-storage/sb_widgets_ababb845.webp",
};

export type PluginStatus = "complete" | "stub";

export interface Plugin {
  id: string;
  name: string;
  layer: "foundation" | "gameplay-base" | "extension" | "presentation" | "tools";
  dependsOn: string[];
  description: string;
  status: PluginStatus;
  version: string;
}

export const PLUGINS: Plugin[] = [
  { id: "01", name: "SandboxCommon", layer: "foundation", dependsOn: ["02"], description: "Gameplay Tags, FSBAttribute e modificadores, logs estruturados, USBBehaviorRegistry.", status: "complete", version: "1.7.0" },
  { id: "02", name: "SandboxInterfaces", layer: "foundation", dependsOn: [], description: "Contratos de ciclo de vida, persistência e rede: ISBComponentInterface, ISBSaveInterface, ISBDebugInterface.", status: "complete", version: "1.7.0" },
  { id: "03", name: "SandboxAssets", layer: "foundation", dependsOn: ["01"], description: "SBAssetManager integrado e Data Assets de definição (PawnData, ComponentSet, AbilitySet).", status: "complete", version: "1.7.0" },
  { id: "04", name: "SandboxCore", layer: "foundation", dependsOn: ["01", "03"], description: "SBComponentFactory, Message Router priorizado (USBEventSubsystem), SBInputSubsystem.", status: "complete", version: "1.7.0" },
  { id: "05", name: "SandboxCharacter", layer: "gameplay-base", dependsOn: ["04"], description: "Contêiner ASBCharacter e componentes de Atributos, Estado, Habilidades, Movimento, Câmera e Animação.", status: "complete", version: "1.7.0" },
  { id: "06", name: "SandboxCombat", layer: "extension", dependsOn: ["05"], description: "Behavior Stack de armas, hitscan autoritativo, fire rate, rollbacks anti-cheat.", status: "complete", version: "1.7.0" },
  { id: "07", name: "SandboxInteraction", layer: "extension", dependsOn: ["05"], description: "Hold-to-interact, locks autoritativos no servidor, proteção contra race conditions.", status: "complete", version: "1.7.0" },
  { id: "08", name: "SandboxInventory", layer: "extension", dependsOn: ["05"], description: "Inventário autoritativo, fast array replication, Definition/Instance/Fragment, desacoplamento via Message Router.", status: "complete", version: "1.7.0" },
  { id: "09", name: "SandboxUI", layer: "presentation", dependsOn: ["02", "04"], description: "Gerenciador de camadas USBUIManager (ULocalPlayerSubsystem) e widgets reativos via USBEventSubsystem. Lógica completa homologada na Fase 18.", status: "complete", version: "1.8.0" },
  { id: "10", name: "SandboxDebug", layer: "presentation", dependsOn: ["02", "04"], description: "Integração ao Gameplay Debugger nativo via ISBDebugInterface. Implementado na Fase 17.", status: "complete", version: "1.7.0" },
  { id: "11", name: "SandboxEditor", layer: "tools", dependsOn: [], description: "Módulo Editor-only para validação visual e customização de painéis.", status: "complete", version: "1.7.0" },
];

export const LAYER_META: Record<Plugin["layer"], { label: string; color: string }> = {
  foundation: { label: "Foundation", color: "border-[oklch(0.45_0.02_255)]" },
  "gameplay-base": { label: "Gameplay Base", color: "border-[oklch(0.48_0.09_165)]" },
  extension: { label: "Gameplay Extensions", color: "border-[oklch(0.62_0.13_65)]" },
  presentation: { label: "Presentation", color: "border-[oklch(0.55_0.15_25)]" },
  tools: { label: "Tools", color: "border-[oklch(0.48_0.01_255)]" },
};

export const MANIFESTO_PRINCIPLES = [
  { n: 1, title: "Modularidade Absoluta", text: "Cada funcionalidade encapsulada em um plugin autocontido. Habilitar ou desabilitar um plugin não quebra outros sistemas independentes." },
  { n: 2, title: "Orientação a Dados", text: "Nenhum parâmetro de gameplay hardcoded. Configurações expostas em Data Assets ou tabelas." },
  { n: 3, title: "Controle por Estado Físico", text: "Estados do personagem representados por Gameplay Tags no SBStateComponent. Consultas de estado leem exclusivamente este componente." },
  { n: 4, title: "Desacoplamento por Interfaces", text: "Atores e componentes nunca referenciam tipos concretos de outros plugins. Chamadas externas via interfaces leves." },
  { n: 5, title: "Injeção Dinâmica de Componentes", text: "Nenhum componente instanciado no construtor. Injeção controlada via PawnData e SBComponentFactory." },
  { n: 6, title: "Separação Runtime e Editor", text: "Códigos de editor nunca vazam para módulos de runtime. Zero editor leaks." },
  { n: 7, title: "Zero Dependências Circulares", text: "Árvore de dependência unidirecional. Foundation nunca importa tipos de gameplay." },
  { n: 8, title: "Suporte Nativo a Redes", text: "Predição client-side + autoridade server-side em toda ação de gameplay, com validação por RPC." },
  { n: 9, title: "Carregamento Otimizado", text: "Assets pesados carregados assincronamente via SBAssetManager a partir de Primary Asset IDs." },
  { n: 10, title: "Blueprint Opcional", text: "Lógica estrutural em C++. Blueprints para configuração de dados e ajustes artísticos." },
];

export interface Phase {
  phase: number;
  version: string;
  title: string;
  status: "Concluída" | "Em execução" | "Em planejamento";
  summary: string;
  highlights: string[];
  tests?: string;
}

export const PHASES: Phase[] = [
  { phase: 10, version: "v1.2.x", title: "Predição de Atributos & Combate", status: "Concluída", summary: "Predição transacional de munição/mana via PredictionId, upsert de ConfirmedPredictions e módulo de combate com hitscan autoritativo e ExclusivityGroup ejection.", highlights: ["Transações por PredictionId", "Upsert do array replicado", "Timeout guard de 2s", "Rollback anti-cheat (ClientRollbackFire)"] },
  { phase: 11, version: "v1.2.0", title: "Validação da Suíte de Testes", status: "Concluída", summary: "Remoção de todos os bypasses de teste (GIsAutomationTesting, mocks) do código de produção; configuração correta do ambiente headless com ULocalPlayer/APlayerState nativos.", highlights: ["Zero bypasses de produção", "Mocks removidos", "API pública protegida com friend class", "16/16 testes verdes"] },
  { phase: 12, version: "v1.3.x", title: "Interação Modular (07_SandboxInteraction)", status: "Concluída", summary: "Hold-to-interact com progresso, locks autoritativos no servidor, validação de distância contra cheats e cenários de race condition.", highlights: ["Trace de detecção configurável", "Locks com exclusividade lógica", "ClientCancelInteraction simétrico", "21/21 testes verdes"] },
  { phase: 13, version: "v1.3.x", title: "Inventário e Slots Replicados (08_SandboxInventory)", status: "Concluída", summary: "Padrão Definition/Instance/Fragment, fast array replication, fila de ativação com timeout e desacoplamento total via Message Router.", highlights: ["FSBInventoryList + FFastArraySerializer", "Equipe/desequipe simétrico", "Integração Combat↔Inventory via eventos", "26/26 testes verdes"] },
  { phase: 14, version: "v1.4.0", title: "Consolidação do Behavior Stack", status: "Concluída", summary: "USBBehaviorStackComponent genérico em 01_SandboxCommon com FSBStackMutationGuard (RAII + flat loop) contra reentrância recursiva em cascata.", highlights: ["ExclusivityGroup, BlockedTags, RequiredTags", "FSBStackMutationGuard com profundidade", "DeferredEntries/DeferredExits determinísticos", "27/27 testes verdes"] },
  { phase: 15, version: "v1.5.x", title: "Persistência e Save Game (USBSaveSubsystem)", status: "Concluída", summary: "Subsistema abstrato em 02_SandboxInterfaces + concreto em 04_SandboxCore, serialização autoritativa de atributos e inventário com prioridades de carregamento.", highlights: ["FObjectAndNameAsStringProxyArchive", "SaveGame por componente (ISBSaveInterface)", "Restauração via ModifyAttributeBaseValue", "28/28 testes verdes"] },
  { phase: 16, version: "v1.6.0", title: "Habilidades no Behavior Stack", status: "Concluída", summary: "USBAbility herdando de USBGameplayBehavior com consumo preditivo de recursos, FSBCooldownList replicado e Enhanced Input Mapping data-driven.", highlights: ["Consumo preditivo com PredictionId", "CurrentServerPredictionId no servidor", "Cooldowns jitter-free", "31/31 testes verdes"] },
  { phase: 17, version: "v1.7.0", title: "Gameplay Debugger e Telemetria (10_SandboxDebug)", status: "Concluída", summary: "Plugin de debug com dependência exclusiva de 02_SandboxInterfaces e 04_SandboxCore, integrando ISBDebugInterface aos componentes de gameplay e ao ator de teste de interação.", highlights: ["FSBDebugLine (Label/Value/bIsHeader) sem vazamento de ponteiros", "#if WITH_GAMEPLAY_DEBUGGER (zero custo em Shipping)", "Teste de isolamento real (UBT com inventário oculto)", "31/31 testes verdes"] },
  { phase: 18, version: "v1.8.0", title: "Interface Dinâmica (09_SandboxUI)", status: "Concluída", summary: "Widgets reativos via USBEventSubsystem sem dependência de compilação das extensões. SBUITests verde: 32/32 specs. Critérios de aceite da v1.8.0 homologados e publicados neste site.", highlights: ["Plano executado homologado (ULocalPlayerSubsystem, NativeDestruct, anti-spill, throttle 60 Hz)", "4 eventos canônicos de inventário preservados (ItemAdded/Removed/Equipped/Unequipped)", "SBUITests: Cenário 1 (auto-unsubscribe + idempotência) e Cenário 2 (escopo local)", "Teste de isolamento com 05+06+07+08 desabilitados simultaneamente"] },
  { phase: 19, version: "v1.9.0", title: "Indicador Direcional de Dano (09_SandboxUI)", status: "Em planejamento", summary: "Indicador de dano adiado pela DD-08: novo ponto autoritativo de publicação em 06_SandboxCombat, payload USBDamageEventPayload em 04_SandboxCore e widget com deduplicação client-side via AttackId (DD-11). Alvo: SBUITests 34/34.", highlights: ["USBDamageEventPayload em 04_SandboxCore (nunca em 06 ou 09)", "Broadcast autoritativo dentro de HasAuthority() — sem tocar replicação", "Anti-spill TargetPawn + dedupe AttackId (mapa com TTL)", "SBUITests Cenários 7 e 8 + teste de isolamento simétrico"] },
];

export const PHASE18_EVENTS: { event: string; producer: string; purpose: string; exists: boolean }[] = [
  { event: "Event.Interaction.Available / Cleared", producer: "07_SandboxInteraction", purpose: "Prompt contextual e limpeza de foco.", exists: true },
  { event: "Event.Interaction.Progress", producer: "07_SandboxInteraction", purpose: "Barra de hold-to-interact; progresso já publicado, throttle 60 Hz adicionado no Tick.", exists: true },
  { event: "Event.Inventory.ItemEquipped / ItemUnequipped", producer: "08_SandboxInventory", purpose: "Highlight de slot no HUD de inventário.", exists: true },
  { event: "Event.Inventory.ItemAdded / ItemRemoved", producer: "08_SandboxInventory", purpose: "Par simétrico de modificação bruta de slots (novo produtor).", exists: false },
  { event: "Event.Attribute.Changed", producer: "05_SandboxCharacter", purpose: "Barras de vida/mana/estamina; publicado no BroadcastAttributeChanged.", exists: false },
  { event: "Event.Ability.CooldownStarted / CooldownEnded", producer: "05_SandboxCharacter", purpose: "Overlay de cooldown sem polling — polling violaria o manifesto.", exists: false },
  { event: "Event.Combat.WeaponEquipped / AmmoDepleted / FireExecuted", producer: "06_SandboxCombat", purpose: "HUD de arma, munição e feedback de tiro seco.", exists: false },
  { event: "Event.Combat.DamageReceived", producer: "05/06 (ponto autoritativo de dano)", purpose: "Indicador direcional de dano (seta por 1,5s).", exists: false },
];

export const PHASE18_WIDGETS: { widget: string; events: string[]; visual: string }[] = [
  { widget: "USBUIPromptWidget", events: ["Event.Interaction.Available", "Event.Interaction.Cleared", "Event.Interaction.Progress"], visual: "Prompt contextual + barra de hold para Duration > 0." },
  { widget: "USBUIInventoryWidget", events: ["Event.Inventory.ItemAdded / Removed", "ItemEquipped / ItemUnequipped"], visual: "Grid de slots síncrono ao replicado; highlight no slot recém-equipado." },
  { widget: "USBUIAbilityWidget", events: ["Event.Ability.CooldownStarted", "Event.Ability.CooldownEnded"], visual: "Ícones de habilidade + overlay de cooldown em segundos decrescentes." },
  { widget: "USBUIAttributeWidget", events: ["Event.Attribute.Changed", "Leitura local via ISBCharacterInterface"], visual: "Barras de vida/mana/estamina; flash vermelho em dano." },
  { widget: "USBUIWeaponWidget", events: ["Event.Combat.WeaponEquipped", "Event.Combat.AmmoDepleted"], visual: "Ícone da arma ativa + contador de munição; feedback de tiro seco." },
  { widget: "USBUIDamageIndicator", events: ["Event.Combat.DamageReceived"], visual: "Compass/seta direcional por 1,5s; re-spawn simétrico sob hit repetido." },
];

export const PHASE18_ACCEPTANCE: string[] = [
  "USBUIManager gerencia camadas Game/Modal/Debug com push/pop simétrico e sem widgets órfãos.",
  "Todos os widgets herdam de USBUIElement e registram/desregistram listeners com simetria garantida (OnDestruct/OnDestroyed).",
  "Zero includes de 05/06/07/08 no 09_SandboxUI; testes de compilação com extensão desabilitada passam.",
  "Desabilitar 09_SandboxUI não quebra a compilação nem a suíte de gameplay.",
  "Suíte SBUITests 100% verde (5 cenários) sem qualquer GIsAutomationTesting/bypass de produção.",
  "Widget de prompt respeita escopo local (não exibe prompt de outro jogador).",
  "Barras de atributo e cooldowns atualizam sem flicker sob net PktLag=100.",
  "Manual de uso (v1.8.0) e walkthrough documentam a nova hierarquia de widgets.",
  "Versão v1.8.0 registrada em todos os .uplugin e no Dashboard.",
];

// Critérios de aceite da spec executada (plano revisado e homologado)
export const PHASE18_ACCEPTANCE_V2: string[] = [
  "USBUIManager (ULocalPlayerSubsystem) instancia um manager por jogador local: isolamento nativo em split-screen e Listen Server.",
  "USBUserWidget faz auto-unsubscribe cirúrgico em NativeDestruct (FSBWidgetEventSubscription por delegate, nunca unsubscribe por tag).",
  "SubscribeToEvent do subsystem é idempotente: reinscrição do mesmo delegate é rejeitada.",
  "Todo widget de gameplay valida TargetPawn == owning pawn antes de renderizar (requisito anti-spill).",
  "Contrato de inventário preservado: ItemAdded/Removed/Equipped/Unequipped individuais; grid assina os quatro.",
  "Event.Interaction.Progress throttled a 60 Hz no acumulador do TickComponent.",
  "SBEventPayloads.h (04_SandboxCore): USBPawnEventPayload, USBAttributeChangedPayload, USBInteractionProgressPayload, USBInventoryEventPayload (UObject* ItemInstance).",
  "Teste de isolamento com 05+06+07+08 desabilitados simultaneamente: 09_SandboxUI compila (Exit Code 0).",
  "Teste inverso: desabilitar 09_SandboxUI não quebra compilação nem a suíte de gameplay.",
  "SBUITests 100% verde: Cenário 1 (auto-unsubscribe + idempotência) e Cenário 2 (escopo local / TargetPawn mismatch).",
  "Playtest: barras de vida/mana, prompt e hold síncrono, grid de inventário instantâneo e cooldown em segundos decrescentes.",
  "Manual de uso (v1.8.0), walkthrough e Dashboard atualizados; versão v1.8.0 em todos os .uplugin.",
];

export const TEST_SUITES = [
  { domain: "Sandbox.Character.Animation", specs: 2 },
  { domain: "Sandbox.Character.Camera", specs: 2 },
  { domain: "Sandbox.Character.Movement", specs: 4 },
  { domain: "Sandbox.Character.Network", specs: 5 },
  { domain: "Sandbox.Combat", specs: 3 },
  { domain: "Sandbox.Interaction", specs: 5 },
  { domain: "Sandbox.Inventory", specs: 5 },
  { domain: "Sandbox.Save", specs: 1 },
  { domain: "Sandbox.BehaviorStack", specs: 3 },
  { domain: "Sandbox.Character.Abilities", specs: 1 },
];
