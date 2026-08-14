/*
  DESIGN: "Blueprint Técnico" + referência fuch.ai — documentação de especificação.
  Header: marca compacta no canto superior esquerdo (wordmark bold + sublinha mono);
  navegação agrupada como chips mono discretos no canto superior direito (padrão fuch.ai).
  Acento verde-engineering; tinta grafite sobre papel quente.
*/
import { Link, useLocation } from "wouter";
import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Check, Moon, Search, Sun, X, Menu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { ASSET_URLS } from "@/lib/siteData";
import { CHECKLIST_META, decodeChecklistProgress } from "@/components/PhaseChecklist";

/* Rota → checklist ativo: ⌘⇧C copia o Markdown do checklist da fase em foco
   (par com o botão "Copiar status" do checklist interativo). */
const ROUTE_PHASE_INDEX: Record<string, number> = {
  "/fase-17": 0,
  "/fase-18": 1,
  "/fase-19": 2,
};

function buildPhaseMarkdown(index: number): string | null {
  const meta = CHECKLIST_META[index];
  if (!meta) return null;
  const { done } = decodeChecklistProgress(meta);
  const pct = Math.round((done.length / meta.items.length) * 100);
  const lines = [
    `# Checklist — ${meta.phase} · ${meta.title}`,
    "",
    `Progresso: ${done.length}/${meta.items.length} itens concluídos (${pct}%).`,
    "",
    ...meta.items.map((item, idx) => {
      const mark = done.includes(item) ? "x" : " ";
      return `- [${mark}] ${idx + 1}. ${item.label}`;
    }),
    "",
    `Exportado do site de documentação do Sandbox Framework em ${new Date().toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}.`,
    "",
  ];
  return lines.join("\n");
}
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchPalette, SearchShortcut } from "@/components/SearchPalette";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Data registrada da última sincronização integral Vault ↔ site.
const LAST_VAULT_SYNC = "14/08/2026 01:15 GMT-3";

const PHASE_CHECKLIST_KEYS = ["sbf-phase17-checklist", "sbf-phase18-checklist", "sbf-phase19-checklist"];

interface PendingDetail {
  phase: string;
  title: string;
  doneCount: number;
  total: number;
  pending: string[];
}

function useUnsyncedChecklists(): boolean {
  const [unsynced, setUnsynced] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const anyProgress = PHASE_CHECKLIST_KEYS.some((key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          return typeof parsed === "object" && parsed !== null && Object.values(parsed).some(Boolean);
        });
        setUnsynced(anyProgress);
      } catch {
        setUnsynced(false);
      }
    };
    check();
    window.addEventListener("storage", check);
    const interval = window.setInterval(check, 2000);
    return () => {
      window.removeEventListener("storage", check);
      window.clearInterval(interval);
    };
  }, []);

  return unsynced;
}

function usePendingDetails(): PendingDetail[] {
  const [details, setDetails] = useState<PendingDetail[]>([]);

  useEffect(() => {
    const check = () => {
      setDetails(
        CHECKLIST_META.map((meta) => {
          const { done, pending } = decodeChecklistProgress(meta);
          return {
            phase: meta.phase,
            title: meta.title,
            doneCount: done.length,
            total: meta.items.length,
            pending: pending.map((i) => i.label),
          };
        }).filter((d) => d.doneCount > 0)
      );
    };
    check();
    window.addEventListener("storage", check);
    const interval = window.setInterval(check, 2000);
    return () => {
      window.removeEventListener("storage", check);
      window.clearInterval(interval);
    };
  }, []);

  return details;
}

/*
  Nav como chips (referência fuch.ai): rótulo curto mono + número de ordem.
  Home fica como chip utilitário de busca (⌘K cobre o acesso completo).
*/
const NAV_CHIPS = [
  { href: "/fase-17", label: "F17 — Debugger", short: "01 · F17" },
  { href: "/fase-18", label: "F18 — Interface Dinâmica", short: "02 · F18" },
  { href: "/fase-19", label: "F19 — Planejamento", short: "03 · F19" },
  { href: "/especificacao", label: "Especificação SFPS", short: "04 · SFPS" },
  { href: "/plugins", label: "Topologia de Plugins", short: "05 · Plugins" },
  { href: "/manual", label: "Manual de Uso", short: "06 · Manual" },
  { href: "/guia-cpp", label: "Guia de Desenvolvimento", short: "07 · Guia" },
  { href: "/message-router", label: "Message Router", short: "08 · Router" },
  { href: "/decisoes", label: "Registro de Decisões", short: "09 · Decisões" },
  { href: "/manifesto", label: "Manifesto & Padrões", short: "10 · Manifesto" },
  { href: "/historico", label: "Histórico Consolidado", short: "11 · Hist" },
];

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      title={theme === "light" ? "Modo escuro" : "Modo claro"}
      className={`inline-flex items-center justify-center border border-border rounded-full text-muted-foreground hover:text-foreground hover:border-engineering/60 transition-colors ${
        compact ? "p-2" : "px-3 py-1.5 text-[10px] gap-1.5 font-mono uppercase tracking-wider"
      }`}
    >
      {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      {!compact && (theme === "light" ? "Escuro" : "Claro")}
    </button>
  );
}

function SyncBadge({ details, unsynced }: { details: PendingDetail[]; unsynced: boolean }) {
  if (!unsynced) return null;
  return (
    <TooltipProvider>
      <Tooltip open disableHoverableContent={false} delayDuration={150}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 cursor-default border border-amber-warn/70 bg-amber-warn/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-amber-warn animate-pulse">
            <AlertTriangle className="h-3 w-3" /> {details.length} checklist(s) pendente(s)
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="max-w-md p-0 border-border bg-popover text-popover-foreground"
        >
          <div className="max-w-sm">
            {details.map((d) => (
              <div key={d.phase} className="px-3 py-2 border-b border-border/60 last:border-b-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-warn mb-1.5">
                  {d.phase} · {d.doneCount}/{d.total} concluídos
                </div>
                <ul className="space-y-1">
                  {d.pending.slice(0, 6).map((p) => (
                    <li key={p} className="flex items-start gap-1.5 text-[10px] text-foreground/90 leading-snug">
                      <span className="mt-1 h-1 w-1 shrink-0 bg-amber-warn/80" />
                      {p}
                    </li>
                  ))}
                  {d.pending.length > 6 && (
                    <li className="font-mono text-[10px] text-muted-foreground">
                      + {d.pending.length - 6} itens restantes
                    </li>
                  )}
                </ul>
              </div>
            ))}
            <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Passe no Vault para homologar · depois "Limpar progresso" no site
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DocsLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const unsynced = useUnsyncedChecklists();
  const pendingDetails = usePendingDetails();

  /* Atalho ⌘⇧C — copiar o checklist da fase ativa sem usar o mouse.
     Ignora quando o foco está em campo de texto (para não colidir com ⌘C nativo). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.key.toLowerCase() !== "c") return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) return;
      const index = ROUTE_PHASE_INDEX[location];
      const text = index !== undefined ? buildPhaseMarkdown(index) : null;
      if (!text) {
        toast("Nenhuma fase ativa nesta página", {
          description: "⌘⇧C copia o checklist das páginas /fase-17, /fase-18 e /fase-19.",
        });
        return;
      }
      e.preventDefault();
      navigator.clipboard
        .writeText(text)
        .then(() => {
          const meta = CHECKLIST_META[index];
          toast(`Checklist da ${meta.phase} copiado`, {
            description: `Markdown da fase ativa pronto para colar no Vault.`,
          });
        })
        .catch(() => {
          toast("Falha ao copiar", {
            description: "O navegador bloqueou o acesso à área de transferência.",
          });
        });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[oklch(0.968_0.008_90)]/90 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-3 py-3">
          {/* Marca compacta no canto superior esquerdo (fuch.ai: identidade em bloco) */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0 group">
            <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
              Sandbox<span className="text-engineering">·</span>Framework
            </span>
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-engineering transition-colors">
              Engineering spec · UE5.8 · C++
            </span>
          </Link>

          {/* Chips utilitários + chips de navegação agrupados à direita (fuch.ai) */}
          <div className="flex items-center gap-1.5">
            <SearchShortcut />
            <ThemeToggle compact />
            <span className="hidden md:inline-block mx-1 h-4 w-px bg-border/70" />
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_CHIPS.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`px-2 py-1 rounded-full border text-[10px] font-mono uppercase tracking-[0.08em] whitespace-nowrap transition-colors ${
                    location === item.href
                      ? "border-engineering text-engineering bg-engineering/5"
                      : "border-border/70 text-muted-foreground hover:text-foreground hover:border-foreground/40"
                  }`}
                >
                  {item.short}
                </Link>
              ))}
              {/* Mais chips via search */}
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
                className="px-2 py-1 rounded-full border border-dashed border-border text-[10px] font-mono uppercase tracking-[0.08em] text-muted-foreground hover:text-engineering hover:border-engineering/60 transition-colors"
                title="Buscar nas demais páginas (⌘K)"
              >
                +5 · ⌘K
              </button>
            </nav>
            <SyncBadge details={pendingDetails} unsynced={unsynced} />
            <Sheet>
              <SheetTrigger asChild>
                <button className="xl:hidden p-2 -mr-2" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-mono text-xs uppercase tracking-[0.18em]">
                    Sandbox<span className="text-engineering">·</span>Framework
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 space-y-1">
                  <Link
                    href="/"
                    onClick={() => {}}
                    className={`block px-3 py-2.5 text-sm border-l-2 ${
                      location === "/" ? "border-engineering text-engineering font-semibold" : "border-transparent text-foreground"
                    }`}
                  >
                    00 · Início
                  </Link>
                  {NAV_CHIPS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2.5 text-sm border-l-2 ${
                        location === item.href
                          ? "border-engineering text-engineering font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.short} — {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-border/60">
                    <p className="px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Última sync Vault · {LAST_VAULT_SYNC}
                    </p>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SearchPalette />
      {/* Rodapé: faixa mono "trusted by"-like (fuch.ai) + auditoria de sync compacta */}
      <footer className="border-t border-border bg-secondary/60">
        <div className="container py-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Spec · v1.8.0
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground flex-wrap justify-center">
              <span>11 plugins</span>
              <span>·</span>
              <span className="text-engineering">zero dependências circulares</span>
              <span>·</span>
              <span>Fase 18 homologada 32/32</span>
              <span>·</span>
              <span>Fase 19 em homologação (v1.9.0)</span>
              <span>·</span>
              <span>UE5.8 · C++</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Vault ↔ site · {LAST_VAULT_SYNC}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {CHECKLIST_META.map((meta) => {
                const { done } = decodeChecklistProgress(meta);
                return (
                  <span
                    key={meta.storageKey}
                    className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${
                      done.length === 0
                        ? "border-border/70 text-muted-foreground"
                        : "border-amber-warn/60 text-amber-warn"
                    }`}
                  >
                    {done.length > 0 && <Check className="h-2.5 w-2.5" />}
                    {meta.phase.replace("Fase ", "F")}: {done.length}/{meta.items.length}
                  </span>
                );
              })}
              {!unsynced && (
                <span className="inline-flex items-center gap-1.5 border rounded-full border-engineering/60 bg-engineering/5 px-2 py-0.5 font-mono text-[10px] tracking-wider text-engineering">
                  <Check className="h-3 w-3" /> sincronizado
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              Sandbox Framework · documentação de engenharia
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
