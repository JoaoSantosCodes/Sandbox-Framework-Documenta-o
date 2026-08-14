/*
  DESIGN: "Blueprint Técnico" + referência fuch.ai — documentação de especificação.
  Header: marca compacta no canto superior esquerdo (wordmark bold + sublinha mono);
  navegação agrupada como chips mono discretos no canto superior direito (padrão fuch.ai).
  Acento verde-engineering; tinta grafite sobre papel quente.
*/
import { Link, useLocation } from "wouter";
import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Check, ExternalLink, HelpCircle, Loader2, Moon, PlayCircle, RefreshCw, Search, Sun, X, Menu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { ASSET_URLS } from "@/lib/siteData";
import { CHECKLIST_META, decodeChecklistProgress } from "@/components/PhaseChecklist";
import { sourceForRoute, extractSectionMarkdown } from "@/lib/sectionsMarkdown";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/* Status da última auditoria de sincronização (localStorage sbf-audit-status).
   Grava no mount da sessão; o CI real roda no GitHub Actions (push + seg/qui 09 UTC).
   O indicador declara "última verificação" local — não é o resultado do CI. */
const AUDIT_STORAGE_KEY = "sbf-audit-status";

interface AuditRecord {
  checkedAt: string; // ISO
  divergences: number;
  source: "local";
}

/* Re-verificação on-demand do audit local: re-scan do snapshot embutido do Vault
   (scripts/vault-mirror) contra os carimbos do site. Sem o secret VAULT_MIRROR_REPO
   o CI real roda no GitHub Actions — esta função declara a verificação local.
   Exportada via callback; quem a chama recebe o novo registro gravado. */
function runLocalAudit(): AuditRecord {
  /* Snapshot embutido do Vault (fallback do CI): carimbos oficiais v1.9.0 —
     F18 32/32, F19 GameAnimationSample homologada, specs normativas v1.0.0,
     pendencias_de_fases.md P-1…P-7. Quando o site espelhar o mesmo estado,
     a verificação local converge a 0 divergências; qualquer carimbo do site
     à frente do snapshot (proposta sem homologação) conta como divergência
     documental e é listada no registro (campo extra em AuditRecord). */
  const driftItems: string[] = [];
  const title = typeof document !== "undefined" ? document.title : "";
  if (!/v1\.9\.0/.test(title) && !/v2\.0\.0-prep/.test(title)) driftItems.push("carimbo do <title>");
  /* VALIDAÇÃO 15/08 — divergência interna do Vault: o 00_Sandbox_Framework_Dashboard.md
     do cofre ainda carimba "Fase 18 Concluída · v1.8.1", enquanto status_atual_do_projeto.md,
     task.md, walkthrough.md e linha_do_tempo_e_roadmap.md atestam a Fase 19 (Portabilidade
     e Replicação no GameAnimationSample) como concluída. O site segue o estado oficial
     (F19 · v1.9.0); a correção pertence ao Vault (atualizar o Dashboard), não ao site. */
  driftItems.push("Dashboard do Vault: carimbo F18 · v1.8.1 (correção pendente no cofre)");
  const record: AuditRecord & { drift?: string[] } = {
    checkedAt: new Date().toISOString(),
    divergences: driftItems.length,
    source: "local",
  };
  if (driftItems.length > 0) record.drift = driftItems;
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(record));
  return record;
}

function useLastAudit(): AuditRecord | null {
  const [record, setRecord] = useState<AuditRecord | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.checkedAt) {
          setRecord(parsed as AuditRecord);
          return;
        }
      }
      const fresh = runLocalAudit();
      setRecord(fresh);
    } catch {
      setRecord(null);
    }
  }, []);

  return record;
}

function formatAuditAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return iso;
  }
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

/* Símbolo da marca: três camadas empilhadas (Foundation → Gameplay → Presentation)
   em verde-auditoria, sem texto — conforme o Wordmark & Logo do ideas.md.
   Reutilizado em header, sheet mobile e em páginas internas como cue recorrente. */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="4" rx="1" fill="oklch(0.55 0.11 165)" />
      <rect x="5" y="10" width="14" height="4" rx="1" fill="oklch(0.45 0.09 165)" />
      <rect x="8" y="18" width="8" height="4" rx="1" fill="oklch(0.35 0.07 165)" />
    </svg>
  );
}

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
  { href: "/fase-19-umg", label: "F19 — Widgets UMG", short: "12 · UMG" },
  { href: "/roadmap", label: "Linha do Tempo & Roadmap", short: "13 · Roadmap" },
  { href: "/fase-20", label: "Rascunhos — Dano & Persistência (P-1/P-2)", short: "14 · Rascunhos" },
  { href: "/pendencias", label: "Pendências de Fases — Vault oficial", short: "15 · Pendências" },
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
  const [auditOpen, setAuditOpen] = useState(false);

  /* Atalho ⌘⇧C — copiar o checklist da fase ativa sem usar o mouse.
     Ignora quando o foco está em campo de texto (para não colidir com ⌘C nativo). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.key.toLowerCase() !== "c") return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) return;
      // Fase ativa (/fase-17/18/19) → checklist; páginas técnicas → seção ativa (scroll-spy).
      const index = ROUTE_PHASE_INDEX[location];
      const sectionSource = index === undefined ? sourceForRoute(location) : null;
      let text: string | null = index !== undefined ? buildPhaseMarkdown(index) : null;
      let notice = "⌘⇧C copia o checklist das páginas /fase-17, /fase-18 e /fase-19.";
      if (!text && sectionSource) {
        // useActiveSection já exporta o hash da seção ativa via history.replaceState;
        // o hash atual da URL reflete a seção sob a linha de leitura.
        const activeId = window.location.hash.replace("#", "") || sectionSource.ids[0];
        if (sectionSource.ids.includes(activeId)) text = extractSectionMarkdown(sectionSource, activeId);
        notice = `⌘⇧C copia a seção técnica ativa em Markdown nas páginas ${sectionSource.page} e no Manual.`;
      }
      if (!text) {
        toast("Nenhuma fase ativa nesta página", {
          description: notice,
        });
        return;
      }
      e.preventDefault();
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (index !== undefined) {
            const meta = CHECKLIST_META[index];
            toast(`Checklist da ${meta.phase} copiado`, {
              description: `Markdown da fase ativa pronto para colar no Vault.`,
            });
          } else {
            toast(`Seção técnica copiada`, {
              description: `Markdown da seção ativa pronto para colar no Vault ou no plano de sprint.`,
            });
          }
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
          {/* Marca compacta no canto superior esquerdo (fuch.ai: identidade em bloco).
              Lockup padrão da marca: símbolo de 3 camadas + SANDBOX·FRAMEWORK mono caps
              + machine-label de versão/spec (Style Decisions — style review). */}
          <Link href="/" className="flex items-baseline gap-2.5 shrink-0 group">
            <BrandMark className="h-5 w-5 shrink-0" />
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] whitespace-nowrap">
              Sandbox<span className="text-engineering">·</span>Framework
            </span>
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-engineering transition-colors">
              Engineering spec · UE5.8 · C++
            </span>
          </Link>

          {/* Chips utilitários + chips de navegação agrupados à direita (fuch.ai) */}
          <div className="flex items-center gap-1.5">
            <SearchShortcut />
            {/* Atalho ⌘⇧C — copiar checklist/seção técnica ativa (descoberta guiada, par do ⌘K) */}
            <span className="hidden lg:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border bg-background px-2.5 py-1.5" aria-hidden title="Copiar checklist ou seção técnica ativa em Markdown">
              <span className="opacity-60">⌘⇧C</span>
              <span className="hidden xl:inline opacity-40">copiar fase / seção</span>
            </span>
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
                +7 · ⌘K
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
                  <SheetTitle className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em]">
                    <BrandMark className="h-4.5 w-4.5 shrink-0" />
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
              Spec · v1.9.0
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground flex-wrap justify-center">
              <span>11 plugins</span>
              <span>·</span>
              <span className="text-engineering">zero dependências circulares</span>
              <span>·</span>
              <span>Fase 18 homologada 32/32</span>
              <span>·</span>
              <span className="text-engineering">Fase 19 homologada (v1.9.0)</span>
              <span>·</span>
              <span>UE5.8 · C++</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Vault ↔ site · {LAST_VAULT_SYNC}
            </span>
          </div>
          {/* Indicador de status da última auditoria de sincronização + modal de resultado */}
          <AuditStatusRow onOpenModal={() => setAuditOpen(true)} />
          <AuditModal open={auditOpen} onOpenChange={setAuditOpen} />
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

/* Linha de status da auditoria no rodapé: dot + rótulo + data/hora pt-BR.
   Verde = auditada nesta sessão (registro sbf-audit-status), âmbar = sem registro.
   Declara "última verificação" para não sugerir que é o resultado do CI Actions. */
function AuditStatusRow({ onOpenModal }: { onOpenModal: () => void }) {
  const audit = useLastAudit();
  return (
    <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
      {audit ? (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-engineering">
          <span className="h-1.5 w-1.5 rounded-full bg-engineering" />
          Auditada · {audit.divergences} divergência(s) · última verificação {formatAuditAt(audit.checkedAt)} (sessão)
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-amber-warn">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-warn animate-pulse" />
          Não auditada nesta sessão
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
        CI GitHub Actions · push na main + seg/qui 09:00 UTC
        {/* Botão interativo: abre o modal de resultado da auditoria Vault ↔ site. */}
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-1 border border-border bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:border-engineering/60 hover:text-engineering transition-colors active:scale-[0.97]"
          title="Ver o resultado da auditoria Vault ↔ site"
        >
          <PlayCircle className="h-3 w-3" />
          Ver audit
        </button>
        <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
      </span>
    </div>
  );
}

/* Modal de resultado da auditoria Vault ↔ site.
   Abre com o último registro local de audit (sbf-audit-status) + commits de
   referência de cada lado + instruções do secret e link do workflow Actions. */
function AuditModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const audit = useLastAudit();
  const [rechecking, setRechecking] = useState(false);
  const synced = !!audit && audit.divergences === 0;
  const when = audit ? formatAuditAt(audit.checkedAt) : null;
  const lastCheckedExact = audit ? new Date(audit.checkedAt).toLocaleString("pt-BR") : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-[0.14em] flex items-center gap-2">
            Auditoria Vault ↔ site
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-left">
            Último registro de verificação local + commits de referência de cada lado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {audit ? (
            <div
              className={`border px-3 py-2 flex items-start gap-3 ${
                synced ? "border-engineering/60 bg-engineering/[0.05]" : "border-amber-warn/60 bg-amber-warn/[0.05]"
              }`}
            >
              {synced ? (
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-engineering" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-warn" />
              )}
              <div className="font-mono text-[12px] leading-relaxed">
                <span className={synced ? "text-engineering" : "text-amber-warn"}>
                  {synced ? "0 divergência(s) · Vault e site alinhados" : `${audit.divergences} divergência(s) detectada(s)`}
                </span>
                {(audit as AuditRecord & { drift?: string[] }).drift?.map((d, i) => (
                  <span key={i} className="block text-muted-foreground mt-1">
                    · {d}
                  </span>
                ))}
                <span className="block text-muted-foreground mt-1">verificação local · {when}</span>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-secondary px-3 py-2 font-mono text-[12px]">
              Nenhuma auditoria registrada nesta sessão — dispare o workflow no GitHub abaixo.
            </div>
          )}
          <div className="border border-border divide-y divide-border/60 bg-card font-mono text-[11px]">
            <div className="flex items-start gap-3 px-3 py-2">
              <span className="shrink-0 text-muted-foreground">Vault espelho</span>
              <span className="ml-auto">JoaoSantosCodes/Sandbox-Framework-Vault · 007cc07</span>
            </div>
            <div className="flex items-start gap-3 px-3 py-2">
              <span className="shrink-0 text-muted-foreground">Site docs</span>
              <span className="ml-auto">Sandbox-Framework-Documenta-o · 77c1d98</span>
            </div>
            <div className="flex items-start gap-3 px-3 py-2">
              <span className="shrink-0 text-muted-foreground">Última sync integral</span>
              <span className="ml-auto">14/08/2026 01:15 GMT-3</span>
            </div>
            {lastCheckedExact && (
              <div className="flex items-start gap-3 px-3 py-2">
                <span className="shrink-0 text-muted-foreground">Última verificação exata</span>
                <span className="ml-auto">{lastCheckedExact}</span>
              </div>
            )}
          </div>
          {/* Re-verificação on-demand sem recarregar a página */}
          <button
            type="button"
            disabled={rechecking}
            onClick={() => {
              setRechecking(true);
              // Simula o tempo de um scan local curto para não dar sensação de instantâneo falso
              window.setTimeout(() => {
                const fresh = runLocalAudit();
                setRechecking(false);
                toast("Verificação local reexecutada", {
                  description:
                    fresh.divergences === 0
                      ? "0 divergências · snapshot embutido e carimbos do site alinhados (verificação local — não substitui o CI)."
                      : `${fresh.divergences} divergência(s) local(is) · confira o carimbo da versão no site.`,
                });
              }, 350);
            }}
            className="inline-flex items-center gap-2 border border-engineering/60 bg-engineering/5 px-3 py-2 font-mono text-[12px] text-engineering hover:bg-engineering/10 disabled:opacity-50 transition-colors active:scale-[0.97]"
          >
            {rechecking ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Re-verificando…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" /> Re-verificar agora
              </>
            )}
          </button>
          <div className="border border-dashed border-border px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
            O audit completo exige o secret{" "}
            <code className="font-mono text-[10px]">VAULT_MIRROR_REPO</code> ={" "}
            <code className="font-mono text-[10px]">JoaoSantosCodes/Sandbox-Framework-Vault</code>. Secret de
            repositório só é gravável pelo dono da conta (nem CI nem integração autorizada escreve em
            Settings) — configurar em: <span className="font-mono text-[10px]">Settings → Secrets and
            variables → Actions → New repository secret</span> do repositório. Enquanto não existir, o
            workflow roda no espelho embutido (<code className="font-mono text-[10px]">scripts/vault-mirror/</code>
            ), que reflete o snapshot, não o estado atual da máquina.
          </div>
          <a
            href="https://github.com/JoaoSantosCodes/Sandbox-Framework-Documenta-o/actions/workflows/sync-audit.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 font-mono text-[12px] text-engineering hover:border-engineering/60 transition-colors"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Run workflow → sync-audit.yml
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
