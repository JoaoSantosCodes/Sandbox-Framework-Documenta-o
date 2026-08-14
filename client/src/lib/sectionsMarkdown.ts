/*
  DESIGN: "Blueprint Técnico" — fontes de verdade para o atalho ⌘⇧C em páginas
  técnicas longas (Manual, SFPS). Cada rota expõe os ids das seções e seus
  títulos legíveis; o conteúdo Markdown é extraído do DOM da seção ativa
  (texto do elemento com id até a próxima seção), garantindo fidelidade ao que
  o usuário está lendo — sem duplicar conteúdo em string.
*/

export interface SectionCopySource {
  /** Rota (location) que ativa este mapa. */
  route: string;
  /** Nome legível da página, usado no cabeçalho do Markdown. */
  page: string;
  /** ids das seções, na ordem do documento. */
  ids: string[];
  /** Título legível por id. */
  labels: Record<string, string>;
}

const MANUAL_SECTIONS: SectionCopySource = {
  route: "/manual",
  page: "Manual de Uso",
  ids: ["pre", "data", "input", "single", "multi", "gdt", "checklist", "limitacoes", "integracao"],
  labels: {
    pre: "Pré-requisitos de ambiente",
    data: "Data Assets — obrigatório antes de qualquer teste",
    input: "Roteamento de inputs (Enhanced Input)",
    single: "Roteiro de playtest — Single Player (PIE simples)",
    multi: "Roteiro de playtest — Multiplayer",
    gdt: "Gameplay Debugger (SandboxDebug) — v1.7.0",
    checklist: "Checklist de aceite por domínio",
    limitacoes: "Limitações conhecidas",
    integracao: "Guia de integração incremental",
  },
};

const SPEC_SECTIONS: SectionCopySource = {
  route: "/especificacao",
  page: "Especificação SFPS",
  ids: ["sfps-01", "sfps-02", "sfps-03", "sfps-04", "sfps-05", "sfps-06", "sfps-07", "sfps-08"],
  labels: {
    "sfps-01": "01 · Topologia Final de Plugins",
    "sfps-02": "02 · Regra de Dependência Unidirecional",
    "sfps-03": "03 · Metadados de Compatibilidade (.uplugin)",
    "sfps-04": "04 · Estrutura de Contexto Unificada (FSBBehaviorContext)",
    "sfps-05": "05 · Divisão de Estados de Behaviors",
    "sfps-06": "06 · Priorização e Políticas do Modificador",
    "sfps-07": "07 · Gameplay Message Router (USBEventSubsystem)",
    "sfps-08": "08 · Matriz de Interfaces de Fundação (02_SandboxInterfaces)",
  },
};

const GUIDE_SECTIONS: SectionCopySource = {
  route: "/guia-cpp",
  page: "Guia de Desenvolvimento C++",
  ids: ["sfdg-01", "sfdg-02", "sfdg-03", "sfdg-04", "sfdg-05", "sfdg-06", "sfdg-07", "sfdg-08"],
  labels: {
    "sfdg-01": "01 · Comportamento de Movimentação (05_SandboxCharacter)",
    "sfdg-02": "02 · Utilizando o Message Router (USBEventSubsystem)",
    "sfdg-03": "03 · Ciclo de Vida, Ticks e Ordem de Execução",
    "sfdg-04": "04 · Sincronização via ISBReplicable",
    "sfdg-05": "05 · Objetos Interativos Modulares (07_SandboxInteraction)",
    "sfdg-06": "06 · Habilidades no Behavior Stack (Fase 16)",
    "sfdg-07": "07 · Integração ao Save Game System (Fase 15)",
    "sfdg-08": "08 · Precedentes Homologados — DD-01 ··· DD-08 (v1.8.0)",
  },
};

const ROUTER_SECTIONS: SectionCopySource = {
  route: "/message-router",
  page: "Message Router",
  ids: ["modos", "tabela", "prioridades", "invariantes", "fase-18"],
  labels: {
    modos: "Modos de publicação",
    tabela: "Tabela canônica — eventos Event.*",
    prioridades: "Prioridades de assinatura",
    invariantes: "Invariantes de consumo",
    "fase-18": "Contrato da Fase 18",
  },
};

const ROADMAP_SECTIONS: SectionCopySource = {
  route: "/roadmap",
  page: "Linha do Tempo & Roadmap",
  ids: ["visao-geral", "linha-do-tempo", "marcos", "em-curso", "roadmap", "riscos"],
  labels: {
    "visao-geral": "Visão geral",
    "linha-do-tempo": "Linha do tempo",
    marcos: "Marcos homologados",
    "em-curso": "Em curso",
    roadmap: "Roadmap",
    riscos: "Riscos & mitigação",
  },
};

const PENDENCIAS_SECTIONS: SectionCopySource = {
  route: "/pendencias",
  page: "Pendências de Fases (pendencias_de_fases.md)",
  ids: [
    "pendencias-regra",
    "pendencias-p-1",
    "pendencias-p-2",
    "pendencias-p-3",
    "pendencias-p-4",
    "pendencias-p-5",
    "pendencias-p-6",
    "pendencias-p-7",
  ],
  labels: {
    "pendencias-regra": "Regra de homologação",
    "pendencias-p-1": "P-1 · Indicador Direcional de Dano",
    "pendencias-p-2": "P-2 · Persistência Transacional de Atributos",
    "pendencias-p-3": "P-3 · Montagem Visual UMG",
    "pendencias-p-4": "P-4 · Infraestrutura de Rede",
    "pendencias-p-5": "P-5 · Polimento de Gameplay",
    "pendencias-p-6": "P-6 · Restauração Visual de Equipamento",
    "pendencias-p-7": "P-7 · Sincronização documental",
  },
};

export const SECTION_COPY_SOURCES: SectionCopySource[] = [
  MANUAL_SECTIONS,
  SPEC_SECTIONS,
  GUIDE_SECTIONS,
  ROUTER_SECTIONS,
  ROADMAP_SECTIONS,
  PENDENCIAS_SECTIONS,
];

/** Seleciona a fonte de cópia da rota atual, se houver. */
export function sourceForRoute(route: string): SectionCopySource | null {
  return SECTION_COPY_SOURCES.find((s) => s.route === route) ?? null;
}

/**
 * Extrai o conteúdo Markdown da seção ativa de uma página técnica:
 * vai do elemento com o id ativo até o início da próxima seção conhecida.
 * Blocos de código <pre> são preservados; demais HTML vira texto limpo.
 * Retorna null se a seção não for encontrável no DOM.
 */
export function extractSectionMarkdown(source: SectionCopySource, activeId: string): string | null {
  const anchor = document.getElementById(activeId);
  if (!anchor) return null;
  const label = source.labels[activeId] ?? activeId;
  // Próximo elemento de seção conhecida (irmão subsequente com id de seção).
  let nextBoundary: Element | null = null;
  let cursor: Element | null = anchor.parentElement;
  while (cursor) {
    const sibling = cursor.nextElementSibling;
    if (sibling) {
      if (sibling.id && source.ids.includes(sibling.id)) {
        nextBoundary = sibling;
        break;
      }
      // Caso o id viva em um neto, procurar dentro do irmão.
      const inner = sibling.querySelector("[id]");
      if (inner && inner.id && source.ids.includes(inner.id)) {
        nextBoundary = sibling;
        break;
      }
    }
    cursor = cursor.parentElement;
    if (cursor && cursor.id && source.ids.includes(cursor.id) && cursor.id !== activeId) {
      nextBoundary = cursor;
      break;
    }
  }
  // Coletar texto do anchor (incluindo irmãos até o limite).
  const textParts: string[] = [];
  let node: Element | null = anchor;
  const stop = (el: Element) => el === nextBoundary;
  const visit = (el: Element) => {
    if (stop(el)) return;
    if (el.tagName === "PRE" || el.tagName === "CODE" && el.closest("pre")) return;
    if (el.tagName === "PRE") {
      textParts.push(el.textContent?.trim() ?? "");
      return;
    }
    for (const child of Array.from(el.children)) visit(child);
  };
  visit(anchor);
  let content = textParts.join("\n").trim();
  // Se o anchor for só título (h2), coletar também os irmãos de texto subsequentes.
  if (anchor.tagName.toLowerCase().startsWith("h")) {
    let sibling: Element | null = anchor.nextElementSibling;
    while (sibling && !stop(sibling)) {
      if (sibling.tagName === "PRE") textParts.push(sibling.textContent?.trim() ?? "");
      else if (!sibling.querySelector?.("h2, h3")) textParts.push(sibling.textContent?.trim() ?? "");
      sibling = sibling.nextElementSibling;
    }
    content = textParts.slice(1).join("\n").trim();
  }
  const lines = [
    `## ${label}`,
    "",
    content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join("\n"),
    "",
  ];
  return lines.join("\n");
}
