/*
  DESIGN: "Blueprint Técnico" — checklist interativo por fase com persistência em
  localStorage. Contém os botões "Limpar progresso" e "Copiar status" para
  reiniciar o acompanhamento ou exportar o progresso como texto copiável.
*/
import { Check, Copy, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ChecklistItem {
  key: string;
  label: string;
}

interface PhaseChecklistProps {
  storageKey: string;
  items: ChecklistItem[];
  headerNote?: string;
  completeMessage?: string;
}

export function PhaseChecklist({
  storageKey,
  items,
  headerNote = "Progresso salvo automaticamente no localStorage (por navegador)",
  completeMessage = "Checklist completo — pronto para submeter o plano executado à revisão.",
}: PhaseChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, loaded, storageKey]);

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const clearProgress = () => {
    setChecked({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    toast("Checklist reiniciado", {
      description: "Todo o progresso foi limpo deste navegador.",
    });
  };

  const copyStatus = async () => {
    const done = items.filter((i) => checked[i.key]);
    const lines = [
      `[Checklist] Progresso: ${done.length}/${items.length}`,
      ...items.map((item, idx) => {
        const mark = checked[item.key] ? "x" : " ";
        return `- [${mark}] ${idx + 1}. ${item.label}`;
      }),
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast("Status copiado para a área de transferência", {
        description: `${done.length}/${items.length} itens concluídos — cole no relatório do Vault.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar — seu navegador bloqueou o acesso à área de transferência.", {
        description: "Copie manualmente a partir da página.",
      });
    }
  };

  const doneCount = items.filter((i) => checked[i.key]).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="mt-6 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-border bg-secondary/60">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {headerNote}
        </span>
        <span className="font-mono text-[11px] text-engineering">
          {doneCount}/{items.length} ({pct}%)
        </span>
      </div>
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-1 bg-engineering transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="divide-y divide-border">
        {items.map((item, idx) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-secondary/40 transition-colors"
              aria-pressed={!!checked[item.key]}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[10px] transition-colors duration-150 ${
                  checked[item.key]
                    ? "border-engineering bg-engineering/15 text-engineering"
                    : "border-border bg-background text-transparent"
                }`}
              >
                {checked[item.key] ? <Check className="h-3 w-3" /> : String(idx + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  checked[item.key]
                    ? "text-muted-foreground line-through decoration-engineering/60"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {doneCount === items.length && (
        <div className="px-4 py-3 border-t border-engineering/50 bg-engineering/5 font-mono text-[11px] uppercase tracking-wider text-engineering">
          {completeMessage}
        </div>
      )}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border bg-secondary/30">
        <button
          type="button"
          onClick={clearProgress}
          disabled={doneCount === 0}
          className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-destructive/60 hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Limpar progresso
        </button>
        <button
          type="button"
          onClick={copyStatus}
          className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-engineering/60 hover:text-engineering transition-colors"
        >
          <Copy className="h-3 w-3" /> Copiar status
        </button>
        {copied && (
          <span className="self-center font-mono text-[10px] uppercase tracking-wider text-engineering">
            Status copiado ✓
          </span>
        )}
      </div>
    </div>
  );
}
