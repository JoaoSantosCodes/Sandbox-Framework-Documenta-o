/*
  FASE 19 — EXECUÇÃO PARALELA UMG (WBP_* no editor)
  DESIGN: "Blueprint Técnico" — nota paralela à porta de homologação v1.9.0 (DD-17).
  Este documento NÃO altera o escopo da Fase 19 (indicador de dano, DD-08 vigente):
  registra os Widget Blueprints montados no editor como execução paralela de conteúdo,
  cujo suporte C++ (09_SandboxUI + Fase 18) já está homologado.
  Papel quente, tinta grafite, acento verde-engineering.
*/
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import { AuditNote, CodeBlock, CopyButton, PhaseStamp, TechRule } from "@/components/Primitives";
import { toast } from "sonner";

const TOC = [
  { id: "dd-17", label: "01 · Posição na homologação (DD-17)" },
  { id: "diretrizes", label: "02 · Diretrizes de montagem" },
  { id: "widgets", label: "03 · Widgets WBP" },
  { id: "hud", label: "04 · Integração HUD" },
  { id: "verificacao", label: "05 · Verificação (Playtest)" },
];

/* Guias de montagem dos WBPs — extraídos do plano executado enviado ao Vault.
   Cada guia carrega o grafo de eventos, os casts e o filtro anti-spill obrigatório (DD-05). */
interface WbpGuide {
  slug: string;
  nome: string;
  purpose: string;
  eventos: string[];
  grafo: string;
}

const WBP_GUIDES: WbpGuide[] = [
  {
    slug: "wbp-statushud",
    nome: "WBP_StatusHUD",
    purpose: "Barras de vida e mana (PB_Health, PB_Mana). Herda de USBUserWidget.",
    eventos: ["Event.Attribute.Changed → OnAttributeChanged(FGameplayTag, UObject*)"],
    grafo: `// Event Graph — WBP_StatusHUD (Custom Event OnAttributeChanged)
1. Cast Payload → USBAttributeChangedPayload; Cast Failed → early return
2. Anti-spill (DD-05): TargetPawn == GetOwningPlayerPawn() ? senão abortar
3. Payload->AttributeTag:
   - Attribute.Character.Health → PB_Health->SetPercent(CurrentValue / MaxHealthValue)
   - Attribute.Mana           → PB_Mana->SetPercent(CurrentValue / MaxManaValue)`,
  },
  {
    slug: "wbp-interactionprompt",
    nome: "WBP_InteractionPrompt",
    purpose: "Prompt de interação (TXT_Prompt) e barra de hold (PB_HoldProgress). Herda de USBUserWidget.",
    eventos: [
      "Event.Interaction.Available → mostra o prompt",
      "Event.Interaction.Progress → atualiza PB_HoldProgress",
      "Event.Interaction.Cleared → esconde o prompt",
    ],
    grafo: `// Event Graph — WBP_InteractionPrompt
Available: Cast Payload → USBInteractionAvailableEventPayload; anti-spill (DD-05);
  SetVisibility(HitTestInvisible); TXT_Prompt->SetText(PromptText);
  PB_HoldProgress->SetVisibility(Collapsed)
Progress: Cast Payload → USBInteractionProgressEventPayload; anti-spill;
  Duration > 0 → PB_HoldProgress visível + SetPercent(ProgressPct)   // 60 Hz (DD-07)
Cleared:   Cast Payload → USBPawnEventPayload; anti-spill;
  SetVisibility(Collapsed)`,
  },
  {
    slug: "wbp-abilitybar",
    nome: "WBP_AbilityBar",
    purpose: "Hotbar de habilidades com máscara de cooldown (IMG_CooldownMask) e contador (TXT_CooldownTime). Herda de USBUserWidget.",
    eventos: ["Event.Ability.CooldownStarted", "Event.Ability.CooldownEnded"],
    grafo: `// Event Graph — WBP_AbilityBar
CooldownStarted: Cast Payload → USBCooldownEventPayload; anti-spill;
  filtro Fail-Closed: AbilityTag == WatchedAbilityTag (inválida/diferente → abortar)
  interpolação COSMÉTICA local por frame (Timeline/DeltaTime) — SEM polling de rede;
  assume o tempo da notificação inicial para TXT_CooldownTime
CooldownEnded: Cast Payload → USBCooldownEventPayload; anti-spill;
  filtro Fail-Closed; IMG_CooldownMask → Collapsed; limpar TXT_CooldownTime`,
  },
  {
    slug: "wbp-inventorygrid",
    nome: "WBP_InventoryGrid",
    purpose: "Grid visual de itens (UniformGridPanel/ScrollBox com WBP_InventorySlot). Herda de USBUserWidget.",
    eventos: ["Event.Inventory.SlotUpdated"],
    grafo: `// Event Graph — WBP_InventoryGrid
SlotUpdated: Cast Payload → USBInventoryEventPayload; anti-spill (DD-05);
  cast dinâmico ItemInstance → USBItemInstance (cast falha → limpar o slot);
  ler StackCount + tags dinâmicas; atualizar ícone e quantidade do slot do grid`,
  },
];

/* Trecho para o Vault — registro da nota paralela no Dashboard (copiável). */
const VAULT_NOTE = `<!-- Registrar como nota paralela em 00_Sandbox_Framework_Dashboard.md -->
### Execução paralela — Fase 19 (conteúdo UMG, fora do escopo da homologação v1.9.0)
Montagem, fiação e verificação PIE dos widgets UMG: WBP_StatusHUD, WBP_InteractionPrompt,
WBP_AbilityBar e WBP_InventoryGrid (herdando de USBUserWidget), com WBP_MainHUD / BP_SBHUD /
HUDClass no GameMode de playtest. Infraestrutura C++ de suporte: Fase 18 homologada (DD-04,
DD-05, DD-06, DD-07, DD-02). Referência completa: site /fase-19-umg · DD-17.
Status da homologação v1.9.0 (indicador de dano, DD-08): PENDENTE — aguardando corpos dos
slots A–D e SBUITests 34/34 (ver /fase-19).`;

export default function Phase19Umg() {
  const active = useActiveSection(TOC.map((t) => t.id));
  return (
    <DocsLayout>
      {/* HERO */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}>
            FASE 19 · UMG
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 19-b · execução paralela · nota técnica
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="19" version="nota paralela · DD-17" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                widgets UMG no editor · fora do escopo da homologação v1.9.0
              </span>
            </div>
            <div className="mt-4 flex items-start gap-2.5 border border-engineering/60 bg-engineering/[0.06] px-4 py-3 max-w-3xl">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-engineering" />
              <div className="text-sm leading-relaxed">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering block mb-1">
                  P-3 homologado · Frente 1 concluída · 15/08/2026
                </span>
                <span className="text-muted-foreground">
                  A montagem dos quatro WBPs sobre as backing classes do 09_SandboxUI, os slots com{" "}
                  <code className="font-mono text-[11px]">WatchedAbilityTag</code> e o checklist de playtest
                  Listen Server + Split-Screen foram executados sem erros — <strong className="text-foreground">homologação relatada
                  pelo usuário em 15/08/2026</strong> (nota de origem). O espelhamento no painel de pendências
                  reflete esse relato; o carimbo documental no cofre (Dashboard/task.md/walkthrough.md) fecha
                  a cadeia de homologação do P-3.
                </span>
              </div>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Integração Visual e{" "}
            <em className="not-italic text-engineering">Widgets UMG</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Montagem, fiação lógica e verificação em Play In Editor dos{" "}
            <strong className="text-foreground">Widget Blueprints</strong> que consomem o barramento de eventos da
            Fase 18 homologada — execução paralela de conteúdo, documentada aqui por auditabilidade (DD-17), sem
            alterar o escopo da homologação v1.9.0 do indicador de dano.
          </p>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">
        {/* TOC + índice lateral */}
        <nav aria-label="Índice da página" className="mb-8 border border-border bg-secondary/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">índice da página</div>
          <ol className="mt-3 space-y-1.5">
            {TOC.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className={`font-mono text-sm transition-colors ${active === t.id ? "text-engineering underline underline-offset-4" : "text-foreground/80 hover:text-engineering"}`}
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 01 · Posição na homologação */}
        <h2 id="dd-17" className="mt-10 font-serif text-2xl font-bold scroll-mt-24">
          01 · Posição na homologação (DD-17)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          A decisão DD-17 resolveu a divergência entre o plano de widgets UMG enviado ao Vault e a DD-08
          vigente: a <strong className="text-foreground">Rota A prevalece</strong> — a Fase 19 mantém o indicador direcional de
          dano como escopo de homologação, e os WBPs são <strong className="text-foreground">execução paralela no editor</strong>.
          Como WBPs são arquivos binários <code className="font-mono text-sm">.uasset</code>, a montagem cabe ao
          desenvolvedor no Unreal Editor seguindo as diretrizes abaixo; a infraestrutura C++ de suporte
          (<code className="font-mono text-sm">09_SandboxUI</code>, Fase 18 homologada) já está fechada.
        </p>
        <div className="mt-4 border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              vault · 00_Sandbox_Framework_Dashboard.md — nota paralela copiável
            </span>
            <CopyButton
              label="Copiar nota"
              value={VAULT_NOTE}
              onCopy={() => toast("Nota do Vault copiada", { description: "Cole em 00_Sandbox_Framework_Dashboard.md como nota paralela." })}
            />
          </div>
          <div className="mt-3 overflow-x-auto">
            <CodeBlock path="00_Sandbox_Framework_Dashboard.md · Execução paralela F19 (UMG)" language="text">
              {VAULT_NOTE}
            </CodeBlock>
          </div>
        </div>

        {/* 02 · Diretrizes de montagem */}
        <h2 id="diretrizes" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          02 · Diretrizes de montagem
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Todos os widgets nascem no diretório de Content do projeto (ex: <code className="font-mono text-sm">/Content/UI/</code>)
          herdando da classe base C++ <code className="font-mono text-sm">USBUserWidget</code>. Três contratos herdados da
          infraestrutura homologada valem para todo o grafo de eventos:
        </p>
        <div className="mt-4 space-y-3">
          <AuditNote tone="info">
            <strong className="text-foreground">Null check + cast antes de qualquer leitura</strong> — cast do payload para a
            classe esperada com early return no pino Cast Failed, evitando "Accessed None" no PIE.
          </AuditNote>
          <AuditNote tone="info">
            <strong className="text-foreground">Anti-spill obrigatório (DD-05)</strong> — todo handler valida{" "}
            <code className="font-mono text-sm">Payload-&gt;TargetPawn == GetOwningPlayerPawn()</code> antes de tocar na UI;
            é esse filtro que isola os HUDs individuais no Split-Screen.
          </AuditNote>
          <AuditNote tone="info">
            <strong className="text-foreground">Cosmética local, sem polling</strong> — a UI assume o tempo recebido na notificação
            inicial do evento e interpola por frame (Timeline/DeltaTime); nunca requisita o estado atual à rede.
          </AuditNote>
        </div>

        {/* 03 · Widgets WBP */}
        <h2 id="widgets" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          03 · Widgets WBP
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Quatro WBPs cobrem o HUD de gameplay. Cada guia abaixo traz os eventos assinados e o grafo de lógica
          esperado no Event Graph — extraídos do plano executado enviado ao Vault.
        </p>
        <div className="mt-6 space-y-4">
          {WBP_GUIDES.map((w) => (
            <div key={w.slug} className="border border-border">
              <div className="px-4 py-2 border-b border-border/60 bg-secondary/60 flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-engineering">{w.nome}</span>
                <CopyButton
                  label="Copiar guia"
                  value={`=== ${w.nome} ===\n\nPropósito: ${w.purpose}\nEventos: ${w.eventos.join("; ")}\n\n${w.grafo}`}
                  onCopy={() => toast(`${w.nome}: guia copiado`, { description: "Eventos e grafo de lógica prontos para o Vault." })}
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{w.purpose}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {w.eventos.map((e) => (
                    <span key={e} className="font-mono text-[10px] uppercase tracking-[0.12em] border border-border bg-secondary/60 px-2 py-0.5 text-muted-foreground">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-4">
                <CodeBlock path={`${w.nome} · Event Graph`} language="cpp">
                  {w.grafo}
                </CodeBlock>
              </div>
            </div>
          ))}
        </div>

        {/* 04 · Integração HUD */}
        <h2 id="hud" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          04 · Integração HUD e Viewport Setup
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          A montagem da HUD principal agrega os quatro widgets em um canvas único, ligado ao GameMode de
          playtest pelo caminho nativo <code className="font-mono text-sm">ASBHUD::BeginPlay</code>:
        </p>
        <div className="mt-4">
          <CodeBlock path="WBP_MainHUD · BP_SBHUD · GameMode de Playtest" language="text">{`1. WBP_MainHUD — Canvas contendo as instâncias de WBP_StatusHUD, WBP_InteractionPrompt,
   WBP_AbilityBar e WBP_InventoryGrid alinhadas na tela.
2. BP_SBHUD — Blueprint herdando de ASBHUD (04_SandboxCore) com MainHUDWidgetClass
   = WBP_MainHUD.
3. GameMode de Playtest — HUDClass = BP_SBHUD; ASBHUD::BeginPlay instancia e adiciona
   o widget de forma nativa (ULocalPlayerSubsystem / DD-01, um HUD por local player).`}</CodeBlock>
        </div>

        {/* 05 · Verificação */}
        <h2 id="verificacao" className="mt-12 font-serif text-2xl font-bold scroll-mt-24">
          05 · Verificação (Playtest Visual)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Duas baterias de playtest — single-player PIE e Split-Screen com dois jogadores locais — fecham a
          verificação visual. A segunda bateria é a que prova o contrato mais crítico do projeto: o
          <strong className="text-foreground"> controle de spill</strong> entre HUDs. <strong className="text-foreground">Resultado
          (15/08/2026, relatado pelo usuário):</strong> o checklist foi executado sem erros — Listen Server
          com dois clientes isolados e Split-Screen com zero spill cruzado, validando os itens P-3.1,
          P-3.2 e P-3.3 do documento oficial <code className="font-mono text-[11px]">pendencias_de_fases.md</code>.
        </p>
        <div className="mt-4 space-y-3">
          <AuditNote tone="info">
            <strong className="text-foreground">Verificação 1 — PIE 1 Player:</strong> sprint/habilidades decrementam mana
            instantaneamente; dano reduz a barra de vida; mirar em porta/baú exibe o prompt e a barra de hold
            enche proporcionalmente; habilidade (ex: Teleport) mostra cooldown em segundos decrescentes; coletar
            itens adiciona slots dinâmicos com quantidades corretas.
          </AuditNote>
          <AuditNote tone="warn">
            <strong className="text-foreground">Verificação 2 — Split-Screen PIE 2 Players:</strong> ambos os jogadores
            atualizam seus HUDs individuais (Jogador 1 gasta mana → HUD 1 atualiza; Jogador 2 mira em baú →
            prompt 2 aparece) e, crucialmente, o Jogador 1 <strong className="text-foreground">não recebe nem reflete</strong> as
            atualizações do Jogador 2 — prova do filtro <code className="font-mono text-sm">TargetPawn == GetOwningPlayerPawn()</code>.
          </AuditNote>
        </div>

        <TechRule label="Nota de escopo (DD-17)" />
        <AuditNote tone="warn">
          Esta página documenta a execução paralela de conteúdo — os WBPs não alteram o carimbo de homologação
          da Fase 19. A versão v1.9.0 fecha quando o indicador direcional de dano (porta de homologação em{" "}
          <Link href="/fase-19" className="text-engineering underline underline-offset-4">/fase-19</Link>) receber os
          corpos reais dos quatro slots e a suíte SBUITests 34/34. O <strong className="text-foreground">P-3 (Frente 1 ·
          Montagem Visual UMG)</strong> segue como pendência oficial do Vault concluída por relato, e o próximo
          marco da ordem de execução é o <Link href="/pendencias" className="text-engineering underline underline-offset-4">P-4
          (Infraestrutura de Rede)</Link>.
        </AuditNote>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link href="/fase-19" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-engineering transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Porta de homologação v1.9.0
          </Link>
          <Link href="/historico" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-engineering transition-colors">
            Linha do tempo do framework <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <BackToTop />
    </DocsLayout>
  );
}
