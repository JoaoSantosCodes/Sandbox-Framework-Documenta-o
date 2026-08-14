/* Fonte de verdade do documento oficial do Vault: pendencias_de_fases.md
   (criado em 14/08/2026 a partir da auditoria Vault ↔ site de documentação).
   O site apenas espelha o Vault — qualquer divergência resolve a favor do Vault.
   Regra de homologação (do próprio documento): uma fase sai desta lista só com
   (1) corpo real C++ compilado com UBT Exit 0, (2) suíte 100% verde no contexto,
   (3) isolamento simétrico (desabilitar o plugin e recompilar sem quebra),
   (4) carimbo consistente em Dashboard/task.md/walkthrough.md.
   Rascunhos, planos e propostas não contam como homologação. */

export interface PendingItem {
  id: string; // P-1.1, P-2.2, ...
  exige: string;
  estado: "Pendente" | "Parcial" | "Concluída";
}

export interface PhasePending {
  id: "P-1" | "P-2" | "P-3" | "P-4" | "P-5" | "P-6" | "P-7";
  titulo: string;
  categoria: "Proposta fora da régua" | "Backlog oficial do Vault" | "Documental";
  ordem: number; // posição de execução recomendada pelo Vault
  resumo: string;
  paginaRelacionada?: string; // rota do site, se houver
  itens: PendingItem[];
}

export const PHASE_PENDINGS: PhasePending[] = [
  {
    id: "P-1",
    titulo: "Indicador Direcional de Dano",
    categoria: "Proposta fora da régua",
    ordem: 0,
    resumo:
      "Proposta registrada no site como “Fase 19” (DD-11; DD-08 revogada), nunca homologada no C++ — sem contraparte no Vault. O planejamento está documentado no site, mas nenhum corpo compilado existe.",
    paginaRelacionada: "/fase-19",
    itens: [
      { id: "P-1.1", exige: "USBDamageEventPayload em 04_SandboxCore (nunca em 06 ou 09)", estado: "Pendente" },
      {
        id: "P-1.2",
        exige: "Broadcast autoritativo dentro de HasAuthority() no ponto de dano, sem tocar replicação",
        estado: "Pendente",
      },
      {
        id: "P-1.3",
        exige: "Anti-spill TargetPawn + deduplicação client-side via AttackId (mapa com TTL)",
        estado: "Pendente",
      },
      { id: "P-1.4", exige: "Widget com compass/seta direcional (1,5s)", estado: "Pendente" },
      {
        id: "P-1.5",
        exige: "SBUITests Cenários 7 e 8 + teste de isolamento simétrico — alvo 34/34",
        estado: "Pendente",
      },
    ],
  },
  {
    id: "P-2",
    titulo: "Persistência Transacional de Atributos",
    categoria: "Proposta fora da régua",
    ordem: 0,
    resumo:
      "Plano de design registrado no site como “Fase 20” (DD-19): persistência ancorada no PredictionId, com USBAttributePersistenceDefinition (opt-in por chave estável), FSBAttributePersistenceRuntimeData (last-confirmed + transações abertas) e log transacional com rollback simétrico. Existe apenas como corpo de referência no site — nenhum código compilado.",
    paginaRelacionada: "/fase-20",
    itens: [
      {
        id: "P-2.1",
        exige:
          "USBAttributePersistenceDefinition / Instance + FSBAttributePersistenceRuntimeData compilados no 04_SandboxCore com UBT Exit 0",
        estado: "Pendente",
      },
      {
        id: "P-2.2",
        exige: "Log transacional por PredictionId com rollback simétrico",
        estado: "Pendente",
      },
      { id: "P-2.3", exige: "Integração com USBSaveSubsystem via ISBSaveInterface", estado: "Pendente" },
      { id: "P-2.4", exige: "Suíte SBPersistenceTests 100% verde", estado: "Pendente" },
    ],
  },
  {
    id: "P-3",
    titulo: "Montagem Visual UMG",
    categoria: "Backlog oficial do Vault",
    ordem: 1,
    resumo:
      "CONCLUÍDA em 15/08/2026 (homologação relatada pelo usuário: checklist de playtest da Frente 1 executado sem erros no Listen Server e no Split-Screen — nota de origem; o carimbo documental no cofre — Dashboard/task.md/walkthrough.md — fecha a cadeia). Montagem dos Widget Blueprints herdando das backing classes C++ do 09_SandboxUI, slots de habilidades com WatchedAbilityTag e playtests de interface em Listen Server e Split-Screen local.",
    paginaRelacionada: "/fase-19-umg",
    itens: [
      {
        id: "P-3.1",
        exige: "Widget Blueprints sobre as backing classes C++ do 09_SandboxUI",
        estado: "Concluída",
      },
      { id: "P-3.2", exige: "Slots de habilidades com WatchedAbilityTag", estado: "Concluída" },
      {
        id: "P-3.3",
        exige: "Playtests de interface em Listen Server e Split-Screen local",
        estado: "Concluída",
      },
    ],
  },
  {
    id: "P-4",
    titulo: "Infraestrutura de Rede",
    categoria: "Backlog oficial do Vault",
    ordem: 2,
    resumo:
      "RPC Rate-Limiting e anti-cheat de validação de comandos no servidor, incluindo validação de distância de interação e posse do item no frame exato da RPC.",
    itens: [
      { id: "P-4.1", exige: "RPC Rate-Limiting de comandos de gameplay no servidor", estado: "Pendente" },
      {
        id: "P-4.2",
        exige: "Anti-cheat: validação de distância de interação e posse do item no frame exato da RPC",
        estado: "Pendente",
      },
    ],
  },
  {
    id: "P-5",
    titulo: "Polimento de Gameplay",
    categoria: "Backlog oficial do Vault",
    ordem: 3,
    resumo:
      "Sistema genérico de Status Effects (buff/debuff, DOT) e compensação de lag (rewind de rede para hitscan).",
    itens: [
      {
        id: "P-5.1",
        exige: "Status Effects genérico (buff/debuff, DOT) desacoplado via 02_SandboxInterfaces",
        estado: "Pendente",
      },
      { id: "P-5.2", exige: "Compensação de lag (rewind de rede para hitscan)", estado: "Pendente" },
    ],
  },
  {
    id: "P-6",
    titulo: "Restauração Visual de Equipamento",
    categoria: "Backlog oficial do Vault",
    ordem: 4,
    resumo:
      "Spawn de atores visuais nos sockets da malha e restauração visual do equipamento ao carregar Save Game.",
    itens: [
      { id: "P-6.1", exige: "Spawn de atores visuais nos sockets da malha", estado: "Pendente" },
      {
        id: "P-6.2",
        exige: "Restauração visual do equipamento ao carregar Save Game",
        estado: "Pendente",
      },
    ],
  },
  {
    id: "P-7",
    titulo: "Sincronização documental das specs normativas",
    categoria: "Documental",
    ordem: 5,
    resumo:
      "sfps_specification.md, sfdg_guide.md e manifesto_and_coding_standards.md seguem em v1.0.0 e não registram as decisões DD-09 a DD-19 homologadas no site. Requer revisão e carimbo de versão nova.",
    itens: [
      {
        id: "P-7.1",
        exige: "sfps_specification.md revisada com DD-09…DD-19 e carimbo de versão nova",
        estado: "Pendente",
      },
      {
        id: "P-7.2",
        exige: "sfdg_guide.md revisado com DD-09…DD-19 e carimbo de versão nova",
        estado: "Pendente",
      },
      {
        id: "P-7.3",
        exige: "manifesto_and_coding_standards.md revisado com DD-09…DD-19 e carimbo de versão nova",
        estado: "Pendente",
      },
    ],
  },
];

export const PENDING_ORDER_NOTE =
  "O Vault prioriza P-3 → P-4 → P-5 → P-6 (backlog oficial do status_atual_do_projeto.md). P-1 e P-2 são rascunhos fora da régua, retomáveis a qualquer momento — mas nenhuma nova fase entra na régua numerada sem corpo real de código homologado, e toda nova frente abre nota de pendência neste documento antes de ganhar número oficial.";

export function filterAndSortPendings(
  items: PhasePending[],
  filter: string, // "todas" | "backlog" | "proposta" | "documental"
  sort: "ordem" | "id" | "pendentes",
): PhasePending[] {
  const filtered =
    filter === "todas"
      ? items
      : items.filter((p) =>
          filter === "backlog"
            ? p.categoria === "Backlog oficial do Vault"
            : filter === "proposta"
              ? p.categoria === "Proposta fora da régua"
              : p.categoria === "Documental",
        );
  return [...filtered].sort((a, b) =>
    sort === "ordem"
      ? a.ordem - b.ordem
      : sort === "id"
        ? a.id.localeCompare(b.id)
        : pendingCount(b) - pendingCount(a),
  );
}

export function pendingCount(p: PhasePending): number {
  return p.itens.filter((i) => i.estado === "Pendente").length;
}
