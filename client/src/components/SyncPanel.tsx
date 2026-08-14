/*
  DESIGN: "Blueprint Técnico" + fuch.ai — painel de status de sincronização Vault ↔ site.
  Mono tracejado, verde-engineering para sincronizado, âmbar-warn para pendência.
  O painel declara o último registro local de auditoria e os commits de referência de cada lado.
*/
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, CheckCircle2, GitBranch, Layers, RefreshCcw } from "lucide-react";
import { PHASES } from "@/lib/siteData";
import { PHASE_PENDINGS } from "@/lib/phasePendings";

const AUDIT_STORAGE_KEY = "sbf-audit-status";
const LAST_VAULT_SYNC = "14/08/2026 01:15 GMT-3";
const VAULT_COMMIT = "37b8eea";
const SITE_COMMIT = "c06a466";

interface AuditRecord {
  checkedAt: string;
  divergences: number;
  source: "local";
}

function readAudit(): AuditRecord | null {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.checkedAt) {
      return parsed as AuditRecord;
    }
  } catch {
    // ignore
  }
  return null;
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

/* Data/hora exata da última verificação (segundos + timezone GMT-3) —
   revelada no hover do símbolo de convergência (regra de detalhe progressivo: o
   painel mostra hh:mm por padrão e a precisão completa só quando o usuário pede). */
function formatAuditExact(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return iso;
  }
}

/* Painel de status de sincronização Vault ↔ site na Home.
   Estado local: registro sbf-audit-status gravado no rodapé (botão Ver audit /
   re-verificação on-demand no modal), re-lido a cada render da Home.
   Regra de precedência: o Vault Obsidian é a fonte oficial — divergência resolve
   a favor do Vault, que deve subir ao espelho Git (Sandbox-Framework-Vault). */
export function SyncPanel() {
  const audit = readAudit();
  const synced = !!audit && audit.divergences === 0;
  const when = audit ? formatAuditAt(audit.checkedAt) : null;

  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container py-10 grid lg:grid-cols-[minmax(160px,1fr)_3fr] gap-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">01 / sincronização</div>
          <div className="mt-4 space-y-2 font-mono text-xs">
            <Link href="#sync-painel" className="block text-engineering font-semibold">01 · Painel</Link>
            <Link href="/pendencias" className="block text-muted-foreground hover:text-engineering transition-colors">
              02 · Pendências P-1…P-7
            </Link>
            <Link
              href="https://github.com/JoaoSantosCodes/Sandbox-Framework-Vault"
              className="block text-muted-foreground hover:text-engineering transition-colors"
            >
              03 · Espelho Vault ↗
            </Link>
          </div>
        </div>
        <div id="sync-painel">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Seção 01 · Vault ↔ site
              </span>
              <h2 className="font-display text-3xl font-bold mt-2">
                O site espelha o Vault — painel de sincronização
              </h2>
            </div>
            <Link
              href="/pendencias"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-engineering hover:underline"
            >
              Ver pendências de fases <RefreshCcw className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
            {/* Lado Vault */}
            <div className="border border-border bg-card">
              <div className="px-3 py-1.5 border-b border-dashed border-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Obsidian Vault · oficial
                </span>
                <GitBranch className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="p-3">
                <div className="font-mono text-sm font-bold">pendencias_de_fases.md + Dashboard</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  espelho: {VAULT_COMMIT} · sync {LAST_VAULT_SYNC}
                </div>
                <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                  Fonte oficial. O que não está compilado no C++/UE5.8 não conta como concluído.
                </div>
              </div>
            </div>

            {/* Símbolo de convergência — hover revela data/hora exata (group) */}
            <div className="group relative flex items-center justify-center">
              {synced ? (
                <span className="inline-flex h-10 w-10 items-center justify-center border border-engineering/60 bg-engineering/5 transition-colors group-hover:bg-engineering/10" title={`Auditado · 0 divergências${audit ? ` · ${formatAuditExact(audit.checkedAt)}` : ""}`}>
                  <CheckCircle2 className="h-5 w-5 text-engineering" />
                </span>
              ) : audit ? (
                <span className="inline-flex h-10 w-10 items-center justify-center border border-amber-warn/60 bg-amber-warn/5 transition-colors group-hover:bg-amber-warn/10" title={`Auditado · ${audit.divergences} divergência(s)${audit ? ` · ${formatAuditExact(audit.checkedAt)}` : ""}`}>
                  <AlertTriangle className="h-5 w-5 text-amber-warn" />
                </span>
              ) : (
                <span className="inline-flex h-10 w-10 items-center justify-center border border-border bg-secondary transition-colors group-hover:border-muted-foreground/60" title="Ainda não auditado nesta sessão">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
                </span>
              )}
              {/* Popover mono com a data/hora exata da última verificação */}
              {audit && (
                <div className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full mt-2 hidden group-hover:block">
                  <div className="w-max border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground shadow-sm">
                    última verificação · {formatAuditExact(audit.checkedAt)} · GMT-3
                  </div>
                </div>
              )}
            </div>

            {/* Lado site */}
            <div className="border border-border bg-card">
              <div className="px-3 py-1.5 border-b border-dashed border-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  site · documentação
                </span>
                <GitBranch className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="p-3">
                <div className="font-mono text-sm font-bold">sandbox-framework-docs · v1.9.0</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  github/main: {SITE_COMMIT} · espelha o Vault
                </div>
                <div className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                  Rascunhos fora da régua (P-1 · dano, P-2 · persistência) estão marcados como não homologados.
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progresso da régua de fases — concluídas vs. pendentes, espelhando o Vault.
             Rascunhos (phase 99) não contam na régua oficial; a barra é reativa ao siteData e
             usa o mesmo padrão de faixa da F20 (traço verde-engineering, 300ms ease-out). */}
          <ProgressTrack />

          <div className="mt-3 border border-dashed border-border bg-background px-3 py-2 flex items-center justify-between flex-wrap gap-2">
            {synced ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-engineering">
                <CheckCircle2 className="h-3 w-3" /> auditado nesta sessão · 0 divergência(s) · {when}
              </span>
            ) : audit ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-warn">
                <AlertTriangle className="h-3 w-3" /> auditado · {audit.divergences} divergência(s) · {when}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                não auditado nesta sessão — use o botão "Ver audit" no rodapé
              </span>
            )}
            <Link
              href="/pendencias"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-engineering hover:underline"
            >
              pendências P-1…P-7 em aberto →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Barra de progresso: fases concluídas ÷ total de fases da régua oficial (sem rascunhos).
   F10…F19 são as fases da régua registrada no siteData — 10/10 concluídas (v1.9.0). */
function ProgressTrack() {
  const official = PHASES.filter((p) => !p.draft);
  const done = official.filter((p) => p.status === "Concluída").length;
  const total = official.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const lastDone = [...official].reverse().find((p) => p.status === "Concluída");
  return (
    <div className="mt-4 border border-border bg-card">
      <div className="px-3 py-1.5 border-b border-dashed border-border flex items-center justify-between flex-wrap gap-1">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Layers className="h-3 w-3" />
          régua de fases · concluídas vs. pendentes
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {done}/{total} · {pct}%
        </span>
      </div>
      <div className="group relative px-3 py-2.5 space-y-2">
        <div className="h-2 w-full bg-secondary overflow-hidden" title={`${pct}% da régua concluída`}>
          <div
            className="h-full bg-engineering transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-engineering">
            ✓ até {lastDone ? `${lastDone.title.split(" (")[0]} · ${lastDone.version}` : "—"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            próxima frente: backlog oficial P-3 → P-4 → P-5 → P-6
          </span>
        </div>
        {/* Tooltip interativo — hover revela a sequência exata das próximas fases
           pendentes do backlog oficial (espelha phasePendings.ts, fonte única do Vault).
           Detalhe progressivo: a régua mostra só "P-3 → P-6" por padrão; o detalhe
           completo (título de cada P e contador de itens) abre sob demanda. */}
        <div className="pointer-events-none absolute left-3 right-3 -bottom-1 translate-y-full mt-2 hidden group-hover:block z-10">
          <div className="border border-border bg-background shadow-sm">
            <div className="px-3 py-1.5 border-b border-dashed border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              próximas fases pendentes · ordem de execução do Vault
            </div>
            <ul className="divide-y divide-border/50">
              {PHASE_PENDINGS.filter((p) => p.categoria === "Backlog oficial do Vault")
                .sort((a, b) => a.ordem - b.ordem || a.id.localeCompare(b.id))
                .map((p, i, arr) => (
                  <li key={p.id}>
                    <Link
                      href={p.paginaRelacionada ?? "/pendencias"}
                      className="block px-3 py-2 flex items-start gap-2 hover:bg-accent/60 transition-colors"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-engineering pt-0.5">
                        {p.id}
                      </span>
                      <span className="text-[11px] leading-snug flex-1">
                        {p.titulo}
                        <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground mt-0.5">
                          {p.itens.filter((it) => it.estado === "Pendente").length}/{p.itens.length} itens pendentes
                        </span>
                      </span>
                      {i < arr.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50 mt-0.5" />
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


