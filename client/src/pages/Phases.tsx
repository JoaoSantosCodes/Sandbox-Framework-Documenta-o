/*
  DESIGN: "Blueprint Técnico" — histórico de fases como linha de revisão técnica.
  Linha vertical com carimbos de fase; Fase 18 destacada como "em planejamento".
*/
import { Link } from "wouter";
import { DocsLayout } from "@/components/DocsLayout";
import { PhaseStamp, TechRule } from "@/components/Primitives";
import { PHASES } from "@/lib/siteData";
import { ArrowRight } from "lucide-react";

export default function Phases() {
  return (
    <DocsLayout>
      <div className="container py-12 lg:py-16 max-w-4xl">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Doc. 04 · Registro de fases
          </span>
          <span className="phase-stamp">v1.7.0 · homologada</span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight mt-2">Histórico de fases</h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Cada fase registra o que foi implementado, o que foi testado e qual versão foi homologada.
          Numeração sequencial e status cruzados com Dashboard, task.md e walkthrough.md.
        </p>
        <TechRule />

        <ol className="relative border-l-2 border-border ml-3 space-y-10 py-2">
          {PHASES.slice().reverse().map((p) => (
            <li key={p.phase} className="ml-7 relative">
              <span
                className={`absolute -left-[37px] top-1 h-4 w-4 rounded-full border-2 ${
                  p.status === "Em planejamento"
                    ? "border-amber-warn bg-background"
                    : "border-engineering bg-engineering"
                }`}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <PhaseStamp phase={String(p.phase)} version={p.version} warn={p.status === "Em planejamento"} />
                <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border ${
                  p.status === "Em planejamento" ? "border-amber-warn/60 text-amber-warn" : "border-engineering/60 text-engineering"
                }`}>
                  {p.status === "Em planejamento" ? "Em execução" : "Homologada"}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold mt-3">{p.title}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{p.summary}</p>
              <div className="mt-3 border border-border bg-card">
                <div className="px-3 py-1 border-b border-dashed border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground bg-secondary/40">
                  Evidências · inspeção
                </div>
                <ul className="flex flex-wrap gap-2 p-3">
                  {p.highlights.map((h) => (
                    <li key={h} className="font-mono text-[11px] px-2 py-1 border border-border bg-background">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <TechRule />
        <div className="border-l-2 border-amber-warn bg-[oklch(0.62_0.13_65)]/7 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-amber-warn font-semibold">
              Em aberto · Fase 18 · Interface Dinâmica (09_SandboxUI)
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Plano de implantação publicado: arquitetura de eventos via USBEventSubsystem e hierarquia
              de widgets reativos.
            </p>
          </div>
          <Link
            href="/fase-18"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            Abrir o plano <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </DocsLayout>
  );
}
