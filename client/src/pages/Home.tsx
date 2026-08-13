/*
  DESIGN: "Blueprint Técnico" — Home
  Hero com diagrama blueprint, métricas de engenharia, preview do plano Fase 18 e manifesto.
  Tipografia serifada display + mono; acento verde-engineering.
*/
import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import { TopologyDiagram } from "@/components/TopologyDiagram";
import { PhaseStamp, TechRule } from "@/components/Primitives";
import { ASSET_URLS, MANIFESTO_PRINCIPLES, PHASES, TEST_SUITES } from "@/lib/siteData";

const METRICS = [
  { value: "11", label: "Plugins em arquitetura unidirecional" },
  { value: "31/31", label: "Testes automatizados verdes (Exit Code 0)" },
  { value: "0", label: "Dependências circulares" },
  { value: "10", label: "Princípios do Manifesto" },
];

export default function Home() {
  const latestPhase = PHASES[PHASES.length - 1];
  return (
    <DocsLayout>
      {/* HERO */}
      <section className="paper-grain border-b border-border">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 fade-up">
            <PhaseStamp phase={String(latestPhase.phase)} version={latestPhase.version} />
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mt-5">
              A especificação viva de um framework de gameplay multiplayer em Unreal Engine 5.8
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              C++ modular, predição client-side com autoridade server-side, Message Router desacoplado
              e onze plugins com dependências unidirecionais verificáveis por compilação.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/fase-18"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              >
                Plano da Fase 18 — Interface Dinâmica <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/plugins"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
              >
                Auditar a topologia
              </Link>
            </div>
          </div>
          <div className="lg:col-span-3 relative fade-up" style={{ animationDelay: "80ms" }}>
            <div
              className="rounded-sm border border-border overflow-hidden shadow-[0_12px_40px_-16px_oklch(0.26_0.012_255/0.35)]"
            >
              <img
                src={ASSET_URLS.hero}
                alt="Blueprint da arquitetura do Sandbox Framework"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="border-b border-border bg-secondary/50">
        <div className="container grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {METRICS.map((m, i) => (
            <div key={m.label} className="py-8 px-5 lg:px-8 fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="font-mono text-3xl font-bold text-engineering">{m.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOPOLOGY */}
      <section id="topologia" className="container py-16 grid lg:grid-cols-[140px_1fr] gap-8">
        <div className="hidden lg:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Seções</div>
          <ul className="mt-3 space-y-1.5 font-mono text-xs">
            <li><a href="#" className="text-foreground" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>01 · Vista geral</a></li>
            <li><a href="#topologia" className="text-engineering font-semibold">02 · Topologia</a></li>
            <li><a href="#fase18" className="text-muted-foreground hover:text-engineering transition-colors">03 · Fase 18</a></li>
            <li><a href="#manifesto" className="text-muted-foreground hover:text-engineering transition-colors">04 · Manifesto</a></li>
            <li><a href="#evidencia" className="text-muted-foreground hover:text-engineering transition-colors">05 · Evidência</a></li>
          </ul>
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
        <div className="border border-border bg-card paper-grain p-6">
          <TopologyDiagram />
          <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
            Foundation (01–04) nunca importa tipos de gameplay. As extensões 06, 07 e 08 dependem apenas
            do 05 e nunca umas das outras — a comunicação entre elas atravessa o Message Router de 04.
            O <strong>10_SandboxDebug</strong> comprova o contrato: compila conhecendo apenas interfaces de fundação.
          </p>
        </div>
        </div>
      </section>

      {/* LATEST PHASE / PHASE 18 */}
      <section id="fase18" className="border-y border-border bg-secondary/40">
        <div className="container py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
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
              className="mt-7 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
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
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Seção 03 · Manifesto
        </span>
        <h2 className="font-display text-3xl font-bold mt-2">Os dez princípios que nenhuma fase pode violar</h2>
        <TechRule />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            Seção 04 · Evidência de qualidade
          </span>
          <h2 className="font-display text-3xl font-bold mt-2">Suíte verde — 31 specs, sem bypasses de teste</h2>
          <TechRule />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
