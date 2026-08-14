/*
  DESIGN: "Blueprint Técnico" — índice de seções internas para a busca global (⌘K).
  Cada página longa expõe seções com id estável; este arquivo centraliza
  {page, hash, title, keywords} para que a paleta global navegue direto
  à seção por âncora (SearchPalette.goTo já suporta hash).
  MANTENHA: qualquer seção nova em Manual/SFPS/Guide/F17/F18/F19/Router deve
  ser registrada aqui com keywords em português e código-fonte.
  Nota de auditoria: os títulos abaixo são os títulos reais extraídos das
  páginas — nunca usar descrição em prosa no lugar do rótulo verdadeiro.
*/

export interface SectionIndexEntry {
  id: string;
  title: string;
  subtitle: string;
  page: string;
  hash: string;
  keywords: string;
  group: "manual" | "sfps" | "sfdg" | "fases" | "router";
}

export const MANUAL_SECTIONS: SectionIndexEntry[] = [
  { id: "s-pre", title: "Pré-requisitos de ambiente", subtitle: "Manual § Pré-requisitos", page: "/manual", hash: "pre", keywords: "manual pré-requisitos ambiente engine", group: "manual" },
  { id: "s-data", title: "Data Assets — obrigatório antes de qualquer teste", subtitle: "Manual § Data Assets", page: "/manual", hash: "data", keywords: "manual data assets obrigatório teste", group: "manual" },
  { id: "s-input", title: "Roteamento de inputs (Enhanced Input)", subtitle: "Manual § Input", page: "/manual", hash: "input", keywords: "manual input enhanced input mapping", group: "manual" },
  { id: "s-single", title: "Roteiro de playtest — Single Player (PIE simples)", subtitle: "Manual § Single", page: "/manual", hash: "single", keywords: "manual playtest single player pie", group: "manual" },
  { id: "s-multi", title: "Roteiro de playtest — Multiplayer", subtitle: "Manual § Multi", page: "/manual", hash: "multi", keywords: "manual playtest multiplayer dedicated", group: "manual" },
  { id: "s-gdt", title: "Gameplay Debugger (SandboxDebug) — v1.7.0", subtitle: "Manual § GDT", page: "/manual", hash: "gdt", keywords: "manual gameplay debugger sandboxdebug crosshair", group: "manual" },
  { id: "s-integracao", title: "Guia de integração incremental", subtitle: "Manual § Integração", page: "/manual", hash: "integracao", keywords: "manual integração incremental fases", group: "manual" },
  { id: "s-limitacoes", title: "Limitações conhecidas", subtitle: "Manual § Limitações", page: "/manual", hash: "limitacoes", keywords: "manual limitações conhecidas bugs", group: "manual" },
  { id: "s-checklist", title: "Checklist de aceite por domínio", subtitle: "Manual § Checklist", page: "/manual", hash: "checklist", keywords: "manual checklist aceite domínio", group: "manual" },
];

export const SFPS_SECTIONS: SectionIndexEntry[] = [
  { id: "s-sfps-01", title: "SFPS 01 · Topologia Final de Plugins", subtitle: "Especificação § 01", page: "/especificacao", hash: "sfps-01", keywords: "topologia plugins foundation gameplay presentation", group: "sfps" },
  { id: "s-sfps-02", title: "SFPS 02 · Regra de Dependência Unidirecional", subtitle: "Especificação § 02", page: "/especificacao", hash: "sfps-02", keywords: "dependência unidirecional regra circular", group: "sfps" },
  { id: "s-sfps-03", title: "SFPS 03 · Metadados de Compatibilidade (.uplugin)", subtitle: "Especificação § 03", page: "/especificacao", hash: "sfps-03", keywords: "uplugin metadados compatibilidade disabled", group: "sfps" },
  { id: "s-sfps-04", title: "SFPS 04 · Estrutura de Contexto Unificada (FSBBehaviorContext)", subtitle: "Especificação § 04", page: "/especificacao", hash: "sfps-04", keywords: "behavior context unificado framework", group: "sfps" },
  { id: "s-sfps-05", title: "SFPS 05 · Divisão de Estados de Behaviors", subtitle: "Especificação § 05", page: "/especificacao", hash: "sfps-05", keywords: "divisão estados behaviors stack", group: "sfps" },
  { id: "s-sfps-06", title: "SFPS 06 · Priorização e Políticas do Modificador", subtitle: "Especificação § 06", page: "/especificacao", hash: "sfps-06", keywords: "priorização políticas modificador", group: "sfps" },
  { id: "s-sfps-07", title: "SFPS 07 · Gameplay Message Router (USBEventSubsystem)", subtitle: "Especificação § 07", page: "/especificacao", hash: "sfps-07", keywords: "message router event subsystem broadcast", group: "sfps" },
  { id: "s-sfps-08", title: "SFPS 08 · Matriz de Interfaces de Fundação (02_SandboxInterfaces)", subtitle: "Especificação § 08", page: "/especificacao", hash: "sfps-08", keywords: "interfaces fundação foundation isb", group: "sfps" },
];

export const SFDG_SECTIONS: SectionIndexEntry[] = [
  { id: "s-sfdg-01", title: "SFDG 01 · Comportamento de Movimentação (05_SandboxCharacter)", subtitle: "Guia C++ § 01", page: "/guia-cpp", hash: "sfdg-01", keywords: "guia character movimento câmera animação", group: "sfdg" },
  { id: "s-sfdg-02", title: "SFDG 02 · Utilizando o Message Router (USBEventSubsystem)", subtitle: "Guia C++ § 02", page: "/guia-cpp", hash: "sfdg-02", keywords: "guia message router subsystem publish", group: "sfdg" },
  { id: "s-sfdg-03", title: "SFDG 03 · Ciclo de Vida, Ticks e Ordem de Execução", subtitle: "Guia C++ § 03", page: "/guia-cpp", hash: "sfdg-03", keywords: "guia ciclo vida tick execução ordem", group: "sfdg" },
  { id: "s-sfdg-04", title: "SFDG 04 · Sincronização via ISBReplicable", subtitle: "Guia C++ § 04", page: "/guia-cpp", hash: "sfdg-04", keywords: "guia sincronização replicável isb", group: "sfdg" },
  { id: "s-sfdg-05", title: "SFDG 05 · Objetos Interativos Modulares (07_SandboxInteraction)", subtitle: "Guia C++ § 05", page: "/guia-cpp", hash: "sfdg-05", keywords: "guia interação interativo modular prompt", group: "sfdg" },
  { id: "s-sfdg-06", title: "SFDG 06 · Habilidades no Behavior Stack (Fase 16)", subtitle: "Guia C++ § 06", page: "/guia-cpp", hash: "sfdg-06", keywords: "guia habilidades behavior stack fase 16", group: "sfdg" },
  { id: "s-sfdg-07", title: "SFDG 07 · Integração ao Save Game System (Fase 15)", subtitle: "Guia C++ § 07", page: "/guia-cpp", hash: "sfdg-07", keywords: "guia save game sistema persistência", group: "sfdg" },
  { id: "s-sfdg-08", title: "SFDG 08 · Precedentes Homologados — DD-01 ··· DD-08 (v1.8.0)", subtitle: "Guia C++ § 08", page: "/guia-cpp", hash: "sfdg-08", keywords: "guia precedentes homologados decisões dd", group: "sfdg" },
];

export const FASE_SECTIONS: SectionIndexEntry[] = [
  { id: "s-f17-plugin", title: "F17 · Isolação absoluta: editor-only, zero custo em Shipping", subtitle: "Fase 17 § Plugin", page: "/fase-17", hash: "plugin", keywords: "fase 17 plugin isolation editor-only shipping", group: "fases" },
  { id: "s-f17-interface", title: "F17 · ISBDebugInterface + FSBDebugLine", subtitle: "Fase 17 § Interface", page: "/fase-17", hash: "interface", keywords: "fase 17 debug interface linha isbdebug", group: "fases" },
  { id: "s-f17-coletor", title: "F17 · O coletor de debug (FGGameplayDebuggerCategory · Sandbox)", subtitle: "Fase 17 § Coletor", page: "/fase-17", hash: "coletor", keywords: "fase 17 coletor gameplaydebugger category sandbox", group: "fases" },
  { id: "s-f17-telemetria", title: "F17 · O que cada componente expõe (telemetria)", subtitle: "Fase 17 § Telemetria", page: "/fase-17", hash: "telemetria", keywords: "fase 17 componente expõe telemetria", group: "fases" },
  { id: "s-f17-gate", title: "F17 · #ifWITH_GAMEPLAY_DEBUGGER — zero custo em Shipping", subtitle: "Fase 17 § Gate", page: "/fase-17", hash: "gate", keywords: "fase 17 gate with gameplay debugger shipping", group: "fases" },
  { id: "s-f18-regra", title: "F18 · Regra de ouro: UI nunca consulta componentes de gameplay", subtitle: "Fase 18 § Regra", page: "/fase-18", hash: "regra", keywords: "fase 18 regra ouro ui consulta", group: "fases" },
  { id: "s-f18-topo", title: "F18 · Topologia de arquitetura e desacoplamento", subtitle: "Fase 18 § Topologia", page: "/fase-18", hash: "topologia", keywords: "fase 18 topologia desacoplamento usbui", group: "fases" },
  { id: "s-f18-widget", title: "F18 · USBUIBase: widget base reativo", subtitle: "Fase 18 § Widget", page: "/fase-18", hash: "base", keywords: "fase 18 usbuibase widget subscribe reativo", group: "fases" },
  { id: "s-f18-hierarquia", title: "F18 · Hierarquia de widgets por domínio", subtitle: "Fase 18 § Hierarquia", page: "/fase-18", hash: "widgets", keywords: "fase 18 hierarquia widgets domínio game modal", group: "fases" },
  { id: "s-f18-payloads", title: "F18 · Payloads de eventos e extensão permitida dos produtores", subtitle: "Fase 18 § Payloads", page: "/fase-18", hash: "eventos", keywords: "fase 18 payloads eventos produtores", group: "fases" },
  { id: "s-f18-padrao", title: "F18 · Padrão de consumo: exemplo canônico do prompt", subtitle: "Fase 18 § Padrão", page: "/fase-18", hash: "padrao", keywords: "fase 18 padrão consumo canônico prompt", group: "fases" },
  { id: "s-f18-verificacao", title: "F18 · Plano de verificação — espelha o Fase 17: mais forte", subtitle: "Fase 18 § Verificação", page: "/fase-18", hash: "verificacao", keywords: "fase 18 verificação isolamento testes", group: "fases" },
  { id: "s-f18-aceite", title: "F18 · Critérios de aceite da Fase 18", subtitle: "Fase 18 § Aceite", page: "/fase-18", hash: "aceite", keywords: "fase 18 critérios aceite homologação", group: "fases" },
  { id: "s-f19-dd08", title: "F19 · Por que adiar — e o que isso garante (DD-08)", subtitle: "Fase 19 § Adiar", page: "/fase-19", hash: "DD-08", keywords: "fase 19 adiar dd-08 planejamento", group: "fases" },
  { id: "s-f19-pre", title: "F19 · Pré-requisitos homologados", subtitle: "Fase 19 § Pré-requisitos", page: "/fase-19", hash: "pre-requisitos", keywords: "fase 19 pré-requisitos homologados precedentes", group: "fases" },
  { id: "s-f19-escopo", title: "F19 · Escopo proposto (não homologado)", subtitle: "Fase 19 § Escopo", page: "/fase-19", hash: "escopo", keywords: "fase 19 escopo damage indicator proposto", group: "fases" },
  { id: "s-f19-aceite", title: "F19 · Critérios de aceite preliminares", subtitle: "Fase 19 § Aceite", page: "/fase-19", hash: "aceite", keywords: "fase 19 critérios aceite preliminares", group: "fases" },
];

export const ROUTER_SECTIONS: SectionIndexEntry[] = [
  { id: "s-router-modos", title: "Modos de publicação", subtitle: "Message Router § Modos", page: "/message-router", hash: "modos", keywords: "router broadcast publishstate fire forget", group: "router" },
  { id: "s-router-tabela", title: "Tabela canônica — eventos Event.*", subtitle: "Message Router § Tabela", page: "/message-router", hash: "tabela", keywords: "router tabela canônica eventos prioridade", group: "router" },
  { id: "s-router-prioridades", title: "Prioridades de assinatura", subtitle: "Message Router § Prioridades", page: "/message-router", hash: "prioridades", keywords: "router prioridades high medium low lowest", group: "router" },
  { id: "s-router-invariantes", title: "Invariantes de consumo", subtitle: "Message Router § Invariantes", page: "/message-router", hash: "invariantes", keywords: "router invariantes consumo payload escopo", group: "router" },
  { id: "s-router-fase18", title: "Contrato da Fase 18", subtitle: "Message Router § F18", page: "/message-router", hash: "fase-18", keywords: "router contrato fase 18 ui widgets", group: "router" },
];

export const ALL_SECTIONS: SectionIndexEntry[] = [
  ...MANUAL_SECTIONS,
  ...SFPS_SECTIONS,
  ...SFDG_SECTIONS,
  ...FASE_SECTIONS,
  ...ROUTER_SECTIONS,
];
