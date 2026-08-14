/*
  DESIGN: "Blueprint Técnico" — página do plano de implantação da Fase 18.
  Coluna assimétrica: conteúdo à esquerda, sumário sticky à direita. Código de primeira classe.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { TopologyDiagram } from "@/components/TopologyDiagram";
import { AuditNote, CodeBlock, PhaseStamp, TechRule, VaultCopyButton, VaultCopyWarning } from "@/components/Primitives";
import { toast } from "sonner";
import { CheckCircle2, Circle, X } from "lucide-react";
import { PhaseChecklist } from "@/components/PhaseChecklist";
import { PHASE18_ACCEPTANCE_V2, PHASE18_EVENTS, PHASE18_WIDGETS } from "@/lib/siteData";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";

const TOC = [
  { id: "regra", label: "Regra de ouro" },
  { id: "topologia", label: "Topologia e desacoplamento" },
  { id: "base", label: "USBUIElement e camadas" },
  { id: "widgets", label: "Hierarquia de widgets" },
  { id: "eventos", label: "Payloads e produtores" },
  { id: "padrao", label: "Padrão de consumo" },
  { id: "verificacao", label: "Verificação" },
  { id: "aceite", label: "Critérios de aceite" },
  { id: "checklist", label: "Checklist interativo" },
  { id: "trechos-vault", label: "Trechos do Vault" },
];

/* Trechos exatos para colar no Vault após a homologação — mantidos como dado
   único, consumidos pelos blocos copiáveis da seção "Trechos do Vault" (id trechos-vault).
   Regra: não colar no Vault antes de o corpo real do build fechar 32/32 + isolamento simétrico. */
const VAULT18_DASHBOARD_SNIPPET = `### Fase 18 Concluída · v1.8.0 (Interface Dinâmica — 09_SandboxUI)
Homologação fechada: SBEventPayloads.h em 04_SandboxCore (UObject, DD-03), USBUIManager como
ULocalPlayerSubsystem (split-screen/listen server), auto-unsubscribe cirúrgico em NativeDestruct
(DD-02), filtro anti-spill em todos os widgets (DD-05), throttle de 60 Hz no hold, grade de
inventário nos 4 eventos canônicos, SBUITests 32/32 (Cenários 1/2) e isolamento simétrico Exit 0.
Decisões DD-04 · DD-05 · DD-06 · DD-07 · DD-02 vigentes. 10 de 11 plugins implementados · 1 em backlog.`;

const VAULT18_TASK_SNIPPET = `## Fase 18 — Interface Dinâmica (v1.8.0)

- [x] 9.1. SBEventPayloads.h em 04_SandboxCore — payloads UObject sem dependência de 06/07/08
- [x] 9.2. USBUIManager como ULocalPlayerSubsystem com instâncias por local player
- [x] 9.3. USBUserWidget + auto-unsubscribe cirúrgico em NativeDestruct (FSBWidgetEventSubscription)
- [x] 9.4. Filtro anti-spill (TargetPawn == GetOwningPlayerPawn) em todos os widgets de gameplay
- [x] 9.5. Throttle 60 Hz no acumulador do hold (USBInteractionComponent::TickComponent)
- [x] 9.6. WBP_InventoryGrid assinando ItemAdded/Removed/Equipped/Unequipped
- [x] 9.7. SBUITests 32/32 — Cenário 1 (unsubscribe/idempotência) + Cenário 2 (TargetPawn mismatch)
- [x] 9.8. Isolamento simétrico: hide 05+06+07+08 → 09 compila; hide 09 → gameplay intacto (Exit 0)
- [x] 9.9. Playtest multiplayer PIE com Gameplay Debugger (F17) auditando vida/mana/hold/grid/cooldown
- [x] 9.10. Carimbo v1.8.0: task.md, Dashboard, walkthrough, V1 Unreal Engine, /fase-18`;

const PHASE18_CHECKLIST_KEY = "sbf-phase18-checklist";

const PHASE18_CHECKLIST_ITEMS = [
  { key: "payloads", label: "SBEventPayloads.h criado em 04_SandboxCore (UObject, GC) — sem #include de 06/07/08" },
  { key: "subsystem", label: "USBUIManager como ULocalPlayerSubsystem — isolamento por local player (split-screen / listen server)" },
  { key: "unsubscribe", label: "Auto-unsubscribe cirúrgico em NativeDestruct (FSBWidgetEventSubscription tag + delegate)" },
  { key: "antispill", label: "Filtro anti-spill em todos os widgets (TargetPawn == GetOwningPlayerPawn())" },
  { key: "throttle", label: "Throttle de 60 Hz no acumulador do hold (USBInteractionComponent::TickComponent)" },
  { key: "inventorio", label: "Grade de inventário assinando os 4 eventos canônicos (ItemAdded/Removed/Equipped/Unequipped)" },
  { key: "sutest", label: "SBUITests verde (32/32 specs) — Cenário 1: unsubscribe/idempotência; Cenário 2: TargetPawn mismatch" },
  { key: "isolamento", label: "Isolamento simétrico: hide 05+06+07+08 → 09 compila; hide 09 → gameplay e suíte preservados" },
  { key: "playtest", label: "Playtest multiplayer: vida/mana, prompt de interação, progresso de hold síncrono, grid e cooldowns" },
  { key: "vault", label: "Vault e site carimbados v1.8.0 (Dashboard, task.md, siteData, manual de uso)" },
];

export default function Phase18() {
  const active = useActiveSection(TOC.map((t) => t.id));
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}>
            FASE 18
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 18 · implantation plan
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="18" version="v1.8.0" warn />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                homologada · 32/32 specs no Vault
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Interface Dinâmica e{" "}
            <em className="not-italic text-engineering">HUD Reativo</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Conversão do plugin <code className="font-mono text-sm">09_SandboxUI</code> na camada de
            apresentação completa e reativa do framework, executando o plano de implantação{" "}
            <code className="font-mono text-sm">implementation_plan.md</code> registrado no Vault do projeto.
          </p>
        </div>
      </section>

      <div className="container py-12 lg:py-16 grid lg:grid-cols-[1fr_240px] gap-10">
        <article className="min-w-0">
          <TechRule label="02.1 · Regra de ouro" />
          <h2 id="regra" className="font-display text-2xl font-bold scroll-mt-24">
            A UI nunca consulta os componentes de gameplay
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            Widgets reagem exclusivamente a eventos publicados no <code className="font-mono text-sm">USBEventSubsystem</code>{" "}
            (Message Router) com payloads tipados. O plugin permanece sem qualquer{" "}
            <code className="font-mono text-sm">#include</code> de 06, 07 ou 08. A leitura pontual de
            estado autoritativo local — por exemplo, a mana do personagem controlado localmente — é feita
            pelas interfaces leves de 02_SandboxInterfaces, nunca por reflexão por string.
          </p>
          <AuditNote tone="info">
            Separação GDT vs. UI de produção, registrada na auditoria da Fase 17:{" "}
            <code className="font-mono text-xs">ISBDebugInterface</code> é ferramenta de diagnóstico; os
            widgets de gameplay consomem apenas eventos do Message Router.
          </AuditNote>

          <TechRule label="02.2 · Topologia" />
          <h2 id="topologia" className="font-display text-2xl font-bold scroll-mt-24">
            Topologia de arquitetura e desacoplamento
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O plugin permanece no nível de Presentation, dependendo apenas de{" "}
            <code className="font-mono text-sm">02_SandboxInterfaces</code> (contratos) e{" "}
            <code className="font-mono text-sm">04_SandboxCore</code> (o Message Router, produtor dos
            eventos). Nenhuma extensão de gameplay é conhecida em tempo de compilação.
          </p>
          <div className="mt-5 border border-border bg-card paper-grain p-5">
            <TopologyDiagram compact />
          </div>

          <TechRule label="02.3 · Camada de camadas" />
          <h2 id="base" className="font-display text-2xl font-bold scroll-mt-24">
            USBUIElement: widget base reativo
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O stub da Fase 5 evolui para <code className="font-mono text-sm">USBUIElement</code> — classe
            abstrata que concentra o contrato de assinatura do Message Router. Widgets de HUD registram-se
            com <code className="font-mono text-sm">ESBEventPriority::Low</code>: a UI é consumidora de
            baixa prioridade, gameplay nunca espera por ela. Cada widget faz{" "}
            <code className="font-mono text-sm">Cast&lt;&gt;</code> do payload concreto e ignora silênciosamente
            payloads inesperados.
          </p>
          <CodeBlock path="09_SandboxUI/Classes/Widgets/SBUIElement.h" language="C++">{`UCLASS(Abstract, BlueprintType)
class SANDBOXUI_API USBUIElement : public UUserWidget, public ISBUIElementInterface
{
    GENERATED_BODY()
protected:
    // Registro no OnInitialized; prioridade padrão Low (HUD)
    virtual void RegisterEventBindings();
    // OnDestruct garante o unregister — simetria Enter/Exit
    virtual void UnregisterEventBindings();
    UFUNCTION() virtual void OnGameplayEvent(FGameplayTag EventTag, UObject* Payload);
};`}</CodeBlock>
          <p className="leading-relaxed max-w-3xl">
            O <code className="font-mono text-sm">USBUIManager</code> gerencia camadas priorizadas{" "}
            <code className="font-mono text-sm">Game / Modal / Debug</code> com push/pop simétrico: uma
            camada Modal pausa widgets de Game sem destruí-los, e{" "}
            <code className="font-mono text-sm">OnPlayerRemoved</code> / <code className="font-mono text-sm">OnOwnerDestroyed</code>{" "}
            removem widgets órfãos em disconnect e respawn. Todos os métodos de mutação seguem
            validar-antes-de-mutar — nunca existe um caminho onde um widget fica "meio adicionado".
          </p>

          <TechRule label="02.5 · Hierarquia" />
          <h2 id="widgets" className="font-display text-2xl font-bold scroll-mt-24">
            Hierarquia de widgets por domínio
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            Todos os widgets herdam de <code className="font-mono text-sm">USBUserWidget</code> e escutam
            apenas os eventos canônicos já documentados pelas extensões — sem criar novos eventos nem
            exigir código novo além dos produtores listados na seção seguinte. O grid de inventário assina
            os quatro eventos <code className="font-mono text-sm">ItemAdded/Removed/Equipped/Unequipped</code>{" "}
            individualmente para reconstruir os slots, preservando a compatibilidade com o Combate.
          </p>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Widget</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Eventos escutados</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Comportamento visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                {PHASE18_WIDGETS.map((w) => (
                  <tr key={w.widget} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">{w.widget}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{w.events.join(", ")}</td>
                    <td className="px-4 py-3">{w.visual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TechRule label="02.6 · Produtores" />
          <h2 id="eventos" className="font-display text-2xl font-bold scroll-mt-24">
            Payloads de evento e extensão permitida dos produtores
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O manifesto proíbe extensões de conhecer o 09_SandboxUI, mas permite que extensões publiquem
            novos eventos no Message Router — adição de produtor, não dependência. Os novos eventos são
            criados nas próprias extensões (05/06/08), com payloads declarados na extensão produtora ou
            em 02_SandboxInterfaces. Os payloads concretos vivem em <code className="font-mono text-sm">SBEventPayloads.h</code>{" "}
            (04_SandboxCore).
          </p>
          <AuditNote tone="info">
            Design Decision — payloads <code className="font-mono text-xs">UObject*</code> em vez de
            structs leves: classes derivadas de UObject (ex: <code className="font-mono text-xs">USBAttributeChangedPayload</code>)
            têm ciclo de vida gerenciado pelo Garbage Collector e suportam casting dinâmico e reflexão
            diretamente nos gráficos de Blueprint das classes UMG — simplificando o design-workflow no
            editor. Para o item de inventário, o payload carrega <code className="font-mono text-xs">UObject* ItemInstance</code>
            em vez do tipo concreto <code className="font-mono text-xs">USBItemInstance</code>: mantém
            acoplamento zero em compilação, e o cast é feito em runtime nos gráficos de Blueprint, onde o
            acoplamento é permitido.
          </AuditNote>
          <AuditNote tone="warn">
            Throttling do Tick de interação: <code className="font-mono text-xs">Event.Interaction.Progress</code> é
            publicado no <code className="font-mono text-xs">TickComponent</code> do hold com acumulador de tempo —
            taxa máxima de 60 Hz (~0,016s), poupando o Slate de re-renders por frame.
          </AuditNote>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Evento</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Produtor</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Existe?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                {PHASE18_EVENTS.map((e) => (
                  <tr key={e.event} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{e.event}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{e.producer}</td>
                    <td className="px-4 py-3">{e.purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {e.exists ? (
                        <span className="inline-flex items-center gap-1 text-engineering text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Já publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-warn text-xs font-semibold">
                          <Circle className="h-3.5 w-3.5" /> Novo produtor
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AuditNote tone="warn">
            <code className="font-mono text-xs">Event.Combat.DamageReceived</code> exige que o ponto
            autoritativo de dano no Hitscan passe a publicar o evento. Alternativa aprovável: adiar o{" "}
            <code className="font-mono text-xs">USBUIDamageIndicator</code> para uma Fase 19 e fechar a 18
            com Prompt, Inventário, Arma e Cooldowns. Escopo confirmado na execução: widgets de gameplay
            com filtro anti-spill são requisito obrigatório; indicador de dano fica para a Fase 19.
          </AuditNote>

          <TechRule label="02.7 · Padrão de consumo" />
          <h2 id="padrao" className="font-display text-2xl font-bold scroll-mt-24">
            Padrão de consumo: exemplo canônico do prompt
          </h2>
          <CodeBlock path="09_SandboxUI/Widgets/UIPrompt/SBUIPromptWidget.cpp" language="C++">{`void USBUIPromptWidget::RegisterEventBindings()
{
    USBEventSubsystem* Events = GetSubsystem<USBEventSubsystem>();
    Events->SubscribeToEvent(FSBGameplayTags::Get().Event_Interaction_Available,
        ESBEventPriority::Low,
        FSBBlueprintEventDelegate::CreateUObject(this, &USBUIPromptWidget::OnInteractionAvailable));
    // ... Cleared / Progress
}

void USBUIPromptWidget::OnInteractionAvailable(FGameplayTag EventTag, UObject* Payload)
{
    const USBInteractionProgressPayload* Data =
        Cast<USBInteractionProgressPayload>(Payload);
    if (!Data || Data->TargetPawn != GetOwningPlayerPawn()) return; // anti-spill
    ShowPrompt(Data->PromptText, Data->Duration);
}`}</CodeBlock>
          <AuditNote tone="err">
            A validação <code className="font-mono text-xs">Data-&gt;TargetPawn == GetOwningPlayerPawn()</code>{" "}
            é crítica: eventos de interação são broadcast para todos os clients. Sem o filtro, o prompt do
            Jogador 2 apareceria na tela do Jogador 1. Este cenário virou o Cenário 2 da suíte{" "}
            <code className="font-mono text-xs">SBUITests</code> (TargetPawn mismatch descartado sem reação).
          </AuditNote>

          <TechRule label="02.8 · Verificação" />
          <h2 id="verificacao" className="font-display text-2xl font-bold scroll-mt-24">
            Plano de verificação — espelha a Fase 17, mais forte
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O teste de isolamento desabilita <strong>as quatro extensões simultaneamente</strong> (05+06+07+08)
            via renomeação de pasta + <code className="font-mono text-sm">.uplugin_disabled</code>, e recompila
            confirmando que o <code className="font-mono text-sm">09_SandboxUI</code> sai verde — prova de que
            os widgets só escutam eventos e não incluem cabeçalhos de gameplay. O teste inverso — desabilitar o
            09 — deve preservar toda a lógica de gameplay e a suíte.
          </p>
          <p className="mt-4 leading-relaxed max-w-3xl">
            A suíte nova <code className="font-mono text-sm">SBUITests</code> abre com dois cenários
            automatizados: <strong>Cenário 1</strong> valida o auto-unsubscribe cirúrgico e a idempotência
            (destruir o widget remove suas inscrições sem afetar outros ouvintes); <strong>Cenário 2</strong>{" "}
            dispara um evento de atributo direcionado ao Pawn B e valida que o widget do Player A descarta o
            evento (TargetPawn mismatch). O playtest manual cobre barra de vida/mana, prompt e progresso de
            hold síncrono, grid de inventário instantâneo e overlay de cooldown em segundos decrescentes —
            com o Gameplay Debugger da Fase 17 como instrumento de auditoria lado a lado em PIE.
          </p>

          <TechRule label="02.9 · Aceite" />
          <h2 id="aceite" className="font-display text-2xl font-bold scroll-mt-24">
            Critérios de aceite da Fase 18
          </h2>
          <ul className="mt-5 space-y-2.5 max-w-3xl">
              {PHASE18_ACCEPTANCE_V2.map((c, i) => (
              <li key={c} className="flex gap-3 text-sm leading-relaxed" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="font-mono text-xs text-engineering font-semibold w-6 shrink-0 pt-0.5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>

          <TechRule label="03.0 · Checklist interativo" />
          <h2 id="checklist" className="font-display text-2xl font-bold scroll-mt-24">
            Checklist interativo da Fase 18
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            Marca o progresso da execução item a item; o estado é salvo automaticamente no navegador e pode
            ser exportado como texto para o relatório do Vault pelo botão <code className="font-mono text-xs">Copiar status</code>.
          </p>
          <PhaseChecklist
            phaseLabel="Fase 18 — Interface Dinâmica e HUD Reativo (v1.8.0)"
            storageKey={PHASE18_CHECKLIST_KEY}
            items={PHASE18_CHECKLIST_ITEMS}
            completeMessage="Checklist completo — Fase 18 pronta para homologação final (9/9 itens, v1.8.0)."
          />

          <TechRule label="03.1 · Trechos do Vault" />
          <h2 id="trechos-vault" className="font-display text-2xl font-bold scroll-mt-24">
            Trechos do Vault
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Os dois blocos abaixo são os trechos exatos para colar nos documentos do Vault — mas com a mesma
            regra dura da Fase 19: a colagem só é válida depois da homologação real (corpo do build compilado,
            SBUITests 32/32 e isolamento simétrico com Exit Code 0). O aviso está embutido no toast de cada botão.
          </p>
          <VaultCopyWarning />
          <div className="mt-4 space-y-4">
            <div className="border border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
                <span className="font-mono text-[11px] text-engineering">
                  00_Sandbox_Framework_Dashboard.md · F18 homologada · v1.8.0
                </span>
                <VaultCopyButton
                  label="Copiar"
                  value={VAULT18_DASHBOARD_SNIPPET}
                  toastTitle="Trecho do Dashboard copiado"
                  toastDesc="Cole no 00_Sandbox_Framework_Dashboard.md APENAS após a homologação real (32/32 specs + isolamento simétrico Exit Code 0)."
                />
              </div>
              <CodeBlock path="00_Sandbox_Framework_Dashboard.md · Fase 18 Concluída · v1.8.0" language="text">
                {VAULT18_DASHBOARD_SNIPPET}
              </CodeBlock>
            </div>
            <div className="border border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
                <span className="font-mono text-[11px] text-engineering">task.md · itens da Fase 18</span>
                <VaultCopyButton
                  label="Copiar"
                  value={VAULT18_TASK_SNIPPET}
                  toastTitle="Trecho do task.md copiado"
                  toastDesc="Cole no task.md APENAS após a homologação real — substituir os itens de planejamento pelos checkados."
                />
              </div>
              <CodeBlock path="task.md · Fase 18 (checklist pós-homologação)" language="text">
                {VAULT18_TASK_SNIPPET}
              </CodeBlock>
            </div>
          </div>
        </article>

        {/* Sumário sticky */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 border border-border bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Índice · Plano F18
            </div>
            <ul className="mt-3 space-y-2">
              {TOC.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className={`text-sm transition-colors ${
                      active === t.id
                        ? "text-engineering font-semibold"
                        : "text-muted-foreground hover:text-engineering"
                    }`}
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
