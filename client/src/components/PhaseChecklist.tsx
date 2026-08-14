/*
  DESIGN: "Blueprint Técnico" — checklist interativo por fase com persistência em
  localStorage. Contém os botões "Limpar progresso" e "Copiar status" para
  reiniciar o acompanhamento ou exportar o progresso como texto copiável.
*/
import { Check, Copy, FileDown, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ChecklistItem {
  key: string;
  label: string;
}

export interface ChecklistMeta {
  phase: string;
  title: string;
  storageKey: string;
  items: ChecklistItem[];
}

// Registro central dos checklists interativos por fase — usado pelo indicador de
// sincronização do rodapé (decodificar itens pendentes) e pela exportação em Markdown.
export const CHECKLIST_META: ChecklistMeta[] = [
  {
    phase: "Fase 17",
    title: "Gameplay Debugger e Telemetria (v1.7.0 · retrospectivo)",
    storageKey: "sbf-phase17-checklist",
    items: [
      { key: "iface", label: "ISBDebugInterface + FSBDebugLine criados em 02_SandboxInterfaces" },
      { key: "stack", label: "ISBDebugInterface implementada em USBBehaviorStackComponent (01_SandboxCommon)" },
      { key: "character", label: "ISBDebugInterface em USBAttribute/USBState/USBAbilityComponent (05_SandboxCharacter)" },
      { key: "extensoes", label: "ISBDebugInterface em USBInventoryComponent (08) e USBCombatComponent (06)" },
      { key: "atores", label: "ISBDebugInterface nos atores de teste de interação (ASBTestLockedChest em 07)" },
      { key: "plugin", label: "Plugin 10_SandboxDebug inicializado (.uplugin, Build.cs, módulo)" },
      { key: "coletor", label: "FGameplayDebuggerCategory_Sandbox implementado e registrado no módulo" },
      { key: "isolamento", label: "Teste de desacoplamento: remover dependência de 08_SandboxInventory e validar o build" },
      { key: "tests", label: "V1Editor compila e a suíte de testes permanece verde (31/31)" },
    ],
  },
  {
    phase: "Fase 18",
    title: "Interface Dinâmica e HUD Reativo (v1.8.0)",
    storageKey: "sbf-phase18-checklist",
    items: [
      { key: "payloads", label: "SBEventPayloads.h criado em 04_SandboxCore (UObject, GC) — sem #include de 06/07/08" },
      { key: "subsystem", label: "USBUIManager como ULocalPlayerSubsystem — isolamento por local player (split-screen / listen server)" },
      { key: "unsubscribe", label: "Auto-unsubscribe cirúrgico em NativeDestruct (FSBWidgetEventSubscription tag + delegate)" },
      { key: "antispill", label: "Filtro anti-spill em todos os widgets (TargetPawn == GetOwningPlayerPawn())" },
      { key: "throttle", label: "Throttle de 60 Hz no acumulador do hold (USBInteractionComponent::TickComponent)" },
      { key: "inventorio", label: "Grade de inventário assinando os 4 eventos canônicos (ItemAdded/Removed/Equipped/Unequipped)" },
      { key: "sutest", label: "SBUITests verde (32/32 specs) — Cenário 1: unsubscribe/idempotência; Cenário 2: TargetPawn mismatch" },
      { key: "isolamento", label: "Isolamento simétrico: hide 05+06+07+08 → 09 compila; hide 09 → gameplay e suíte preservados" },
      { key: "playtest", label: "Playtest multiplayer: vida/mana, prompt de interação, progresso de hold síncrono, grid e cooldowns" },
      { key: "vault", label: "Vault e site carimbados v1.8.0 (Dashboard, task.md, siteData, manual de uso)" },
    ],
  },
  {
    phase: "Fase 19",
    title: "Indicador Direcional de Dano (planejamento)",
    storageKey: "sbf-phase19-checklist",
    items: [
      { key: "payload", label: "SBEventPayloads.h — USBDamageEventPayload (AttackId, Direction, bIsFatal)" },
      { key: "produtor", label: "Ponto autoritativo de publicação no Hitscan (HasAuthority já ativo)" },
      { key: "widget", label: "USBUIDamageIndicator assinando com prioridade Low + anti-spill" },
      { key: "dedupe", label: "Deduplicação client-side via AttackId (TTL ou bSkipClientNotify)" },
      { key: "cenario7", label: "SBUITests Cenário 7: indicador no ângulo esperado" },
      { key: "cenario8", label: "SBUITests Cenário 8: TargetPawn mismatch não renderiza" },
      { key: "isolamento", label: "Teste de isolamento simétrico (hide 06 + hide 09, Exit Code 0)" },
      { key: "playtest", label: "Playtest Dedicated Server: indicador só no pawn afetado" },
      { key: "dd11", label: "DD-11 registrado e homologado: deduplicação client-side via AttackId" },
      { key: "vault", label: "Vault + site carimbados v1.9.0 (Dashboard, task.md, siteData)" },
    ],
  },
  {
    phase: "Fase 20",
    title: "Persistência Transacional de Atributos (v2.0.0 · planejada)",
    storageKey: "sbf-phase20-checklist",
    items: [
      { key: "deficao", label: "USBAttributePersistenceDefinition/Instance com chave estável e opt-in" },
      { key: "translog", label: "TransactionLog por PredictionId com rollback completo" },
      { key: "checkpoint", label: "Checkpoint/save via USaveGame com HasAuthority() em toda gravação" },
      { key: "restore", label: "Restore validado por autoridade + rejeição de saves corrompidos" },
      { key: "rollback", label: "SBAttributePersistenceTests: rollback simétrico (Entry/Exit)" },
      { key: "concurrence", label: "Cenário de concorrência: duas mutações na mesma chave estável" },
      { key: "antiSpill", label: "Anti-spill entre local players no mesmo saveslot" },
      { key: "isolamento", label: "Isolamento simétrico: hide do plugin de persistência, Exit Code 0" },
      { key: "playtest", label: "Playtest Dedicated Server: save/restore íntegro" },
      { key: "dd19", label: "Novo registro DD-19 homologando o mecanismo transacional" },
      { key: "vault", label: "Vault e site carimbados v2.0.0 (Dashboard, task.md, siteData)" },
    ],
  },
];

// Decodifica o progresso salvo de um checklist: retorna { done, pending } de itens.
export function decodeChecklistProgress(meta: ChecklistMeta): { done: ChecklistItem[]; pending: ChecklistItem[] } {
  try {
    const raw = localStorage.getItem(meta.storageKey);
    const state: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    const done = meta.items.filter((i) => !!state[i.key]);
    const pending = meta.items.filter((i) => !state[i.key]);
    return { done, pending };
  } catch {
    return { done: [], pending: meta.items };
  }
}

interface PhaseChecklistProps {
  storageKey: string;
  items: ChecklistItem[];
  headerNote?: string;
  completeMessage?: string;
  /** Título da fase para o arquivo exportado em Markdown (ex.: "Fase 17"). */
  phaseLabel?: string;
}

export function PhaseChecklist({
  storageKey,
  items,
  headerNote = "Progresso salvo automaticamente no localStorage (por navegador)",
  completeMessage = "Checklist completo — pronto para submeter o plano executado à revisão.",
  phaseLabel,
}: PhaseChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const label = phaseLabel || storageKey;
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

  const buildMarkdown = () => {
    const done = items.filter((i) => checked[i.key]);
    const lines = [
      `# Checklist — ${label}`,
      "",
      `Progresso: ${done.length}/${items.length} itens concluídos (${pct}%).`,
      "",
      ...items.map((item, idx) => {
        const mark = checked[item.key] ? "x" : " ";
        return `- [${mark}] ${idx + 1}. ${item.label}`;
      }),
      "",
      `Exportado do site de documentação do Sandbox Framework em ${new Date().toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}.`,
      "",
    ];
    return lines.join("\n");
  };

  const downloadMarkdown = () => {
    const text = buildMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Checklist exportado em Markdown", {
      description: `Arquivo salvo para o Vault ou para arquivamento da auditoria.`,
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
        <button
          type="button"
          onClick={downloadMarkdown}
          className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-engineering/60 hover:text-engineering transition-colors"
        >
          <FileDown className="h-3 w-3" /> Exportar Markdown
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
