# Manual de Uso — Sandbox Framework (v1.8.0)

Este documento é um guia prático para configurar, rodar e testar o Sandbox Framework dentro do Unreal Editor. Ele assume que os 11 plugins (01_SandboxCommon a 11_SandboxEditor, incluindo 09_SandboxUI e 10_SandboxDebug) já compilam com sucesso e que a suíte automatizada (Session Frontend → Automation) está verde (32/32 specs).

Para arquitetura e decisões de design, consulte [sfps_specification.md](file:///C:/Users/joaoc/.gemini/antigravity/brain/056f3669-6d8c-48af-8871-68ba0f54ee54/sfps_specification.md) (especificação), [sfdg_guide.md](file:///C:/Users/joaoc/.gemini/antigravity/brain/056f3669-6d8c-48af-8871-68ba0f54ee54/sfdg_guide.md) (guia de desenvolvimento C++) e o [manifesto_and_coding_standards.md](file:///C:/Users/joaoc/.gemini/antigravity/brain/056f3669-6d8c-48af-8871-68ba0f54ee54/manifesto_and_coding_standards.md). Este manual cobre a configuração de assets no editor, o roteiro de playtest e dicas práticas de usabilidade do Blueprint Editor.

---

## 1. Pré-requisitos de Ambiente

* Unreal Engine 5.8 instalada, com o plugin **ModularGameplayActors** presente em `Plugins/` e habilitado no `.uproject` (`Edit` → `Plugins` → `Modular Gameplay Actors`).
* Projeto compila em **Development Editor** sem erros no Visual Studio / Rider.
* Todos os `.uplugin` das extensões (`06_SandboxCombat`, `07_SandboxInteraction`, `08_SandboxInventory`) referenciam `05_SandboxCharacter` como dependência; nenhuma extensão depende de outra extensão diretamente (a comunicação entre elas é feita exclusivamente via `USBEventSubsystem` / Message Router).

> [!IMPORTANT]  
> Se a compilação falhar com `Unable to find parent class type for 'X' named 'AModularY'`, o problema é o plugin **ModularGameplayActors** não habilitado ou o módulo correspondente ausente do `Build.cs` — não é um erro de lógica do framework.

---

## 2. Configuração de Data Assets (obrigatório antes de qualquer teste)

O framework é inteiramente *data-driven* — nada funciona com classes C++ "puras" sem os assets correspondentes configurados no editor.

### 2.1 PawnData e ComponentSet
1. Crie um `USBComponentSetDataAsset` (`BP_ComponentSet_Hero`) listando as classes de componente que o personagem deve receber:
   * **Base**: `USBAttributeComponent`, `USBStateComponent`, `USBAbilityComponent`
   * **Movimento/Apresentação**: `USBMovementComponent`, `USBCameraComponent`, `USBAnimLayerManagerComponent`
   * **Extensões** (conforme o que for testar): `USBCombatComponent`, `USBInteractionComponent`, `USBInventoryComponent`
2. Crie um `USBPawnDataAsset` (`BP_PawnData_Hero`) referenciando esse `ComponentSet`.
3. Crie um Blueprint derivado de `ASBCharacter` (`BP_SBCharacter_Hero`) e atribua o `PawnData` no painel de detalhes.
4. No `ASBGameMode` do nível de teste, defina `DefaultPawnClass = BP_SBCharacter_Hero`.

> [!WARNING]  
> Sem isso, `InitializeFromPawnData()` roda com `PawnData == nullptr`, loga um warning, e nenhum componente de gameplay é injetado.

### 2.2 Movimento (Sprint / Crouch)
Configure os seguintes Data Assets no editor:

| Asset | Campos Obrigatórios |
| :--- | :--- |
| **USBMovementBehaviorDefinition** (Sprint) | `BehaviorTag = Movement.Sprint`, `StackPriority = 50`, `ExclusivityGroup = Movement.Group.Stance`, `RequiredTags = State.Character.Grounded`, `BlockedTags = State.Character.Dead`, `MovementModifiers` (ex: `TargetStatTag = Movement.Stat.Speed`, `Operation = Multiply`, `Value = 1.5`), `StaminaCostPerSecond` |
| **USBMovementBehaviorCrouchDefinition** (Crouch) | `BehaviorTag = Movement.Crouch`, `StackPriority = 20`, `ExclusivityGroup = Movement.Group.Stance`, `BlockedTags` incluindo `State.Character.Sprinting`, `CrouchedHalfHeight` |
| **USBMovementConfigDataAsset** | Lista as duas Definitions acima, registradas no `USBMovementComponent` do personagem. |

### 2.3 Câmera
Crie um `USBCameraModeDefinition` para cada um dos seguintes estados de câmera:
* **Walk**: FOV 90, ArmLength 300, `ActivationTag` = nula ou padrão, `StackPriority` = 10.
* **Sprint**: FOV 100, ArmLength 350, `ActivationTag = State.Character.Sprinting`, `StackPriority` = 50.
* **Aim**: FOV 65, ArmLength 150, `ActivationTag = State.Character.Aiming`, `StackPriority` = 100.

### 2.4 Combate
* Crie um `USBWeaponBehaviorDefinition` por arma, configurando:
  * `BehaviorTag = Combat.Action.FirePrimary`
  * `ExclusivityGroup = Combat.Slot.Primary`
  * `Damage`, `FireRate`, `AmmoCost`
  * `BlockedTags` (ex: `State.Character.Sprinting`).
* Registre a tag `Attribute.Character.Health` no `USBAttributeComponent` inicial de qualquer personagem que possa ser alvo — sem isso o Hitscan não encontra o atributo correspondente para reduzir o valor e falhará silenciosamente.

### 2.5 Interação
* Posicione atores no nível que implementem `ISBInteractableInterface` — você pode derivar Blueprints ou criar classes C++ baseadas nos mocks de teste (ex: `ASBTestInstantPickup`, `ASBTestLockedChest`).
* Confirme que `GetInteractionPrompt` e `GetInteractionDuration` retornam valores sensatos no editor e que objetos compartilhados implementam a lógica de lock (`LockInteraction` / `UnlockInteraction`).

### 2.6 Inventário
* Crie assets de `USBItemDefinition` por item, especificando `MaxStackCount` e preenchendo a lista de `Fragments`.
* Adicione um `USBItemFragment_Equippable` que aponte para o `USBWeaponBehaviorDefinition` correspondente à arma (implementando `ISBEquippableInterface`).
* Crie pickups físicos no nível que implementem `ISBInteractableInterface`, cujo `Interact_Implementation` chame `ServerAddItem` no `USBInventoryComponent` do personagem que interagiu.

### 2.7 Habilidades (Abilities)
* Crie um `USBAbilitySetDataAsset` (`BP_AbilitySet_Hero`) no Content Browser.
* Para cada habilidade que você deseja disponibilizar para o personagem, adicione uma entrada na lista de habilidades:
  * **InputTag**: Defina a tag do input correspondente (ex: `Input.Action.Ability1`).
  * **Definition**: Aponte para o `USBGameplayBehaviorDefinition` da habilidade.
  * **AbilityClass**: Aponte para a classe Blueprint de sua habilidade (derivada de `USBAbility`).
* No Blueprint de sua habilidade (`BP_Ability_Teleport` por exemplo, derivado de `USBAbility`):
  * Configure `AbilityTag` (ex: `Ability.Teleport`).
  * Configure as tags ativas em `AbilityTags` (ex: `State.Character.Teleporting`).
  * Configure o custo do recurso: `ResourceTag = Attribute.Mana`, `ResourceCost = 25.0`.
  * Configure o cooldown: `CooldownDuration = 5.0`.

  > [!NOTE]  
  > **Decisão de Design (Superfície de Configuração)**: Diferente de Movimento e Combate que concentram toda a parametrização nas Definitions, Habilidades configuram Custo, Recurso e Cooldown diretamente no Blueprint da classe derivada de `USBAbility`. Como o designer inevitavelmente precisa criar o Blueprint de Habilidade para programar seus efeitos visuais, lógica de execução e animações no Event Graph, centralizar os parâmetros nela previne a proliferação excessiva de Data Assets adicionais por habilidade (workflow semelhante ao Gameplay Ability System - GAS nativo da Unreal).

* Vincule o `AbilitySet` criado no `USBPawnDataAsset` do personagem.

### 2.8 Persistência (Save Game System)
O subsistema de persistência serializa de forma automática os dados de componentes que assinam a interface `ISBSaveInterface`.
1. **Configuração dos Componentes**:
   * O `USBAttributeComponent` e o `USBInventoryComponent` já vêm pré-configurados com suporte à serialização automática dos dados marcados com `SaveGame` em C++ (valores base de atributos e slots de itens/itens equipados).
2. **Gatilho de Teste (Playtest Trigger)**:
   * No `PlayerController` ou no Event Graph do seu Personagem (`BP_SBCharacter_Hero`), configure atalhos de teclado (ex: tecla **F5** para Salvar e tecla **F9** para Carregar):
     * **F5 (Salvar)**: Obtenha o subsistema concreto de save (`GetGameInstance` → `GetSubsystem<SBSaveSubsystemConcrete>`) e chame `SaveGame("SlotPlaytest", 0)`.
     * **F9 (Carregar)**: Obtenha o subsistema e chame `LoadGame("SlotPlaytest", 0)`.

---

## 3. Roteamento de Inputs

Configure o **Input Mapping Context** (Enhanced Input) associando teclas a ações que disparam os métodos correspondentes no personagem:

| Tecla / Ação | Ação Esperada no Componente |
| :--- | :--- |
| **Sprint** (Hold) | `Input.Action.Sprint` → Vinculado no `USBMovementComponent` para chamar `RequestBehavior(Movement.Sprint)`. |
| **Crouch** (Toggle/Hold) | `Input.Action.Crouch` → Vinculado no `USBMovementComponent` para chamar `RequestBehavior(Movement.Crouch)`. |
| **Fire** (Press/Hold) | `Input.Action.Fire` → Vinculado no `USBCombatComponent` para chamar `RequestWeaponBehavior(...)`. |
| **Interact** (Hold/Press) | `Input.Action.Interact` → Vinculado no `USBInteractionComponent` para chamar `ServerStartInteract(Target)`. |
| **Habilidades** (Press) | Teclas de habilidades mapeadas no IMC para ações como `Input.Action.Ability1`. O binding é realizado automaticamente de forma genérica via `USBAbilityComponent::BindInputActions` mapeando os disparos em `SetupPlayerInputComponent`. |

### 💡 Dica Prática: Como Encontrar as Funções dos Componentes no Blueprint Editor
Para desenvolvedores e designers que criam a lógica visual no Blueprint do Personagem (`BP_SBCharacter_Hero`):
1. No **Event Graph**, localize e selecione a variável de um dos componentes do framework (ex: `SBCombatComponent`, `SBAbilityComponent` ou `SBMovementComponent`) na lista de variáveis do componente.
2. Arraste e solte o pino dele no Event Graph para criar um nó de **Get**.
3. Puxe um fio azul a partir do pino do componente e solte-o no espaço vazio para abrir o menu de busca de ações.
4. **IMPORTANTE**: No canto superior direito da janela de pesquisa, **desmarque a caixa "Context Sensitive"** (ou limpe totalmente qualquer filtro de busca anterior).
5. Como os componentes herdam de estruturas C++ customizadas do framework, desmarcar essa caixa garante que a Unreal Engine liste 100% das funções herdadas e métodos C++ nativos expostos à reflexão.
6. Digite palavras-chave como `Fire`, `Attack`, `Interact`, `Cooldown` ou `Activate` para encontrar funções nativas expostas como `ActivateAbilityByTag`, `EndAbilityByTag`, `RequestBehavior` ou `GetInteractionPrompt`.

---

## 4. Roteiro de Playtest — Single Player (PIE simples)

*Objetivo: validar a correta configuração dos assets antes de testar a sincronização em rede.*

1. **Play** (▶) no nível de teste.
2. **Aperte Sprint** → Confirme que a velocidade de movimentação aumenta, a câmera afasta (FOV de SprintMode assume) e a animação de corrida é ativada via Anim Layer.
3. **Aperte Crouch** → Confirme que a cápsula encolhe (`Character->Crouch()` nativo) e a pose do personagem muda.
4. **Aperte Sprint enquanto agachado** → Crouch deve ser ejetado e Sprint assume (conflito de `ExclusivityGroup`).
5. **Aperte Crouch enquanto corre** → Nada deve acontecer (ação bloqueada por `BlockedTags` do Crouch), mantendo a corrida.
6. **Aproxime-se de um objeto interativo** → Confirme que o prompt de interação é enviado. Se você configurou um Widget Blueprint herdeiro de `USBUserWidget` no HUD (`MainHUDWidgetClass`), o prompt de interação será renderizado na tela pelo HUD de UI Dinâmica (`09_SandboxUI`). Caso contrário, valide via Gameplay Debugger (`10_SandboxDebug`) ou logs.
7. **Segure Interact** em um objeto com duração (ex: baú) → Se a UI visual estiver configurada no editor, confirme que a barra de progresso avança visualmente no HUD de progresso e conclui a interação ao preencher. Soltar a tecla antes de preencher deve fazer a barra desaparecer síncronamente. Caso contrário, valide via Gameplay Debugger.
8. **Dispare a arma** (se equipada) → A contagem de munição deve decrescer, atualizando o HUD correspondente caso esteja montado e vinculado no editor. O dano é aplicado ao alvo via Hitscan.
9. **Ative a Habilidade** (ex: tecla configurada para `Input.Action.Ability1`) → O valor de mana do personagem deve decrementar e a habilidade entra na pilha. Se os widgets visuais estiverem montados, o HUD exibirá a máscara e o tempo de cooldown decrescente. Caso contrário, verifique via Gameplay Debugger.
10. **Persistência de Dados**:
    * Consuma um pouco de Mana (ativando habilidades) ou perca Vida.
    * Colete alguns itens para o seu inventário.
    * **Aperte F5** (Salvar) → Confirme nos logs do output do editor (`LogSandboxCore`) a gravação dos dados dos componentes:
      `USBSaveSubsystemConcrete::SaveGame: Saving component ...`
    * Saia do Play (Esc), inicie o Play novamente (reiniciando o nível com os valores padrões).
    * **Aperte F9** (Carregar) → Confirme nos logs o carregamento dos componentes na ordem correta de prioridades. Os atributos e o inventário devem retornar exatamente ao estado em que foram salvos.

---

## 5. Roteiro de Playtest — Multiplayer (Sincronização em Rede)

### 5.1 Configuração do PIE
No dropdown ao lado do botão Play:
* **Number of Players**: 2
* **Net Mode**: *Play As Listen Server*
* **Simulação de Latência** (Altamente recomendado): No console de um dos clientes (tecla `~`), digite:
  ```
  net PktLag=100
  net PktLagVariance=30
  ```

> [!TIP]  
> Sem latência artificial simulada, condições de corrida causadas por tempo de ida e volta (RTT) de rede não se manifestarão localmente.

### 5.2 Cenários de Validação de Rede
* **Cenário 1: Rejeição e Rollback de Stamina/Sprint**  
  Tente correr (Sprint) com o Cliente 2 sem ter stamina suficiente. O cliente deve prever localmente a ativação da tag, mas o servidor deve rejeitá-la, forçando o cliente a reverter a velocidade e a tag local (confirmando que o `USBMovementModifierAggregator` não ficou com modificadores órfãos).
* **Cenário 2: Rollback de Tiro sem Munição**  
  Tente disparar a arma no Cliente 2 com latência e sem munição suficiente. O cliente prevê o tiro, mas o `ClientRollbackFire` deve reverter a munição local e cancelar a animação iniciada.
* **Cenário 3: Disputa de Interação**  
  Coloque os dois clientes lado a lado e tente interagir com o mesmo baú no mesmo frame. Confirme que o servidor atribui o lock a apenas um jogador; o outro jogador deve receber `ClientCancelInteraction` imediatamente.
* **Cenário 4: Replicação de Subobjetos de Inventário**  
  Faça o Cliente 2 equipar uma arma do seu inventário. Verifique se o subobjeto `USBItemInstance` replica corretamente para o Cliente 1 (que deve visualizar o modelo da arma anexado nas mãos do Cliente 2).
* **Cenário 5: Ejeção Simétrica de Arma**  
  Faça o Cliente 2 desequipar a arma. Verifique se o `USBWeaponBehavior` é ejetado simetricamente no servidor e nos clientes, sem resíduos na pilha de combate ou na velocidade de movimentação.
* **Cenário 6: Consumo Preditivo e Rollback de Habilidade**  
  Com latência ativada, aperte o botão de habilidade no Cliente 2. O custo de Mana deve ser decrementado localmente de forma jitter-free. Caso o servidor recuse o uso da habilidade (por tags de bloqueio ou manipulação/cheat), o mana deve ser restaurado instantaneamente e de forma limpa pelo `ClientRollbackPrediction`.
* **Cenário 7: Persistência Autoritativa sob Carregamento**:  
  O salvamento e carregamento devem ser executados unicamente pelo Servidor (`ROLE_Authority`). Ao carregar a sessão no servidor (apertando F9), verifique se as alterações de atributos e a reconstrução física das instâncias de itens do inventário replicam instantaneamente para todos os clientes conectados.

### 5.3 Ferramentas Úteis de Diagnóstico
* `stat unit` / `stat game`: Monitora ticks de CPU e frames para confirmar se o cache de dirty-flags (Anim Layers/Câmera) está de fato reduzindo computação redundante.
* `ModularGameplay.DumpGameFrameworkComponentManagers`: Lista quais componentes estão atualmente registrados em cada personagem Pawn via ComponentSet.
* Logs de Autoridade: Filtre por logs de autoridade para inspecionar os logs emitidos no servidor (`ServerRequestBehavior`, `ServerCompleteInteract`) e certifique-se de que a ordem de processamento das RPCs reflete a simulação estipulada.

---

## 6. Checklist de Aceite por Domínio

- [ ] **Movimento**: Sprint e Crouch são mutuamente exclusivos, respeitam `BlockedTags` e limpam modificadores no Aggregator sem deixar atributos órfãos.
- [ ] **Animação**: As Anim Layers e animações de pose trocam dinamicamente sem travamento ou atraso perceptível.
- [ ] **Câmeras**: As transições de FOV e distância do braço da câmera (`ArmLength`) ocorrem de forma fluida.
- [ ] **Combate**: Disparos sem munição sofrem rollback imediato, e o dano é processado e validado unicamente no Servidor.
- [ ] **Interação**: Lock autoritativo do Servidor resolve colisões de disputa por recursos perfeitamente.
- [ ] **Inventário**: Equipar/desequipar instancia a arma, associa os behaviors corretos via interface e limpa o estado sem deixar resíduos na pilha.
- [ ] **Habilidades**: Validação preditiva de mana e cooldowns ocorrem no frame do cliente, com rollbacks precisos e replicados.
- [ ] **Persistência**: Carregar a sessão recupera com precisão o estado de atributos e slots do inventário respeitando a prioridade de carregamento.

---

## 7. Limitações Conhecidas (Dívida Técnica / Backlog)

1. **Sem Compensação de Lag no Hitscan**: A detecção de tiro do Hitscan é realizada usando o frame do servidor (sem histórico de colisão retroativo).
2. **RPC Rate-Limiting Simplificado**: A validação das RPCs (`_Validate`) é um stub básico; as validações ocorrem em tempo de execução nos métodos `CanEnter()`.
3. **Sem Motion Warping ou IK Completo**: Animações básicas de locomoção sem integração avançada de Hand/Foot IK e Motion Warping.
4. **Sem Restauração de Equipamento**: O estado do item equipado (anexado à malha do personagem) não é restaurado visualmente ao recarregar a sessão (apenas o inventário lógico e a struct de dados do slot são salvos).
5. **Perda de PredictionId em Habilidades Cascateadas via Deferral**: Habilidades que sejam ativadas de forma reentrante/cascateada e enfileiradas pelo `FSBStackMutationGuard` em `DeferredEntries` perdem o `PredictionId` do cliente no servidor, pois a resolução das mutações diferidas (`ResolveDeferredMutations`) ocorre após a reentrância retornar e limpar a variável transiente `CurrentServerPredictionId`.
6. **09_SandboxUI Logic Complete**: O plugin `09_SandboxUI` agora possui a lógica dinâmica de HUD e camadas de widgets, gerenciando assinaturas assíncronas automáticas e filtros contra vazamento de escopo. A exibição e renderização física de HUDs (atributos, inventário, cooldowns e interações) devem ser configuradas no UMG Designer herdando diretamente das respectivas backing classes C++: `USBStatusHUDWidget`, `USBInteractionPromptWidget`, `USBAbilityBarWidget` e `USBInventoryGridWidget`.

---

## 8. Guia Recomendado de Integração e Teste Inicial

Para testar o framework de forma incremental sem introduzir múltiplos pontos de falha:
1. Comece configurando apenas as dependências básicas (**PawnData** e **ComponentSet** apenas com Movimento).
2. Execute o PIE em Single-Player para validar a exclusão mútua de Sprint e Crouch.
3. Adicione a Câmera e as Anim Layers correspondentes, testando as transições visuais.
4. Execute em rede com 2 jogadores locais sem latência.
5. Introduza latência simulada (`net PktLag=100`) para auditar as correções de rollback.
6. Habilite e integre Combate, Interação, Inventário, Habilidades e o Sistema de Persistência de forma sequencial, rodando os testes de integração específicos de cada etapa.

---

## 9. Integração com o GameAnimationSample

O Sandbox Framework também está disponível integrado de forma híbrida no projeto **GameAnimationSample** (`D:\Unreal\GameAnimationSample`). 
*   **Target no Editor**: `GameAnimationSampleEditor` (Win64 Development).
*   **Compilação**: Para compilar o editor do projeto de animações integrado com o Sandbox, execute:
    ```powershell
    dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" GameAnimationSampleEditor Win64 Development "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -waitmutex
    ```
*   **Suíte de Testes**: Para rodar os testes de conformidade do Sandbox integrados no GameAnimationSample:
    ```powershell
    & "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -NullRHI -NoSound -NoSplash -stdout -ExecCmds="Automation RunTest Sandbox; Quit" -log
    ```
*   **Sincronização Remota**: O código e os arquivos de regras de build deste projeto estão hospedados sob controle de versão no GitHub: [GameAnimationSampleSandbox-Framework](https://github.com/JoaoSantosCodes/GameAnimationSampleSandbox-Framework).

