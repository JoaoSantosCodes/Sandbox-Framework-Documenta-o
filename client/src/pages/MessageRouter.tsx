/*
  DESIGN: "Blueprint Técnico" — página de referência do Message Router.
  Linguagem de spec sheet: cabeçalho de documento com metadados mono, tabelas
  com réguas de hachura, TechRule para invariantes, notas de auditoria âmbar.
  Papel quente, tinta grafite, acento verde-engineering.
*/
import { DocsLayout } from "@/components/DocsLayout";
import {
  AuditNote,
  CodeBlock,
  PhaseStamp,
  TechRule,
} from "@/components/Primitives";
import { PHASE18_ACCEPTANCE_V2 } from "@/lib/siteData";

const SEMANTICS = [
  {
    name: "BroadcastMessage<T>",
    semantics: "Instantâneo (fire-and-forget)",
    cache: "Nenhum",
    use: "Transientes: prompts, feedbacks de hit, eventos de tick agregados.",
    code: "GetSubsystem<USBEventSubsystem>()->BroadcastMessage<FOnInteractionAvailable>(Target);",
  },
  {
    name: "PublishState<T>",
    semantics: "Stateful com cache por ator",
    cache: "Por ator (ResetState / ClearStateCacheForActor via ISBResettable)",
    use: "Estado duradouro: equipamento de arma, item equipado no slot, cooldown ativo.",
    code: "GetSubsystem<USBEventSubsystem>()->PublishState<FOnWeaponEquipped>(Owner, Payload);",
  },
];

const EVENTS = [
  { event: "Event.Interaction.Available", alt: "Event.Interaction.Cleared", producer: "07_SandboxInteraction", payload: "USBPawnEventPayload*", mechanics: "Fire-and-forget; anti-spill exige TargetPawn == owning pawn antes de renderizar." },
  { event: "Event.Interaction.Progress", alt: "—", producer: "07_SandboxInteraction", payload: "USBInteractionProgressPayload*", mechanics: "Throttle de 60 Hz no acumulador do TickComponent; protege o Slate de re-render por frame." },
  { event: "Event.Inventory.ItemAdded", alt: "Event.Inventory.ItemRemoved", producer: "08_SandboxInventory", payload: "USBInventoryEventPayload*", mechanics: "Contrato canônico de 4 eventos (compatibilidade reversa com 06_SandboxCombat). Grid assina os quatro." },
  { event: "Event.Inventory.ItemEquipped", alt: "Event.Inventory.ItemUnequipped", producer: "08_SandboxInventory", payload: "USBInventoryEventPayload*", mechanics: "Highlight de slot no HUD; ItemInstance como UObject* (GC + casting em Blueprint)." },
  { event: "Event.Attribute.Changed", alt: "—", producer: "05_SandboxCharacter", payload: "USBAttributeChangedPayload*", mechanics: "Ponto de injeção: dentro de ModifyAttributeBaseValue, sem duplicar escritas." },
  { event: "Event.Ability.CooldownStarted", alt: "Event.Ability.CooldownEnded", producer: "05_SandboxCharacter", payload: "USBPawnEventPayload*", mechanics: "Overlay de cooldown sem polling — polling violaria o princípio de desacoplamento." },
  { event: "Event.Combat.WeaponEquipped", alt: "Event.Combat.AmmoDepleted", producer: "06_SandboxCombat", payload: "USBPawnEventPayload*", mechanics: "Ícone de arma ativa e feedback de munição esgotada." },
  { event: "Event.Combat.DamageReceived", alt: "—", producer: "06_SandboxCombat (ponto autoritativo)", payload: "USBPawnEventPayload*", mechanics: "Indicador direcional por 1,5 s; exige publicação no ponto autoritativo de dano." },
];

const PRIORITIES = [
  { label: "High", value: "0", semantics: "Gameplay crítico: lógica de rede e gameplay que NÃO espera pela UI.", example: "RPCs de validação, lock de interação" },
  { label: "Medium", value: "10", semantics: "Extensões dependentes de reação rápida.", example: "Consumo de recurso pós-hitscan" },
  { label: "Low", value: "20", semantics: "Consumidor de baixa prioridade — gameplay nunca espera pela UI.", example: "09_SandboxUI (todos os widgets)" },
  { label: "Lowest", value: "30", semantics: "Diagnóstico e telemetria.", example: "10_SandboxDebug, logs estruturados" },
];

const RULES = [
  { title: "Produtores e consumidores estritamente separados", body: "O 09_SandboxUI nunca faz #include de 05/06/07/08 e nunca lê estado de gameplay por reflexão por string. A única superfície de comunicação são os eventos do USBEventSubsystem e as interfaces leves de 02_SandboxInterfaces." },
  { title: "Prioridade Low para UI", body: "Widgets assina todos os eventos com prioridade Low (20). Gameplay (High/Medium) executa primeiro e nunca bloqueia aguardando resposta de widget." },
  { title: "Anti-spill é obrigatório, não opcional", body: "Eventos broadcast em rede chegam a todos os clients. Todo widget de gameplay valida TargetPawn == owning pawn antes de renderizar — Cenário 2 da SBUITests cobre o mismatch." },
  { title: "Auto-unsubscribe cirúrgico", body: "USBUserWidget rastrea cada assinatura (tag + delegate) em FSBWidgetEventSubscription e remove por delegate individual em NativeDestruct. SubscribeToEvent é idempotente: reinscrição do mesmo delegate é rejeitada." },
  { title: "Payloads vivem em 04_SandboxCore", body: "SBEventPayloads.h centraliza USBPawnEventPayload, USBAttributeChangedPayload, USBInteractionProgressPayload e USBInventoryEventPayload. Construir payloads em 04 — nunca em 09 — mantém o teste de isolamento provável." },
];

export default function MessageRouter() {
  return (
    <DocsLayout>
      <div className="container py-10 max-w-5xl">
        <header className="border-b-2 border-foreground pb-6 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PhaseStamp phase="RF" version="v1.0.0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Documento de referência · Fonte: sfps_specification.md § Gameplay Message Router + plano Fase 18 homologado
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Message Router
            <span className="text-engineering"> — Referência de Eventos</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Contrato vivo entre produtores (extensões de gameplay) e consumidores (UI e debug).
            <code className="font-mono text-[13px]">USBEventSubsystem</code> em 04_SandboxCore;
            dois modos de publicação, quatro prioridades e oito eventos canônicos.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-1">Modos de publicação</h2>
          <p className="text-sm text-muted-foreground mb-5">Os dois primitivos do subsistema e quando usar cada um.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {SEMANTICS.map((s) => (
              <div key={s.name} className="border border-border bg-card">
                <div className="bg-secondary px-4 py-2 border-b border-border flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[13px] font-semibold">{s.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">{s.semantics}</span>
                </div>
                <div className="p-4 space-y-3 text-sm [&_p>span.text-foreground]:text-foreground [&_p]:text-foreground [&_p>span]:text-muted-foreground [&_p>span]:font-mono [&_p>span]:text-[11px] [&_p>span]:uppercase">
                  <p><span className="font-mono text-[11px] text-muted-foreground uppercase">Cache</span> <span className="text-foreground">{s.cache}</span></p>
                  <p><span className="font-mono text-[11px] text-muted-foreground uppercase">Uso</span> <span className="text-foreground">{s.use}</span></p>
                  <CodeBlock path="SBEventPayloads.h">{s.code}</CodeBlock>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-1">Tabela canônica — eventos Event.*</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Evento, produtor autoritativo, payload em <code className="font-mono text-[13px]">SBEventPayloads.h</code> e regra de mecânica.
          </p>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-secondary border-b border-border text-left">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider">Evento</th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider">Produtor</th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider">Payload</th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider">Mecânica</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e.event} className="border-b border-border last:border-0 align-top hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] text-foreground">{e.event}</span>
                      {e.alt !== "—" && (
                        <span className="block font-mono text-[11px] text-muted-foreground mt-0.5">{e.alt}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{e.producer}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{e.payload}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.mechanics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AuditNote tone="warn">
            Os eventos de atributo, cooldown e dano exigem novos pontos de publicação nas extensões
            — a injeção deve ocorrer dentro do caminho autoritativo existente (ex.: ModifyAttributeBaseValue),
            nunca duplicando escritas de estado.
          </AuditNote>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-1">Prioridades de assinatura</h2>
          <p className="text-sm text-muted-foreground mb-5">Gameplay nunca espera pela UI.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIORITIES.map((p) => (
              <div key={p.label} className={`border ${p.label === "Low" ? "border-engineering/60" : "border-border"} bg-card`}>
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <span className={`font-mono text-lg font-bold ${p.label === "Low" ? "text-engineering" : ""}`}>{p.value}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider">{p.label}</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <p className="text-foreground">{p.semantics}</p>
                  <p className="text-muted-foreground text-[13px]">{p.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-1">Invariantes de consumo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            As cinco regras que qualquer novo widget de gameplay deve satisfazer.
          </p>
          <div className="space-y-10">
            {RULES.map((r, i) => (
              <TechRule key={r.title} label={`INVARIANTES · ${String(i + 1).padStart(2, "0")} — ${r.title}`} />
            ))}
          </div>
          <div className="-mt-8 space-y-3 mb-4">
            {RULES.map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground pl-2 border-l-2 border-border">
                <span className="text-foreground">{r.title}</span> — {r.body}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-serif text-2xl font-bold mb-1">Contrato da Fase 18</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Critérios de aceite da UI reativa — validação final antes de homologar <code className="font-mono text-[13px]">v1.8.0</code>.
          </p>
          <div className="border border-border divide-y divide-border">
            {PHASE18_ACCEPTANCE_V2.map((c, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-[10px] text-muted-foreground mt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-foreground">{c}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
