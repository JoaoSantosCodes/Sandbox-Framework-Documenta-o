/*
  DESIGN: "Blueprint Técnico" — página histórica da Fase 17 concluída (v1.7.0).
  Coluna assimétrica: conteúdo à esquerda, sumário sticky à direita. Código de primeira classe.
  Checklist interativo retrospectivo com persistência em localStorage e botões de controle.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, CodeBlock, PhaseStamp, TechRule } from "@/components/Primitives";
import { PhaseChecklist } from "@/components/PhaseChecklist";

const TOC = [
  { id: "plugin", label: "O plugin 10_SandboxDebug" },
  { id: "interface", label: "ISBDebugInterface" },
  { id: "coletor", label: "Coletor nativo do GDT" },
  { id: "telemetria", label: "Telemetria por componente" },
  { id: "gate", label: "Portão de compilação" },
  { id: "isolamento", label: "Isolamento de compilação" },
  { id: "aceite", label: "Critérios de aceite" },
  { id: "checklist", label: "Checklist interativo" },
];

const PHASE17_CHECKLIST_KEY = "sbf-phase17-checklist";

// Itens retroativos espelhando o task.md do Vault (9 itens da Fase 17)
const PHASE17_CHECKLIST_ITEMS = [
  { key: "iface", label: "ISBDebugInterface + FSBDebugLine criados em 02_SandboxInterfaces" },
  { key: "stack", label: "ISBDebugInterface implementada em USBBehaviorStackComponent (01_SandboxCommon)" },
  { key: "character", label: "ISBDebugInterface em USBAttribute/USBState/USBAbilityComponent (05_SandboxCharacter)" },
  { key: "extensoes", label: "ISBDebugInterface em USBInventoryComponent (08) e USBCombatComponent (06)" },
  { key: "atores", label: "ISBDebugInterface nos atores de teste de interação (ASBTestLockedChest em 07)" },
  { key: "plugin", label: "Plugin 10_SandboxDebug inicializado (.uplugin, Build.cs, módulo)" },
  { key: "coletor", label: "FGameplayDebuggerCategory_Sandbox implementado e registrado no módulo" },
  { key: "isolamento", label: "Teste de desacoplamento: remover dependência de 08_SandboxInventory e validar o build" },
  { key: "tests", label: "V1Editor compila e a suíte de testes permanece verde (31/31)" },
];

export default function Phase17() {
  return (
    <DocsLayout>
      <div className="container py-12 lg:py-16 grid lg:grid-cols-[1fr_240px] gap-10">
        <article className="min-w-0">
          <PhaseStamp phase="17" version="v1.7.0" />
          <h1 className="font-display text-4xl font-bold mt-4 leading-tight">
            Fase 17 — Gameplay Debugger e Telemetria
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
            Registro histórico do plugin{" "}
            <code className="font-mono text-sm">10_SandboxDebug</code>, homologado na versão
            <strong className="text-foreground"> v1.7.0</strong> com 31/31 specs verdes. A Fase 17 abriu a
            superfície de observabilidade do framework via{" "}
            <code className="font-mono text-sm">ISBDebugInterface</code> — sem qualquer dependência de
            compilação entre o plugin de debug e as extensões de gameplay.
          </p>

          <TechRule label="17.1 · O plugin 10_SandboxDebug" />
          <h2 id="plugin" className="font-display text-2xl font-bold scroll-mt-24">
            Isolação absoluta: editor-only, zero custo em Shipping
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O plugin{" "}
            <code className="font-mono text-sm">10_SandboxDebug</code> integra o framework ao Gameplay
            Debugger nativo (<code className="font-mono text-sm">Shift + '</code>) da engine. O coletor{" "}
            <code className="font-mono text-sm">FGameplayDebuggerCategory_Sandbox</code> varre os componentes
            do ator sob a mira e chama{" "}
            <code className="font-mono text-sm">ISBDebugInterface::Execute_GetDebugDescription</code> — o
            framework expõe descrição, nunca ponteiros ou estado interno. A categoria é registrada apenas
            quando o módulo está ativo; em Shipping o código inteiro desaparece por compilação.
          </p>

          <TechRule label="17.2 · Interface de debug" />
          <h2 id="interface" className="font-display text-2xl font-bold scroll-mt-24">
            ISBDebugInterface + FSBDebugLine
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            Contrato leve em <code className="font-mono text-sm">02_SandboxInterfaces</code>: o ator ou
            componente implementa <code className="font-mono text-sm">CollectData</code> e devolve uma lista
            de <code className="font-mono text-sm">FSBDebugLine</code> (Label/Value/bIsHeader). O Gameplay
            Debugger nativo renderiza as structs; o framework não conhece nenhuma classe de debug.
          </p>
          <CodeBlock
            language="cpp"
            path="02_SandboxInterfaces/ISBDebugInterface.h"
          >
{`USTRUCT(BlueprintType)
struct FSBDebugLine
{
    GENERATED_BODY()
    UPROPERTY() FString Label;
    UPROPERTY() FString Value;
    UPROPERTY() bool bIsHeader = false;
};

UINTERFACE(MinimalAPI)
class USBDebugInterface : public UInterface
{
    GENERATED_BODY()
};

class ISBDebugInterface
{
public:
    virtual TArray<FSBDebugLine> Execute_GetDebugDescription() const = 0;
};`}
          </CodeBlock>
          <AuditNote tone="info">
            Mesma disciplina das interfaces de gameplay: contrato explícito em 02_SandboxInterfaces, nunca
            reflexão por string sobre propriedades do ator.
          </AuditNote>

          <TechRule label="17.3 · Coletor nativo" />
          <h2 id="coletor" className="font-display text-2xl font-bold scroll-mt-24">
            FGameplayDebuggerCategory_Sandbox
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O coletor varre os componentes do ator selecionado (ou sob a mira), testa{" "}
            <code className="font-mono text-sm">ISBDebugInterface</code> e empilha as descrições por
            componente. Em <strong>Dedicated Server</strong>, o GDT inspeciona a visão do servidor — valores
            autoritativos no overlay servem para auditar divergências client/server lado a lado.
          </p>
          <AuditNote tone="info">
            <strong>Runtime:</strong> habilite o plugin nativo GameplayDebugger no <code className="font-mono text-xs">.uproject</code>,
            em PIE aperte <code className="font-mono text-xs">Shift + '</code>, depois <code className="font-mono text-xs">.</code> e clique no alvo —
            a categoria <strong>Sandbox</strong> mostra os pares Label/Value de cada componente.
          </AuditNote>

          <TechRule label="17.4 · Telemetria" />
          <h2 id="telemetria" className="font-display text-2xl font-bold scroll-mt-24">
            O que cada componente expõe
          </h2>
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full text-sm bg-card">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Componente / Ator</th>
                  <th className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider">Telemetria exposta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBBehaviorStackComponent</td>
                  <td className="px-4 py-3">Pilha ativa, prioridades, profundidade de mutação e queues deferidas — diagnóstico de reentrância do FSBStackMutationGuard.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBAttributeComponent</td>
                  <td className="px-4 py-3">Base vs Current, modificadores ativos e transações preditivas pendentes por PredictionId.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBStateComponent</td>
                  <td className="px-4 py-3">Tags de estado ativas e preditas.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBAbilityComponent</td>
                  <td className="px-4 py-3">Cooldowns em segundos decrescentes e mapeamento InputTag → AbilityTag.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBInventoryComponent</td>
                  <td className="px-4 py-3">Grid de slots replicados sincronizado (item, quantidade, tags transientes).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">USBCombatComponent</td>
                  <td className="px-4 py-3">Behaviors de armas por ExclusivityGroup.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">ASBTestInteractableActor / LockedChest</td>
                  <td className="px-4 py-3">Duração da interação, dono do lock atual e contagem cumulativa de ativações.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <TechRule label="17.5 · Portão de compilação" />
          <h2 id="gate" className="font-display text-2xl font-bold scroll-mt-24">
            #if WITH_GAMEPLAY_DEBUGGER — zero custo em Shipping
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            Todo o código de debug vive atrás do portão nativo{" "}
            <code className="font-mono text-sm">WITH_GAMEPLAY_DEBUGGER</code>. A categoria só é registrada
            quando o módulo de debug está ativo; em Shipping, o overhead é nulo — nem a interface de
            descrição é consultada.
          </p>

          <TechRule label="17.6 · Isolamento de compilação" />
          <h2 id="isolamento" className="font-display text-2xl font-bold scroll-mt-24">
            Desacoplamento provado, não declarado
          </h2>
          <p className="mt-3 leading-relaxed max-w-3xl">
            O teste de isolamento da Fase 17 seguiu o método DD-09: o <code className="font-mono text-sm">08_SandboxInventory</code>{" "}
            foi escondido do gráfico de build (renome de pasta + <code className="font-mono text-sm">.uplugin_disabled</code>);
            o <code className="font-mono text-sm">10_SandboxDebug</code> continuou compilando, provando que
            nunca incluiu cabeçalhos de inventário, combate ou interação.
          </p>

          <TechRule label="17.7 · Critérios de aceite homologados" />
          <h2 id="aceite" className="font-display text-2xl font-bold scroll-mt-24">
            O que fechou a v1.7.0
          </h2>
          <ul className="mt-5 space-y-2.5 max-w-3xl list-none">
            {[
              "ISBDebugInterface em todos os componentes observáveis + ator de teste de interação (lock, duração e contagem cumulativa).",
              "FSBDebugLine sem vazamento de ponteiros: structs Label/Value, nunca estado interno exposto.",
              "Código 100% atrás de #if WITH_GAMEPLAY_DEBUGGER — zero custo em Shipping.",
              "Isolamento provado por hide real de módulos no UBT (método DD-09, herdado pela Fase 18).",
              "V1Editor compila e a suíte de testes permanece verde (31/31).",
              "Dashboard v1.7.0, task.md 9/9 e walkthrough atualizados.",
            ].map((v) => (
              <li key={v} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-engineering" />
                <span>{v}</span>
              </li>
            ))}
          </ul>

          <TechRule label="17.8 · Checklist interativo" />
          <h2 id="checklist" className="font-display text-2xl font-bold scroll-mt-24">
            Checklist retrospectivo da Fase 17
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Checklist retroativo espelhando o <code className="font-mono text-xs">task.md</code> do Vault.
            Os 9 itens foram homologados na v1.7.0 — marque-os aqui para acompanhar a auditoria documental
            de fases concluídas, ou use "Copiar status" para conferir o registro com o Vault.
          </p>
          <PhaseChecklist
            storageKey={PHASE17_CHECKLIST_KEY}
            items={PHASE17_CHECKLIST_ITEMS}
            completeMessage="Checklist completo — Fase 17 (v1.7.0) confirmada e auditada."
          />

          <AuditNote tone="info">
            <strong>Dívida conhecida:</strong> compensação de lag no Hitscan segue ausente — a detecção usa
            o frame do servidor, sem histórico de colisão retroativo. O RPC rate-limiting também permanece
            como stub (validação real em <code className="font-mono text-xs">CanEnter()</code>).
          </AuditNote>

          <div className="mt-10 flex items-center gap-3">
            <a
              href="/fases"
              className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
            >
              Histórico de Fases
            </a>
            <a
              href="/decisoes"
              className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
            >
              Registro de Decisões
            </a>
          </div>
        </article>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 border border-border bg-card">
            <div className="px-4 py-2 border-b border-border bg-secondary/60 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Sumário da Fase 17
            </div>
            <ul className="divide-y divide-border">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-engineering hover:bg-secondary/40 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </DocsLayout>
  );
}
