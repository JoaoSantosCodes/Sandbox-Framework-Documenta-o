/*
  DESIGN: "Blueprint Técnico" — Editorial de engenharia / spec manual.
  Página: Especificação Estrutural (SFPS v1.0.0) — fonte de verdade SFPS.
  Linguagem: trilho lateral de seções, carimbos mono, code blocks escuros, notas de auditoria.
*/
import { CodeBlock, AuditNote, TechRule } from "@/components/Primitives";
import { DocsLayout } from "@/components/DocsLayout";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";

const STRUCTS = `USTRUCT(BlueprintType)
struct FSBGameplayContext
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<ACharacter> Character = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<APawn> Pawn = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<AController> Controller = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<APlayerState> PlayerState = nullptr;

    UPROPERTY(BlueprintReadOnly)
    float DeltaSeconds = 0.0f;
};

USTRUCT(BlueprintType)
struct FSBFrameworkContext
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<UWorld> World = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<UGameInstance> GameInstance = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<USBAssetManager> AssetManager = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<USBEventSubsystem> EventSubsystem = nullptr;

    UPROPERTY(BlueprintReadOnly)
    TObjectPtr<USBSaveSubsystem> SaveSubsystem = nullptr;

    UPROPERTY(BlueprintReadOnly)
    uint8 NetMode = 0;
};

USTRUCT(BlueprintType)
struct FSBBehaviorContext
{
    GENERATED_BODY()

    // Referência forte ao contexto de gameplay do ator
    const FSBGameplayContext* GameplayContext = nullptr;

    // Referência forte ao contexto de infraestrutura global
    const FSBFrameworkContext* FrameworkContext = nullptr;

    // Ponteiro genérico opcional para dados específicos de domínio
    // (ex: FSBMovementContext)
    const void* FeatureContext = nullptr;
};`;

const MODIFIER = `USTRUCT(BlueprintType)
struct FSBModifierEntry
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FGameplayTag SourceTag;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float Value = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    ESBModifierOperation Operation = ESBModifierOperation::Additive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Priority = 0; // Prioridade maior executa depois (ex: Overrides)
};`;

const UPPLUGIN = `{
    "SandboxVersion": {
        "Plugin": "1.0.0",
        "API": 1,
        "Assets": 1,
        "Network": 1,
        "Serialization": 1
    }
}`;

const SPEC_INDEX = [
  { n: "01", label: "Topologia de Plugins", id: "sfps-01" },
  { n: "02", label: "Dependência Unidirecional", id: "sfps-02" },
  { n: "03", label: "Metadados .uplugin", id: "sfps-03" },
  { n: "04", label: "Contexto Unificado", id: "sfps-04" },
  { n: "05", label: "Definition / Instance", id: "sfps-05" },
  { n: "06", label: "Modificadores", id: "sfps-06" },
  { n: "07", label: "Message Router", id: "sfps-07" },
  { n: "08", label: "Matriz de Interfaces", id: "sfps-08" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export default function Spec() {
  const active = useActiveSection(SPEC_INDEX.map((s) => s.id));
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap" style={{ fontSize: "clamp(3.5rem, 12vw, 12rem)" }}>
            SFPS
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. sfps · fonte de verdade
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="phase-stamp">SFPS · v1.0.0</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                sandbox framework plugin specification · 11 plugins
              </span>
            </div>
          </div>
          <h1 className="max-w-3xl font-display text-4xl lg:text-5xl font-bold mt-5 leading-[1.05]">
            Especificação{" "}
            <em className="not-italic text-engineering">Estrutural</em>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Documento consolidado que governa a arquitetura de software do framework — a
            especificação é a fonte de verdade; o código é a prova.
          </p>
        </div>
      </section>

      <div className="container grid grid-cols-1 xl:grid-cols-[200px_1fr] gap-10 py-12">
        {/* Trilho lateral de seções */}
        <nav className="hidden xl:block sticky top-28 self-start border-l border-border pl-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-4">Índice SFPS</p>
          <ol className="space-y-3 text-sm">
            {SPEC_INDEX.map((s) => (
              <li key={s.n}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => scrollToSection(e, s.id)}
                  className={`group flex items-baseline gap-3 transition-colors ${
                    active === s.id
                      ? "text-engineering font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[10px] text-engineering">{s.n} ·</span>
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <TechRule label="SFPS v1.0.0" />
        </nav>

        <article className="min-w-0">

          {/* 01 Topologia */}
          <section id="sfps-01" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">01</span>
              Topologia Final de Plugins
            </h2>
            <div className="border border-border divide-y divide-border">
              {[
                { layer: "Foundation", plugins: "01_SandboxCommon · 02_SandboxInterfaces · 03_SandboxAssets · 04_SandboxCore", color: "border-[oklch(0.45_0.02_255)]" },
                { layer: "Gameplay Base", plugins: "05_SandboxCharacter — serviço de base para extensões: Character, Movement, Camera, Animation", color: "border-[oklch(0.48_0.09_165)]" },
                { layer: "Gameplay Extensions", plugins: "06_SandboxCombat · 07_SandboxInteraction · 08_SandboxInventory — cada um depende apenas de 05", color: "border-[oklch(0.62_0.13_65)]" },
                { layer: "Presentation", plugins: "09_SandboxUI · 10_SandboxDebug", color: "border-[oklch(0.55_0.15_25)]" },
                { layer: "Tools", plugins: "11_SandboxEditor — Editor-only", color: "border-[oklch(0.48_0.01_255)]" },
              ].map((g) => (
                <div key={g.layer} className="flex items-baseline gap-4 px-5 py-3.5">
                  <span className={`w-1 shrink-0 self-stretch ${g.color} border-l-2`} />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground w-44 shrink-0">{g.layer}</span>
                  <span className="text-sm leading-relaxed">{g.plugins}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 02 Dependência unidirecional */}
          <section id="sfps-02" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">02</span>
              Regra de Dependência Unidirecional
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              As extensões de gameplay (<span className="font-mono text-xs">06</span>,{" "}
              <span className="font-mono text-xs">07</span>,{" "}
              <span className="font-mono text-xs">08</span>) podem depender diretamente da base
              (<span className="font-mono text-xs">05_SandboxCharacter</span>), mas o inverso é
              estritamente proibido: <span className="font-mono text-xs">05_SandboxCharacter</span>{" "}
              nunca deve importar tipos ou cabeçalhos de Combat, Inventory ou Interaction. Isso
              preserva o desacoplamento e evita dependências circulares.
            </p>
            <div className="border border-border">
              <div className="flex items-center justify-between px-5 py-2 border-b border-border bg-secondary/60">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Direção permitida</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering">unidirecional</span>
              </div>
              <div className="px-5 py-6 font-mono text-sm text-center">
                <span className="text-muted-foreground">06 / 07 / 08</span>
                <span className="mx-4 text-engineering">──►</span>
                <span>05_SandboxCharacter</span>
                <span className="mx-4 text-destructive">✕</span>
                <span className="text-muted-foreground">05 não importa 06/07/08</span>
              </div>
            </div>
            <AuditNote tone="warn">
              A prova desse contrato não é prosa: é o teste de isolamento que esconde o plugin
              dependente (renomeando a pasta + <span className="font-mono">.uplugin_disabled</span>)
              e confirma que o outro ainda compila com <span className="font-mono">Exit Code: 0</span>.
              Esse teste foi executado na Fase 17 (10 oculta) e é requisito da Fase 18 (09 oculta).
            </AuditNote>
          </section>

          {/* 03 Metadados */}
          <section id="sfps-03" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">03</span>
              Metadados de Compatibilidade (.uplugin)
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Todo descritor <span className="font-mono text-xs">.uplugin</span> do framework deve
              conter o bloco de compatibilidade de versões abaixo. As dimensões <em>Plugin</em>,{" "}
              <em>API</em>, <em>Assets</em>, <em>Network</em> e <em>Serialization</em> são
              incrementadas independentemente quando o respectivo contrato quebra.
            </p>
            <CodeBlock path=".uplugin" language="JSON">
              {UPPLUGIN}
            </CodeBlock>
          </section>

          <TechRule label="Abstrações reutilizáveis" />

          {/* 04 Contexto unificado */}
          <section id="sfps-04" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">04</span>
              Estrutura de Contexto Unificada (FSBBehaviorContext)
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Para evitar quebras de assinatura em cascata quando novas dependências de
              infraestrutura forem adicionadas, todos os comportamentos de gameplay recebem um
              wrapper unificado de referências constantes. O gameplay vê{" "}
              <span className="font-mono text-xs">FSBGameplayContext</span>; a infraestrutura vê{" "}
              <span className="font-mono text-xs">FSBFrameworkContext</span>; e{" "}
              <span className="font-mono text-xs">FeatureContext</span> carrega dados
              específicos de domínio opcionais.
            </p>
            <CodeBlock path="SBCommonTypes.h" language="C++">
              {STRUCTS}
            </CodeBlock>
          </section>

          {/* 05 Definition/Instance/RuntimeData */}
          <section id="sfps-05" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">05</span>
              Divisão de Estados de Behaviors
            </h2>
            <div className="border border-border divide-y divide-border">
              {[
                {
                  name: "Definition",
                  desc: "Propriedades imutáveis carregadas via Data Asset.",
                  example: "USBMovementBehaviorDefinition",
                },
                {
                  name: "Instance",
                  desc: "O UObject de lógica operacional ativado em runtime. Posse direta do BehaviorRegistry.",
                  example: "USBMovementBehavior",
                },
                {
                  name: "Runtime Data",
                  desc: "Struct com variáveis dinâmicas e mutáveis alteradas a cada tick. O behavior apenas referencia este dado transiente.",
                  example: "FSBMovementRuntimeData",
                },
              ].map((d) => (
                <div key={d.name} className="flex items-baseline gap-5 px-5 py-4">
                  <span className="font-mono text-sm text-engineering w-32 shrink-0">{d.name}</span>
                  <p className="text-sm text-muted-foreground flex-1">{d.desc}</p>
                  <span className="font-mono text-xs text-foreground/70">{d.example}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 06 Modificadores */}
          <section id="sfps-06" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">06</span>
              Priorização e Políticas do Modificador
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Toda modificação física ou de atributos é regulada por{" "}
              <span className="font-mono text-xs">FSBModifierEntry</span>: cada modificador declara
              sua origem (tag), valor, operação e prioridade. Prioridades maiores executam depois —
              o <em>Override</em> vence a soma.
            </p>
            <CodeBlock path="SBCommonTypes.h" language="C++">
              {MODIFIER}
            </CodeBlock>
          </section>

          <TechRule label="Gameplay Message Router" />

          {/* 07 Message Router */}
          <section id="sfps-07" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">07</span>
              Gameplay Message Router (USBEventSubsystem)
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              O barramento de eventos processa mensagens em duas categorias de tempo de vida.
              Novos componentes que entram em jogo (late join / respawn) leem o estado persistente
              imediatamente após a subscrição.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border border-border">
                <div className="px-5 py-2.5 border-b border-border bg-secondary/60 font-mono text-xs uppercase tracking-[0.14em]">
                  Instant Message
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-xs text-engineering mb-2">BroadcastMessage&lt;T&gt;</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mensagens transientes distribuídas imediatamente aos escutas ativos no momento
                    do disparo. Exemplo: <span className="font-mono">Event.Weapon.Fire</span>.
                  </p>
                </div>
              </div>
              <div className="border border-border">
                <div className="px-5 py-2.5 border-b border-border bg-secondary/60 font-mono text-xs uppercase tracking-[0.14em]">
                  Stateful Message
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-xs text-engineering mb-2">PublishState&lt;T&gt;</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Registra o último valor enviado (ex:{" "}
                    <span className="font-mono">State.Character.Sprinting</span>). Novos
                    componentes em jogo leem o estado imediatamente.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l-2 border-engineering/60 bg-[var(--engineering)]/7 pl-4 py-3 text-engineering text-sm mb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-80 mb-1">
                Gerenciamento de cache
              </p>
              O cache de estado é vinculado ao ciclo de vida do ator emissor. Quando o ator é
              destruído ou resetado ({""}<span className="font-mono">ISBResettable</span>), suas
              mensagens registradas no barramento devem ser invalidadas.
            </div>
            <AuditNote tone="info">
              <p>
                A versão executada da Fase 18 estende este barramento com payload como{" "}
                <span className="font-mono">UObject*</span> (design registrado no plano da Fase 18)
                e a assinatura priorizada — UI assina com <span className="font-mono">Low (20)</span>,
                gameplay nunca espera pela interface.
              </p>
            </AuditNote>
          </section>

          <TechRule label="Fundação" />

          {/* 08 Matriz de interfaces */}
          <section id="sfps-08" className="mb-14">
            <h2 className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-4">
              <span className="font-mono text-sm text-engineering">08</span>
              Matriz de Interfaces de Fundação (02_SandboxInterfaces)
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
              Todas as classes e componentes do framework devem se adequar aos contratos abaixo,
              definidos em <span className="font-mono text-xs">02_SandboxInterfaces</span> — nunca
              em plugins de gameplay ou apresentação.
            </p>
            <div className="border border-border divide-y divide-border">
              {[
                { name: "ISBInitializable", desc: "Inicialização e encerramento ordenados de dependências (Initialize, Shutdown)." },
                { name: "ISBTickable", desc: "Padroniza ticks em classes que não herdam de UActorComponent. Tick group padrão TG_PrePhysics — modificações lógicas influenciam a simulação do mesmo frame." },
                { name: "ISBComponentInterface", desc: "Ganchos do ciclo de vida modular: OnComponentCreated, OnPreInitialize, OnInitialize, OnPostInitialize, OnReady, OnShutdown." },
                { name: "ISBSaveInterface", desc: "Ganchos de persistência e salvamento de estado do componente." },
                { name: "ISBResettable", desc: "Implementa ResetState() para limpar estados físicos durante pooling de atores ou respawn." },
                { name: "ISBReplicable", desc: "Empacotamento de propriedades dinâmicas e sincronização de dados transitórios via rede (RPC/Serialization wrappers)." },
                { name: "ISBDebugInterface", desc: "Retorno de strings estruturadas de telemetria e depuração visual — sem vazamento de ponteiros internos." },
              ].map((i) => (
                <div key={i.name} className="flex items-baseline gap-5 px-5 py-4">
                  <span className="font-mono text-sm w-44 shrink-0">{i.name}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{i.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
