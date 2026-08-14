/* Design: "Blueprint Técnico" + referência fuch.ai (ver ideas.md / DocsLayout.tsx).
   Página interna — segue a Internal-page opening rule: header espec assimétrico de
   2 colunas (trilho mono à esquerda, tese editorial à direita).
   Acento verde-engineering; tinta grafite sobre papel quente; selo tracejado para rascunhos. */
import { useState, useEffect, useMemo } from "react";
import { Copy } from "lucide-react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  FileText,
  Filter,
  Layers,
  Printer,
  RefreshCcw,
  Search,
  SortDesc,
  X,
} from "lucide-react";
import { DocsLayout } from "@/components/DocsLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PHASE_PENDINGS,
  PENDING_ORDER_NOTE,
  filterAndSortPendings,
  pendingCount,
  type PhasePending,
} from "@/lib/phasePendings";
import { toast } from "sonner";
import { sourceForRoute, extractSectionMarkdown } from "@/lib/sectionsMarkdown";

const FILTER_STORAGE_KEY = "sbf-pendencias-filter";
const SEARCH_STORAGE_KEY = "sbf-pendencias-search";

/* Busca por palavras-chave (id, título, categoria, resumo e requisitos) com
   destaque âmbar do termo — mesmo padrão do changelog da Home. */
function highlightTerm(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="bg-amber-warn/25 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function pendingMatches(p: PhasePending, term: string): boolean {
  if (!term.trim()) return true;
  const hay = `${p.id} ${p.titulo} ${p.categoria} ${p.resumo} ${p.itens.map((i) => `${i.id} ${i.exige}`).join(" ")}`.toLowerCase();
  return hay.includes(term.toLowerCase());
}

/* Exportação da lista filtrada: Markdown (.md) e PDF (print-to-PDF nativo).
   O formato de impressão (container oculto em tela, visível na impressão)
   espelha sempre o estado corrente: filtro de categoria + ordenação ativos. */

function pendingsToMarkdown(pendings: PhasePending[], filter: CategoryFilter, sort: SortKey): string {
  const lines: string[] = [];
  lines.push("# Pendências de fases — Snapshot exportado");
  lines.push("");
  lines.push(`Fonte oficial: pendencias_de_fases.md (Sandbox-Framework-Vault) · exportado em ${new Date().toLocaleString("pt-BR")} GMT-3`);
  lines.push("");
  lines.push(`Filtro aplicado: ${CATEGORY_CHIPS.find((c) => c.key === filter)?.label ?? filter} · ordenação: ${SORT_OPTIONS.find((s) => s.key === sort)?.label ?? sort}`);
  lines.push("");
  lines.push("## Regra de homologação");
  lines.push("");
  HOMOLOGATION_RULES.forEach((r) => lines.push(`${r.step}. ${r.label}`));
  lines.push("");
  lines.push(`## Pendências (${pendings.length})`);
  lines.push("");
  pendings.forEach((p) => {
    const pendingItems = p.itens.filter((i) => i.estado === "Pendente").length;
    lines.push(`### ${p.id} · ${p.titulo}`);
    lines.push("");
    lines.push(`**Categoria:** ${p.categoria}${p.categoria === "Proposta fora da régua" ? " · rascunho" : ""}`);
    lines.push("");
    lines.push(p.resumo);
    lines.push("");
    lines.push(`**Itens pendentes:** ${pendingItems}/${p.itens.length}`);
    lines.push("");
    p.itens.forEach((item) => lines.push(`- [${item.estado === "Pendente" ? " " : "x"}] **${item.id}** — ${item.exige}`));
    lines.push("");
  });
  lines.push(`Ordem de execução recomendada pelo Vault: ${PENDING_ORDER_NOTE}`);
  lines.push("");
  return lines.join("\n");
}

function exportMarkdown(pendings: PhasePending[], filter: CategoryFilter, sort: SortKey) {
  const markdown = pendingsToMarkdown(pendings, filter, sort);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pendencias_de_fases_${filter === "todas" ? "todas" : filter}_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Markdown exportado", {
    description: `${pendings.length} pendência(s) com o filtro ativo — pronta para colar no Vault após homologação.`,
  });
}

type CategoryFilter = "todas" | "backlog" | "proposta" | "documental";
type SortKey = "ordem" | "id" | "pendentes";

const CATEGORY_CHIPS: { key: CategoryFilter; label: string; count: number }[] = [
  { key: "todas", label: "Todas", count: PHASE_PENDINGS.length },
  {
    key: "backlog",
    label: "Backlog oficial",
    count: PHASE_PENDINGS.filter((p) => p.categoria === "Backlog oficial do Vault").length,
  },
  {
    key: "proposta",
    label: "Propostas fora da régua",
    count: PHASE_PENDINGS.filter((p) => p.categoria === "Proposta fora da régua").length,
  },
  {
    key: "documental",
    label: "Documental",
    count: PHASE_PENDINGS.filter((p) => p.categoria === "Documental").length,
  },
];

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof SortDesc }[] = [
  { key: "ordem", label: "Ordem do Vault", icon: SortDesc },
  { key: "id", label: "ID P-1…P-7", icon: SortDesc },
  { key: "pendentes", label: "Mais pendentes", icon: ClipboardList },
];

/* Regras de homologação — do próprio documento Vault */
const HOMOLOGATION_RULES = [
  { step: "1", label: "Corpo real de código C++ compilado com UBT Exit 0" },
  { step: "2", label: "Suíte de testes 100% verde no contexto do projeto" },
  { step: "3", label: "Isolamento simétrico — desabilitar o plugin e recompilar sem quebra" },
  {
    step: "4",
    label: "Carimbo consistente em 00_Sandbox_Framework_Dashboard.md, task.md e walkthrough.md",
  },
];

function useCopySection() {
  return (sectionId: string) => {
    const source = sourceForRoute("/pendencias");
    if (!source) {
      toast.error("Fonte de exportação indisponível", { description: "Recarregue a página e tente novamente." });
      return;
    }
    const markdown = extractSectionMarkdown(source, sectionId);
    if (!markdown) {
      toast.error("Seção não encontrada para exportação", {
        description: "Recarregue a página e tente novamente.",
      });
      return;
    }
    navigator.clipboard.writeText(markdown).then(
      () => toast.success(`Seção copiada — ${source.page}`, { description: "Pronta para colar no Vault após homologação." }),
      () => toast.error("Falha ao copiar"),
    );
  };
}

export default function Pendencias() {
  const [filter, setFilter] = useState<CategoryFilter>(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      if (raw && ["todas", "backlog", "proposta", "documental"].includes(raw)) return raw as CategoryFilter;
    } catch {
      // ignore
    }
    return "todas";
  });
  const [sort, setSort] = useState<SortKey>("ordem");
  const [term, setTerm] = useState<string>(() => {
    try {
      return localStorage.getItem(SEARCH_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [openPending, setOpenPending] = useState<PhasePending | null>(null);
  const copySection = useCopySection();

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch {
      // ignore
    }
  }, [filter]);

  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_STORAGE_KEY, term);
    } catch {
      // ignore
    }
  }, [term]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FILTER_STORAGE_KEY && e.newValue) {
        if (["todas", "backlog", "proposta", "documental"].includes(e.newValue)) {
          setFilter(e.newValue as CategoryFilter);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sorted = useMemo(
    () => filterAndSortPendings(PHASE_PENDINGS, filter, sort).filter((p) => pendingMatches(p, term)),
    [filter, sort, term],
  );
  const totalPending = PHASE_PENDINGS.reduce((acc, p) => acc + pendingCount(p), 0);

  return (
    <DocsLayout>
      {/* Header espec assimétrico (Internal-page opening rule) */}
      <div className="border-b border-border bg-secondary/60">
        <div className="container py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <aside className="font-mono text-[11px] leading-relaxed text-muted-foreground flex flex-col gap-1">
            <span className="uppercase tracking-[0.18em] text-foreground/70">015 · pendencias_de_fases.md</span>
            <span className="uppercase tracking-[0.18em] text-foreground/70">
              docs · {PHASE_PENDINGS.length} pendências · {totalPending} itens
            </span>
            <span className="uppercase tracking-[0.18em] text-foreground/70">spec · v1.9.0</span>
            <span className="mt-2 pt-2 border-t border-border/60 uppercase tracking-[0.18em] text-foreground/70">
              vault · oficial
            </span>
            <span className="text-[10px]">criado em 14/08/2026 · auditoria Vault ↔ site</span>
            <span className="text-[10px]">3 camadas · 1 arquivo de precedentes</span>
          </aside>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-engineering">
              backlog oficial das fases · espelho do Vault
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight">
              O que o framework ainda não é — pendências de fases
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
              Este documento consolida tudo que <strong className="text-foreground">ainda não foi implementado ou
              homologado</strong> no Vault oficial. O que não está compilado no C++/UE5.8 não conta como concluído,
              independentemente de existir como plano, rascunho ou proposta em qualquer outro documento — rascunhos,
              planos e propostas não contam como homologação.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de ferramentas: chips de categoria + ordenação */}
      <div className="border-b border-border bg-background">
        <div className="container py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  filter === chip.key
                    ? "border-engineering bg-engineering/10 text-engineering"
                    : "border-border bg-card text-muted-foreground hover:border-engineering/60 hover:text-foreground"
                }`}
              >
                <Filter className="h-3 w-3" />
                {chip.label}
                <span className="opacity-60">{chip.count}</span>
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ordenar:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  sort === opt.key
                    ? "border-foreground/60 bg-secondary text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40"
                }`}
                title={opt.label}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </button>
            ))}
          </div>
          {/* Busca em tempo real — combina com o filtro de categoria e a ordenação ativos */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar pendência… (ID, título, requisito)"
                className="w-full border border-border bg-card pl-8 pr-7 py-1 font-mono text-[11px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-engineering/70 transition-colors"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {term.trim() && (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground shrink-0">
                {sorted.length} resultado{sorted.length === 1 ? "" : "(s)"} para «{term.trim().slice(0, 20)}»
              </span>
            )}
          </div>
          <div className="h-5 w-px bg-border hidden md:block" />
          {/* Exportação da lista filtrada — respeita o filtro de categoria e a ordenação ativos */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => exportMarkdown(sorted, filter, sort)}
              className="inline-flex items-center gap-1.5 border border-engineering/60 bg-engineering/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:bg-engineering/10 transition-colors active:scale-[0.97]"
              title={`Exporta a lista filtrada (${sorted.length} pendência(s)) como Markdown`}
            >
              <FileText className="h-3 w-3" />
              Exportar .md
            </button>
            <button
              type="button"
              onClick={() => {
                window.print();
                toast.success("Preparando PDF", {
                  description: "Na janela de impressão, escolha \"Salvar como PDF\" — a lista sai com o filtro e a ordenação ativos.",
                });
              }}
              className="inline-flex items-center gap-1.5 border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:border-engineering/60 hover:text-engineering transition-colors active:scale-[0.97]"
              title="Abre a janela de impressão para salvar a lista filtrada como PDF"
            >
              <Printer className="h-3 w-3" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <main className="container py-8 space-y-8" id="pendencias-lista">
        {/* Regra de homologação */}
        <section className="border border-engineering/40 bg-engineering/[0.04]" id="pendencias-regra">
          <div className="px-4 py-2 border-b border-dashed border-engineering/40 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-engineering">
              regra de homologação · fonte: pendencias_de_fases.md
            </span>
            <button
              onClick={() => copySection("pendencias-regra")}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" /> copiar seção
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {HOMOLOGATION_RULES.map((r) => (
              <div key={r.step} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-engineering border border-engineering/50 px-1.5 py-0.5">
                  {r.step}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ordem de execução recomendada */}
        <div className="flex items-start gap-3 border border-border bg-card px-4 py-3">
          <Layers className="h-4 w-4 mt-0.5 shrink-0 text-engineering" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Ordem de execução recomendada pelo Vault:</strong> {PENDING_ORDER_NOTE}
          </p>
        </div>

        {/* Cards de pendências */}
        <section className="space-y-5">
          {sorted.map((p) => (
            <PendingCard
              key={p.id}
              pending={p}
              term={term}
              copySection={copySection}
              onOpen={(pd) => setOpenPending(pd)}
            />
          ))}
          {sorted.length === 0 && (
            <div className="border border-dashed border-border px-6 py-10 text-center space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {term.trim()
                  ? `Nenhum resultado para «${term.trim().slice(0, 20)}»`
                  : "Nenhuma pendência nesta categoria"}
              </p>
              {term.trim() && (
                <button
                  onClick={() => setTerm("")}
                  className="inline-flex items-center gap-1.5 border border-engineering/60 bg-engineering/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:bg-engineering/10 transition-colors"
                >
                  <X className="h-3 w-3" /> Limpar busca
                </button>
              )}
            </div>
          )}
        </section>

        {/* Modal de detalhes da pendência — aberto ao clicar no card */}
        <PendingDetailModal pending={openPending} onClose={() => setOpenPending(null)} copySection={copySection} />

        {/* Formato de impressão (PDF) — oculto em tela, espelha a lista filtrada */}
        <div className="print-only hidden print:block space-y-4">
          <h1 className="text-2xl font-bold">
            Pendências de fases — {CATEGORY_CHIPS.find((c) => c.key === filter)?.label ?? filter} ({sorted.length})
          </h1>
          <p className="text-xs">
            Fonte oficial: pendencias_de_fases.md (Sandbox-Framework-Vault) · exportado em{" "}
            {new Date().toLocaleString("pt-BR")} · ordenação: {SORT_OPTIONS.find((s) => s.key === sort)?.label ?? sort}
          </p>
          {sorted.map((p) => (
            <div key={p.id} className="border border-gray-300">
              <h2 className="bg-gray-100 px-3 py-2 font-mono text-sm font-bold">
                {p.id} · {p.titulo} — {p.categoria}
              </h2>
              <div className="px-3 py-2 space-y-2">
                <p className="text-sm">{p.resumo}</p>
                <ul className="text-sm space-y-1">
                  {p.itens.map((item) => (
                    <li key={item.id}>
                      [{item.estado === "Pendente" ? " " : "x"}] {item.id} — {item.exige}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </DocsLayout>
  );
}

function PendingCard({
  pending,
  term,
  copySection,
  onOpen,
}: {
  pending: PhasePending;
  term: string;
  copySection: (id: string) => void;
  onOpen: (p: PhasePending) => void;
}) {
  const pendingItems = pending.itens.filter((i) => i.estado === "Pendente").length;
  const isDraft = pending.categoria === "Proposta fora da régua";
  return (
    <article
      className="border border-border bg-card"
      id={`pendencias-${pending.id.toLowerCase()}`}
    >
      {/* Clique no header abre o modal de detalhes da pendência */}
      <button
        type="button"
        onClick={() => onOpen(pending)}
        className="w-full text-left px-4 py-3 border-b border-border flex items-start justify-between gap-3 flex-wrap group"
        aria-label={`Abrir detalhes de ${pending.id} · ${pending.titulo}`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-engineering">
            {highlightTerm(pending.id, term)}
          </span>
          <h2 className="font-display text-xl font-bold">{highlightTerm(pending.titulo, term)}</h2>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 border ${
              pending.categoria === "Backlog oficial do Vault"
                ? "border-engineering/60 text-engineering"
                : isDraft
                  ? "border-dashed border-muted-foreground/60 text-muted-foreground"
                  : "border-border/70 text-muted-foreground"
            }`}
          >
            {pending.categoria}
          </span>
          {isDraft && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] border border-amber-warn/60 text-amber-warn px-2 py-0.5">
              rascunho
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ClipboardList className="h-3 w-3" />
            {pendingItems}/{pending.itens.length} pendentes
          </span>
          <span className="text-engineering/70 hidden sm:inline-flex items-center gap-1">
            <CheckSquare className="h-3 w-3" /> ver detalhes
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copySection(`pendencias-${pending.id.toLowerCase()}`);
            }}
            className="hover:text-engineering inline-flex items-center gap-1 hover:underline underline-offset-4"
          >
            <RefreshCcw className="h-3 w-3" /> copiar seção
          </button>
        </div>
      </button>
      <div className="p-4 space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{highlightTerm(pending.resumo, term)}</p>
        {pending.paginaRelacionada && (
          <Link
            href={pending.paginaRelacionada}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:underline underline-offset-4"
          >
            <ArrowUpRight className="h-3 w-3" /> documento no site
            <ExternalLink className="h-2.5 w-2.5 opacity-50" />
          </Link>
        )}
        <div className="border border-border bg-secondary/40">
          <div className="px-3 py-1.5 border-b border-dashed border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {pending.itens.length} requisito(s) para sair da lista
          </div>
          <ul className="divide-y divide-border/60">
            {pending.itens.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-3 py-2">
                <span className="font-mono text-[10px] text-muted-foreground pt-0.5 w-12 shrink-0">{item.id}</span>
                <p className="text-sm leading-relaxed flex-1">{highlightTerm(item.exige, term)}</p>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border shrink-0 ${
                    item.estado === "Pendente"
                      ? "border-amber-warn/60 text-amber-warn"
                      : "border-engineering/60 text-engineering"
                  }`}
                >
                  {item.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* Modal de detalhes da pendência — abre ao clicar no header do card.
   Espelha o conteúdo integral do Vault: resumo completo, checklist de
   requisitos com estado e documento relacionado, sem inventar notas. */
function PendingDetailModal({
  pending,
  onClose,
  copySection,
}: {
  pending: PhasePending | null;
  onClose: () => void;
  copySection: (id: string) => void;
}) {
  const completedItems = pending?.itens.filter((i) => i.estado !== "Pendente").length ?? 0;
  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering border border-engineering/60 px-1.5 py-0.5">
              {pending?.id}
            </span>
            {pending?.categoria && (
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 border ${
                  pending.categoria === "Backlog oficial do Vault"
                    ? "border-engineering/60 text-engineering"
                    : pending.categoria === "Proposta fora da régua"
                      ? "border-dashed border-muted-foreground/60 text-muted-foreground"
                      : "border-border/70 text-muted-foreground"
                }`}
              >
                {pending.categoria}
              </span>
            )}
          </div>
          <DialogTitle className="font-display text-xl font-bold">
            {pending?.titulo}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {pending?.resumo}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>
              {completedItems}/{pending?.itens.length ?? 0} requisitos concluídos
            </span>
            <span>
              {pending?.itens.length} para sair da lista
            </span>
          </div>
          <ul className="divide-y divide-border/60 border border-border bg-secondary/40">
            {pending?.itens.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-3 py-2">
                <span
                  className={`font-mono text-[10px] pt-0.5 w-12 shrink-0 ${
                    item.estado === "Pendente" ? "text-muted-foreground" : "text-engineering"
                  }`}
                >
                  [{item.estado === "Pendente" ? " " : "x"}] {item.id}
                </span>
                <p className="text-sm leading-relaxed flex-1">{item.exige}</p>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 border shrink-0 ${
                    item.estado === "Pendente"
                      ? "border-amber-warn/60 text-amber-warn"
                      : item.estado === "Parcial"
                        ? "border-foreground/40 text-foreground"
                        : "border-engineering/60 text-engineering"
                  }`}
                >
                  {item.estado}
                </span>
              </li>
            ))}
          </ul>
          {pending?.paginaRelacionada && (
            <Link
              href={pending.paginaRelacionada}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:underline underline-offset-4"
            >
              <ArrowUpRight className="h-3 w-3" /> ver documento no site
            </Link>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            fonte: pendencias_de_fases.md · Vault
          </p>
          {pending && (
            <button
              onClick={() => copySection(`pendencias-${pending.id.toLowerCase()}`)}
              className="inline-flex items-center gap-1 border border-engineering/60 bg-engineering/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:bg-engineering/10 transition-colors"
            >
              <RefreshCcw className="h-3 w-3" /> copiar seção
            </button>
          )}
          {/* Botão "Copiar texto" — resumo compacto da pendência (badge · título · resumo · checklist)
             gerado diretamente do PhasePending aberto, sem depender do DOM e sem inventar notas. */}
          {pending && (
            <button
              onClick={() => copyPendingSummary(pending)}
              className="inline-flex items-center gap-1 border border-border/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:border-engineering/60 transition-colors"
            >
              <Copy className="h-3 w-3" /> copiar texto
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Copia um resumo compacto da pendência em texto plano — compartilhável em chat
   ou anotação: badge + título + categoria + resumo + checklist de requisitos.
   O conteúdo vem integralmente do PhasePending (fonte única phasePendings.ts,
   espelho do Vault) — nenhum campo é inventado. */
function copyPendingSummary(p: PhasePending) {
  const lines: string[] = [
    `${p.id} · ${p.titulo} · ${p.categoria}`,
    "",
    p.resumo,
    "",
    "Requisitos:",
    ...p.itens.map((i) => `[${i.estado === "Pendente" ? " " : "x"}] ${i.id} ${i.exige}`),
    "",
    `fonte: pendencias_de_fases.md · Vault · https://sandboxdocs-c9yezybu.manus.space/pendencias`,
  ];
  navigator.clipboard.writeText(lines.join("\n")).then(
    () => toast.success(`Texto copiado — ${p.id}: ${p.titulo}`, {
      description: "Compartilhável em texto plano; a homologação oficial segue no Vault.",
    }),
    () => toast.error("Falha ao copiar"),
  );
}
