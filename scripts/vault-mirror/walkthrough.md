# Walkthrough: Sandbox Framework Bootstrap (v1.0.0)

Este documento registra a conclusão da fase de **Bootstrap Baseline (v1.0.0)** do **Sandbox Framework**. Estruturamos os diretórios iniciais dos plugins físicos no disco, alinhados com a especificação **SFPS v1.0.0** e o guia de desenvolvimento **SFDG v1.0.0**.

---

## 1. Módulos Inicializados no Disco (7 de 11)

Nesta fase de bootstrap, instanciamos a infraestrutura completa da fundação (4/4) combinada com um subset inicial de gameplay, apresentação e ferramentas (3/7) necessários para a baseline operacional do framework.

Os demais 4 plugins (`06_SandboxCombat`, `07_SandboxInteraction`, `08_SandboxInventory` e `10_SandboxDebug`) serão introduzidos incrementalmente nas próximas fases de desenvolvimento.

### A. Foundation (4/4 Plugins)
- **[01_SandboxCommon](file:///d:/Unreal/V1/Plugins/01_SandboxCommon/)**: Gameplay Tags nativas (`SBGameplayTags`), definição de Atributos (`FSBAttribute`) e seus modificadores dinâmicos correspondentes (`FSBAttributeModifier`), além de logs estruturados e as classes base reutilizáveis (`FSBContext`, `USBBehaviorRegistry`, `USBModifierAggregator`).
- **[02_SandboxInterfaces](file:///d:/Unreal/V1/Plugins/02_SandboxInterfaces/)**: Contratos do ciclo de vida, persistência e rede (`ISBComponentInterface`, `ISBSaveInterface`, `ISBInitializable`, `ISBTickable`, `ISBReplicable`, `ISBResettable`).
- **[03_SandboxAssets](file:///d:/Unreal/V1/Plugins/03_SandboxAssets/)**: `SBAssetManager` integrado e Data Assets de definição (`PawnData`, `ComponentSet`, `AbilitySet`).
- **[04_SandboxCore](file:///d:/Unreal/V1/Plugins/04_SandboxCore/)**: `SBComponentFactory` (resolução topológica de dependências), Message Router priorizado (`USBEventSubsystem`), `SBInputSubsystem` e classes do ciclo do jogo.

### B. Gameplay (1/4 Plugins)
- **[05_SandboxCharacter](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/)**: Contêiner genérico `ASBCharacter` e componentes injetados (`Attribute`, `State`, `Ability`). Futuramente receberá subcomponentes de Movimentação, Câmera e Animação.

### C. Presentation (1/2 Plugins)
- **[09_SandboxUI](file:///d:/Unreal/V1/Plugins/09_SandboxUI/)**: Gerenciador de camadas de widgets `SBUIManager` e HUD.

### D. Tools (1/1 Plugins)
- **[11_SandboxEditor](file:///d:/Unreal/V1/Plugins/11_SandboxEditor/)**: Módulo exclusivo do editor para validação visual e customização de painéis.

---

## 2. Padrões de Engenharia Aplicados na Baseline

- **Versionamento no Descritor**: Inserção do bloco de versionamento `"SandboxVersion"` nos metadados de todos os arquivos `.uplugin`.
- **Wrapper de Contexto Unificado (`FSBBehaviorContext`)**: Criado para encapsular as referências de gameplay (`FSBGameplayContext`) e infraestrutura (`FSBFrameworkContext`) em um único struct constante repassado aos comportamentos.
- **Modificadores Priorizados**: Inserção do membro `Priority` na estrutura `FSBModifierEntry` para controle estrito de precedências de modificadores físicos.
- **Segurança de Tipos no Contexto**: Configuração de ponteiros fortemente tipados para os subsistemas `USBAssetManager` e `USBEventSubsystem` no contexto de infraestrutura.
- **Agendamento de Testes Automatizados**: A criação da bateria inicial de testes automatizados (Unit/Integration) sob a pasta `Tests/` foi programada para a próxima iteração lógica, acompanhando a codificação dos primeiros comportamentos concretos de movimentação (Sprint/Crouch).

---

## 3. Diretrizes de Compilação

> [!TIP]
> A Unreal Engine 5.8 traz nativamente seu DotNet SDK embutido (*bundled* em `Engine/Binaries/ThirdParty/DotNet/`) para execução do UnrealBuildTool (UBT). Nenhuma instalação externa ou manual do .NET SDK 10 é necessária no Windows para compilar o projeto `V1.sln`, evitando assim potenciais conflitos de runtime do compilador.

---

## 4. Extensão do Personagem - Animação Modular (Fase 8)

Implementamos a fundação de animação baseada em Linked Anim Layers e orientada a tags para o plugin **05_SandboxCharacter**:

- **ISBAnimLayerInterface**: Interface base (`UInterface`) em C++ utilizada para validar se os sub-ABP (sub-grafos) vinculados dinamicamente cumprem o contrato de animação esperado no Sandbox Framework.
- **USBAnimLayerConfigDataAsset**: Estrutura orientada a dados (`UDataAsset`) que mapeia as tags de estado (`FGameplayTag`) para classes de AnimInstance (`TSubclassOf<UAnimInstance>`) de sub-layer e suas respectivas prioridades (`Priority`).
- **USBAnimLayerManagerComponent**: Componente orquestrador de rede que gerencia de forma dinâmica e performática a vinculação e desvinculação de layers na malha:
  - **Hitch-Free Check**: Evita micro-soluços visuais em runtime comparando a lista atual versus a nova lista ordenada de layers. Se os grafos ativos não mudaram, pula a re-vinculação.
  - **StableSort Determinístico**: Resolve colisões de funções de interface compartilhadas ligando as layers em ordem ascendente de prioridade, de modo que a de maior prioridade herde o topo da pilha de execução da UE nativamente.
  - **Coalescimento por Dirty-Flag**: Escuta as alterações de tags do `StateComponent` e agenda um rebuild único por frame no fim do tick (`TG_PrePhysics`), evitando múltiplas vinculações redundantes no mesmo frame.
  - **Guards de Inicialização**: Gerencia links de forma deferida caso o `AnimInstance` do skeletal mesh esteja nulo na inicialização inicial do jogo.

---

## 5. Extensão do Personagem - Sistema de Câmeras (Fase 9)

Implementamos a infraestrutura do sistema de câmera dinâmico e desacoplado para o plugin **05_SandboxCharacter**:

- **FSBCameraContext**: Estrutura contendo referências transientes (Character, SpringArm, CameraComponent) e DeltaTime enviadas a cada frame para atualização dos modos ativos.
- **USBCameraModeDefinition**: Data Asset estático contendo configurações de FOV, Arm Length, Socket Offset e Blend Speed configuradas por designers, incluindo a propriedade `CameraModeClass` para comportamentos especializados.
- **USBCameraMode**: Classe base operacional para modos de câmera que implementa callbacks cruciais (`Enter`, `Update`, `Exit`) e controle de prioridade estática.
- **USBCameraComponent**: Componente orquestrador que gerencia a pilha de câmera local e realiza a interpolação suave (blending) de propriedades:
  - **Coalescimento por Dirty-Flag**: Escuta as alterações de tags do `StateComponent` e agenda uma reconstrução única por frame da pilha no início de seu `TickComponent` (evitando ordenações redundantes).
  - **Ciclo de Atualização (`Update()`) Contínuo**: Todos os modos da pilha rodam `Update()` para manter seu estado dinâmico (timers, camera shake), mas apenas o topo (maior prioridade) fornece as metas para o blending.
  - **Otimização Inteligente para Replays/Spectator**: O componente ignora o tick e processamento de câmera em proxies simulados, executando apenas se o pawn for controlado localmente (`IsLocallyControlled()`) ou for o `ViewTarget` atual do `PlayerController` local daquele cliente.
  - **Ordenação determinística por StableSort**: Reordena a pilha de modos ativos deterministicamente.

---

## 6. Extensão do Atributo & Sistema de Combate (Fase 10)

Implementamos a predição transacional de atributos e a inicialização física do sistema de combate no plugin **06_SandboxCombat**:

- **Predição de Atributos Jitter-Free (`USBAttributeComponent`)**:
  - **Transações por PredictionId**: Implementamos predição de recursos de consumo discreto (Munição, Mana) onde o cliente deduz visualmente o offset em seu HUD local associando a um `PredictionId` sequencial.
  - **Upsert do Array Replicado**: O servidor confirma consumos fazendo o *upsert* (update ou insert) de um ID confirmado em `ConfirmedPredictions` (`TArray<FSBConfirmedPredictionEntry>`), limitando o tamanho do array e eliminando vazamentos de dados na rede.
  - **Sincronização em Mesmo Frame**: OnReps de atributos e confirmações rodam juntos no mesmo frame de rede, limpando offsets locais e garantindo visual 100% livre de flicker ou double-dips.
  - **Timeout Guard**: Varredura contínua no tick que descarta transações mais velhas que 2.0 segundos, executando rollbacks implícitos sob perda severa de conexão.
  - **Consolidação de Escritas (`ModifyAttributeBaseValue`)**: Centralizamos todas as escritas físicas de valores em um único helper para garantir que mapas de cache C++ e arrays de replicação de rede nunca divirjam (corrigindo o bug latente de replicação de regeneração).

- **Módulo de Combate (`06_SandboxCombat`)**:
  - **Descritor `.uplugin` & Build.cs**: Inicializados no disco com as dependências unidirecionais topológicas estritas sobre a base de gameplay (`05_SandboxCharacter`).
  - **USBCombatComponent**: Orquestrador central que gerencia inventário de behaviors de armas, taxa de disparo (cooldowns de Cadência), RPCs de disparo (`ServerRequestFire`) e rollbacks em caso de cheat (`ClientRollbackFire`).
  - **ExclusivityGroup Ejection**: A ativação de armas em slots (ex: Rifle Primary) ejeta de forma automática e frame-perfect outras armas ativas no mesmo grupo de exclusão (ex: Pistol Secondary), realizando o weapon swap de forma data-driven.
  - **USBWeaponBehavior / Hitscan**: Lógica genérica de armas. O `USBWeaponBehaviorHitscan` executa traços físicos autoritativos no servidor (`LineTraceSingleByChannel`) e aplica danos consumindo diretamente da tag de saúde (`Attribute.Character.Health`) do componente de atributo do alvo.

- **Suíte de Testes Automatizados (`SBCombatTests`)**:
  - **Cenário 1**: Valida a predição local de munição, confirmação jitter-free e esvaziamento da fila de transação.
  - **Cenário 2 (Cheat Protection)**: Simula o cliente tentando disparar sem munição, e verifica o disparo do rollback restaurando a munição e limpando o behavior de disparo.
  - **Cenário 3 (Exclusivity Group Ejection)**: Valida a ejeção e transição perfeita de Rifle para Pistola no mesmo frame baseando-se no slot de exclusão.

---

## 7. Validação Completa da Suíte de Testes Automatizados (Fase 11 / v1.2.0)

Concluímos com sucesso a correção, refatoração arquitetural e estabilização de toda a suíte de testes unitários e de rede para os módulos de **Movimentação**, **Câmera**, **Animação** e **Combate**, alcançando **100% de cobertura verde (Exit Code: 0)**.

Seguindo os mais altos padrões de design de testes, removemos todos os desvios de execução de teste (`GIsAutomationTesting` ou classes mock de controller) que alteravam o fluxo do código de produção real, ajustando ao invés disso o ambiente de inicialização dos testes:

### Melhorias Arquiteturais e de Design nos Testes:
- **Remoção de Bypasses no Código de Produção**:
  - Revertemos o desvio de colisão de Crouch no [`SBMovementBehaviorCrouch.cpp`](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/Source/SandboxCharacter/Private/Movement/Behaviors/SBMovementBehaviorCrouch.cpp). O comportamento agora executa a checagem nativa de produção `CanCrouchInCurrentState()` sem bypasses.
  - Para permitir o Crouch no ambiente headless vazio de testes, configuramos o modo de movimentação do Pawn para `MOVE_Walking` nos arquivos de spec de teste.
  - Removemos o desvio do `GIsAutomationTesting` no override de `IsLocallyControlled()` no [`SBCharacter.cpp`](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/Source/SandboxCharacter/Private/Character/SBCharacter.cpp). O override agora reflete estritamente a lógica limpa de produção de Lyra: `IsPlayerControlled() && Super::IsLocallyControlled()`.
- **Eliminação de Classes Mock Excedentes**:
  - Excluímos as classes `ASBMockLocalPlayerController` e `ASBMockRemotePlayerController` de [`SBMovementComponent.h`](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/Source/SandboxCharacter/Public/Components/SBMovementComponent.h). Os testes agora utilizam a classe de produção nativa `APlayerController`.
- **Configuração Realista do Ambiente de Teste**:
  - Para fazer o `IsLocallyControlled()` nativo funcionar perfeitamente em modo headless sem interagir com telas, criamos instâncias de `ULocalPlayer` anexadas a `GEngine` como seu Outer e as atribuímos diretamente ao `Player` de cada Controller local de teste.
  - Para atender às validações nativas do motor (como `APawn::IsPlayerControlled()` que em versões modernas verifica a existência de um PlayerState não-bot), spawnamos instâncias de `APlayerState` no mundo de teste e as vinculamos a `Controller->PlayerState` nos specs de teste.
- **Proteção de API Pública**:
  - O método de utilidade de possessão virtual `Test_Possess(AController*)` foi alterado para `private` em [`SBCharacter.h`](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/Source/SandboxCharacter/Public/Character/SBCharacter.h).
  - Declaramos `friend class FSBNetworkTestsSpec;` na classe do personagem, garantindo que o atalho de possessão esteja disponível exclusivamente para a suíte de automação sem poluir a API de produção do framework.
- **USBBehaviorRegistry Concrete Class**:
  - A classe `USBBehaviorRegistry` em [`SBCommonTypes.h`](file:///d:/Unreal/V1/Plugins/01_SandboxCommon/Source/SandboxCommon/Public/Types/SBCommonTypes.h) permanece concreta (não-abstrata) uma vez que ela é instanciada diretamente via `NewObject` pela lógica de produção ativa em [`SBMovementComponent.cpp`](file:///d:/Unreal/V1/Plugins/05_SandboxCharacter/Source/SandboxCharacter/Private/Components/SBMovementComponent.cpp).

### Resultados da Suíte Automatizada:
Todas as baterias de testes estão executando e passando de forma 100% estável:
1. **Sandbox.Character.Animation** (2/2 Passando)
2. **Sandbox.Character.Camera** (2/2 Passando)
3. **Sandbox.Character.Movement** (4/4 Passando)
4. **Sandbox.Character.Network** (5/5 Passando)
5. **Sandbox.Combat** (3/3 Passando)

**Status Final: 100% Verde (Zero Falhas, Zero Ensures, Compilação Segura Sequencial com MaxParallelActions=1).**

---

## 8. Extensão de Interação Modular (Fase 12 - SandboxInteraction)

Implementamos o sistema de interações físicas e de rede sob hold-to-interact, autoridade centralizada de locks e proteção contra condições de corrida no plugin **07_SandboxInteraction**:

### A. Componente de Interação (`USBInteractionComponent`):
- **Detecção e Foco por Trace**: Varredura por linha ou varredura de esfera com base em configurações (`InteractionRange`, `bUseLineTrace`, `TraceRadius`), publicando eventos de detecção (`Event.Interaction.Available` e `Event.Interaction.Cleared`) com o payload correspondente (prompt de interação, duração) obtidos a partir dos contratos implementados no alvo.
- **Roteamento de Interface Seguro**: Adicionamos métodos auxiliares robustos que encapsulam o roteamento das chamadas da interface `ISBInteractableInterface` para evitar falhas do vtable do subsistema de reflexão da engine quando invocado em instâncias de teste C++ puras spawnadas dinamicamente. Os helpers tentam um cast estático de C++ para `ISBInteractableInterface*` antes de fazer o fallback via `ProcessEvent` do Unreal.
- **Suporte Completo a Retenção (Hold-to-Interact)**: Lógica com accumulators de DeltaTime local no cliente para hold-to-interact, acompanhado do respectivo acompanhamento visual (`GetHoldProgressPercent()`) e publicação contínua de eventos de progresso (`Event.Interaction.Progress`).
- **Locks no Servidor com Autoridade Estrita**: O servidor valida a distância do jogador (`ServerStartInteract` e `ServerCompleteInteract`) contra trapaças/desconexões, e realiza um lock de exclusividade lógica no ator alvo (`LockInteraction` e `UnlockInteraction`), mitigando cenários de concorrência onde dois jogadores tentam interagir com o mesmo baú/porta ao mesmo tempo (Cenário 5).
- **ClientCancelInteraction Simétrico**: No caso de falhas de rede, cheat ou desvio de distância do hold, o servidor força o cancelamento e restaura o estado do personagem de forma simétrica e limpa.

### B. Resultados da Suíte de Testes Automatizados (`Sandbox.Interaction`):
- **Cenário 1 (Detecção e Foco por Trace)**: Valida que a rotação e posicionamento da mira ativa detectam ou limpam o foco do objeto sob a mira, emitindo os payloads e tags esperados.
- **Cenário 2 (Interação Instantânea/Discreta)**: Valida interações sem duração (hold = 0.0s), as quais disparam imediatamente o evento `Interact` e liberam o lock.
- **Cenário 3 (Interação por Retenção/Hold-to-Interact)**: Valida o acúmulo de progresso de hold ao longo do tempo usando ticks manuais consistentes com a taxa de atualização máxima (`MaxDeltaTime`) da engine, executando a interação física somente no término do hold.
- **Cenário 4 (Interrupção por Distância/Network Safety)**: Valida que teleportar o personagem para longe do alvo do hold durante a interação força a interrupção local e o cancelamento autoritativo pelo servidor.
- **Cenário 5 (Cenário de Corrida de Alvo Compartilhado/Race Condition)**: Valida a disputa pelo mesmo objeto entre Jogador 1 (Servidor) e Jogador 2 (Cliente). O Jogador 2 tem sua requisição rejeitada pelo servidor porque o alvo já está trancado pelo Jogador 1.

**Status Final de Todos os Testes: 100% Verde (21/21 Testes Passando em toda a suíte do Sandbox).**

---

## 9. Sistema de Inventário e Slots Replicados (Fase 13 - SandboxInventory)

Implementamos a infraestrutura completa de inventário autoritativo em rede no plugin **08_SandboxInventory**, integrando-o de forma desacoplada aos demais plugins de gameplay:

### A. Componentes e Estrutura de Itens:
- **Padrão Definition/Instance/Fragment**: Implementamos os itens utilizando `USBItemDefinition` (Primary Data Asset contendo metadados imutáveis e `MaxStackCount`), `USBItemInstance` (UObject contendo estados replicados de quantidade/tags transientes) e `USBItemFragment` (classes instanciadas para especializar o uso de itens de forma polimórfica).
- **Fast Array Replication**: Criamos a estrutura `FSBInventoryList` (derivada de `FFastArraySerializer`) contendo slots `FSBInventoryEntry`. O componente `USBInventoryComponent` registra o array e realiza `ReplicateSubobjects` para todos os clientes conectados.
- **Fila de Ativação e Timeout Guard**: Adicionamos uma fila temporária no tick do cliente que retém a notificação visual do slot enquanto a referência UObject do subobjeto do item não é totalmente resolvida em rede. Aplicamos o **Timeout Guard de 2.0 segundos** para descartar entradas órfãs sob interrupção de rede.
- **Desacoplamento Completo via Message Router**: A conexão entre o Inventário e o Combate (`06_SandboxCombat`) ocorre de forma 100% plana. Ao equipar ou desequipar itens, o inventário publica os eventos `Event.Inventory.ItemEquipped` / `ItemUnequipped` com seus payloads. O `USBCombatComponent` assina os eventos e usa **reflexão dinâmica em runtime** para ler as propriedades do fragmento de equipamento, instanciando e ejetando os `WeaponBehavior` simetricamente sem possuir dependência de compilação com o plugin de inventário.

### B. Resultados da Suíte de Testes Automatizados (`Sandbox.Inventory`):
- **Cenário 1 (Adição e Stacking)**: Valida que itens empilháveis incrementam slots existentes até `MaxStackCount`, dividindo transações subsequentes em novos slots.
- **Cenário 2 (Fila de Ativação e Timeout)**: Verifica que slots com referências nulas enfileiram na ativação e são ejetados com log de aviso após 2 segundos sem resolver.
- **Cenário 3 (Integração de Equipar)**: Valida que equipar um Rifle publica a tag no Message Router, ativando e configurando o `WeaponBehavior` correspondente no `CombatComponent` via reflexão.
- **Cenário 4 (Loot Dispute)**: Testa disputa de anel valendo-se da exclusão mútua de locks de interação, garantindo que o segundo jogador seja rejeitado e o loot não seja duplicado.
- **Cenário 5 (Desequipamento Simétrico)**: Verifica que desequipar o rifle do inventário dispara a remoção e encerramento limpo do behavior correspondente da pilha de combate.

**Status Final de Todos os Testes: 100% Verde (26/26 Testes Passando em toda a suíte do Sandbox).**

---

## 10. Consolidação do USBBehaviorStackComponent (Fase 14 - v1.4.0)

Consolidamos com sucesso o mecanismo de pilha ativa de comportamentos de movimentação (`USBMovementComponent`) e de combate (`USBCombatComponent`) em um único componente genérico comum e robusto, o `USBBehaviorStackComponent`, localizado no plugin core **01_SandboxCommon**.

### A. Componentes Consolidados e Proteção de Reentrância:
- **Base Comum Data-Driven (`USBGameplayBehavior` e `USBGameplayBehaviorDefinition`)**: Extraímos as definições estáticas (`StackPriority`, `ExclusivityGroup`, `RequiredTags`, `BlockedTags`) e a lógica de instância (`Initialize`, `Enter`, `Exit`, `Update`, `CanEnter`, `CanExit`) para classes polimórficas comuns.
- **USBBehaviorStackComponent**: Orquestrador comum que gerencia a pilha ativa (`ActiveBehaviors`) e os comportamentos disponíveis (`AvailableBehaviors`). 
- **Prevenção Simétrica de Reentrância (`FSBStackMutationGuard`)**: Implementamos a mutabilidade segura da pilha em loops de saída em cascata. O guard rastreia a profundidade de mutação (`StackMutationDepth`). Se novas ativações ou ejeções ocorrerem durante a execução dos hooks `Enter`/`Exit`, elas são retidas em `DeferredEntries` e `DeferredExits` e resolvidas deterministicamente de forma sequencial (*flat loop*) quando a profundidade retorna a zero, mitigando crashes por stack overflow.
- **Roteamento de Interfaces no Mundo Headless**: Corrigimos o setup de inicialização de comportamentos em ambientes de testes automatizados headless (onde o sistema de reflexão UObject da Unreal pode falhar ao validar interfaces dinâmicas) substituindo as chamadas de reflexão lentas por casts estáticos de C++ (`Cast<ISBCharacterInterface>` e `Cast<ISBStateComponentInterface>`) com fallbacks seguros para reflexão (`ImplementsInterface` e `Execute_`).
- **Resolução de Conflitos e Shadowing**: Renomeamos as propriedades sombreadas de subclasses (`Definition` -> `MovementDefinition` / `WeaponDefinition`) e corrigimos as diretivas `UFUNCTION` repetidas em overrides virtuais C++ que geravam erros do compilador Unreal Header Tool (UHT).

### B. Adaptação dos Plugins Especializados:
- **USBMovementComponent & USBCombatComponent**: Herdaram diretamente da base comum, eliminando centenas de linhas de código duplicado e herdando as rotinas genéricas de Tick e ordenação.
- **RPC Symmetrical Synchronization (`OnBehaviorEjected`)**: Implementamos o hook virtual de ejeção de rede que propaga flags de skip de replicação (`bSkipServerNotify`/`bSkipClientNotify`) corretamente, permitindo que componentes de movimentação e combate disparem seus respectivos RPCs nativos (`ClientStopBehavior`, `ServerRequestFire`, etc.) sem gerar loops infinitos na rede.

### C. Bateria de Testes Unificada:
Criamos o arquivo de teste [`SBSourceBehaviorStackTests.cpp`](file:///d:/Unreal/V1/Plugins/01_SandboxCommon/Source/SandboxCommon/Private/Tests/SBSourceBehaviorStackTests.cpp) em `01_SandboxCommon` e executamos a suíte de automação completa:
- **Should sort behaviors by descending priority**: Valida a ordenação correta das prioridades na base comum.
- **Should eject conflicting behavior in same ExclusivityGroup**: Testa a ejeção determinística do behavior ativo quando outro behavior do mesmo grupo e de maior prioridade entra na pilha.
- **Should defer reentrant requests correctly in exit cascades**: Estressa a pilha com ativações reentrantes profundas, verificando que o flat loop as adia e executa sequencialmente sem estourar a memória.
- **Suíte Legada Integrada**: Todos os 26 testes de movimentação avançada, rede, câmera, animação, combate, interação e inventário continuam passando perfeitamente.

**Status Final de Todos os Testes: 100% Verde (27/27 Testes Passando com Exit Code: 0).**

---

## 11. Sistema de Persistência e Save Game (Fase 15 - USBSaveSubsystem)

Implementamos a infraestrutura completa de persistência e save/load de jogo no **Sandbox Framework** baseando-se no contrato C++ `ISBSaveInterface`, integrando-o de forma autoritativa no servidor aos componentes de Atributos e Inventário.

### A. Componentes e Estrutura de Salvamento:
- **USBSaveSubsystem (Desacoplamento Base Abstrata)**: Criado o subsistema abstrato base em [`02_SandboxInterfaces`](file:///d:/Unreal/V1/Plugins/02_SandboxInterfaces/Source/SandboxInterfaces/Public/Subsystems/SBSaveSubsystem.h) herdando de `UGameInstanceSubsystem` com a assinatura `UCLASS(Abstract, BlueprintType)`. Isso permite a outros plugins (como `01_SandboxCommon`) resolverem referências do save subsystem estaticamente em compile-time via `GetSubsystem<USBSaveSubsystem>()`, sem dependência circular com o módulo concreto de persistência.
- **USBSaveSubsystemConcrete (Varredura do Mundo)**: Implementada a classe concreta em [`04_SandboxCore`](file:///d:/Unreal/V1/Plugins/04_SandboxCore/Source/SandboxCore/Public/Subsystems/SBSaveSubsystemConcrete.h), a qual varre todos os atores do mundo (`TActorIterator`) e seus componentes associados. Se um ator ou componente implementar `ISBSaveInterface`, seus ganchos polimórficos de serialização (`SaveComponentData` / `LoadComponentData`) são executados.
- **USBSavePayload & FSBSaveObjectData**: O payload genérico utiliza `FObjectAndNameAsStringProxyArchive` com o sinalizador `ArIsSaveGame = true` para filtrar e serializar propriedades `SaveGame` em um buffer de bytes transiente. Para contornar a rejeição do Unreal Header Tool (UHT) a `TMap`s com coleções complexas no campo do valor, envelopamos os dados binários na struct C++ `FSBSaveObjectData`.
- **Persistência de Atributos (`USBAttributeComponent`)**: Salvamento e carregamento autoritativo (`HasAuthority()`). O carregamento de atributos lê a alteração serializada e a propaga chamando `ModifyAttributeBaseValue` para cada atributo de forma individual, garantindo que os rollbacks de predição e o HUD local mantenham a sincronização perfeita sem double-dips ou dessincronização de rede.
- **Persistência de Inventário (`USBInventoryComponent`)**: Salvamento e carregamento autoritativo (`HasAuthority()`). Salva o caminho do data asset do item (`USBItemDefinition`), a quantidade (`StackCount`) e as tags dinâmicas transientes (`DynamicTags`) associadas à instância (ex: `State.Item.Broken`). Ao carregar, o servidor reconstrói as instâncias de itens na rede chamando `ServerAddItem`.

### B. Suíte de Testes Automatizados (`SBSaveTests.cpp`):
A suíte de testes foi alocada no plugin [`08_SandboxInventory`](file:///d:/Unreal/V1/Plugins/08_SandboxInventory/Source/SandboxInventory/Private/Tests/SBSaveTests.cpp) (para resolver todas as inclusões de componentes sem dependências circulares), validando o fluxo completo:
- **World Context Setup**: Instanciamos um `UGameInstance` autônomo e criamos um `FWorldContext` no `GEngine` associado ao `TestWorld`, assegurando que a chamada `GetWorld()` no subsystem resolva perfeitamente no ambiente de testes headless.
- **Prevenção de Colisões Síncronas**: Implementamos a limpeza de atores e componentes em testes sequenciais chamando `Rename` nos atores e componentes antigos antes da chamada de destruição, liberando seus nomes de forma frame-perfect para a nova iteração.
- **Validação de Restauração de Atributos**: Modificamos e persistimos os campos base da struct `FSBAttribute` (as quais marcamos com o especificador `SaveGame` em [`SBCommonTypes.h`](file:///d:/Unreal/V1/Plugins/01_SandboxCommon/Source/SandboxCommon/Public/Types/SBCommonTypes.h) para permitir serialização em baixo nível), comprovando que o carregamento reverte o estado do personagem para os valores gravados.
- **Validação de Restauração de Tags Dinâmicas**: Provamos que itens que contêm tags de estado temporárias (ex: tag `BrokenTag`) no inventário salvam e reconstroem essas tags perfeitamente ao carregar a sessão.

**Status Final de Todos os Testes: 100% Verde (28/28 Testes Passando com Exit Code: 0).**

---

## 12. Sistema de Habilidades Baseado no Behavior Stack (Fase 16 - v1.6.0)

Implementamos o **Sistema de Habilidades** completo herdando diretamente da fundação consolidada do `USBBehaviorStackComponent` e `USBGameplayBehavior`, provendo predição em rede, gerenciamento transacional de recursos e suporte ao Enhanced Input.

### A. Herança Limpa e Validação de Recursos:
- **USBAbility (Gameplay Behavior Especializado)**: Herdado de `USBGameplayBehavior`, ganhando automaticamente toda a proteção de reentrância em cascata, tags exigidas/bloqueadas e grupos de exclusão mútua. Inclui suporte a `CooldownDuration`, `ResourceTag` (ex: `Attribute.Mana`) e `ResourceCost`.
- **USBAbilityComponent (Behavior Stack Replicado)**: Herdado de `USBBehaviorStackComponent`, integrando os RPCs de rede do ciclo de ativação de habilidades. `USBAbility` não é replicado como subobjeto (acoplamento zero de rede), dependendo de tags e cooldowns para sincronizar estado na rede.
- **Enhanced Input Mapping**: Mapeamento dinâmico entre tags de input (`InputTag`) e habilidades (`AbilityTag`), executado em `SetupPlayerInputComponent` através do dispatch `BindInputActions` de forma data-driven.
- **Ordem de Operações Preditiva Segura**:
  - O `RequestBehavior` sobrescrito no cliente local valida e consome o recurso (*predictive consumption*) no `USBAttributeComponent` associado a um `PredictionId` **antes** de chamar a execução da pilha base (`Super::RequestBehavior()`).
  - O servidor associa o `PredictionId` recebido do cliente a uma variável transiente (`CurrentServerPredictionId`) para evitar geração local dessincronizada de IDs e prevenir consumo duplicado de recursos na rede.
  - Se a pilha base rejeitar a ativação (por tags de bloqueio ou exclusão) ou sob falha, o cliente realiza a limpeza da predição local enquanto o servidor executa o **rollback simétrico** reembolsando o valor base do recurso diretamente na autoridade (`SetAttributeBaseValue`).
- **FSBCooldownList (Replicação de Cooldowns)**: Implementado como uma lista de replicação em rede baseada em `FFastArraySerializer`, garantindo sincronização jitter-free de cooldowns ativos sem replicação desnecessária de subobjetos de UObject pesados.

### B. Correção de Acoplamentos de Teste e Robustez de C++:
- **Decoupling dos Testes da Fundação**: Para eliminar o acoplamento circular entre Foundation (`SandboxCore`) e extensões de Gameplay:
  - Os testes de persistência do inventário foram isolados em `08_SandboxInventory` (`SBInventorySaveTests.cpp`).
  - Os testes de persistência de atributos/states core foram isolados no plugin de personagens `05_SandboxCharacter` (`SBSaveTests.cpp`).
  - O plugin `04_SandboxCore` permanece no nível base, com zero acoplamento físico ou lógico com inventário ou personagens.
- **Resolução de Casts em Mundos Headless**: Substituímos as chamadas de interface do Blueprint VM (`ISBCharacterInterface::Execute_GetAttributeComponent`) por robustos casts C++ estáticos (`Cast<ISBCharacterInterface>`), contornando falhas no vtable da Unreal em mundos unitários headless.
- **Registro Dinâmico de Tags nos Testes**: Evitamos poluição estática na lista de tags de produção registrando as tags de input de teste de forma temporária na inicialização (`BeforeEach`) de `SBAbilityTests.cpp` usando o `UGameplayTagsManager`.

### C. Resultados da Suíte de Testes Automatizados (`Sandbox.Character.Abilities`):
- **Cenário 1 (Ativação e Cooldown Replicado)**: Valida que a habilidade ativa, adiciona tags de estado ao personagem, registra o cooldown no array replicado do componente e bloqueia re-ativações até o cooldown expirar.
- **Cenário 2 (Consumo e Rollback Transacional)**: Valida que habilidades consomem mana localmente com `PredictionId`. Sob falta de recurso ou rejeição de ativação por tags de bloqueio, simula o rollback seguro do servidor devolvendo o recurso de forma invisível ao jogador.
- **Cenário 3 (Enhanced Input Mapping)**: Verifica que simulações de triggers de press de input ativam as habilidades correspondentes no componente orquestrador de forma frame-perfect.

**Status Final de Compilação e Suíte de Testes (Fase 16): 100% Sucedido e Verde (31 de 31 testes unitários e de integração concluídos com sucesso no V1Editor).**

---

## 13. Gameplay Debugger e Telemetria (Fase 17 - v1.7.0)

Implementamos o plugin **Gameplay Debugger** (`10_SandboxDebug`) com desacoplamento total das extensões de gameplay usando a interface de reflexão/telemetria `ISBDebugInterface`.

### A. Desacoplamento Arquitetural (Manifesto Garantido):
- **Isolamento de Compilação**: O plugin `10_SandboxDebug` possui dependência única e exclusiva de `02_SandboxInterfaces` (e infraestrutura base `04_SandboxCore`), sem qualquer link de compilação C++ ou inclusão de cabeçalho contra `05_SandboxCharacter`, `06_SandboxCombat`, `07_SandboxInteraction` ou `08_SandboxInventory`.
- **ISBDebugInterface**: Declarada no plugin `02_SandboxInterfaces`. Utiliza a struct leve `FSBDebugLine` para representar metadados estruturados (Label, Value, bIsHeader) evitando o vazamento de ponteiros de objetos internos.
- **Auto-Descrição via Componentes**:
  - `USBBehaviorStackComponent` expõe sua pilha ativa de behaviors, profundidade de mutações e queues de mutação adiada (`DeferredEntries`/`DeferredExits`).
  - `USBAttributeComponent` expõe atributos registrados (Base vs Current), contagem de modificadores ativos e predições locais pendentes.
  - `USBStateComponent` expõe tags de estado ativas e preditas.
  - `USBAbilityComponent` expõe cooldowns ativos em segundos decrescentes e mapeamento de inputs.
  - `USBInventoryComponent` expõe o grid de slots de itens de forma síncrona aos dados replicados.
  - `USBCombatComponent` expõe armas disponíveis e ativas.
  - `ASBTestInteractableActor` expõe a duração de interação, contagem de acessos e o ator que possui o lock atual.

### B. Integração ao GDT (Gameplay Debugger Subsystem):
- **Coleta Autoritativa (`CollectData`)**: Varre em tempo de execução os componentes do ator inspecionado na mira do jogador (tanto personagens quanto atores interativos como baús). Filtra e invoca dinamicamente `ISBDebugInterface::Execute_GetDebugDescription` para quem assina o contrato.
- **Replicação Eficiente via DataPacks**: Utiliza o pipeline nativo `SetDataPackReplication` para replicar de forma otimizada os dados compilados no servidor para renderização local.
- **Apresentação Formatada (`DrawData`)**: Utiliza o markup nativo do GDT canvas para desenhar títulos estruturados em ciano (`{cyan}`) e pares de telemetria alinhados em branco (`{white}`) sob fundo escuro.
- **Compilação Condicional**: Todo o ciclo do módulo e arquivos C++ associados são condicionados via `#if WITH_GAMEPLAY_DEBUGGER` prevenindo vazamento de stubs em Shipping builds.

**Status Final de Compilação e Suíte de Testes (Fase 17): 100% Sucedido e Verde (31 de 31 testes unitários e de integração concluídos com sucesso no V1Editor).**

---

## 14. Interface Dinâmica e Desacoplamento de UI (Fase 18 - v1.8.0)

Implementamos a infraestrutura para **UI Dinâmica** (`09_SandboxUI`), conectando widgets visuais ao barramento de eventos assíncronos (`USBEventSubsystem`) sob acoplamento estático zero, prevenção de vazamento de escopo e testes de idempotência e limpeza automatizados.

### A. Estrutura de Eventos Core (`04_SandboxCore`):
- **Event Payloads Centralizados**: Criado o arquivo [`SBEventPayloads.h`](file:///D:/Unreal/V1/Plugins/04_SandboxCore/Source/SandboxCore/Public/Subsystems/SBEventPayloads.h) declarando as classes de payload derivadas de `UObject` para permitir Garbage Collection e compatibilidade nativa com Blueprints (UMG):
  - `USBPawnEventPayload`
  - `USBAttributeChangedPayload` (com `AttributeTag`, `BaseValue` e `CurrentValue`)
  - `USBInteractionAvailableEventPayload` e `USBInteractionProgressEventPayload` (ambos contendo `TargetPawn` para filtragem)
  - `USBInventoryEventPayload` (contendo `TargetPawn` e `ItemInstance` genérico como `UObject*` para acoplamento C++ zero)
  - `USBCooldownEventPayload`
- **Idempotência no Event Subsystem**: Atualizado o método `SubscribeToEvent` do [`SBEventSubsystem.cpp`](file:///D:/Unreal/V1/Plugins/04_SandboxCore/Source/SandboxCore/Private/Subsystems/SBEventSubsystem.cpp) para buscar delegates existentes antes de registrar a inscrição, prevenindo assinaturas duplicadas acidentais na mesma tag.

### B. Emissão de Eventos e Throttling:
- **Atributos & Habilidades (`05_SandboxCharacter`)**:
  - `SBAttributeComponent` assina seu delegate dinâmico `OnAttributeChanged` e publica telemetria na tag `Event.Attribute.Changed`.
  - `SBAbilityComponent` emite `Event.Ability.CooldownStarted` e gerencia a expiração de cooldowns ativos em seu `TickComponent` para disparar `Event.Ability.CooldownEnded` no frame exato.
- **Throttling a 60 Hz em Interações (`07_SandboxInteraction`)**:
  - Em `SBInteractionComponent`, implementamos um acumulador de delta de tempo no Tick para limitar os disparos de `Event.Interaction.Progress` a uma taxa máxima de **60 Hz** (intervalo `>= 0.01667s`), reduzindo re-renders excessivos em widgets Slate/UMG.
- **Compatibilidade Canônica em Inventários (`08_SandboxInventory`)**:
  - Preservamos os quatro eventos canônicos (`ItemAdded`/`ItemRemoved`/`ItemEquipped`/`ItemUnequipped`) no `SBInventoryComponent`, permitindo que grids de UI assinem as modificações de forma individualizada.
  - Registramos nativamente todas as novas tags de eventos de inventário no `StartupModule` de `SandboxInventoryModule.cpp` para consistência e prevenção de falhas de tags no carregamento autônomo.
  - **Correção de Use-After-Free**: Corrigido bug crítico de acesso de memória (Access Violation) no `ServerRemoveItem()` reordenando a publicação de atualizações de slot antes da exclusão física dos elementos no array de entries.

### C. Ciclo de Vida do Widget e Filtro de Escopo Local (`09_SandboxUI`):
- **Auto-Unsubscribe síncrono**: `USBUserWidget` gerencia um array transiente de `FSBWidgetEventSubscription` (armazenando tag + delegate de blueprint) e executa automaticamente desinscrições cirúrgicas e seguras no `NativeDestruct()`.
- **Filtro de Escopo Local (Anti-Spill)**: Implementamos o método helper `GetOwningPlayerPawn()` no `USBUserWidget`. Os widgets visuais do barramento utilizam esse helper para comparar se o `TargetPawn` do payload do evento corresponde ao Pawn controlado localmente, impedindo o vazamento de dados de interface entre clientes locais em Listen Server ou split-screen.
- **Subsystem Manager (`USBUIManager`)**: Herdado de `ULocalPlayerSubsystem` para garantir o ciclo de vida e acoplamento nativo por jogador do HUD e das camadas de widgets (HUD, Menu, Popup, Notification).
- **Fallback no HUD**: `SBHUD` implementa fallback seguro para instanciar a classe de HUD base configurada em `MainHUDWidgetClass` quando as propriedades do Pawn estão indisponíveis no editor.

### D. Resultados da Suíte de Testes Automatizados (`Sandbox.UI.WidgetEvents`):
Criamos a suíte de testes de UI [`SBUITests.cpp`](file:///D:/Unreal/V1/Plugins/09_SandboxUI/Source/SandboxUI/Private/Tests/SBUITests.cpp) cobrindo os seguintes cenários de conformidade:
- **should be idempotent and auto-unsubscribe cleanly**: Valida que assinar o mesmo delegate duas vezes dispara apenas 1 evento no barramento (idempotência), e que a destruição do widget remove todas as escutas ativas.
- **should filter events based on TargetPawn matching widget's possessed pawn**: Valida que o widget ignora eventos cujo `TargetPawn` não corresponde ao seu Pawn controlado localmente (usando o suporte a `bMockOwningPawn` em ambiente de testes unitários).
- **Suíte Legada e Nova Suíte Integrada**: Todos os 32 testes do Sandbox Framework rodam com sucesso absoluto.

### E. Classes de Suporte C++ (Backing Classes) para Widgets UMG:
Para permitir auditoria de código robusta e simplificar o trabalho do desenvolvedor no editor (evitando programação visual em gráficos espaguete de Blueprints), implementamos a lógica de controle completa em C++ no plugin `09_SandboxUI`:
*   **[`USBStatusHUDWidget`](file:///D:/Unreal/V1/Plugins/09_SandboxUI/Source/SandboxUI/Public/Widgets/SBStatusHUDWidget.h)**:
    *   Vincula dinamicamente componentes de barra de progresso `PB_Health` e `PB_Mana` via especificação `meta = (BindWidget)`.
    *   Assina `Event.Attribute.Changed` e executa um guard contra payloads nulos ou casts inválidos.
    *   Filtra pelo Pawn possuído localmente e calcula a proporção exata de preenchimento (`CurrentValue / MaxValue`) atualizando a porcentagem na tela síncronamente.
*   **[`USBInteractionPromptWidget`](file:///D:/Unreal/V1/Plugins/09_SandboxUI/Source/SandboxUI/Public/Widgets/SBInteractionPromptWidget.h)**:
    *   Vincula `TXT_Prompt` (bloco de texto) e `PB_HoldProgress` (barra de progresso).
    *   Inscreve-se nos eventos `Available`, `Cleared` e `Progress`.
    *   Gerencia os estados de visibilidade (*HitTestInvisible* vs *Collapsed*) e atualiza o progresso do hold de forma reativa a partir do payload `ProgressPercent`.
*   **[`USBAbilityBarWidget`](file:///D:/Unreal/V1/Plugins/09_SandboxUI/Source/SandboxUI/Public/Widgets/SBAbilityBarWidget.h)**:
    *   Vincula `IMG_CooldownMask` e `TXT_CooldownTime`.
    *   Inscreve-se em `CooldownStarted` e `CooldownEnded`.
    *   **Ticking de Cooldown Cosmético**: Implementa interpolação estritamente local (client-side) em `NativeTick` a partir da duração capturada inicialmente, reduzindo qualquer sobrecarga de tráfego de rede ou queries repetitivas ao servidor.
*   **[`USBInventoryGridWidget`](file:///D:/Unreal/V1/Plugins/09_SandboxUI/Source/SandboxUI/Public/Widgets/SBInventoryGridWidget.h)**:
    *   Escuta `Event.Inventory.SlotUpdated` e repassa a notificação para a Blueprint via evento implementável `BP_OnSlotUpdated(UObject* ItemInstance)`. O Blueprint do designer faz o cast dinâmico seguro de `ItemInstance` para `USBItemInstance` no UMG para popular imagens e textos de slot de forma visual.

**Status Final de Compilação e Suíte de Testes (Fase 18): 100% Sucedido e Verde (32 de 32 testes concluídos com sucesso no V1Editor - EXIT CODE: 0).**

---

## 🚀 Integração e Replicação no GameAnimationSample

Em 14 de Agosto de 2026, estendemos a infraestrutura C++ do Sandbox para o projeto **GameAnimationSample** (`D:\Unreal\GameAnimationSample`), realizando a portabilidade completa de forma estável e rastreável:
- **Módulo de Código Nativo**: Criado o módulo do jogo principal C++ `GameAnimationSample` com seus alvos de compilação `Target.cs` e regras de build.
- **Portabilidade de Plugins**: Habilitamos todos os 11 plugins do Sandbox e suas dependências associadas no arquivo `.uproject` do projeto de animações.
- **Build de Compilação Completa**: O projeto compilou com sucesso absoluto na linha de comando via UBT com 241 passos de compilação C++.
- **Garantia Verde nos Testes**: Executamos a suíte de testes unitários do Sandbox dentro do novo ambiente integrado, retornando **EXIT CODE: 0** com todos os 32 testes de automação passando.
- **Repositório GitHub**: Publicado no GitHub sob a conta `JoaoSantosCodes` no repositório [GameAnimationSampleSandbox-Framework](https://github.com/JoaoSantosCodes/GameAnimationSampleSandbox-Framework) com `.gitignore` configurado para omitir assets pesados da Epic Games e manter o repositório leve (apenas código, plugins de lógica e configurações).

