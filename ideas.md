# Brainstorm de Design — Sandbox Framework Docs

## Três abordagens consideradas

### 1. "Blueprint Técnico" — Editorial de Engenharia
Estética inspirada em manuais técnicos de motores AAA e blueprint da Unreal: papel claro quente, linhas de grade fina, tipografia serifada display + mono para código, diagramas de dependência como elemento hero. Emoção: documentação de especificação oficial, séria e precisa.
**Probabilidade: 0.07**

### 2. "Cockpit do Debugger" — Terminal Dark
Fundo escuro de terminal, verde/âmbar fosforescente, estética do próprio Gameplay Debugger. Emoção: ferramenta para engenheiros, dentro do jogo.
**Probabilidade: 0.03**

### 3. "Schematic Industrial" — Desenho técnico CAD
Traços finos, hachuras, carimbos de revisão, cotas e anotações como em desenho industrial. Emoção: precisão mecânica,图纸 de engenharia.
**Probabilidade: 0.05**

---

## Abordagem escolhida: 1. "Blueprint Técnico" — Editorial de Engenharia

**Design Movement**: Editorial técnico de especificação (Swiss typographic + manual de engenharia aeronáutica). Referências: documentação da Lyra/Unreal, manuais MIL-spec, "The Design of Everyday Things".

**Core Principles**:
1. Precisão tipográfica: hierarquia clara, números de fase monoespaçados, labels em caps espaçados.
2. O código C++ é cidadão de primeira classe: blocos com realce, fonte mono dedicada.
3. Diagrama de topologia de plugins como elemento estrutural permanente (aparece em várias páginas).
4. Conteúdo denso mas respirado: margens generosas, colunas assimétricas.

**Color Philosophy**: Papel técnico quente (off-white #F7F5F0) como base — remete a especificação impressa. Tinta grafite profunda (quase-preto azulado) para texto. **Assinatura**: verde-engineering escuro (oklch ~0.45 0.09 165, um verde "terminal fosforescente desaturado", ecoando o markup {cyan} do GDT mas em tinta) para acentos, estados "verde" de testes e links. Âmbar para avisos/bloqueantes de auditoria, vermelho contido para erros. Intenção: sério, auditável, sem brilho de startup.

**Layout Paradigm**: Assimétrico em duas colunas — sidebar fixa de navegação por documento (esquerda, estreita, tipo sumário de especificação) + conteúdo principal com margem direita para anotações de auditoria ("nota de revisor"). Hero da home é um diagrama Mermaid-like da topologia de plugins desenhado em SVG nativo, não imagem.

**Signature Elements**:
1. "Carimbo de fase": badge monoespaçado com numeração (F17 · v1.7.0) em todos os cards de fase.
2. Linha de régua horizontal fina com marcações (tickle marks) separando seções, como régua de desenho técnico.
3. Bloco de código com barra lateral esquerda em verde e label do arquivo (Plugin/Path).

**Interaction Philosophy**: Navegação instantânea, sem animação em cliques de teclado; hover em cards eleva sutilmente (1px translateY + sombra de papel); âncoras de seção destacadas no scroll.

**Animation**: Entradas com fade+translateY(8px) 200ms ease-out, stagger 40ms; hover de cards 160ms; nada acima de 300ms; respeitar prefers-reduced-motion.

**Typography System**: Display: "Libre Caslon Text" (serifada técnica para títulos de capítulos) — fallback: Georgia. Body: "Source Sans 3". Mono: "JetBrains Mono" para código, numeração de fase e paths. Hierarquia: h1 serif 40px, h2 serif 28px com número de seção, labels mono 11px uppercase tracking-wide.

**Brand Essence**: A especificação viva do Sandbox Framework — documentação de engenharia para quem constrói gameplay multiplayer em UE5.8. Adjetivos: rigoroso, auditável, técnico.

**Brand Voice**: Direto, de engenheiro sênior. Exemplos: "11 plugins. 31 testes verdes. Zero dependências circulares." / "Audite a topologia — cada seta é uma promessa de compilação."

**Wordmark & Logo**: Marca simbólica de três camadas empilhadas (Foundation → Gameplay → Presentation) em verde-engineering, sem texto; wordmark "SANDBOX·FRAMEWORK" em mono caps com ponto central.

**Signature Brand Color**: Verde-engineering oklch(0.45 0.09 165) — "verde de auditoria".

## Style Decisions
- O modelo de navegação é parte da marca: toda página de documentação preserva um layout de especificação assimétrico com trilho de documento à esquerda (índice de seções visível) e notas de auditoria opcionais na margem direita — nunca uma pilha de artigo centralizada pura.
- O wordmark deve aparecer completo em mono caps "SANDBOX·FRAMEWORK" ao lado do símbolo de três camadas verde; nunca truncado com reticências na navegação primária.
- Containers de conteúdo secundário usam linguagem de "spec sheet" — carimbos de fase, metadados mono, réguas técnicas, labels de dependência e cues de auditoria/revisão — em vez de cards genéricos bordados sempre que possível.
