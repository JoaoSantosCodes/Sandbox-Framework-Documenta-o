# 🎮 Sandbox Framework - Painel de Controle (Dashboard)

Bem-vindo ao painel central do **Sandbox Framework** no seu Obsidian. Este espaço centraliza o planejamento, padrões de arquitetura, manuais de uso e histórico de desenvolvimento dos projetos localizados em `D:\Unreal\V1` e integrado no projeto de animações em `D:\Unreal\GameAnimationSample`.

---

## 🚀 Status do Projeto

- **Projeto Primário**: `D:\Unreal\V1` (Sandbox Framework C++ standalone)
- **Integração Híbrida**: `D:\Unreal\GameAnimationSample` (Game Animation Sample com Sandbox C++)
- **Repositório GitHub**: [GameAnimationSampleSandbox-Framework](https://github.com/JoaoSantosCodes/GameAnimationSampleSandbox-Framework)
- **Fase Atual**: `Fase 18 Concluída` — **Interface Dinâmica (09_SandboxUI)** & **Integração Visual no GameAnimationSample**
- **Suíte de Testes**: **100% Verde (32/32 Specs Passando em ambos os projetos)**
- **Versão de Lançamento**: `v1.8.1` (11 plugins criados com lógica C++ completa, integrados e compilados no GameAnimationSample com testes unitários em status verde)

---

## 🗺️ Navegação Rápida (Documentos e Notas)

Use os links abaixo para navegar pelas notas e especificações de design do framework diretamente no Obsidian:

*   📋 **CHECKLIST & TAREFAS**: [[task|Checklist de Atividades e Fases]]
*   🚀 **HISTÓRICO DE ENTREGAS**: [[walkthrough|Walkthrough de Refatorações e Recursos]]
*   📜 **DIRETRIZES DE ARQUITETURA**: [[manifesto_and_coding_standards|Manifesto & Padrões de Código C++]]
*   📐 **ESPECIFICAÇÕES TÉCNICAS**: [[sfps_specification|Especificação Estrutural (SFPS v1.0.0)]]
*   📘 **MANUAL DO DESENVOLVEDOR**: [[sfdg_guide|Guia de Desenvolvimento (SFDG v1.0.0)]]
*   📘 **MANUAL DE USO DO PRODUTO**: [[manual_de_uso|Manual de Utilização do Framework]]

---

## 🗂️ Estrutura Física de Diretórios (`D:\Unreal\V1`)

Os plugins físicos e suas dependências unidirecionais estão estruturados da seguinte forma:

```mermaid
graph TD
    classDef interfaces fill:#3f51b5,stroke:#fff,stroke-width:2px,color:#fff;
    classDef core fill:#009688,stroke:#fff,stroke-width:2px,color:#fff;
    classDef gameplay fill:#ff9800,stroke:#fff,stroke-width:2px,color:#fff;
    classDef presentation fill:#e91e63,stroke:#fff,stroke-width:2px,color:#fff;

    02[02_SandboxInterfaces]:::interfaces
    01[01_SandboxCommon]:::core
    03[03_SandboxAssets]:::core
    04[04_SandboxCore]:::core
    05[05_SandboxCharacter]:::gameplay
    06[06_SandboxCombat]:::gameplay
    07[07_SandboxInteraction]:::gameplay
    08[08_SandboxInventory]:::gameplay
    09[09_SandboxUI]:::presentation
    10[10_SandboxDebug]:::presentation

    01 --> 02
    03 --> 01
    04 --> 01
    04 --> 03
    05 --> 04
    06 --> 05
    07 --> 05
    08 --> 05
    09 --> 04
    10 --> 02
    10 --> 04
```

---

## 🛠️ Comandos de Terminal Recomendados

### Projeto Standalone (V1)
*   **Compilar Editor**:
    ```powershell
    dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" V1Editor Win64 Development "D:\Unreal\V1\V1.uproject" -waitmutex
    ```
*   **Rodar Testes**:
    ```powershell
    & "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Unreal\V1\V1.uproject" -NullRHI -NoSound -NoSplash -stdout -ExecCmds="Automation RunTest Sandbox; Quit" -log
    ```

### Projeto de Integração (GameAnimationSample)
*   **Compilar Editor**:
    ```powershell
    dotnet "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" GameAnimationSampleEditor Win64 Development "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -waitmutex
    ```
*   **Rodar Testes**:
    ```powershell
    & "C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Unreal\GameAnimationSample\GameAnimationSample.uproject" -NullRHI -NoSound -NoSplash -stdout -ExecCmds="Automation RunTest Sandbox; Quit" -log
    ```

