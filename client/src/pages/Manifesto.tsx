/*
  DESIGN: "Blueprint Técnico" — Manifesto e padrões de código.
  Dez princípios numerados em grid técnico; padrões como seções de especificação.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, TechRule } from "@/components/Primitives";
import { MANIFESTO_PRINCIPLES } from "@/lib/siteData";

const STANDARDS = [
  {
    title: "Componentes modulares",
    items: [
      "Todos os componentes dinâmicos herdam de UModularActorComponent e implementam ISBComponentInterface.",
      "Proibição de spawn direto: nenhum componente cria outro com NewObject ou CreateDefaultSubobject — delegação ao SBComponentFactory via ComponentSet.",
      "Ciclo de vida padronizado: OnComponentCreated → OnPreInitialize → OnInitialize (registro no Event Bus) → OnPostInitialize → OnReady → OnShutdown.",
    ],
  },
  {
    title: "Comunicação e eventos",
    items: [
      "Event Bus vs. referências diretas: se uma arma disparou, não chame o HUD — dispare Event.Weapon.Fire no SBEventSubsystem e deixe os sistemas reagirem.",
      "Assinaturas priorizadas (ESBEventPriority): High (0) para AI e física; Medium (10) para animação e efeitos; Low (20) para HUD e widgets; Lowest (30) para logs e persistência local.",
    ],
  },
  {
    title: "Persistência desacoplada",
    items: [
      "Componentes que salvam estado implementam ISBSaveInterface, com serialização no payload genérico (SaveComponentData / LoadComponentData).",
    ],
  },
];

export default function Manifesto() {
  return (
    <DocsLayout>
      <div className="container py-12 lg:py-16 grid lg:grid-cols-[200px_1fr] gap-10">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 border border-border bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Índice · Doc. 05
            </div>
            <ul className="mt-3 space-y-2">
              {MANIFESTO_PRINCIPLES.map((p) => (
                <li key={p.n}>
                  <a href={`#p${p.n}`} className="text-sm font-mono text-muted-foreground hover:text-engineering transition-colors">
                    {String(p.n).padStart(2, "0")} · {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Doc. 05 · Norma
          </span>
          <span className="phase-stamp">norma v1.0.0 · imutável</span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight mt-2">
          Manifesto e padrões de código
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Os dez princípios core que governam todas as fases, seguidos dos padrões de engenharia que
          transformam princípio em prática. Nenhuma decisão de fase pode violá-los sem auditoria.
        </p>
        <TechRule />

        <div className="space-y-3">
          {MANIFESTO_PRINCIPLES.map((p, i) => (
            <article
              key={p.n}
              id={`p${p.n}`}
              className="border border-border bg-card grid sm:grid-cols-[96px_1fr] gap-4 scroll-mt-24 fade-up"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div className="border-b sm:border-b-0 sm:border-r border-border p-4 flex sm:flex-col items-center sm:items-start justify-center gap-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Princípio</div>
                <div className="font-mono text-3xl font-bold text-engineering">{String(p.n).padStart(2, "0")}</div>
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl font-bold">{p.title}</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.text}</p>
              </div>
            </article>
          ))}
        </div>

        <TechRule label="Padrões de engenharia" />
        {STANDARDS.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="font-display text-2xl font-bold">{s.title}</h2>
            <ul className="mt-3 space-y-2 max-w-3xl">
              {s.items.map((it) => (
                <li key={it} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-engineering font-bold">—</span>
                  {it}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <AuditNote tone="info">
          Reaproveitamento como regra de revisão: decisões já estabelecidas — chave estável em vez de
          índice de array, interface em vez de reflexão por string, validar-antes-de-mutar, simetria
          Enter/Exit — devem ser reaproveitadas em cada novo sistema, nunca reinventadas por fase.
        </AuditNote>
        </div>
      </div>
    </DocsLayout>
  );
}
