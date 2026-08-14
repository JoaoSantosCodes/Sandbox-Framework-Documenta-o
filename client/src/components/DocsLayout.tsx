/*
  DESIGN: "Blueprint Técnico" — layout de documentação
  Header com carimbo de versão + navegação lateral tipo sumário de especificação.
  Acento verde-engineering; tinta grafite sobre papel quente.
*/
import { Link, useLocation } from "wouter";
import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, X } from "lucide-react";
import { ASSET_URLS } from "@/lib/siteData";
import { CHECKLIST_META, decodeChecklistProgress } from "@/components/PhaseChecklist";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Data registrada da última sincronização integral Vault ↔ site (Dashboard, task.md,
// sfdg_guide.md, manifesto_and_coding_standards.md e páginas do site).
const LAST_VAULT_SYNC = "13/08/2026 23:50 GMT-3";

// Chaves de localStorage dos checklists interativos das fases — usadas pelo indicador de
// sincronização pendente no rodapé: se existe progresso marcado no navegador que ainda não
// foi homologado/marcado no Vault, o rodapé alerta o auditor.
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
    // Recheck quando outra aba atualiza o localStorage (checklists de outras páginas).
    window.addEventListener("storage", check);
    // Poll leve na mesma aba enquanto um checklist estiver na tela (itens mudam).
    const interval = window.setInterval(check, 2000);
    return () => {
      window.removeEventListener("storage", check);
      window.clearInterval(interval);
    };
  }, []);

  return unsynced;
}

// Detalha o progresso pendente por fase — usado pelo tooltip do rodapé.
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
import { SearchPalette, SearchShortcut } from "@/components/SearchPalette";
import { Search } from "lucide-react";

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      title={theme === "light" ? "Modo escuro" : "Modo claro"}
      className={`inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-engineering/60 transition-colors ${
        compact ? "p-2" : "px-2 py-1.5 text-[10px] gap-1.5 font-mono uppercase tracking-wider"
      }`}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {!compact && (theme === "light" ? "Escuro" : "Claro")}
    </button>
  );
}

const NAV = [
  { href: "/", label: "Início", section: "01" },
  { href: "/fase-17", label: "Fase 17 — Gameplay Debugger", section: "02·R" },
  { href: "/fase-18", label: "Fase 18 — Interface Dinâmica", section: "02" },
  { href: "/especificacao", label: "Especificação SFPS", section: "03" },
  { href: "/plugins", label: "Topologia de Plugins", section: "04" },
  { href: "/fases", label: "Histórico de Fases", section: "05" },
  { href: "/manual", label: "Manual de Uso", section: "06" },
  { href: "/guia-cpp", label: "Guia de Desenvolvimento", section: "07" },
  { href: "/message-router", label: "Message Router", section: "08" },
  { href: "/decisoes", label: "Registro de Decisões", section: "09" },
  { href: "/fase-19", label: "Fase 19 — Planejamento", section: "09·P" },
  { href: "/manifesto", label: "Manifesto & Padrões", section: "10" },
];

export function DocsLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const unsynced = useUnsyncedChecklists();
  const pendingDetails = usePendingDetails();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[oklch(0.968_0.008_90)]/92 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src={ASSET_URLS.logo} alt="Sandbox Framework" className="h-10 w-10 shrink-0" />
            <span className="font-mono text-[13px] font-bold tracking-[0.16em] uppercase whitespace-nowrap">
              Sandbox<span className="text-engineering">·</span>Framework
            </span>
          </Link>
          <div className="hidden xl:flex items-center gap-1">
            <ThemeToggle />
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  location === item.href
                    ? "border-engineering text-engineering"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <span className="font-mono text-[10px] opacity-60 mr-1.5">{item.section}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <SearchShortcut />
          <ThemeToggle compact />
          <button
            className="md:hidden p-2 -mr-2 mr-1"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            aria-label="Buscar"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <span className="phase-stamp hidden md:inline ml-2">v1.8.0 · Fase 18 homologada · 32/32</span>
          <button
            className="xl:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
            {open && (
          <nav className="xl:hidden border-t border-border bg-background px-4 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block py-2 text-sm ${
                  location === item.href ? "text-engineering font-semibold" : "text-foreground"
                }`}
              >
                <span className="font-mono text-[10px] opacity-60 mr-1.5">{item.section}</span>
                {item.label}
              </Link>
            ))}
            <button
              className="flex items-center gap-2 py-2 mt-1 text-sm text-muted-foreground font-mono text-[11px]"
              onClick={() => setOpen(false)}
            >
              <Search className="h-3.5 w-3.5" /> ⌘K buscar
            </button>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <SearchPalette />
      <footer className="border-t border-border bg-secondary/60">
        <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={ASSET_URLS.logo} alt="" className="h-6 w-6 opacity-70" />
            <p className="text-sm text-muted-foreground">
              Sandbox Framework · Documentação técnica de engenharia · Unreal Engine 5.8 · C++
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground tracking-wider">
            SPEC · v1.8.0 · 11 PLUGINS · ZERO DEPENDÊNCIAS CIRCULARES · FASE 18 HOMOLOGADA · 32/32
          </span>
        </div>
        <div className="border-t border-border/60">
          <div className="container py-2 flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              Última sincronização Vault ↔ site
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">·</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {LAST_VAULT_SYNC} — Dashboard v1.8.0 · task.md 9/9 · sfdg_guide · manifesto (DD-01…DD-08)
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              Checklists no site
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">·</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {CHECKLIST_META.map((meta) => {
                const { done } = decodeChecklistProgress(meta);
                return (
                  <span
                    key={meta.storageKey}
                    className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] tracking-wider ${
                      done.length === 0
                        ? "border-border/70 text-muted-foreground"
                        : "border-amber-warn/60 text-amber-warn"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" /> {meta.phase.replace("Fase ", "F")}: {done.length}/{meta.items.length}
                  </span>
                );
              })}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">·</span>
            {unsynced ? (
              <TooltipProvider>
              <Tooltip open disableHoverableContent={false} delayDuration={150}>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 cursor-default border border-amber-warn/70 bg-amber-warn/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-amber-warn animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> {pendingDetails.length} checklist(s) com progresso pendente
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-md p-0 border-border bg-popover text-popover-foreground"
              >
                <div className="max-w-sm">
                  {pendingDetails.map((d) => (
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
                    Passe no Vault para homologar · depois “Limpar progresso” no site
                  </div>
                </div>
              </TooltipContent>
              </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-engineering/60 bg-engineering/5 px-2 py-0.5 font-mono text-[10px] tracking-wider text-engineering">
                <Check className="h-3 w-3" /> Sem progresso pendente · sincronizado
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
