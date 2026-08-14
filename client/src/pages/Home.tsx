/*
  DESIGN: "Blueprint Técnico" + referência fuch.ai — Home.
  Hero assimétrico: wordmark gigante em serif como fundo (padrão fuch.ai), com blocos
  funcionais nos cantos (label mono sup.-esq., terminal mono inf.-esq., card de status
  inf.-dir., chips sticker). Faixa de métricas mono com separadores "·". Seções com
  header em duas colunas (label mono + intro bold) e cards numerados com chips de tags.
*/
import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import { TopologyDiagram } from "@/components/TopologyDiagram";
import { PhaseStamp, TechRule } from "@/components/Primitives";
import { ASSET_URLS, MANIFESTO_PRINCIPLES, PHASES, TEST_SUITES } from "@/lib/siteData";

const METRICS = [
  { value: "11", label: "Plugins unidirecionais" },
  { value: "31/31", label: "Testes verdes (Exit Code 0)" },
  { value: "0", label: "Dependências circulares" },
  { value: "13", label: "Decisões homologadas (DD)" },
];

export default function Home() {
  const latestPhase = PHASES[PHASES.length - 1];
  return (
    <DocsLayout>
      {/* HERO — wordmark gigante como fundo (fuch.ai), cantos funcionais */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        {/* Wordmark massivo centralizado, texto de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        >
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 17vw, 20rem)" }}>
            SANDBOX
          </span>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden mt-[clamp(5rem,9vw,12rem)]"
        >
          <span className="font-display font-black leading-[0.85] text-center text-engineering/[0.06] dark:text-engineering/[0.10] whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 13vw, 15rem)" }}>
            FRAMEWORK
          </span>
        </div>

        <div className="container relative py-14 lg:py-20 min-h-[78vh] flex flex-col justify-between gap-10">
          {/* Canto sup.-esq.: identificador de estado (fuch.ai: bloco de identidade) */}
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              004 · mounting spec memory
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase={String(latestPhase.phase)} version={latestPhase.version} warn />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                documentação viva · auditoria de compilação
              </span>
            </div>
          </div>

          {/* Centro: CTA sobre o wordmark */}
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-[1.02]">
              A especificação viva de um framework de gameplay multiplayer em{" "}
              <em className="not-italic text-engineering">Unreal Engine 5.8</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              C++ modular, predição client-side com autoridade server-side, Message Router
              desacoplado e onze plugins com dependências unidirecionais verificáveis por compilação.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/fase-18"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-transform"
              >
                Plano da Fase 18 — Interface Dinâmica <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/plugins"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground active:scale-[0.97] transition-transform"
              >
                Auditar a topologia
              </Link>
            </div>
          </div>

          {/* Rodapé do hero: bloco terminal inf.-esq. + card de status inf.-dir. (fuch.ai) */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-end">
            <div className="fade-up" style={{ animationDelay: "80ms" }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-engineering">Spec</div>
              <p className="mt-2 font-mono text-base lg:text-lg leading-snug">
                11 plugins. 31 testes verdes. zero dependências circulares.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-xs">
                <Link href="/message-router" className="text-muted-foreground hover:text-engineering transition-colors">
                  &gt; como o Message Router desacopla?
                </Link>
                <Link href="/manifesto" className="text-muted-foreground hover:text-engineering transition-colors">
                  &gt; quais os 10 princípios?
                </Link>
                <Link href="/decisoes" className="text-muted-foreground hover:text-engineering transition-colors">
                  &gt; ver as 15 decisões DD?
                </Link>
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                press <span className="border border-border rounded px-1">⌘K</span> para buscar
              </div>
            </div>
            {/* Card de status (espelho do "last jammed to" do fuch.ai) */}
            <div className="border border-border rounded-md bg-card/95 backdrop-blur px-4 py-3 max-w-[280px] w-full">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                ··· status atual
              </div>
              <div className="mt-1 font-mono text-sm font-bold">v1.8.0 · Fase 18</div>
              <div className="text-xs text-muted-foreground mt-0.5">32/32 specs homologadas no Vault</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-warn animate-pulse" />
                <span className="font-mono text-[10px] text-amber-warn uppercase tracking-wider">
                  Fase 19 em homologação · v1.9.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS — faixa mono com separadores (fuch.ai: trusted-by line) */}
      <section className="border-b border-border bg-secondary/50">
        <div className="container py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
            {METRICS.map((m, i) => (
              <span key={m.label} className="flex items-baseline gap-2 fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-2xl font-bold text-engineering">{m.value}</span>
                <span className="text-[11px]">{m.label}</span>
                {i < METRICS.length - 1 && <span className="text-border">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TOPOLOGY — header 2 colunas + grid assimétrico */}
      <section id="topologia" className="container py-16">
        <div className="grid lg:grid-cols-[minmax(160px,1fr)_3fr] gap-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">02 / topologia</div>
            <div className="mt-4 space-y-2 font-mono text-xs">
              <a href="#" className="block text-foreground" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>01 · Vista geral</a>
              <a href="#topologia" className="block text-engineering font-semibold">02 · Topologia</a>
              <a href="#fase18" className="block text-muted-foreground hover:text-engineering transition-colors">03 · Fase 18</a>
              <a href="#manifesto" className="block text-muted-foreground hover:text-engineering transition-colors">04 · Manifesto</a>
              <a href="#evidencia" className="block text-muted-foreground hover:text-engineering transition-colors">05 · Evidência</a>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Seção 02 · Topologia
                </span>
                <h2 className="font-display text-3xl font-bold mt-2">
                  Dependências unidirecionais — cada seta é uma promessa de compilação
                </h2>
              </div>
              <Link href="/plugins" className="inline-flex items-center gap-1.5 text-sm font-semibold text-engineering hover:underline">
                Explorar todos os plugins <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <TechRule />
            <div className="border border-border bg-card paper-grain p-6 mt-5">
              <TopologyDiagram />
              <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
                Foundation (01–04) nunca importa tipos de gameplay. As extensões 06, 07 e 08 dependem apenas
                do 05 e nunca umas das outras — a comunicação entre elas atravessa o Message Router de 04.
                O <strong>10_SandboxDebug</strong> comprova o contrato: compila conhecendo apenas interfaces de fundação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST PHASE / PHASE 18 — cards numerados estilo fuch.ai */}
      <section id="fase18" className="border-y border-border bg-secondary/40">
        <div className="container py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">03 / fase 18</div>
            <PhaseStamp phase="18" version="v1.8.0" />
            <h2 className="font-display text-3xl font-bold mt-4">
              Próximo capítulo: a Interface Dinâmica
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              O plugin 09_SandboxUI deixa o estágio de stub e passa a reagir exclusivamente a eventos do
              Message Router. Widgets herdam de uma classe base com assinatura priorizada, o gerenciador de
              camadas valida-antes-de-mutar e nenhum widget conhece um tipo concreto de gameplay em tempo
              de compilação.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Arquitetura produtor/consumidor via USBEventSubsystem",
                "Seis widgets reativos: prompt, inventário, arma, atributos, cooldowns, dano",
                "Camadas Game / Modal / Debug com push-pop simétrico",
                "Critérios de aceite auditáveis no plano completo",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-engineering shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/fase-18"
              className="mt-7 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-transform"
            >
              Ler o plano de implantação <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="border border-border bg-card p-5">
            <img src={ASSET_URLS.widgets} alt="Esquema de engenharia do HUD do Sandbox Framework" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* MANIFESTO PREVIEW */}
      <section id="manifesto" className="container py-16">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Seção 04 · Manifesto
            </span>
            <h2 className="font-display text-3xl font-bold mt-2">Os dez princípios que nenhuma fase pode violar</h2>
          </div>
        </div>
        <TechRule />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {MANIFESTO_PRINCIPLES.slice(0, 6).map((p) => (
            <article key={p.n} className="border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-mono text-xs text-engineering font-semibold">PRINCÍPIO {String(p.n).padStart(2, "0")}</div>
              <h3 className="font-semibold mt-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-7">
          <Link href="/manifesto" className="inline-flex items-center gap-1.5 text-sm font-semibold text-engineering hover:underline">
            Ver os dez princípios e os padrões de código <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* TEST SUITES */}
      <section id="evidencia" className="border-t border-border bg-secondary/40">
        <div className="container py-14">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Seção 05 · Evidência de qualidade
          </span>
          <h2 className="font-display text-3xl font-bold mt-2">Suíte verde — 31 specs, sem bypasses de teste</h2>
          <TechRule />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            {TEST_SUITES.map((s) => (
              <div key={s.domain} className="border border-border bg-card p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-bold text-engineering">{s.specs}</span>
                  <CheckCircle2 className="h-4 w-4 text-engineering" />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.domain}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-foreground max-w-3xl">
            Todos os domínios — Animação, Câmera, Movimento, Rede, Combate, Interação, Inventário, Save,
            Behavior Stack e Habilidades — passam em pipeline headless com Exit Code 0. Nenhum
            GIsAutomationTesting ou mock vazou para código de produção desde a Fase 11.
          </p>
        </div>
      </section>
    </DocsLayout>
  );
}
