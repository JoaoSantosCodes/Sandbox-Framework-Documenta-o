/*
  DESIGN: "Blueprint Técnico" — botão "Copiar seção" ao lado dos títulos de seção
  em páginas técnicas longas (Guia C++, Message Router, Manual, SFPS). Par visual
  do atalho ⌘⇧C: mesma fonte de verdade (extractSectionMarkdown + DOM da seção).
  Mono, carimbo, sem gradientes; toast sonner confirma a cópia.
*/
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { extractSectionMarkdown, sourceForRoute } from "@/lib/sectionsMarkdown";

/**
 * Botão inline que copia em Markdown a seção identificada por `sectionId`
 * na página técnica da rota atual. Se a rota não tiver fonte de seções ou
 * a seção não for encontrável no DOM, avisa via toast sem quebrar o layout.
 */
export function CopySectionButton({
  sectionId,
  label,
}: {
  /** id da seção no DOM (ex: "sfdg-02", "tabela"). */
  sectionId: string;
  /** Rótulo legível usado no toast. */
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const source = sourceForRoute(window.location.pathname);
    if (!source) {
      toast("Nenhuma fonte de seção nesta página", {
        description: "O botão está disponível apenas nas páginas técnicas longas (Manual, SFPS, Guia C++, Message Router).",
      });
      return;
    }
    const text = extractSectionMarkdown(source, sectionId);
    if (!text) {
      toast("Seção não encontrada", {
        description: `A seção "${label}" não foi encontrável no DOM — verifique o id "${sectionId}".`,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast("Falha ao copiar", {
        description: "O navegador bloqueou o acesso à área de transferência.",
      });
      return;
    }
    setCopied(true);
    toast(`Seção "${label}" copiada`, {
      description: "Markdown pronto para colar no Vault ou no plano de sprint.",
    });
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      aria-label={copied ? `Seção ${label} copiada` : `Copiar seção ${label} em Markdown`}
      onClick={copy}
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 border transition-colors active:scale-[0.97] ${
        copied
          ? "border-engineering/60 text-engineering"
          : "border-border text-muted-foreground hover:border-engineering/50 hover:text-engineering"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "copiado" : "copiar seção"}
    </button>
  );
}
