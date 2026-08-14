# Todo — Redesign de layout com referência fuch.ai

## Fase 1 — Análise da referência
Análise da referência fuch.ai concluída (notes-fuch-ai.md); ideas.md atualizado.

## Fase 2 — Aplicação do layout (plano em notes-redesign.md)
- [ ] DocsLayout: header com marca compacta à esquerda + chips de navegação à direita (nav-chip fuch.ai)
- [ ] Home: hero com wordmark gigante como fundo + blocos funcionais nos cantos (terminal, card de status)
- [ ] Home: faixa de métricas como linha mono com separadores; seções com header 2 colunas
- [ ] Rodapé: faixa mono "Trusted by"-like, mantendo sync Vault e checklists compactos
- [ ] Responsividade (mobile 375, 1280, 1440)

## Fase 3 — Verificação e entrega
- [ ] Screenshot em 1280, 1440 e 375 px + revisão visual
- [ ] tsc --noEmit limpo
- [ ] Checkpoint e publicação (auto-publish)
- [ ] Entregar ao usuário


## Rodada: heros restantes + seção ativa + Voltar ao topo
- [ ] Hero wordmark: MessageRouter.tsx (MRT), Manifesto.tsx (MAN), GuideCpp.tsx (SFDG)
- [ ] IntersectionObserver: destaque da seção ativa nos índices laterais (Manual, SFPS, F17/F18/F19)
- [ ] Botão flutuante "Voltar ao topo" nas páginas longas (Manual, SFPS)
- [ ] tsc + screenshots + checkpoint + entrega
- [ ] Atualizar skill sandbox-framework-review e sincronizar sfr_skill.md


## Rodada: Histórico consolidado + busca interna ⌘K + F19 v1.9.0

### Fase 1 — Página /historico (linha do tempo consolidada)
- [ ] Criar `client/src/pages/History.tsx` com timeline F17→F19 + DD-01…DD-14
- [ ] Registrar rota `/historico` em `App.tsx`
- [ ] Atualizar chips de navegação do DocsLayout (verificar renumeração)
- [ ] Hero wordmark gigante (padrão fuch.ai) + índice lateral numerado + BackToTop

### Fase 2 — Busca global ⌘K indexando seções internas (CONCLUÍDA)
- [x] Criar `client/src/lib/sectionsIndex.ts` com ids/labels reais das seções internas
- [x] Integrar seções ao SearchPalette (grupo "Seções internas", ícone Hash)
- [x] scroll-behavior suave + scroll-padding-top 7rem no html (âncoras não ficam sob header sticky)
- [x] scroll-mt-24 adicionado às h2 de Spec.tsx e Guide.tsx

### Fase 3 — Fase 19 v1.9.0 (estrutura de homologação aguardando código real)
- [ ] Reescrever Phase19.tsx: status v1.9.0 · em homologação, sumário executivo da arquitetura
- [ ] Blocos auditáveis com placeholder explicitamente marcado ("aguardando corpo do build"):
  - USBUIDamageIndicator (widget)
  - USBDamageIndicatorSubsystem (publicação autoritativa no 06)
  - SBUITests 32→34 specs
  - Isolação simétrica (hide 06 / hide 09)
- [ ] Checklist atualizado para ciclo de homologação v1.9.0
- [ ] Nota de auditoria: prosa não fecha homologação — exige corpo do código

### Fase 4 — Auditoria final e entrega
- [ ] Screenshots desktop + mobile (/historico, /fase-19, busca)
- [ ] tsc limpo + checkpoint + entrega
