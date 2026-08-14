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
