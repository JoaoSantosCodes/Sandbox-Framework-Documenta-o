/*
  DESIGN: "Blueprint Técnico" — página de topologia de plugins.
  Linguagem de "spec sheet": carimbo de revisão, metadados mono, etiquetas de dependência
  com setas, hachura sutil — não cards genéricos.
*/
import { DocsLayout } from "@/components/DocsLayout";
import { TechRule } from "@/components/Primitives";
import { LAYER_META, PLUGINS } from "@/lib/siteData";
import { ArrowDown } from "lucide-react";

const LAYERS: Plugin["layer"][] = ["foundation", "gameplay-base", "extension", "presentation", "tools"];

import { Plugin } from "@/lib/siteData";

function SpecSheet({ p }: { p: Plugin }) {
  return (
    <article className="border border-border bg-card relative overflow-hidden">
      <div className="h-1 bg-[repeating-linear-gradient(-45deg,var(--engineering),var(--engineering) 3px,transparent 3px 9px)] opacity-30" />
      <header className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Spec sheet · nº {p.id}
          </div>
          <h3 className="font-mono text-sm font-bold mt-1">
            {p.id} · <span className="text-engineering">{p.name}</span>
          </h3>
        </div>
        {p.status === "stub" ? (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-amber-warn/60 text-amber-warn whitespace-nowrap">
            Em stub — F18
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-engineering/60 text-engineering whitespace-nowrap">
            Rev. {p.version}
          </span>
        )}
      </header>
      <p className="px-5 pb-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
      <footer className="px-5 py-2.5 border-t border-dashed border-border bg-secondary/40 flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Depende de
        </span>
        {p.dependsOn.length === 0 ? (
          <span className="font-mono text-xs text-muted-foreground">∅ (raiz da camada)</span>
        ) : (
          p.dependsOn.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-engineering">
              <ArrowDown className="h-3 w-3" />
              {d}
            </span>
          ))
        )}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
          {LAYER_META[p.layer].label.toUpperCase()}
        </span>
      </footer>
    </article>
  );
}

export default function Plugins() {
  return (
    <DocsLayout>
      <div className="container py-12 lg:py-16 max-w-5xl">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Doc. 03 · Topologia
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight mt-2">
              Topologia de plugins
            </h1>
          </div>
          <span className="phase-stamp">v1.7.0 · homologada</span>
        </div>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Onze plugins em cinco camadas. Cada plugin lista explicitamente suas dependências e nenhuma
          aponta para cima ou para o lado na árvore de gameplay — o contrato é auditável por compilação.
        </p>
        <TechRule />

        <div className="space-y-12">
          {LAYERS.map((layer) => (
            <section key={layer}>
              <div className="flex items-center gap-4">
                <span className={`h-3 w-3 shrink-0 border-2 ${LAYER_META[layer].color}`} />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Camada {LAYERS.indexOf(layer) + 1} · {LAYER_META[layer].label}
                  </span>
                  <h2 className="font-display text-2xl font-bold">{LAYER_META[layer].label}</h2>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {PLUGINS.filter((p) => p.layer === layer).map((p) => (
                  <SpecSheet key={p.id} p={p} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <TechRule label="Contrato estrutural" />
        <div className="border-l-2 border-engineering pl-5 max-w-3xl">
          <h2 className="font-display text-2xl font-bold">Regra de dependência unidirecional de gameplay</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Os plugins Gameplay Extensions (06, 07, 08) podem depender diretamente do Gameplay Base (05),
            mas o inverso é estritamente proibido: 05_SandboxCharacter nunca importa tipos ou cabeçalhos de
            Combat, Inventory ou Interaction. A comunicação entre extensões atravessa o Message Router de
            04_SandboxCore ou interfaces de 02_SandboxInterfaces — nunca uma chamada direta entre extensões.
          </p>
        </div>
      </div>
    </DocsLayout>
  );
}
