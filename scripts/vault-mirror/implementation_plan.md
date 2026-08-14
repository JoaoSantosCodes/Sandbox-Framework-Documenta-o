# Replicar Estrutura de Projeto C++ no GameAnimationSample

Replicar a estrutura do Sandbox Framework C++ e habilitar os plugins de suporte no projeto `D:\Unreal\GameAnimationSample`, convertendo-o de um projeto puramente Blueprint para um projeto C++ funcional.

## Proposed Changes

### GameAnimationSample Project Configuration

#### [MODIFY] [GameAnimationSample.uproject](file:///D:/Unreal/GameAnimationSample/GameAnimationSample.uproject)
*   Adicionar a seção `"Modules"` definindo o módulo primário do jogo `GameAnimationSample`.
*   Habilitar os plugins necessários (`ModularGameplay`, `GameplayAbilities`, `CommonGame`, `CommonUser`, `UIExtension`, `GameplayMessageRouter` e os plugins `01_SandboxCommon` a `11_SandboxEditor`).

### Main Game Module C++ Boilerplate

#### [NEW] [GameAnimationSample.Target.cs](file:///D:/Unreal/GameAnimationSample/Source/GameAnimationSample.Target.cs)
*   Regras do Target para o build da aplicação standalone.

#### [NEW] [GameAnimationSampleEditor.Target.cs](file:///D:/Unreal/GameAnimationSample/Source/GameAnimationSampleEditor.Target.cs)
*   Regras do Target para o build no modo Unreal Editor.

#### [NEW] [GameAnimationSample.Build.cs](file:///D:/Unreal/GameAnimationSample/Source/GameAnimationSample/GameAnimationSample.Build.cs)
*   Arquivo de build do módulo primário do jogo com dependências básicas (`Core`, `CoreUObject`, `Engine`, `InputCore`, `EnhancedInput`).

#### [NEW] [GameAnimationSample.h](file:///D:/Unreal/GameAnimationSample/Source/GameAnimationSample/GameAnimationSample.h)
*   Cabeçalho principal do módulo de jogo.

#### [NEW] [GameAnimationSample.cpp](file:///D:/Unreal/GameAnimationSample/Source/GameAnimationSample/GameAnimationSample.cpp)
*   Implementação do módulo primário (`IMPLEMENT_PRIMARY_GAME_MODULE`).

---

## Verification Plan

### Automated Compilation Check
Compilar o projeto `GameAnimationSample` via Unreal Build Tool (UBT) na linha de comando:
```powershell
dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" GameAnimationSampleEditor Win64 Development "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -waitmutex
```

### Visual Studio Project Generation
Gerar os arquivos do Visual Studio (`.sln`) para o projeto migrado:
```powershell
dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" -projectfiles -project="D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -game -engine
```
