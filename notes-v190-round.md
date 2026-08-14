# Notas — Rodada v1.9.0 (histórico + busca interna + F19)

## Estado atual (checkpoint 84ebab57 publicado)
- Skill sandbox-framework-review atualizada com padrão ActiveSection/BackToTop.
- Phase18/Phase19 já integram useActiveSection + BackToTop; índices laterais numerados.

## Fase 1 (CONCLUÍDA)
- History.tsx criado: hero HISTÓRICO, FOUNDATION_PHASES (F1-9), PHASES 10-18 com motion, DD_BY_VERSION (v1.7.0: DD-09/10; v1.8.0: DD-01..08,12,13,14; v1.9.0 planejada: DD-11), métricas 34/34 alvo, próximo passo F19, índice lateral, BackToTop.
- App.tsx: rota /historico registrada; DocsLayout: chip "11 · Hist" adicionado + botão "+5 · ⌘K".
- MessageRouter.tsx: ids modos/tabela/prioridades/invariantes/fase-18 nas h2 + scroll-mt-24 (corrigido h1 duplicado; tsc OK).

## Fase 2 (CONCLUÍDA)
- `client/src/lib/sectionsIndex.ts` criado: MANUAL_SECTIONS (ids pre/data/input/single/multi/gdt/integracao/limitacoes/checklist), SFPS_SECTIONS (sfps-01..08, títulos reais), SFDG_SECTIONS (sfdg-01..08, títulos reais), FASE_SECTIONS (f17: plugin/interface/coletor/telemetria/gate; f18: regra/topologia/base/widgets/eventos/padrao/verificacao/aceite; f19: DD-08/pre-requisitos/escopo/aceite), ROUTER_SECTIONS (seções sem id na página: modos/tabela/prioridades/invariantes/fase-18 — ATENÇÃO: MessageRouter.tsx NÃO tem ids nas h2! seções 146/166/248/267/286).
- SearchPalette: grupo "secoes" (ícone Hash) integrado em ALL_INDEX; group union atualizado.
- index.css: `html { scroll-behavior: smooth; scroll-padding-top: 7rem; }` adicionado.
- Spec.tsx e Guide.tsx: scroll-mt-24 adicionado às h2 font-serif.
- MessageRouter sem ids nas seções → navegação por âncora das entradas router NÃO funciona ainda. Decisão: dar ids às h2 do MessageRouter (modos, tabela, prioridades, invariantes, fase-18).

## Dados-chave siteData.ts
- PHASES array: fases 10..18 (10=v1.2.x Predição/Combate, 11=v1.2.0 Suíte de Testes, 12=v1.3.x Interação Modular, 13=v1.3.x Inventário, 14=v1.4.0 Behavior Stack consolidado, 15=v1.5.x Save Game, 16=v1.6.0 Habilidades, 17=v1.7.0 Gameplay Debugger 31/31, 18=v1.8.0 Interface Dinâmica 32/32). Fases 1-9 não estão no array (10 é o primeiro).
- Interface Phase: phase, version, title, status ("Concluída"|"Em execução"|"Em planejamento"), summary, highlights[], tests?.
- TEST_SUITES: domínios e specs (Animation 2, Camera 2, Movement 4, Network 5, Combat 3, Interaction 5, Inventory 5, Save 1, BehaviorStack 3, Abilities 1 = 31/31 F17, +2 F18 → 32/32, F19 previstos +2 Cenários 7/8 → 34/34).

## Fase 3 — Phase19.tsx v1.9.0 (EM ANDAMENTO)
- [x] TOC: adicionado "corpo-codigo"
- [x] Checklist: 11 itens (novo "suíte" 34/34)
- [x] carimbo hero: "v1.9.0 · em homologação"
- [ ] Falta: editar hero doc label para "v1.9.0 · homologation gate" e adicionar seção <h2 id="corpo-codigo"> após a tabela SCOPE, com blocos auditáveis (USBUIDamageIndicator, ponto autoritativo no Hitscan, USBDamageEventPayload, SBUITests Cenários 7/8) marcados "aguardando corpo do build", usando prims CodeBlock/AuditNote (CodeBlock exige path+code). Seção antes do PhaseChecklist.
- [ ] Atualizar CHECKLIST_KEY label no PhaseChecklist "v1.9.0 · em homologação" (opcional: phaseLabel existente diz "(planejamento)").

## Fase 1 — /historico (planejado)
- Criar History.tsx: hero wordmark "HISTÓRICO", timeline vertical (fases 10..18 + F19 em planejamento) à esquerda, DD-01..14 à direita ou integrada.
- Reutilizar: DocsLayout, BackToTop, useActiveSection, TechRule, AuditNote, PhaseStamp, Primitives.
- Dados: PHASES de siteData + decisões (usar DECISIONS do Decisions.tsx? exportar do siteData ou redefinir localmente).
- Registrar rota /historico em App.tsx.
- Chips DocsLayout: slice(0,6) fixo — novo chip exige inserir "10 · Histórico" → chips existentes renumerados de 01..10. ATENÇÃO: DD-12 e o SKILL citam rótulos "01 · F17 … 10 · Manifesto"; ao inserir Histórico deve-se decidir posição (provável: antes de Manifesto ou após Decisões) e renumerar. Decisão: inserir como "09 · Histórico" antes de "10 · Manifesto"?? Verificar ordem atual: 01 F17, 02 F18, 03 F19, 04 SFPS, 05 Plugins, 06 Manual, 07 Guia, 08 Router, 09 Decisões, 10 Manifesto. → Melhor: manter e adicionar como 11? Não — DD-12 registrou rótulos curtos. Solução: trocar chip 09 Decisões por 09 Histórico? Não. Alternativa: menu desktop mostra 10 chips + botão +4⌘K; adicionar Histórico como 11 · Hist quebraria padrão numérico. Decisão final: inserir "11 · Hist" ao final e usar botão "+N" ou reduzir a 10: substituir "10 · Manifesto" por… Não: manifestar decisão ao usuário. MELHOR: chips mostram 6 primeiros + botão +4⌘K; sheet mobile lista todos. Novo chip entra como 11º no array (não aparece no desktop top-6, visível no sheet e no ⌘K). Manter numeração existente e adicionar "11 · Hist" ao final.
- Header desktop: NAV_CHIPS.slice(0,6) → histórico não aparece; sheet mobile: NAV_CHIPS.map → aparece. OK.

## Decisões DD registradas (14):
DD-01 USBUIManager ULocalPlayerSubsystem; DD-02 idempotência/subscribe cirúrgico; DD-03 payloads em 04_SandboxCore; DD-04 payloads UObject (com nota); DD-05 anti-spill; DD-06 4 eventos inventário preservados; DD-07 throttle 60Hz; DD-08 escopo F19 adiado; DD-09 hide de módulos (teste isolamento); DD-10 GDT expõe ISBDebugInterface; DD-11 deduplicação AttackId; DD-12 header compacto; DD-13 banner link direto; DD-14 redesign fuch.ai.

## Auditoria pré-entrega
- tsc OK. Screenshots: /historico, /fase-19, busca (desktop+mobile).
- Checkpoint → auto-publish habilitado.


# Rodada: Copy buttons + filtros timeline + ícones ⌘K

## Estado (checkpoint ac7041a2 publicado)
- Home box status: "Fase 19 em homologação · v1.9.0" (âmbar). Rodapé "Fase 19 em homologação (v1.9.0)", LAST_VAULT_SYNC "14/08/2026 01:15 GMT-3".
- Phase19.tsx: 4 slots (A: SBEventPayloads.h USBDamageEventPayload, B: 06_SandboxCombat ponto autoritativo, C: USBUIDamageIndicator, D: SBUITests Cenários 7/8) como divs border-dashed âmbar; seção id="corpo-codigo"; checklist 11 itens; tech rule label="Corpo do código — porta de homologação".
- History.tsx: FOUNDATION_PHASES (4 blocos F1-9), PHASES (10-18) como timeline motion com dots, DD_BY_VERSION (v1.7.0: DD-09/10; v1.8.0: 11 DDs; v1.9.0 planejada: DD-11), METRICS (11 plugins, 32/32, 31/31, 14 DDs), seção métricas adicionais, próximo passo F19; TOC ids: linha-do-tempo/decisoes/metricas/proximo; índice lateral lg.
- SearchPalette.tsx: IndexEntry {id,title,subtitle,page,hash?,keywords,group}; grupos existentes: decisoes + secoes (Hash). ALL_INDEX concatena DD entries + ALL_SECTIONS (MANUAL/SFPS/SFDG/FASE/ROUTER).
- CodeBlock primitiva em Primitives.tsx (path + code) — checar se já tem botão copiar; se não, adicionar componente CopyableCodeBlock ou envolver.

## Progresso da rodada atual
- Fase 1 CONCLUÍDA: CopyButton criado em Primitives.tsx (useState, Clipboard API, 1500ms volta, classes mono border). CodeBlock agora tem CopyButton na figcaption. Phase19.tsx: 4 slots A–D ganharam campo code (snippets C++ com comentários "Aguardando corpo do build") e renderizam <CodeBlock path={s.slot.replace(" · ", " — ")} language="cpp"> dentro do card. tsc OK.
- Fase 2 CONCLUÍDA: History.tsx tem filtros LAYER (todas/foundation/gameplay-base/gameplay-ext/presentation/tools) com contagens + chips; FOUNDATION_PHASES oculta quando filtro ≠ foundation; DD_BY_VERSION com filtro ddFilter por versão (Todas·14, v1.7.0·2, v1.8.0·11, v1.9.0·1) + AnimatePresence; F19 adicionada a PHASES em siteData.ts (Em planejamento, destaques 4); link da timeline trata phase 19. tsc OK.
- Fase 3 EM ANDAMENTO: SearchPalette.tsx — GROUP_META usa ícones: paginas=FileText, secoes=Hash, plugins=Layers, eventos=classes=decisoes=conceitos=Milestone (FALTA: ícones distintos para decisoes/classes/conceitos/eventos). lucide já importados: Clock, FileText, Hash, Layers, Milestone. Falta ver o render dos CommandItem (procurar CommandItem render no arquivo) para inserir iconElement do group.

## Plano de execução
### Fase 1 — Copy buttons
- Phase19.tsx slots: transformar em CopyableCodeBlock (botão copiar do texto "exige" + título). Usar componente novo CopyButton genérico (Clipboard API + toast success "Copiado") — reutilizar em todos os slots e em CodeBlock existente do Primitives.
- Criar componente CopyButton em Primitives.tsx (ícone Copy/Check, 1500ms volta a Copy).
### Fase 2 — Filtros timeline
- History.tsx: camada (layer) em FOUNDATION_PHASES e PHASES: foundation/gameplay-base/gameplay-ext/presentation/tools/planning. Chips tipo FilterChip (já existe pattern em MessageRouter: font-mono uppercase border). Filtro padrão "Todas"; aplicar a ambos os blocos (timeline principal + fundação). Contagem "(N)" no chip.
### Fase 3 — Ícones ⌘K
- SearchPalette: no render dos resultados, ícone por group: paginas=FileText/Compass?, fases=Layers, decisons=ScrollText/Stamp, secoes=Hash/Anchor. Mapear groups reais lidos do arquivo.


## Rodada 3 — localStorage + Copiar Tudo + highlight de busca
Checkpoint anterior: c21aa211 (copy buttons, filtros, ícones). Entregue ao usuário.
Novos pedidos:
1. Persistir filtro de camada em /historico (History.tsx: estado `layer` (Layer) e `ddFilter` (string|null)) em localStorage. Chave sugerida: `sbf-history-layer` e `sbf-history-dd-filter`.
2. Botão "Copiar Tudo" na seção "Corpo do código (homologação)" da Phase19.tsx — concatena os 4 códigos dos slots A–D. Os slots estão definidos como array inline (const com slot/title/exige/code) renderizado em .map; extrair para const SLOTS e adicionar botão no topo da seção. CopyButton já existe em Primitives.tsx (aceita className?) — verificar assinatura antes de reusar.
3. Highlight do termo pesquisado nos CommandItem do SearchPalette.tsx — CommandInput value acessível via estado `value` do Command (cmdk usa Input com value no CommandRoot; passar `value={query}` ao <Command> e usar span com mark/bg-amber-warn/20 no título/subtítulo, com função simpleHighlight(text, q)). O Input do command é filho do CommandRoot — usar <Command value={query}>. Ver linhas ~175-210 do SearchPalette para o <Command>.

State atual relevante:
- History.tsx: const layer + setLayer ("todas" default), ddFilter + setDdFilter (null default). Type Layer definido. FOUNDATION_PHASES, PHASES (siteData tem F19 agora), DD_BY_VERSION, AnimatePresence importado.
- Phase19.tsx: slots inline após linha ~261; CodeBlock path=s.slot.replace(" · "," — ") language="cpp"; importações: AuditNote, CodeBlock, CopyButton, PhaseStamp, TechRule; toast "Copiado" via CopyButton interno.
- SearchPalette.tsx: GROUP_META icons; CommandGroup/CommandItem; queries feitas em matches() sobre `${title} ${subtitle} ${keywords}`. Input no topo do CommandDialog.

### Progresso rodada 3 (atualizado)
- Fase 1 (persistência) CONCLUÍDA: History.tsx — readStored<T> com validação contra LAYER_IDS/ddVersions; chaves sbf-history-layer e sbf-history-dd-filter; persistLayer/persistDd helpers com try/catch. Inicialização lazy nos useState. Todos os setLayer/setDdFilter trocados. Filtro ddFilter default no readStored = "Todas as versões" (não null; persistDd(null) remove).
- Fase 3 (highlight) CONCLUÍDA: SearchPalette.tsx — import Command (do ui/command, usado? não — remover import se não usado no render; tsc já passou então pode estar como side import, remover para cleanliness), highlightText() com escape regex e mark bg-amber-warn/25, CommandInput value={query} onValueChange={setQuery}, query resetado no onOpenChange(false), aplicado em CommandItem de grupos e POPULAR_TAGS.
- FALTA: Fase 2 — botão "Copiar Tudo" na seção "Corpo do código" da Phase19.tsx. Slots definidos inline (~linha 261-350) com campo code. Extrair const CODE_SLOTS acima do componente, adicionar botão CopyButton value={CODE_SLOTS.map(s=>s.code).join("\n\n")} acima do .map, label "Copiar tudo". CopyButton assinatura: { value, label? }.
- Depois: tsc, screenshots, checkpoint, entrega.

## Rodada 4 — URL params, toast Copiar Tudo, atalho ⌘⇧C (em andamento)

### Fase 1 — URL params no /historico (planejado)
- History.tsx já tem: readStored<T>(key, fallback, validação) com chaves `sbf-history-layer` e `sbf-history-dd-filter`; useState lazy com inicialização via readStored; setLayer/setDdFilter com helpers persistLayer/persistDd (try/catch).
- Plano: na inicialização, ler também `new URLSearchParams(window.location.search)` — `?layer=X&dd=V` com validação contra LAYER_IDS/ddVersions; URL prevalece sobre localStorage. Ao mudar filtro: persist + `window.history.replaceState(null, "", ...)` (não push — não poluir o histórico). Fallback: sem History API, só localStorage.
- LAYER_IDS: "todos"(?) + "foundation"(F1-F9), "gameplay-base"(F10-F11), "gameplay-ext"(F12-F16), "presentation"(F17), "tools"(F19). Verificar nomes exatos no History.tsx (grep 'layer' em History.tsx).

### Fase 2 — Toast no Copiar Tudo (planejado)
- Phase19.tsx: CopyButton já importado de Primitives. Ver assinatura do CopyButton em Primitives.tsx (value, label, sucesso?); toast = `toast.success(...)` de sonner (verificar import existente de sonner/toast no projeto — grep 'sonner' ou 'toast' em Primitives.tsx).
- Copiar Tudo é um CopyButton novo com label="Copiar tudo"; se o botão não emite callback, adicionar `onCopy?` no CopyButton (chamar toast lá) — melhor: callback onCopy no componente primitivo, chamado pelos dois pontos de uso.

### Fase 3 — Atalho ⌘⇧C global (planejado)
- DocsLayout.tsx (layout global): listener keydown global — (e.metaKey||e.ctrlKey) && e.shiftKey && e.key==='C' → copiar checklist da fase ativa.
- Fase ativa = a página atual. Rotas: /fase-17 (F17), /fase-18 (F18), /fase-19 (F19). Dados de checklist: verificar PhaseChecklist.tsx — storageKey (sbf-phase17-checklist etc.), items (passar para Props). Precisa exportar getChecklistData(phase) ou usar location da rota.
- Formato do texto copiado: cabeçalho "Fase N — <nome> · <status>", lista "- [x]/- [ ] <item>", rodapé. toast.success de confirmação.
- Prevenir colisão com ⌘C nativo: aplicar só se document.activeElement não for input/textarea e shiftKey presente (C com shift).

### Estado geral (checkpoint anterior 2fc7f08d publicado)
- Histórico: filtros persistidos em localStorage (feito na rodada 3).
- F19: CODE_SLOTS no topo do arquivo; botões copiar por slot e Copiar Tudo (feito).
- SearchPalette: highlight âmbar implementado (feito).
- Auto-publish ativo: checkpoint = publicação imediata.

## Rodada 5 — skill, badge ⌘⇧C, ⌘⇧C estendido, Compartilhar visualização

### Feito até agora (rodada 5)
1. Skill `sandbox-framework-review` atualizada (validada): estado v1.9.0-prep, slots A–D da F19, padrões de UI (busca ⌘K com sectionsIndex, /historico com URL params, atalhos ⌘K/⌘⇧C, botão Compartilhar).
2. DocsLayout.tsx: badge ⌘⇧C adicionado no header (hidden lg:inline-flex) ao lado de SearchShortcut; atalho ⌘⇧C estendido — se a rota é de página técnica (sourceForRoute: /manual, /especificacao), copia a seção ativa via extractSectionMarkdown (hash da URL = seção ativa do scroll-spy useActiveSection que já exporta hash via replaceState). Novo arquivo: client/src/lib/sectionsMarkdown.ts (MANUAL_SECTIONS ids: pre,data,input,single,multi,gdt,checklist,limitacoes,integracao; SPEC_SECTIONS ids: sfps-01..08 com labels "NN · Título").
3. FALTA: botão "Compartilhar visualização" no History.tsx (copiar URL atual com query filters, toast confirm). Inserir perto dos chips LAYERS (linha ~263-281) — ex.: coluna à direita dos chips com CopyButton ou botão próprio com toast("URL copiada"). LAYER_IDS: todas, foundation, gameplay-base, gameplay-ext, presentation, tools. Toast via sonner (já importado? conferir imports do History.tsx — se não, adicionar `import { toast } from "sonner"`).
4. tsc limpo em todas as etapas. Erro stale no devserver log (Phase19.jsx) é do checkpoint anterior já corrigido — ignorar.

### Próximos passos (rodada 5)
- Inserir botão Compartilhar no History.tsx (após bloco LAYERS, linha ~281).
- Screenshot de auditoria (/historico, /manual, /especificacao, home) → checkpoint → entrega com sugestões.
- Checkpoint anterior: 024a1911. Auto-publish ativo.

## Rodada 7 — skill + DD-15 + ⌘⇧C Guide/Router + F19 (aguardando plano executado real)

### Feito até agora (rodada 7)
1. Skill `sandbox-framework-review` atualizada e validada (badge ⌘⇧C, sectionsMarkdown, share, DD-15 pendente).

### Dados técnicos coletados (para editar sem ler arquivos)
- Guide.tsx: ids de seção `sfdg-01..08` em `<section id=...>` com h3 seguinte. Rota `/guia-cpp`. Títulos:
  sfdg-01 "01 · Comportamento de Movimentação (05_SandboxCharacter)", sfdg-02 "02 · Utilizando o Message Router (USBEventSubsystem)",
  sfdg-03 "03 · Ciclo de Vida, Ticks e Ordem de Execução", sfdg-04 "04 · Sincronização via ISBReplicable",
  sfdg-05 "05 · Objetos Interativos Modulares (07_SandboxInteraction)", sfdg-06 "06 · Habilidades no Behavior Stack (Fase 16)",
  sfdg-07 "07 · Integração ao Save Game System (Fase 15)", sfdg-08 "08 · Precedentes Homologados — DD-01···DD-08 (v1.8.0)".
- MessageRouter.tsx: ids `modos, tabela, prioridades, invariantes, fase-18` em h2 (linhas 146/166/248/267/286). Rota `/message-router`.
  Títulos: "Modos de publicação", "Tabela canônica — eventos Event.*", "Prioridades de assinatura", "Invariantes de consumo", "Contrato da Fase 18".
- sectionsMarkdown.ts: exportar SECTION_COPY_SOURCES = [MANUAL, SPEC]; adicionar GUIDE_SECTIONS (route "/guia-cpp") e ROUTER_SECTIONS (route "/message-router").
- Decisions.tsx: array DECISIONS com objetos Decision; últimos IDs DD-14; padrão status Pendente → Homologada. DD-15 = "Atalhos de produtividade ⌘⇧C + compartilhamento de visualização do histórico" (badge no header, seções técnicas em Markdown via sectionsMarkdown.ts, share URL ?layer=&dd= no History). Status: Homologada (decisão de UI registrada nesta rodada) — usar status "Pendente" com homologatedAt null OU "Homologada" com data 14/08/2026.
- Phase19.tsx: slots A–D = CODE_SLOTS (const no topo), seção "Corpo do código (homologação)" com botão Copiar Tudo; hero "v1.9.0 · em homologação" (badge âmbar); checklist 11 itens (sbf-phase19-checklist).
- Checkpoint anterior: c9968624. Auto-publish ativo.

### FALTA (rodada 7)
- sectionsMarkdown.ts: adicionar GUIDE_SECTIONS + ROUTER_SECTIONS.
- Decisions.tsx: adicionar DD-15 ao array (status "Homologada"? ou "Pendente" — usuário pediu registrar; DD-11/12/13/14 já Homologadas registradas em 14/08/2026; DD-15 homologada hoje 14/08/2026). Atualizar contagem 14 → 15 em Decisions.tsx e siteData (home/historico métricas "14 DECISÕES" → "15").
- Phase19.tsx: preparar slots A–D como "roteiro executado preenchível" — aguardando plano executado real (usuário disse "preenchendo com plano executado" mas não enviou os arquivos; manter disciplina: não inventar corpo). Talvez atualizar checklist/labels para refletir "aguardando corpo do build".
- Rodar tsc, screenshots (/historico, /decisoes, /guia-cpp, /message-router), checkpoint, entrega.
- F19: versão do projeto v1.9.0 — o carimbo da página F19 é "v1.9.0 · em homologação"; homologação REAL depende do plano executado que o usuário vai enviar.

### Progresso atualizado (rodada 7) — checkpoint anterior c9968624
- [x] Skill atualizada + validada (sandbox-framework-review)
- [x] sectionsMarkdown.ts: GUIDE_SECTIONS (sfdg-01..08) + ROUTER_SECTIONS (modos/tabela/prioridades/invariantes/fase-18) adicionados e exportados em SECTION_COPY_SOURCES.
- [x] DD-15 adicionada ao Decisions.tsx (status Homologada, homologatedAt 2026-08-14, version "v1.9.0 · planejada").
- [x] History.tsx: contagem 15 decisões; DD-15 no grupo v1.8.0; grupo "v1.9.0 · planejada" = apenas DD-11 (duplicata removida).
- [x] SearchPalette.tsx: DD-15 indexada (grupo decisoes).
- [x] Home.tsx: "ver as 15 decisões DD?" corrigido.
- [x] tsc limpo.
- [ ] Falta: (Fase 3 do plano) Phase19.tsx — atualizar para preparar homologação v1.9.0 (slots A–D aguardando plano executado real; usuário NÃO enviou os arquivos, manter disciplina); (Fase 4) screenshots (/decisoes, /guia-cpp, /message-router, /historico), checkpoint, entrega.
- Nota F19: o carimbo atual é "v1.9.0 · em homologação"; homologação real depende do build + SBUITests 34/34. Na entrega, esclarecer ao usuário que o plano executado real precisa ser enviado.

## Rodada 8 (em andamento) — DD-16, Copiar Seção, toast ⌘⇧C
Estado até agora:
- [x] SKILL.md sandbox-framework-review atualizada (DD-16, portas de homologação, botões Copiar Seção) e validada.
- [x] DD-16 adicionada ao Decisions.tsx após DD-15 (formato: problem/decision/rejected/consequence/precedent, status Homologada 2026-08-14, version "v1.9.0 · planejada").
- [x] Contagens 15→16: Home ("> ver as 16 decisões DD?"), History METRICS (16 decisões), History intro ("cruza as 16 decisões").
- [x] DD-16 adicionada à busca global (SearchPalette.tsx DECISIONS, keywords "dd-16 homologação slots auditáveis contrato build fase futura f19").
- [x] History.tsx: DD-15 movida para grupo "v1.9.0 · planejada" (estava erradamente em v1.8.0), DD-16 adicionada ao mesmo grupo.
- [ ] Falta: botões "Copiar Seção" ao lado dos títulos de seção no Guia C++ (Guide.tsx, ids sfdg-01..08) e Message Router (MessageRouter.tsx, ids modos/tabela/prioridades/invariantes/fase-18). Usar extractSectionMarkdown de sectionsMarkdown.ts + toast sonner. Criar componente reutilizável CopySectionButton.
- [ ] Falta: validar toast do ⌘⇧C nas 4 páginas técnicas (handler unificado DocsLayout.tsx — já dispara toast "Seção técnica copiada" para sectionSource; conferir que /guia-cpp e /message-router entram em sourceForRoute).
- [ ] Falta: tsc final, screenshots (/guia-cpp, /message-router, /decisoes), checkpoint, entrega.

Detalhes técnicos:
- Guide.tsx usa seções com id="sfdg-01"..08 (divs ou section). MessageRouter.tsx ids: modos, tabela, prioridades, invariantes, fase-18.
- sectionsMarkdown.ts: SOURCE_MAP (routes: /manual, /especificacao, /guia-cpp, /message-router) com ids e labels; extractSectionMarkdown(source, id) retorna string Markdown do DOM até o próximo id.
- DocsLayout.tsx: sourceForRoute(location) retorna source de SECTION_SOURCES por rota; toast já implementado no handler ⌘⇧C (linhas ~252-254: "Seção técnica copiada").
- Checkpoint anterior: a53415cc. Auto-publish ativo.


## Rodada 9 — /fase-19-umg + trechos Vault copiáveis (em andamento)

### Contexto chave (não perder)
- Usuário pediu: códigos reais dos slots A-D na F19 + página UMG + trechos Vault.
- Códigos reais AINDA NÃO recebidos (não anexou .cpp/.h nesta sessão). F19 continua "porta de homologação".
- Usuário confirmou "pode continuar" → executar itens que não dependem dos binários.

### Decisões desta rodada
- Página /fase-19-umg: documenta os WBPs (WBP_StatusHUD, WBP_InteractionPrompt, WBP_AbilityBar, WBP_InventoryGrid) do implementation_plan.md como EXECUÇÃO PARALELA NO EDITOR, fora do escopo da F19 (DD-17). Link na timeline /historico como nota paralela.
- Trechos Vault copiáveis: blocos exatos para colar no 00_Sandbox_Framework_Dashboard.md e task.md (F19 em execução → homologada), com botão copiar. Carimbo definitivo v1.9.0 só quando códigos reais chegarem.

### Dados do plano UMG (do implementation_plan.md enviado, resumo)
- Widgets UMG: WBP_StatusHUD (vida/mana), WBP_InteractionPrompt (hold), WBP_AbilityBar (habilidades/cooldowns), WBP_InventoryGrid (slots inventário)
- Infraestrutura C++ de suporte = Fase 18 (USBEventSubsystem, payloads UObject DD-04, anti-spill DD-05, 4 eventos canônicos DD-06, throttle 60Hz DD-07, unsubscribe cirúrgico DD-02)
- Montagem por binários .uasset no editor pelo usuário

### Progresso fase 1 (rodada 9)
- Phase19Umg.tsx CRIADO (/fase-19-umg): hero FASE 19 · UMG, TOC 5 seções (dd-17, diretrizes, widgets, hud, verificacao), 4 guias WBP_GUIDES (WBP_StatusHUD, WBP_InteractionPrompt, WBP_AbilityBar, WBP_InventoryGrid) com CopyButton por guia + botão Copiar nota VAULT_NOTE; AuditNotes anti-spill; link para /fase-19 e /historico; BackToTop. tsc OK.
- FALTA: rota em App.tsx, chip "12 · UMG" no NAV_CHIPS (DocsLayout), link na timeline do History.tsx (nota paralela), indexação na busca (SearchPalette), seção VAULT_SNIPPETS (trechos Dashboard + task.md copiáveis) — decidir onde (página própria /vault-sync ou seção na F19).

### Estado da skill
- SKILL.md atualizada até DD-17 (rodada 8). Precisa registrar: página /fase-19-umg (nota paralela), trechos Vault copiáveis, estado de F19 aguardando códigos.

### Padrões de componentes existentes (reusar)
- DocsLayout NAV_CHIPS: adicionar chip "12 · UMG" (sheet mobile + ⌘K; desktop top-6 não muda); rota em App.tsx
- PhaseStamp: phase, version, warn; CopyButton: { value, label?, onCopy? }; AuditNote tone; TechRule label
- TOC lateral: useActiveSection + scroll-mt-24 nas h2; seções com id
- History.tsx: PHASES (siteData) timeline + SECTION_NOTES/linha de notas paralelas; METRICS "17 decisões"; DD_BY_VERSION
- Decisões: 17 DDs (01..17), DD-17 = divergência UMG vs DD-08 Rota A
