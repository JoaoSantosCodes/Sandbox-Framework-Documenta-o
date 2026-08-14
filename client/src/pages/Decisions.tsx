/*
  DESIGN: "Blueprint Técnico" — Registro de Decisões homologadas.
  Linguagem de "inspection record": cada decisão é um registro com carimbo de versão,
  contexto, alternativa rejeitada, consequência e precedente citável.
  Papel quente, tinta grafite, acento verde-engineering.
*/
import { AnimatePresence, motion } from "framer-motion";
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, PhaseStamp, TechRule } from "@/components/Primitives";
import { useEffect, useState } from "react";
import { Download, Eraser, Link2, Search, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";

// Favoritos do Registro de Decisões — persistidos em localStorage por dd-id.
const FAVORITES_KEY = "sbf-favorite-decisions";

function useFavoriteDecisions() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // storage indisponível — comportamento de leitura apenas.
    }
  }, [favorites]);

  return {
    favorites,
    setFavorites,
    toggleFavorite: (id: string) =>
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    isFavorite: (id: string) => favorites.includes(id),
  };
}

// Exportação de favoritos em JSON — backup entre navegadores.
function exportFavoritesJSON(favorites: string[]) {
  const exported = favorites
    .map((id) => DECISIONS.find((d) => d.id === id))
    .filter((d): d is Decision => Boolean(d))
    .map((d) => ({
      id: d.id,
      version: d.version,
      title: d.title,
      status: d.status,
      homologatedAt: d.homologatedAt,
      url: `${window.location.origin}/decisoes#${d.id.toLowerCase()}`,
    }));
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), total: exported.length, decisions: exported }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `decisoes-favoritas-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${exported.length} decisão(ões) favorita(s) exportada(s) em JSON`);
}

// Importação de favoritos via JSON — restauração de backup entre navegadores.
// O arquivo é o mesmo formato gerado por exportFavoritesJSON: { decisions: [{ id, ... }] }.
function importFavoritesJSON(
  file: File,
  onImported: (ids: string[]) => void,
) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(String(event.target?.result ?? "{}"));
      const decisions: unknown[] = parsed?.decisions ?? parsed;
      const arr = Array.isArray(decisions) ? decisions : [];
      const validIds = arr
        .map((d) => (d as { id?: string } | null)?.id)
        .filter((id): id is string => typeof id === "string" && DECISIONS.some((dd) => dd.id === id));
      const unique = Array.from(new Set(validIds));
      if (unique.length === 0) {
        toast.error(
          "Arquivo JSON inválido: nenhum identificador de decisão reconhecido (formato esperado: decisão-favoritas-*.json)",
        );
        return;
      }
      onImported(unique);
      toast.success(`${unique.length} decisão(ões) favorita(s) importada(s) do backup`);
    } catch {
      toast.error("Falha ao ler o arquivo JSON — verifique se o backup está íntegro.");
    }
  };
  reader.onerror = () => toast.error("Falha ao ler o arquivo de backup.");
  reader.readAsText(file);
}

async function copyDecisionLink(id: string) {
  const url = `${window.location.origin}/decisoes#${id}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`Link de ${id} copiado para a área de transferência`);
  } catch {
    // Fallback: input oculto — necessário em contextos sem clipboard API.
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    toast.success(`Link de ${id} copiado para a área de transferência`);
  }
}

type DecisionStatus = "Homologada" | "Homologada com nota" | "Pendente";

interface Decision {
  id: string;
  version: string;
  title: string;
  problem: string;
  decision: string;
  rejected: string;
  consequence: string;
  precedent: string;
  status: DecisionStatus;
  /** Data ISO da homologação — pendentes não possuem data. */
  homologatedAt?: string;
}

const DECISIONS: Decision[] = [
  {
    id: "DD-01",
    version: "v1.8.0",
    title: "USBUIManager herdando de ULocalPlayerSubsystem",
    problem:
      "Como isolar instâncias de UI por local player em split-screen e Listen Server sem reescrever isolamento manual por widget?",
    decision:
      "USBUIManager é um ULocalPlayerSubsystem nativo: a engine instancia uma cópia por ULocalPlayer automaticamente, isolando as camadas de widgets de cada jogador.",
    rejected:
      "Uma UHUD por jogador com mapeamento manual de instâncias — introduziria estado paralelo ao que a engine já mantém e exigiria sincronização própria em split-screen.",
    consequence:
      "Widgets e camadas Game/Modal/Debug nascem automaticamente na instância certa do jogador; nenhum código adicional para os dois cenários multi-player.",
    precedent:
      "Consequência direta da Regra 4 do Manifesto (injeção dinâmica de componentes) — deixar a engine manter o estado que já é dela.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-02",
    version: "v1.8.0",
    title: "Auto-unsubscribe cirúrgico em NativeDestruct",
    problem:
      "Widgets podem ser destruídos pelo ciclo de vida UMG sem destruição explícita de tags — como fechar a simetria subscribe/destruir em todos os caminhos de falha?",
    decision:
      "USBUserWidget rastreia cada assinatura em FSBWidgetEventSubscription (tag + delegate) e remove por delegate individual em NativeDestruct; SubscribeToEvent rejeita reinscrição do mesmo delegate (idempotente).",
    rejected:
      "Unsubscribe bruto por tag — derrubaria delegates de outros assinantes se o USBEventSubsystem compartilhar o array de handlers.",
    consequence:
      "Caminhos de falha cobertos: widget fechado via PopWidget, ator destruído, player removido (OnPlayerRemoved/OnOwnerDestroyed). Nenhum delegate órfão permanece.",
    precedent:
      "Mesma disciplina de simetria do FSBStackMutationGuard (Enter/Exit) — toda entrada precisa de saída em TODOS os caminhos, não só no caminho feliz.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-03",
    version: "v1.8.0",
    title: "Payloads em SBEventPayloads.h (04_SandboxCore), nunca em 09_SandboxUI",
    problem:
      "Como manter o 09_SandboxUI 100% isolado de compilação das extensões de gameplay se os eventos carregam dados de domínio?",
    decision:
      "Todos os payloads vivem em SBEventPayloads.h, dentro de 04_SandboxCore. O 09 só conhece as classes leves de payload — nunca cabeçalhos de 05/06/07/08.",
    rejected:
      "Includes diretos de eventos nas classes de gameplay (combate/inventário) — criaria dependência circular de compilação e provaria falsa o teste de isolamento.",
    consequence:
      "O teste de isolamento fica provável: 05+06+07+08 desabilitados simultaneamente e 09_SandboxUI continua compilando (Exit Code 0).",
    precedent:
      "Extensão da Regra 5 do Manifesto (desacoplamento por interfaces): o Message Router é a única superfície de comunicação entre camadas.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-04",
    version: "v1.8.0",
    title: "Payloads como classes UObject (GC + Blueprint), não structs FSB",
    problem:
      "Payloads deveriam seguir o padrão struct FSB* das camadas de gameplay ou adaptar-se ao consumo em UMG Blueprint?",
    decision:
      "Classes derivadas de UObject — ciclo de vida gerenciado pelo GC e casting direto em Blueprint, onde os widgets da Fase 18 vivem.",
    rejected:
      "Structs FSB* passados por evento — mais leves em C++, mas exigiriam reflexão por string ou wrappers em Blueprint, violando a Regra de interface do Manifesto.",
    consequence:
      "Custo maior por evento, aceitável porque UI é consumidora de prioridade Low (20) e gameplay nunca espera pela UI. Ponto de injeção de novos payloads: sempre 04_SandboxCore.",
    precedent:
      "Decisão registrada no plano Fase 18 homologado — design decision explícita, não escondida em Open Questions.",
    status: "Homologada com nota",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-05",
    version: "v1.8.0",
    title: "Anti-spill como requisito obrigatório de todo widget",
    problem:
      "Eventos de interação, atributos e combate são broadcast para todos os clients — como impedir o prompt do Jogador 2 na tela do Jogador 1?",
    decision:
      "Todo widget de gameplay valida TargetPawn == owning pawn antes de renderizar. Requisito obrigatório em todos os widgets e Cenário 2 da SBUITests (mismatch intencional).",
    rejected:
      "Validação por origem do evento no produtor — o produtor é broadcast por natureza (autoritativo); o filtro pertence ao consumidor que conhece seu dono.",
    consequence:
      "Split-screen e Dedicated Server seguros: cada UI só reage a eventos do seu próprio pawn. O teste cobre o cenário de race via TargetPawn mismatch.",
    precedent:
      "Extensão do princípio HasAuthority(): assim como lógica persistente exige authority, renderização de gameplay exige ownership.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-06",
    version: "v1.8.0",
    title: "Quatro eventos canônicos de inventário preservados",
    problem:
      "O plano original propunha um único Event.Inventory.Changed — mas 06_SandboxCombat já assinava eventos específicos. Como preservar compatibilidade?",
    decision:
      "Manter ItemAdded/ItemRemoved/ItemEquipped/ItemUnequipped como contrato canônico — o grid de combate assina os quatro, e a UI assina os mesmos quatro.",
    rejected:
      "Evento único genérico com payload discriminado — quebraria os assinantes existentes e reinventaria o contrato em cada novo sistema.",
    consequence:
      "Compatibilidade reversa garantida: nenhum consumidor de 06_SandboxCombat precisou ser reescrito. Contratos estáveis nunca são quebrados por conveniência.",
    precedent:
      "Regra 3 do manifesto (reaproveitar, não reinventar): o contrato já existia; a UI se adaptou a ele, não o contrário.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-07",
    version: "v1.8.0",
    title: "Throttle de 60 Hz no progresso de interação",
    problem:
      "Event.Interaction.Progress dispara no TickComponent durante o hold — como proteger o Slate de re-render por frame?",
    decision:
      "Acumulador de tempo no TickComponent com taxa máxima de 60 Hz para publicar Event.Interaction.Progress; o widget recebe dirty-flag sem tocar o Slate abaixo disso.",
    rejected:
      "Throttle no consumidor (widget) — moveria a regra para a camada de apresentação e permitiria múltiplos consumidores com políticas divergentes.",
    consequence:
      "Barra de hold suave sem custo de re-render; o throttle vive no produtor autoritativo onde a política é única e auditável.",
    precedent:
      "Consistência com a disciplina de eventos do Gameplay Debugger (Fase 17): dados de observação nunca geram escritas de estado.",
    status: "Homologada",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-08",
    version: "v1.8.0",
    title: "Filtro de indicadores de dano adiado para Fase 19",
    problem:
      "O indicador direcional de dano exige um novo ponto autoritativo de publicação no hitscan de combate — vale incluí-lo no escopo da Fase 18?",
    decision:
      "Adiar o USBUIDamageIndicator: fechar a Fase 18 com Prompt, Inventário, Arma e Cooldowns (todos com eventos existentes) antes de introduzir nova superfície de publicação.",
    rejected:
      "Implementar junto com a Fase 18 — aumentaria o risco de regressão na validação autoritativa de dano, o caminho mais sensível do framework.",
    consequence:
      "Escopo da Fase 18 fechado com eventos existentes; a Fase 19 herda o precedente de publicação autoritativa já homologado.",
    precedent:
      "Disciplina de scope (Fase 17 → 18): entregar escopo pequeno e verificável é melhor que escopo grande com lacunas.",
    status: "Homologada com nota",
    homologatedAt: "2026-08-13",
  },
  {
    id: "DD-09",
    version: "v1.7.0",
    title: "Teste de isolamento por hide de módulos no UBT",
    problem:
      "Como provar desacoplamento de compilação sem confiar em declaração de dependência no .uplugin?",
    decision:
      "Renomear a pasta do módulo dependente + .uplugin_disabled força o UBT a remover o plugin do gráfico de build — se o plugin isolado continua compilando, o desacoplamento é real.",
    rejected:
      "Editar apenas o campo de dependência do .uplugin — o UBT ainda linkaria o módulo via dependência implícita e o teste provaria nada.",
    consequence:
      "Método repetível contra as quatro extensões simultaneamente (05+06+07+08 na Fase 18) — versão bilateral: hide de cada lado prova o contrato.",
    precedent:
      "Fase 17 (hide 08_SandboxInventory) → Fase 18 (hide 05+06+07+08 + hide inverso de 09_SandboxUI): o método evolui, mas nunca relaxa.",
    status: "Homologada",
    homologatedAt: "2026-08-12",
  },
  {
    id: "DD-10",
    version: "v1.7.0",
    title: "GDT expõe ISBDebugInterface — não estado interno",
    problem:
      "Como dar observabilidade a todo ator inspecionável sem vazamento de ponteiros ou acoplamento ao Gameplay Debugger nativo?",
    decision:
      "Interface leve ISBDebugInterface com FSBDebugLine (Label/Value/bIsHeader) — cada ator implementa CollectData e a UI do GDT renderiza structs, nunca ponteiros.",
    rejected:
      "Reflexão por string sobre propriedades do ator — violaria a Regra de interface do Manifesto e exporia membros internos não destinados a debug.",
    consequence:
      "Compliance total em Shipping: todo o código de debug fica atrás de #if WITH_GAMEPLAY_DEBUGGER, sem custo em produção.",
    precedent:
      "Mesma disciplina das interfaces em 02_SandboxInterfaces: nunca reflexão por string, sempre contrato leve e explícito.",
    status: "Homologada",
    homologatedAt: "2026-08-11",
  },
  {
    id: "DD-11",
    version: "v1.9.0 (planejada)",
    title: "Deduplicação client-side do indicador de dano via AttackId",
    problem:
      "O cliente prediz o USBUIDamageIndicator localmente enquanto o servidor confirma via Event.Combat.DamageReceived — se o servidor publicar o evento antes da predição expirar, o HUD não pode exibir dois indicadores sobrepostos.",
    decision:
      "Deduplicação client-side por AttackId: cada indicador exibido consome uma entrada em um mapa local de AttackIds recentes; hits duplicados dentro do TTL são ignorados. No caminho feliz, o servidor pode suprimir a publicação redundante via bSkipClientNotify.",
    rejected:
      "Duplicar a validação no widget (comparar timestamp ou posição do hit) — espalharia regra de negócio no consumo e quebraria a simetria predição/autoridade já estabelecida em TryConsumeAttribute.",
    consequence:
      "O HUD exibe exatamente um indicador por hit confirmado, sem re-spawn duplicado; a regra fica no ponto de consumo local (USBUIDamageIndicator), preservando o produtor autoritativo puro.",
    precedent:
      "Mesma mecânica transacional do PredictionId (validar-antes-de-mutar): o cliente consome localmente, o servidor confirma; FSBStackMutationGuard provou o valor de guards locais contra reentrância.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
  {
    id: "DD-12",
    version: "v1.8.0",
    title: "Header compacto com rótulos curtos de navegação",
    problem:
      "O header com rótulos completos de navegação (01 · Início, 02 · F17, 03 · SFPS…) overflowava horizontalmente em larguras de desktop intermediárias (1280–1536px), quebrando o layout.",
    decision:
      "Nav com rótulos curtos ('01 · Início', '02 · F17', '03 · SFPS', '04 · Plugins', '05 · Histórico', '06 · Manual', '07 · Guia C++', '08 · Router', '09 · Decisões', '09 · F19', '10 · Manifesto') + tooltip com o nome completo; carimbo de fase só em telas 2xl; toggle de tema único no header.",
    rejected:
      "Menu hambúrguer permanente em desktop — sacrifica acesso direto a páginas-chave de documentação; ou scrollbar horizontal no header — sinaliza fragilidade estrutural em vez de resolvê-la.",
    consequence:
      "Header comporta 11 entradas + busca + tema sem overflow em qualquer largura ≥375px; labels longos permanecem acessíveis via tooltip, preservando a legibilidade auditável.",
    precedent:
      "Compactar é resposta de layout, não de conteúdo — o nome completo nunca é removido da interface, apenas oculto até a inspeção; espelho da regra do Manifesto de não esconder informação atrás de UX.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
  {
    id: "DD-13",
    version: "v1.8.0",
    title: "Banner persistente de acesso por link direto",
    problem:
      "Ao abrir /decisoes#dd-XX vindo de link externo, o usuário não tinha feedback de que a visualização foi direcionada por âncora — nem botão para desfazer o direcionamento.",
    decision:
      "Banner âmbar no topo da página citando o registro alvo, persistente durante a sessão (não some ao remover o hash do URL), com botão de fechar; scroll suave até o card permanece.",
    rejected:
      "Highlight apenas no card alvo sem banner — o usuário não entende por que aquele registro está destacado; ou remover o banner ao limpar o hash — perde o contexto quando o usuário navega dentro da página.",
    consequence:
      "Link compartilhado de decisão agora carrega contexto explícito ('você está visualizando DD-11 via link direto'), sem interferir no filtro ativo nem no scroll.",
    precedent:
      "Mesmo padrão de observabilidade do 10_SandboxDebug: nunca deixar estado implícito invisível — o que direcionou a navegação deve ser exibido, assim como o GDT exibe duração/lock/ativações.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
  {
    id: "DD-14",
    version: "v1.8.0",
    title: "Redesign de layout com referência fuch.ai: chips de navegação e hero com wordmark gigante",
    problem:
      "O header acumulava 11 entradas de navegação, busca e toggle de tema; em larguras desktop intermediárias (≈1440px) a barra quebrava com scrollbar horizontal, e as páginas de conteúdo não tinham identidade visual de abertura — o layout não transmitia o caráter de documentação técnica homologada.",
    decision:
      "Adotar o padrão de layout do fuch.ai: marca compacta à esquerda com sublinha mono, navegação como chips arredondados com numeração (01 · F17, 02 · F18, … 06 · Manual), e hero de cada página com wordmark gigante (FASE 17 · FASE 18 · FASE 19 · MANUAL · SFPS) renderizado como fundo de baixa opacidade atrás do título. Índices laterais numerados com rolagem suave (preventDefault + scrollIntoView) nas páginas longas.",
    rejected:
      "Sidebar permanente em todas as páginas — empobrece a leitura de documentos largos e duplica os chips do header; grid simétrico de cards no hero — não carrega hierarquia editorial nem o peso de spec sheet; palavra gigante fora do hero (ex.: rodapé) — perderia a função de identidade de abertura.",
    consequence:
      "Header comporta todo o navegação sem overflow em qualquer largura ≥375px; cada página ganha uma abertura editorial com numeração mono (doc. 17 · phase archive); índices numerados criam rota de leitura sequencial; nomes longos permanecem acessíveis via tooltip.",
    precedent:
      "Decisões de layout são resposta estrutural, não de conteúdo — nada informativo é removido (chips preservam numeração + tooltip). Paralelo direto com o padrão do Manifesto: acessibilidade auditável sem custo de compilação; e com DD-12: compactar oculta, não deleta.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
  {
    id: "DD-15",
    version: "v1.9.0 · planejada",
    title: "Atalhos de produtividade ⌘⇧C e compartilhamento de visualização do histórico",
    problem:
      "A reprodução de estado para revisões exigia esforço manual: copiar o checklist de uma fase, extrair a seção técnica ativa de uma página longa e replicar filtros de visualização — rotinas repetidas em praticamente toda rodada de auditoria entre Vault e site.",
    decision:
      "Registrar dois padrões como UI de produtividade: (a) ⌘⇧C copia em Markdown o checklist da fase ativa ou a seção técnica sob a linha de leitura (Manual, SFPS, Guia C++ e Message Router, via sectionsMarkdown.ts), com badge ⌘⇧C no header ao lado do ⌘K para descoberta guiada; (b) botão \"Compartilhar visualização\" no /historico copia a URL com os filtros ?layer=&dd= aplicados. Toast sonner confirma cada cópia; o atalho ignora foco em campos de texto para não colidir com o ⌘C nativo.",
    rejected:
      "Botão fixo de copiar em cada seção — polui o ritmo editorial das páginas longas e repete a função do atalho contextual; salvar filtros apenas em localStorage — não permite compartilhamento por link, inviabilizando links diretos em conversas de review; ⌘⇧C copiando a página inteira — perde a intenção de copiar \"o que estou lendo\", inflando a área de transferência com ruído.",
    consequence:
      "Checklists e seções técnicas exportáveis em um gesto, sem mouse; visualizações filtradas do histórico viram links compartilháveis com restauração exata da seleção; o badge do header garante descoberta sem depender de documentação externa.",
    precedent:
      "Par direto com DD-12 (compactar oculta, não deleta): recursos de produtividade não podem custar a clareza editorial. O conteúdo copiado vem do DOM da própria página — mesma fonte de verdade do render — e não de strings duplicadas, alinhado ao princípio da seção única de verdade.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
  {
    id: "DD-16",
    version: "v1.9.0 · planejada",
    title: "Portas de homologação com slots auditáveis — padrão reutilizável para fases futuras",
    problem:
      "Fases em planejamento tendem a evoluir para especificação fechada em prosa antes da execução — e prosa não prova comportamento. Quando a execução chega, a página da fase precisa ser reescrita do zero, perdendo o histórico do convite à homologação e o contrato que orientou a sprint.",
    decision:
      "Fases futuras (a partir da Fase 19) nascem como \"porta de homologação\": quatro slots auditáveis de contrato (A–D: payload em 04_SandboxCore, produtor autoritativo em 06, widget em 09, testes SBUITests), cada um com texto de exigência + CodeBlock C++ de contrato marcado \"aguardando corpo do build\" + CopyButton individual, e um \"Copiar tudo\" que concatena os slots para o escopo da sprint no Vault. O carimbo fica \"v1.X.0 · em homologação\" até o plano executado real ser submetido; a homologação exige os corpos reais de C++, suíte de testes verde (34/34) e isolamento simétrico — nunca código inventado preenche um slot.",
    rejected:
      "Especificar a fase completa em prosa antes da execução — viola a regra do projeto de nunca aceitar prosa como prova e infla a área da decisão sem revisão; slots com pseudocódigo \"exemplificativo\" já executável — o exemplo executável vira referência silenciosa e contamina o build (padrão DD-01: nunca vazar bypass para produção); abrir a página como \"rascunho livre\" — perde o contrato estruturado que orienta a sprint e não tem ponto de auditoria claro.",
    consequence:
      "Toda fase futura tem um ponto de auditoria explícito: a revisão examina os quatro slots com o corpo real lado a lado do contrato. O histórico do convite à homologação (pré-requisitos, escopo, aceite) permanece preservado após a homologação. Sites com mais de uma fase futura replicam o padrão sem re-inventar a página.",
    precedent:
      "Extensão direta da disciplina do Manifesto (nunca aceitar prosa como prova) e da DD-11 (deduplicação via AttackId): o mecanismo concreto é exigido, não descrito. Mesma simetria Entry/Exit do DD-02 aplicada à documentação — cada abertura de fase (convite) exige fechamento (homologação) em todos os caminhos.",
    status: "Homologada",
    homologatedAt: "2026-08-14",
  },
];

const STATUS_STYLES: Record<DecisionStatus, string> = {
  Homologada: "border-engineering/60 text-engineering",
  "Homologada com nota": "border-amber-warn/60 text-amber-warn",
  Pendente: "border-muted-foreground/60 text-muted-foreground",
};

function DecisionRecord({
  d,
  index,
  formatDate,
  favorite,
  onToggleFavorite,
}: {
  d: Decision;
  index: number;
  formatDate: (iso?: string) => string | undefined;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <article className="border border-border bg-card relative overflow-hidden" id={d.id.toLowerCase()}>
      <div className="h-1 bg-[repeating-linear-gradient(-45deg,var(--engineering),var(--engineering) 3px,transparent 3px 9px)] opacity-30" />
      <header className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Registro nº {index + 1} · {d.id}
          </div>
          <h3 className="font-display text-xl font-bold mt-1">{d.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border whitespace-nowrap ${STATUS_STYLES[d.status]}`}>
            {d.status}
          </span>
          {d.homologatedAt && formatDate && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Homologada em {formatDate(d.homologatedAt)}
            </span>
          )}
          <span className="phase-stamp">{d.version}</span>
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => onToggleFavorite(d.id)}
              aria-label={favorite ? `Remover ${d.id} dos favoritos` : `Marcar ${d.id} como favorito`}
              title={favorite ? "Favorito — clique para remover" : "Marcar como favorito"}
              className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                favorite
                  ? "border-amber-warn/70 bg-amber-warn/10 text-amber-warn"
                  : "border-border/70 text-muted-foreground hover:text-foreground hover:border-engineering/60"
              }`}
            >
              <Star className={`h-3 w-3 ${favorite ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{favorite ? "Favorito" : "Favoritar"}</span>
            </button>
            <button
              onClick={() => copyDecisionLink(d.id.toLowerCase())}
              aria-label={`Copiar link direto para ${d.id}`}
              title="Copiar link direto"
              className="inline-flex items-center gap-1 border border-border/70 text-muted-foreground hover:text-foreground hover:border-engineering/60 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors"
            >
              <Link2 className="h-3 w-3" />
              <span className="hidden sm:inline">Copiar link</span>
            </button>
          </div>
        </div>
      </header>
      <div className="px-5 pb-4 grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Problema</span>
          <span className="text-foreground">{d.problem}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Decisão homologada</span>
          <span className="text-foreground">{d.decision}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Alternativa rejeitada</span>
          <span className="text-muted-foreground">{d.rejected}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground block mb-1">Consequência</span>
          <span className="text-muted-foreground">{d.consequence}</span>
        </p>
      </div>
      <footer className="px-5 py-2.5 border-t border-dashed border-border bg-secondary/40">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Precedente</span>
        <p className="text-sm text-foreground mt-1">{d.precedent}</p>
      </footer>
    </article>
  );
}

const STATUS_FILTERS: (DecisionStatus | "Todas")[] = ["Todas", "Homologada", "Homologada com nota", "Pendente"];

export default function Decisions() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "Todas">("Todas");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  // Indicador persistente de acesso por link direto (/decisoes#dd-XX): persiste
  // enquanto a página estiver aberta, mesmo que o hash seja removido do URL.
  const [directLinkBanner, setDirectLinkBanner] = useState<string | null>(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    return hash.startsWith("dd-") ? hash : null;
  });
  const { favorites, setFavorites, toggleFavorite, isFavorite } = useFavoriteDecisions();

  function importFavoritesFromFile(file: File) {
    importFavoritesJSON(file, (ids) => {
      const merged = Array.from(new Set([...favorites, ...ids]));
      setFavorites(merged);
    });
  }

  const filtered = DECISIONS.filter((d) => {
    if (favoritesOnly && !isFavorite(d.id)) return false;
    if (statusFilter !== "Todas" && d.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.problem.toLowerCase().includes(q) ||
      d.decision.toLowerCase().includes(q) ||
      d.precedent.toLowerCase().includes(q)
    );
  })
    // Ordenação: favoritos no topo quando o status está em "Todas";
    // pendentes primeiro entre não-favoritos; homologadas por data de homologação
    // descendente (mais recentes no topo); empates resolvidos pelo identificador DD-*.
    .sort((a, b) => {
      const favA = isFavorite(a.id);
      const favB = isFavorite(b.id);
      if (statusFilter === "Todas" && !favoritesOnly && favA !== favB) return favA ? -1 : 1;
      if (a.status === "Pendente" && b.status !== "Pendente") return -1;
      if (a.status !== "Pendente" && b.status === "Pendente") return 1;
      const dateA = a.homologatedAt ?? "";
      const dateB = b.homologatedAt ?? "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.id.localeCompare(a.id);
    });

  // Scroll suave para a âncora de link direto: /decisoes#dd-XX rola até o card alvo.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, []);

  const formatDate = (iso?: string) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR") : undefined;

  return (
    <DocsLayout>
      <div className="container py-10 lg:py-14 max-w-5xl">
        <header className="border-b-2 border-foreground pb-6 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PhaseStamp phase="RD" version="v1.8.0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Documento de referência · Registro consolidado de decisões homologadas em auditoria
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Registro de Decisões
            <span className="text-engineering"> — Precedentes homologados</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-3xl">
            Cada decisão de arquitetura com peso de longo prazo foi registrada aqui no momento da homologação:
            o problema, a alternativa rejeitada, a consequência e o precedente citável. Novas fases devem
            reaproveitar estes precedentes em vez de reinventar o contrato — a Regra 3 do Manifesto, tornada auditável.
          </p>
        </header>

        {directLinkBanner && (
          <div className="mb-6 border-l-4 border-amber-warn bg-amber-warn/8 px-4 py-3 flex items-start sm:items-center gap-3">
            <Link2 className="h-4 w-4 text-amber-warn shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-foreground">
              Você está visualizando o registro{" "}
              <span className="font-mono font-bold text-amber-warn">{directLinkBanner.toUpperCase()}</span> via link
              direto — o filtro foi ajustado para destacá-lo na lista.
            </p>
            <button
              type="button"
              onClick={() => setDirectLinkBanner(null)}
              aria-label="Fechar indicador de link direto"
              className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <TechRule label="Como citar" />
        <div className="border-l-2 border-engineering pl-5 max-w-3xl mb-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Referencie decisões pelo identificador (ex.: <span className="font-mono text-foreground">DD-03</span>) em planos
            de nova fase. Se uma decisão registrada precisar ser revertida, a reversão exige auditoria explícita e registro
            no próprio Registro — nunca uma modificação silenciosa.
          </p>
        </div>

        <div className="mb-8 border border-border bg-card">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-secondary/60">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Buscar por identificador, título ou conteúdo
            </span>
            <span className="font-mono text-[11px] text-engineering ml-auto">
              {filtered.length}/{DECISIONS.length} registro(s)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <div className="relative flex-1 min-w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: DD-03, uilocalplayersubsystem, deduplicação..."
                aria-label="Buscar por identificador, título ou conteúdo"
                className="h-9 w-full border border-border bg-background py-2 pl-9 pr-3 text-sm font-mono placeholder:text-muted-foreground/60 focus:border-engineering/60 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`border px-3 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors duration-150 ${
                  favoritesOnly
                    ? "border-amber-warn bg-amber-warn/10 text-amber-warn"
                    : "border-border bg-card text-muted-foreground hover:border-amber-warn/60 hover:text-amber-warn"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-current" : ""}`} />
                Favoritos ({favorites.length})
              </button>
              <button
                type="button"
                onClick={() => exportFavoritesJSON(favorites)}
                disabled={favorites.length === 0}
                title={favorites.length === 0 ? "Nenhuma decisão favorita para exportar" : "Baixar a lista de decisões favoritas em JSON"}
                className={`border px-3 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors duration-150 ${
                  favorites.length === 0
                    ? "border-border bg-card text-muted-foreground/40 cursor-not-allowed"
                    : "border-border bg-card text-muted-foreground hover:border-engineering/60 hover:text-engineering"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "application/json,.json";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (file) importFavoritesFromFile(file);
                  };
                  input.click();
                }}
                title="Restaurar favoritos a partir de um backup JSON exportado anteriormente"
                className="border border-border bg-card px-3 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 text-muted-foreground transition-colors duration-150 hover:border-engineering/60 hover:text-engineering"
              >
                <Upload className="h-3.5 w-3.5" />
                Importar JSON
              </button>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`border px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-150 ${
                    statusFilter === s
                      ? "border-engineering bg-engineering/10 text-engineering"
                      : "border-border bg-card text-muted-foreground hover:border-engineering/60 hover:text-engineering"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("Todas");
                  setFavoritesOnly(false);
                }}
                title="Redefinir busca e filtros para a visualização completa"
                className="border px-3 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors duration-150 border-border bg-card text-muted-foreground hover:border-amber-warn/60 hover:text-amber-warn"
              >
                <Eraser className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.length > 0 ? (
              filtered.map((d, i) => (
                <motion.article
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28, opacity: { duration: 0.18 } }}
                  style={{ border: "1px solid var(--border)", background: "var(--card)", position: "relative", overflow: "hidden" }}
                  id={d.id.toLowerCase()}
                >
                  <div className={isFavorite(d.id) ? "favorite-glow" : ""}>
                    <DecisionRecord
                      d={d}
                      index={i}
                      formatDate={formatDate}
                      favorite={isFavorite(d.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border border-dashed border-border px-6 py-10 text-center font-mono text-sm text-muted-foreground"
              >
                {favoritesOnly
                  ? "Nenhuma decisão marcada como favorita. Use o botão Favoritar no card de cada decisão para destacá-la aqui."
                  : `Nenhum registro corresponde à busca "${query}" ${statusFilter !== "Todas" && `com status "${statusFilter}"`}.`}
                {!favoritesOnly && "Tente outro identificador (DD-01…DD-11) ou amplie o filtro de status."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AuditNote tone="warn">
          Decisões marcadas como "Homologada com nota" carregam custo ou premissa documentada (DD-04: custo de
          UObject por evento; DD-08: indicador de dano adiado). Revisite-as quando o custo se tornar mensurável
          em produção — o registro existe justamente para que a nota não se perca.
        </AuditNote>
      </div>
    </DocsLayout>
  );
}
