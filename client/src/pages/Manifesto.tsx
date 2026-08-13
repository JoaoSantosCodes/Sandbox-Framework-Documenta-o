/*
  DESIGN: "Blueprint Técnico" — Manifesto e padrões de código.
  Dez princípios numerados em grid técnico; padrões como seções de especificação.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { AuditNote, TechRule } from "@/components/Primitives";
import { MANIFESTO_PRINCIPLES } from "@/lib/siteData";

const PRECEDENTS = [
  { principle: "Reaproveitar, não reinventar", decisions: "DD-06 (contrato canônico de inventário preservado), DD-02 (disciplina de simetria do FSBStackMutationGuard)" },
  { principle: "Injeção dinâmica de componentes", decisions: "DD-01 (ULocalPlayerSubsystem: a engine mantém o estado que já é dela)" },
  { principle: "Desacoplamento por interfaces", decisions: "DD-03 (payloads em 04_SandboxCore, Message Router como única superfície entre camadas)" },
  { principle: "HasAuthority() explícito", decisions: "DD-05 (ownership na renderização — extensão do princípio de authority para o consumidor)" },
];

const NORMS = [
  "Custo aceitável, prioridade documentada — DD-04 (payloads UObject) é aceito porque UI é consumidora de prioridade Low (20) e gameplay nunca espera pela UI.",
  "Scope contido e verificável — DD-08 (indicador de dano adiado para a Fase 19) aplica a disciplina da transição Fase 17 → 18: entregar escopo pequeno e auditável é melhor que escopo grande com lacunas.",
  "Reversão auditável — qualquer decisão registrada só pode ser revertida mediante auditoria explícita e novo registro no Registro de Decisões; modificação silenciosa é proibida.",
];

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

        <TechRule label="Precedentes homologados — DD-01 ··· DD-08 (v1.8.0)" />
        <section className="mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-4">
            As decisões homologadas em auditoria concretizam os princípios: vincular cada decisão ao
            princípio que a originou torna o Manifesto auditável em cada nova fase. O registro completo
            (problema, alternativa rejeitada, consequência) vive no{" "}
            <a href="/decisoes" className="text-engineering underline underline-offset-2">
              Registro de Decisões
            </a>.
          </p>
          <div className="overflow-x-auto border border-border bg-card mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left">
                  <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-4 py-2">Princípio</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-4 py-2">Decisões que o concretizam</th>
                </tr>
              </thead>
              <tbody>
                {PRECEDENTS.map((row) => (
                  <tr key={row.principle} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2">{row.principle}</td>
                    <td className="px-4 py-2 text-muted-foreground">{row.decisions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <TechRule label="Normas resultantes" />
        <ul className="mt-3 space-y-2 max-w-3xl mb-8">
          {NORMS.map((it) => (
            <li key={it} className="flex gap-3 text-sm leading-relaxed">
              <span className="text-engineering font-bold">—</span>
              {it}
            </li>
          ))}
        </ul>

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
