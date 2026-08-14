/*
  DESIGN: "Blueprint Técnico" — primitivas: carimbo de fase, bloco de código com barra verde
  e botão de copiar, bloco de auditoria (nota de revisor), régua técnica.
*/
import { ReactNode, useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function PhaseStamp({ phase, version, warn }: { phase: string; version: string; warn?: boolean }) {
  return (
    <span className={`phase-stamp ${warn ? "warn" : ""}`}>
      F{phase} · {version}
    </span>
  );
}

export function CopyButton({ value, label = "Copiar", onCopy }: { value: string; label?: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copiado" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          return;
        }
        setCopied(true);
        onCopy?.();
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 border transition-colors active:scale-[0.97] ${
        copied
          ? "border-engineering/60 text-engineering"
          : "border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "copiado" : label}
    </button>
  );
}

export function CodeBlock({
  path,
  language,
  children,
}: {
  path: string;
  language?: string;
  children: string;
}) {
  return (
    <figure className="my-5 border border-border bg-[oklch(0.22_0.015_255)] text-[oklch(0.93_0.01_90)]">
      <figcaption className="flex items-center justify-between px-4 py-1.5 border-b border-[oklch(0.32_0.02_255)] bg-[oklch(0.26_0.015_255)]">
        <span className="flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-engineering" />
          <span className="font-mono text-xs text-[oklch(0.75_0.02_90)]">{path}</span>
        </span>
        <span className="flex items-center gap-2">
          {language && <span className="font-mono text-[10px] uppercase tracking-wider opacity-50">{language}</span>}
          <CopyButton value={children} />
        </span>
      </figcaption>
      <pre className="px-4 py-4 overflow-x-auto text-[13px] leading-relaxed">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

export function AuditNote({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "info" | "err" }) {
  const tones = {
    warn: "border-amber-warn/60 bg-[oklch(0.62_0.13_65)]/8 text-amber-warn",
    info: "border-engineering/50 bg-[var(--engineering)]/7 text-engineering",
    err: "border-destructive/50 bg-destructive/7 text-destructive",
  };
  return (
    <aside className={`my-6 border-l-2 pl-4 py-3 ${tones[tone]} text-sm`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-80 block mb-1">
        {tone === "warn" ? "Nota de auditoria" : tone === "err" ? "Bloqueante" : "Decisão registrada"}
      </span>
      {children}
    </aside>
  );
}

/* DESIGN "Blueprint Técnico": aviso fixo de que copiar trechos Vault só é válido
   após homologação real (corpo do build + testes verdes) — repetido no toast, não só
   no rótulo, para que quem copia sem ler o texto ainda receba o alerta. */
export function VaultCopyWarning() {
  return (
    <div className="mt-4 flex items-start gap-3 border border-amber-warn/60 bg-amber-warn/[0.06] px-4 py-3">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-warn" />
      <p className="text-[13px] leading-relaxed text-amber-warn/90">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] block mb-1 text-amber-warn">
          Regra de homologação
        </span>
        Copiar este trecho não homologa nada. A colagem no Vault só é válida depois de: corpos reais de
        C++ nos slots auditáveis, suíte de testes fechando 100% e isolamento simétrico com Exit Code 0.
        Colar antes disso quebra a auditoria de sincronização Vault ↔ site.
      </p>
    </div>
  );
}

export function VaultCopyButton({
  value,
  label = "Copiar",
  toastTitle,
  toastDesc,
  onCopy,
}: {
  value: string;
  label?: string;
  toastTitle: string;
  toastDesc: string;
  onCopy?: () => void;
}) {
  return (
    <CopyButton
      label={label}
      value={value}
      onCopy={() => {
        toast.warning(toastTitle, { description: toastDesc, duration: 6000 });
        onCopy?.();
      }}
    />
  );
}

export function TechRule({ label }: { label?: string }) {
  return (
    <div className="tech-rule my-10" role="presentation">
      {label && (
        <span className="absolute -top-3 right-0 bg-background px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
