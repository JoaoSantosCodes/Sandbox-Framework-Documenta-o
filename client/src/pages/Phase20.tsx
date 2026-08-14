/*
  DESIGN: "Blueprint Técnico" — página de planejamento de fase futura (padrão DD-16/DD-18).
  Linguagem de "plano de implantação em rascunho": espaço reservado com pré-requisitos
  homologados citados por precedente (DD-*), escopo proposto em tabela de dependência,
  checklist interativo e critérios de aceite preliminares.
  Papel quente, tinta grafite, acento verde-engineering. Carimbo "planejada".
*/
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, Eraser, FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import type { ReactNode } from "react";
import { DocsLayout } from "@/components/DocsLayout";
import { PhaseChecklist, decodeChecklistProgress } from "@/components/PhaseChecklist";
import { BackToTop, useActiveSection } from "@/components/ActiveSection";
import {
  AuditNote,
  CodeBlock,
  CopyButton,
  PhaseStamp,
  TechRule,
  useSlotHistory,
  useSlotSubmissions,
  VaultCopyButton,
  VaultCopyWarning,
  HomologationRulesModal,
} from "@/components/Primitives";
import { toast } from "sonner";

interface ChangelogEntry {
  tag: string;
  title: string;
  body: string;
}

interface ChangelogEntryCategory extends ChangelogEntry {
  category: "Novidade" | "Correção" | "Auditoria";
}

/* Filtros do changelog (padrão da linha do tempo/Roadmap): categoria com
   contagem, persistência em localStorage (sbf-changelog-filter) e sync entre
   abas via storage event + focus. */
type ChangelogFilterKey = "all" | "Novidade" | "Correção" | "Auditoria";

const CHANGELOG_FILTER_META: Record<ChangelogFilterKey, { label: string }> = {
  all: { label: "Todas" },
  Novidade: { label: "Novidades" },
  Correção: { label: "Correções" },
  Auditoria: { label: "Auditoria" },
};

function ChangelogFilter() {
  const [filter, setFilter] = useState<ChangelogFilterKey>(() => {
    try {
      const saved = localStorage.getItem("sbf-changelog-filter") as ChangelogFilterKey | null;
      if (saved && CHANGELOG_FILTER_META[saved]) return saved;
    } catch {
      /* ignorado */
    }
    return "all";
  });
  useEffect(() => {
    try {
      localStorage.setItem("sbf-changelog-filter", filter);
    } catch {
      /* ignorado */
    }
  }, [filter]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sbf-changelog-filter") {
        const saved = e.newValue as ChangelogFilterKey | null;
        if (saved && CHANGELOG_FILTER_META[saved]) setFilter(saved);
      }
    };
    const onFocus = () => {
      try {
        const saved = localStorage.getItem("sbf-changelog-filter") as ChangelogFilterKey | null;
        if (saved && CHANGELOG_FILTER_META[saved]) setFilter(saved);
      } catch {
        /* ignorado */
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const filtered = V20_CHANGELOG.filter((e) =>
    filter === "all" ? true : e.category === filter,
  );
  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(Object.keys(CHANGELOG_FILTER_META) as ChangelogFilterKey[]).map((key) => {
          const n = V20_CHANGELOG.filter((e) => (key === "all" ? true : e.category === key)).length;
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors active:scale-[0.97] ${
                active
                  ? "border-engineering text-engineering bg-engineering/[0.06]"
                  : "border-border text-muted-foreground hover:border-engineering/50 hover:text-foreground"
              }`}
            >
              {CHANGELOG_FILTER_META[key].label}
              <span className={active ? "text-engineering" : "text-border"}>{n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 border border-border divide-y divide-border/60">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground px-4 py-4">
            Nenhuma entrada na categoria “{CHANGELOG_FILTER_META[filter].label.toLowerCase()}” — ajuste
            o filtro acima.
          </p>
        ) : (
          filtered.map((entry) => (
            <div key={entry.tag} className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[9rem_1fr] gap-4 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-engineering pt-0.5 shrink-0">
                {entry.tag}
              </span>
              <div>
                <div className="text-sm font-semibold">{entry.title}</div>
                <div className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{entry.body}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Alterações da pré-versão v2.0.0-prep — registro documental; nenhum item homologa a fase. */
const V20_CHANGELOG: ChangelogEntryCategory[] = [
  {
    tag: "Carimbo",
    category: "Correção",
    title: "Título do site v2.0.0-prep",
    body: "O <title> de client/index.html passou de v1.9.0-prep para v2.0.0-prep, abrindo oficialmente a janela da Fase 20. O audit compara o título com os carimbos das páginas — divergência aqui quebra a verificação de sincronização.",
  },
  {
    tag: "Rodapé",
    category: "Novidade",
    title: "Indicador de status da última auditoria de sincronização",
    body: "O rodapé de todas as páginas agora expõe o status da última verificação de sincronização: verde (\"Auditada · N divergência(s) · última verificação HH:MM (sessão)\") ou âmbar pulsante (\"Não auditada nesta sessão\"), com a linha \"CI GitHub Actions · push na main + seg/qui 09:00 UTC\". O registro local (sbf-audit-status) declara \"última verificação\" — o CI real continua sendo a fonte oficial.",
  },
  {
    tag: "DD-19",
    category: "Novidade",
    title: "Registro de Decisões: DD-19 (Persistência Transacional de Atributos)",
    body: "Card 19 no /decisoes com o plano homologado da Fase 20: 6 decisões D1–D6, 3 alternativas rejeitadas e status Pendente até a homologação real. Botões de exportação Markdown/PDF por card.",
  },
  {
    tag: "F20 · Playtest",
    category: "Novidade",
    title: "Painel interativo de status do playtest F20-9",
    body: "7 etapas sequenciais (conexão → mutação predita → TransactionLog → confirmação server → checkpoint authoritativo → saída limpa → restore validado), com persistência em localStorage sincronizada entre abas, falha travando o roteiro e faixa de conclusão animada. Roteiro de auditoria — não substitui o playtest real.",
  },
  {
    tag: "F20 · Vault",
    category: "Novidade",
    title: "Trechos do Vault da Fase 20 (copiáveis, com avisos de homologação)",
    body: "Blocos exatos para o 00_Sandbox_Framework_Dashboard.md e o task.md (itens 11.1–11.9), no mesmo padrão das F17/F18/F19: bloco âmbar 'Regra de homologação' e modal das 5 regras nos botões de copiar.",
  },
  {
    tag: "F20 · Slots",
    category: "Novidade",
    title: "Porta de homologação da F20: slots F20-A…F20-D (padrão DD-16)",
        body: "Seção 'Corpo do código' criada na /fase-20 com os 4 slots de contrato (Definition/Instance em 04, TransactionLog/rollback em 04, SaveGame/restore autoritativo em 04/05 e SBAttributePersistenceTests com isolamento). Mesmos componentes da F19: formulário com mínimo 40 caracteres, barra 0/4, exportar/importar .txt, 'Limpar todas' com Desfazer (5s), histórico de alterações por slot e avisos de simulação em todos os pontos de contato. A nota de bloqueio antiga foi substituída pela porta aberta.",
  },
  {
    tag: "CI",
    category: "Auditoria",
    title: "Mitigador C2 fechado: workflow sync-audit ativado",
    body: ".github/workflows/sync-audit.yml criado e pushado (f743006) após a aprovação da permissão Workflows do GitHub App: roda no push da main, workflow_dispatch e cron seg/qui 09:00 UTC, auditando o espelho privado JoaoSantosCodes/Sandbox-Framework-Vault (secret VAULT_MIRROR_REPO) com fallback no espelho embutido scripts/vault-mirror/. Audit validado com 0 divergências nos dois caminhos.",
  },
  {
    tag: "Processo",
    category: "Auditoria",
    title: "Push automático para o GitHub ao final de cada rodada",
    body: "Regra de processo registrada (scripts/README-push-github.md): após checkpoint + tsc limpo + screenshot, o estado do site é espelhado no GitHub (remote github) e o commit reportado. Repo em f743006, 100% sincronizado com o site publicado.",
  },
];

/* ------------------------------------------------------------------
   PORTA DE HOMOLOGAÇÃO DA F20 — slots F20-A…F20-D (padrão DD-16).
   Cada slot: texto de exigência + contrato de interface em C++ +
   formulário de submissão (localStorage — simulação de fluxo, nunca
   evidência de homologação; a v2.0.0 só fecha com build + suíte 100%
   + isolamento Exit 0, declarado em todos os pontos de contato).
   ------------------------------------------------------------------ */
interface CodeSlot {
  slot: string;
  title: string;
  exige: string;
  status: "Aguardando Código";
  hasReference?: boolean;
  code?: string;
}

const CODE_SLOTS_F20: CodeSlot[] = [
  {
    slot: "Slot F20-A · Definition/Instance (04_SandboxCore)",
    title: "USBAttributePersistenceDefinition/Instance com opt-in e chave estável",
    exige:
      "Definition (USDAAttributePersistenceDefinition) com nome de atributo estável (FName) + opt-in por chave de atributo (nunca índice de array); Instance com FSBAttributePersistenceRuntimeData transiente e upsert por chave estável na estrutura replicada. Somente 04_SandboxCore — sem acoplamento com 05/06/07/08.",
    status: "Aguardando Código",
    code: `// --- Slot F20-A · Plugins/04_SandboxCore/Source/Public/Attributes/SBAttributePersistence.h ---
// CORPO DO BUILD — colar aqui a saída do arquivo após a F20-1 fechar no UE5.8.
#pragma once
#include "CoreMinimal.h"
#include "SBAttributePersistence.generated.h"

// Chave estável de atributo (FName) — upsert por chave, NUNCA por índice de array (DD-02).
// Opt-in: só atributos listados na Definition são persistidos (anti-spill de save).
UCLASS(BlueprintType)
class SANDBOXCORE_API USBAttributePersistenceDefinition : public UDataAsset
{
    GENERATED_BODY()
public:
    // Atributos que entram na persistência — nome estável, ordem não importa.
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    TArray<FName> PersistentAttributeKeys;
};

// Estado transiente da instância runtime (FSBAttributePersistenceRuntimeData).
struct FSBAttributePersistenceRuntimeData
{
    // Última mutação confirmada pelo servidor, por chave estável — base do rollback.
    TMap<FName, float> LastConfirmedValues;
    // Transações abertas por PredictionId — F20-B.
    TMap<int32, TMap<FName, float>> OpenTransactions;
};`,
  },
  {
    slot: "Slot F20-B · TransactionLog (04_SandboxCore)",
    title: "TransactionLog por PredictionId com rollback simétrico Entry/Exit",
    exige:
      "TryConsumeAttribute registra cada mutação no TransactionLog com PredictionId + chave estável (upsert); rollback completo em qualquer falha (toda entrada tem saída simétrica); concorrência de duas mutações sobre a mesma chave resolvida pela ordem de confirmação do servidor — cliente reverte a predição que divergir.",
    status: "Aguardando Código",
    code: `// --- Slot F20-B · Plugins/04_SandboxCore/Source/Private/Attributes/SBAttributePersistenceComponent.cpp ---
// CORPO DO BUILD — colar aqui a saída do arquivo após a F20-2 fechar no UE5.8.
// Todo caminho protegido por HasAuthority() quando a mutação é efeito persistente.
// Ordem: validar → registrar transação → aplicar predição → confirmar/reverter.
#include "Attributes/SBAttributePersistenceComponent.h"
#include "SBAttributePersistence.h"

bool USBAttributePersistenceComponent::TryConsumeAttribute(
    int32 PredictionId, FName AttributeKey, float Amount)
{
    // Validação antes de qualquer mutação (DD-03 · validação-antes-de-mutação).
    if (!IsValidPrediction(PredictionId)) { return false; }
    float Current = GetAttributeValue(AttributeKey); // upsert por chave estável
    if (Amount > Current) { return false; }

    // Registro ANTES da aplicação — o rollback precisa da entrada simétrica.
    FAttributeTransactionEntry Entry{ PredictionId, AttributeKey, Amount, Current };
    TransactionLog.Enqueue(Entry);
    ApplyAttributeValue(AttributeKey, Current - Amount); // predição client-side
    return true;
}

void USBAttributePersistenceComponent::OnServerConfirmed(int32 PredictionId, bool Accepted)
{
    // Rollback simétrico: toda entrada tem saída — Entry/Exit em todos os caminhos.
    if (!Accepted)
    {
        for (const auto& Entry : TransactionLog.FindEntries(PredictionId))
            ApplyAttributeValue(Entry.Key, Entry.PreviousValue); // reverte a predição
    }
    TransactionLog.RemoveEntries(PredictionId);
}`,
  },
  {
    slot: "Slot F20-C · Checkpoint/Restore (04/05)",
    title: "USaveGame autoritativo com HasAuthority() e rejeição de saves corrompidos",
    exige:
      "Serialização do estado confirmado (LastConfirmedValues) via USaveGame; HasAuthority() explícito em TODO caminho de gravação — nenhum write client-side; restore com validação de autoridade, checksum e rejeição segura de saves corrompidos (fallback para estado íntegro, nunca crash).",
    status: "Aguardando Código",
    code: `// --- Slot F20-C · Plugins/05_SandboxCharacter/Source/Private/Save/SBSaveManager.cpp ---
// CORPO DO BUILD — colar aqui a saída do arquivo após a F20-3 fechar no UE5.8.
// Authority primeiro: cliente nunca grava nem sobrescreve o save.
#include "Save/SBSaveManager.h"
#include "SBAttributePersistence.h"
#include "Misc/Crc.h"

void USBSaveManager::SaveCheckpoint()
{
    // Guard de authority — toda lógica de efeito persistente exige HasAuthority().
    if (!GetWorld()->GetAuthGameMode() || !HasAuthority()) { return; }
    USBSaveGame* Save = CreateSaveGame();
    for (const auto& Kv : Persistence->GetConfirmedValues()) // só o estado confirmado
    {
        Save->AttributeValues.Add(Kv.Key, Kv.Value); // upsert por FName
    }
    Save->Checksum = FCrc::MemCrc32(&Save->AttributeValues);
    SaveCurrentSaveGame(Save);
}

bool USBSaveManager::RestoreCheckpoint(USBSaveGame* InSave)
{
    if (!InSave) { return false; }
    // Rejeição segura de saves corrompidos — fallback, nunca exceção.
    if (FCrc::MemCrc32(&InSave->AttributeValues) != InSave->Checksum)
    {
        UE_LOG(LogSave, Warning, TEXT("Save corrompido rejeitado — fallback íntegro"));
        return false;
    }
    for (const auto& Kv : InSave->AttributeValues)
        Persistence->ApplyConfirmedValue(Kv.Key, Kv.Value); // simetria Entry/Exit
    return true;
}`,
  },
  {
    slot: "Slot F20-D · SBUITests", // SBUITests da F20 (persistência)
    title: "SBAttributePersistenceTests: rollback, concorrência e anti-spill",
    exige:
      "Rollback simétrico (toda entrada tem saída), duas mutações sobre a mesma chave estável, anti-spill entre local players no mesmo saveslot, e isolamento simétrico com hide do plugin de persistência (Exit Code 0). Suíte completa 100% — sem GIsAutomationTesting nem mocks em produção.",
    status: "Aguardando Código",
    code: `// --- Slot F20-D · Plugins/04_SandboxCore/Source/Private/Tests/SBAttributePersistenceTests.cpp ---
// CORPO DO BUILD — colar aqui a saída do arquivo após a F20-4 fechar no UE5.8.
// Suíte dedicada de persistência: simetria, concorrência e anti-spill (DD-02 · DD-10).
// Teste de isolamento: hide do plugin de persistência compila e roda, Exit Code 0 (F20-5).
#include "SBAttributePersistence.h"
#include "Misc/AutomationTest.h"

IMPLEMENT_SBUI_TEST(F1_PersistenceRollback_IsSymmetric)
{
    GIVEN("consumo predito que o servidor rejeita")
    {
        USBSBAttributePersistenceComponent* Comp = CreateTestComponent(100.f);
        int32 Pid = Comp->BeginPrediction();
        TestTrue("TryConsumeAttribute succeeds locally", Comp->TryConsumeAttribute(Pid, "Health", 25.f));

        THEN("on server rejection, the symmetric rollback restores the exact previous value")
        {
            Comp->OnServerConfirmed(Pid, false);
            TestEqual("Value restored", Comp->GetAttributeValue("Health"), 100.f);
            TestTrue("Transaction removed after rollback", Comp->LogSize() == 0);
        }
    }
}

IMPLEMENT_SBUI_TEST(F2_PersistenceConcurrentUpsert_SameStableKey)
{
    GIVEN("duas mutações preditas sobre a mesma chave estável")
    {
        USBSBAttributePersistenceComponent* Comp = CreateTestComponent(100.f);
        int32 A = Comp->BeginPrediction();
        int32 B = Comp->BeginPrediction();
        Comp->TryConsumeAttribute(A, "Health", 60.f);
        Comp->TryConsumeAttribute(B, "Health", 50.f);

        THEN("server confirmação A mantém o valor; B rejeitada reverter exatamente")
        {
            Comp->OnServerConfirmed(A, true);
            Comp->OnServerConfirmed(B, false);
            TestEqual("Final value follows accepted order", Comp->GetAttributeValue("Health"), 40.f);
        }
    }
}`,
  },
];

/* Chave compartilhada do localStorage dos slots F20 (mesmo padrão da F19). */
const F20_SLOT_STORAGE_KEY = "sbf-slot-submissions-20";

/* Resolve o estado final de um slot F20: "Aguardando Código" ou "Código recebido".
   O corpo exibido vem do slot de contrato (placeholder do plano homologado) —
   substituído pelo build real quando a sprint entregar os arquivos compilados. */
function resolveF20Slot(
  slot: (typeof CODE_SLOTS_F20)[number],
  submissions: Record<string, string>,
): { status: string; code: string } {
  if (submissions[slot.slot]) return { status: "Código recebido", code: submissions[slot.slot] };
  return { status: "Aguardando Código", code: slot.code ?? "" };
}

/* Formata a data/hora exata de uma alteração de slot (locale pt-BR, segundos incluídos). */
function formatSlotTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/* Seção da porta de homologação da F20 — barra 0/4, exportar/importar .txt,
   Limpar todas com Desfazer (5s), "Copiar tudo" e os 4 SlotCards auditáveis. */
function SlotsSection({
  rulesOpen,
  setRulesOpen,
}: {
  rulesOpen: boolean;
  setRulesOpen: (open: boolean) => void;
}) {
  const { submissions, clearAll, submitAll } = useSlotSubmissions(F20_SLOT_STORAGE_KEY);
  const { history, recordChange } = useSlotHistory(F20_SLOT_STORAGE_KEY);
  const submittedCount = CODE_SLOTS_F20.filter((s) => submissions[s.slot]).length;
  const undoSnapshotRef = useRef<Record<string, string> | null>(null);

  const registerSubmit = (slot: string, code: string) => {
    const next = { ...submissions };
    if (code) next[slot] = code;
    else delete next[slot];
    submitAll(next);
    recordChange(slot, "submissão");
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === F20_SLOT_STORAGE_KEY || e.key === `${F20_SLOT_STORAGE_KEY}-history`) {
        // Força re-render sincronizado com outras abas (chave local atualizada via storage event).
        window.dispatchEvent(new CustomEvent("f20-slots-change", { detail: e.newValue }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="mt-6 space-y-4">
      {/* Barra de progresso das submissões — quantos dos 4 slots já receberam código */}
      <div className="border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Progresso das submissões · Slots F20-A–D
          </span>
          <span className="font-mono text-[12px] font-semibold text-engineering">
            {submittedCount} / {CODE_SLOTS_F20.length} slots
          </span>
        </div>
        <div
          className="h-2 w-full bg-secondary overflow-hidden"
          role="progressbar"
          aria-valuenow={submittedCount}
          aria-valuemin={0}
          aria-valuemax={CODE_SLOTS_F20.length}
        >
          <div
            className="h-full bg-engineering transition-all duration-300 ease-out"
            style={{ width: `${(submittedCount / CODE_SLOTS_F20.length) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
          <p className="text-[12px] text-muted-foreground">
            {submittedCount === CODE_SLOTS_F20.length
              ? "Todos os slots receberam corpo submetido — a revisão segue exigindo o build compilado."
              : submittedCount > 0
                ? `${submittedCount} de 4 slots com código submetido neste navegador.`
                : "Nenhum slot com código submetido ainda — os 4 aguardam (Aguardando Código)."}
          </p>
          <button
            type="button"
            onClick={() => exportF20Submissions(submissions)}
            disabled={submittedCount === 0}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar (.txt)
          </button>
          <button
            type="button"
            onClick={() => importF20Submissions(submissions, submitAll, recordChange)}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Importar (.txt)
          </button>
          <button
            type="button"
            onClick={() => {
              if (submittedCount === 0) {
                toast("Nada a limpar", { description: "Nenhum slot tem submissão neste navegador." });
                return;
              }
              const snapshot = clearAll();
              undoSnapshotRef.current = snapshot;
              const undone = toast(
                (
                  <div className="flex items-center justify-between gap-3">
                    <p>
                      <span className="font-medium">Todas as submissões removidas</span>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        Barra de progresso em 0/4 e slots em “Aguardando Código”.
                      </span>
                    </p>
                    <button
                      type="button"
                      className="border border-border bg-background px-2.5 py-1 text-xs font-mono uppercase hover:border-engineering/60 hover:text-engineering transition-colors"
                      onClick={() => {
                        toast.dismiss(undone);
                        undoSnapshotRef.current = null;
                        submitAll(snapshot);
                        for (const s of CODE_SLOTS_F20) if (snapshot[s.slot]) recordChange(s.slot, "importação");
                        toast.success("Desfeito", {
                          description: "Submissões restauradas do snapshot anterior à limpeza.",
                          duration: 5000,
                        });
                      }}
                    >
                      Desfazer
                    </button>
                  </div>
                ),
                { duration: 5000, onAutoClose: () => (undoSnapshotRef.current = null) },
              );
            }}
            className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-destructive/60 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar todas
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          4 slots auditáveis — concatene o contrato completo para a sprint
        </span>
        <CopyButton
          label="Copiar tudo"
          value={CODE_SLOTS_F20.map((s) => `=== ${s.slot} ===\n${s.title}\n\n${s.code ?? ""}`).join("\n\n")}
          onCopy={() =>
            toast("Contrato completo copiado", {
              description: "Os 4 slots de homologação concatenados, prontos para a sprint no Vault.",
            })
          }
        />
      </div>
      <div className="border border-border bg-secondary/40 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Envio antecipado para auditoria:</strong> submeta o corpo
          do C++ de cada slot pelo formulário abaixo — o indicador muda para verde e o bloco de código
          fica legível na página, marcando o slot como <em>“Código recebido”</em>. Isso organiza a
          revisão, mas não homologa: a v2.0.0 só fecha com build UBT + suíte 100% + isolamento
          simétrico Exit 0. (Simulação de fluxo em localStorage — os dados nunca saem do navegador.){" "}
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className="underline underline-offset-2 hover:text-engineering transition-colors cursor-pointer"
          >
            Ver regras de homologação
          </button>
        </p>
      </div>
      {CODE_SLOTS_F20.map((s) => {
        const resolved = resolveF20Slot(s, submissions);
        const submitted = resolved.status === "Código recebido";
        return (
          <F20SlotCard
            key={s.slot}
            slot={s}
            resolved={resolved}
            submitted={submitted}
            submissions={submissions}
            onSubmit={(code) => registerSubmit(s.slot, code)}
            lastChanged={history[s.slot]}
          />
        );
      })}
      <AuditNote tone="info">
        A homologação acontece quando os quatro slots acima receberem os corpos reais de C++, a suíte
        SBAttributePersistenceTests ficar 100% verde e o teste de isolamento simétrico (hide do plugin de
        persistência) passar com Exit Code 0. A partir daí, o carimbo desta página muda de “planejada”
        para v2.0.0 — assim como os slots da F19 homologaram a v1.9.0.
      </AuditNote>
    </div>
  );
}

const SLOT_STATUS_STYLES: Record<string, string> = {
  "Aguardando Código": "border-amber-warn/60 text-amber-warn",
  "Código recebido": "border-engineering/60 text-engineering",
};

/* Slot card da F20 — replicando o padrão DD-16 da F19 (componente local,
   mesmo visual e mesmas regras de simulação explícita em todos os pontos). */
function F20SlotCard({
  slot, resolved, submitted, submissions, onSubmit, lastChanged,
}: {
  slot: (typeof CODE_SLOTS_F20)[number];
  resolved: { status: string; code: string };
  submitted: boolean;
  submissions: Record<string, string>;
  onSubmit: (code: string) => void;
  lastChanged?: { at: string; via: string };
}) {
  const [draft, setDraft] = useState(submissions[slot.slot] ?? "");
  const [openForm, setOpenForm] = useState(false);
  const highlightRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const el = highlightRef.current;
    if (!el) return;
    if (draft.trim().length === 0) {
      el.textContent = "";
      el.classList.remove("hljs");
      return;
    }
    const result = hljs.highlight(draft, { language: "cpp" });
    el.innerHTML = result.value;
    el.classList.add("hljs");
  }, [draft]);
  return (
    <div
      className={`border ${
        submitted
          ? "border border-engineering/60 bg-engineering/[0.04]"
          : "border-dashed border-amber-warn/60 bg-amber-warn/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
        <span className="flex items-center gap-2 font-mono text-[11px]">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${submitted ? "bg-engineering" : "bg-amber-warn waiting-dot"}`}
            aria-hidden="true"
          />
          <span className={submitted ? "text-engineering" : "text-amber-warn"}>{slot.slot}</span>
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.14em] border px-2 py-0.5 whitespace-nowrap ${SLOT_STATUS_STYLES[resolved.status] ?? SLOT_STATUS_STYLES["Aguardando Código"]}`}
        >
          {resolved.status}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="font-medium text-sm">{slot.title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{slot.exige}</p>
        {lastChanged && (
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.05em] text-muted-foreground">
            Última alteração: {formatSlotTimestamp(lastChanged.at)} · {lastChanged.via}
          </p>
        )}
      </div>
      {resolved.code && (
        <div className="px-4 pb-4">
          <CodeBlock path={slot.slot.replace(" · ", " — ")} language="cpp">
            {resolved.code}
          </CodeBlock>
        </div>
      )}
      <div className="px-4 pb-4">
        {submitted ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-engineering">
              Corpo registrado neste navegador — a revisão segue exigindo o build compilado.
            </p>
            <button
              type="button"
              onClick={() => {
                onSubmit("");
                setDraft("");
                setOpenForm(true);
                toast("Submissão removida", {
                  description: `O slot ${slot.slot} voltou para "Aguardando Código".`,
                });
              }}
              className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-amber-warn/60 hover:text-amber-warn transition-colors"
            >
              Retirar submissão
            </button>
          </div>
        ) : (
          openForm ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = draft.trim();
                if (trimmed.length < 40) {
                  toast.error("Código insuficiente", {
                    description: "Cole o corpo real de C++ do slot — prosa não fecha homologação.",
                  });
                  return;
                }
                onSubmit(trimmed);
                setOpenForm(false);
                toast.success(`Submissão registrada — ${slot.slot}` as ReactNode as string, {
                  description:
                    "Indicador verde e bloco habilitado. ATENÇÃO: simulação de fluxo — a homologação real só fecha com build + suíte 100% + isolamento Exit 0.",
                  duration: 5000,
                });
              }}
              className="space-y-2"
            >
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Corpo do código ({slot.slot} — mínimo 40 caracteres)
                </span>
                <div className="relative mt-1 w-full border border-border bg-background font-mono text-[12px] leading-relaxed">
                  <pre
                    ref={highlightRef}
                    aria-hidden="true"
                    className="absolute inset-0 m-0 overflow-auto whitespace-pre-wrap break-words px-3 py-2 pointer-events-none text-transparent selection:bg-transparent"
                  />
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={8}
                    spellCheck={false}
                    className="relative w-full bg-transparent resize-y px-3 py-2 text-transparent caret-foreground focus:outline-none"
                    placeholder={`Cole aqui o corpo real de ${slot.slot}… // SBAttributePersistence.h, TransactionLog, SBSaveManager ou SBUITests`}
                  />
                </div>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="bg-engineering text-background px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:opacity-90 active:scale-[0.97] transition-all"
                >
                  Enviar submissão
                </button>
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-amber-warn/60 hover:text-amber-warn transition-colors"
                >
                  Cancelar
                </button>
                <span className="text-[11px] text-muted-foreground">
                  localStorage — apenas este navegador
                </span>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setOpenForm(true)}
              className="border border-border bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-[0.1em] hover:border-engineering/60 hover:text-engineering transition-colors"
            >
              Submeter corpo do código
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* Importa o backup .txt dos slots F20 — valida cada bloco individualmente;
   blocos vazios (< 40 caracteres) ou com cabeçalho ilegível entram no
   relatório de problemas (toast.warning detalhado, nunca restaurados). */
function importF20Submissions(
  submissions: Record<string, string>,
  submitAll: (next: Record<string, string>) => void,
  recordChange: (slot: string, via: "submissão" | "importação") => void,
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,text/plain";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const restored: Record<string, string> = { ...submissions };
    const blocks = text.split(/=== /).filter((b) => b.trim());
    const problems: { slot: string; issue: string }[] = [];
    const seen = new Set<string>();
    for (const block of blocks) {
      const headerMatch = block.match(/^=== (Slot F20-[A-D][^=·]+)\s*·/);
      if (!headerMatch) {
        problems.push({ slot: "(bloco não identificado)", issue: "cabeçalho ilegível — não segue o formato '=== Slot F20-X · Título ==='" });
        continue;
      }
      const header = headerMatch[1].trim();
      const slot = CODE_SLOTS_F20.find((s) => header.startsWith(s.slot));
      if (!slot) {
        problems.push({ slot: header, issue: "cabeçalho não corresponde a nenhum slot F20 conhecido (F20-A…F20-D)" });
        continue;
      }
      if (seen.has(slot.slot)) {
        problems.push({ slot: slot.slot, issue: "duplicado no arquivo — mantém-se a primeira ocorrência" });
        continue;
      }
      seen.add(slot.slot);
      const code = block.slice(headerMatch[0].length).replace(/^Exige:.*?\n\n/, "").trim();
      if (code.length < 40) {
        problems.push({
          slot: slot.slot,
          issue: code.length === 0 ? "bloco vazio — sem código após o cabeçalho" : `corrompido/insuficiente — ${code.length} caracteres (mínimo exigido: 40)`,
        });
        continue;
      }
      restored[slot.slot] = code;
    }
    if (problems.length > 0) {
      toast.warning(`${problems.length} ${problems.length === 1 ? "problema detectado no arquivo" : "problemas detectados no arquivo"}`, {
        description: (
          <ul className="mt-1 space-y-0.5 text-xs">
            {problems.map((p, i) => (
              <li key={i} className="text-muted-foreground">
                <strong className="text-foreground">{p.slot}:</strong> {p.issue}
              </li>
            ))}
            <li className="text-muted-foreground">Os blocos problemáticos foram ignorados — nenhum slot foi restaurado a partir deles.</li>
          </ul>
        ),
        duration: 12000,
      });
    }
    if (seen.size === 0) {
      toast.error("Nenhum slot restaurado", {
        description: "O arquivo não contém blocos legíveis de slots auditáveis da F20.",
      });
      return;
    }
    submitAll(restored);
    for (const s of CODE_SLOTS_F20) if (restored[s.slot]) recordChange(s.slot, "importação");
    toast.success(`${seen.size} ${seen.size === 1 ? "slot restaurado" : "slots restaurados"}`, {
      description: "Submissões importadas do backup .txt — verificação do build segue necessária.",
      duration: 5000,
    });
  };
  input.click();
}

/* Exporta os códigos submetidos dos slots F20 como .txt — apenas os slots
   com código, para backup entre navegadores (localStorage é local ao browser). */
function exportF20Submissions(submissions: Record<string, string>) {
  const entries = CODE_SLOTS_F20.filter((s) => submissions[s.slot]);
  if (entries.length === 0) return;
  const body = entries
    .map((s) => `=== ${s.slot} · ${s.title} ===\nExige: ${s.exige}\n\n${submissions[s.slot]}`)
    .join("\n\n");
  const header =
    `SANDBOX FRAMEWORK — Submissões dos slots auditáveis (Fase 20 · v2.0.0-prep)\n` +
    `Gerado em: ${new Date().toLocaleString("pt-BR")}\n` +
    `AVISO: simulação de fluxo — os códigos abaixo NÃO substituem o build compilado;\n` +
    `a homologação real exige SBAttributePersistenceTests 100% + isolamento simétrico Exit Code 0.\n\n`;
  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sandbox-framework-f20-slots-submetidos-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${entries.length} ${entries.length === 1 ? "slot exportado" : "slots exportados"}`, {
    description: "Backup .txt salvo — apenas os slots com código submetido neste navegador.",
    duration: 4000,
  });
}

const CHECKLIST_KEY = "sbf-phase20-checklist";

const TOC = [
  { id: "por-que-f20", label: "Por que a Fase 20 — e o momento dela" },
  { id: "pre-requisitos", label: "Pré-requisitos homologados" },
  { id: "escopo", label: "Escopo proposto (contrato de homologação)" },
  { id: "playtest-painel", label: "Playtest F20-9 — painel de status" },
  { id: "aceite", label: "Critérios de aceite preliminares" },
  { id: "slots-homologacao", label: "Porta de homologação (F20-A…F20-D)" },
  { id: "checklist", label: "Checklist interativo" },
  { id: "trechos-vault", label: "Trechos do Vault" },
  { id: "changelog", label: "Changelog · v2.0.0-prep" },
];

interface Prerequisite {
  id: string;
  title: string;
  source: string;
  oqueGarante: string;
}

/* Todos os itens abaixo são precedentes homologados — nenhum depende de nova decisão.
   A Fase 20 monta persistência transacional de atributos sobre a disciplina DD-10
   (PredictionId) e a chave estável da DD-02, nunca por índice de array. */
const PREREQUISITES: Prerequisite[] = [
  {
    id: "DD-02",
    title: "Chave estável e upsert — nunca índice de array",
    source: "Registro de Decisões · v1.3.0",
    oqueGarante:
      "Toda estrutura replicada endereça entradas por chave estável (upsert), garantindo que reordenação ou remoção no servidor nunca corrompa o mapeamento client-side.",
  },
  {
    id: "DD-03",
    title: "Predição client-side + autoridade server-side",
    source: "Registro de Decisões · v1.4.0",
    oqueGarante:
      "Toda ação de gameplay é predita localmente e validada pelo servidor, que confirma ou reverte via RPC. Base da persistência: o cliente deve poder reverter mudanças de atributo que o servidor rejeitar.",
  },
  {
    id: "DD-04 · DD-05 · DD-06",
    title: "Payloads UObject via USBEventSubsystem",
    source: "Registro de Decisões · v1.7.0 · v1.8.0",
    oqueGarante:
      "Ciclo de vida por GC e reflexão amigável a UMG; eventos canônicos com filtros de escopo local (anti-spill) e subscrição com auto-unsubscribe no NativeDestruct.",
  },
  {
    id: "DD-10",
    title: "Consumo transacional de atributos via PredictionId",
    source: "Registro de Decisões · v1.9.0 · homologada com nota",
    oqueGarante:
      "TryConsumeAttribute associa cada mutação de atributo a um PredictionId, permitindo que o rollback identifique exatamente qual predição reverter — o pré-requisito central da persistência transacional.",
  },
  {
    id: "DD-11",
    title: "Deduplicação client-side via AttackId",
    source: "Registro de Decisões · v1.9.0",
    oqueGarante:
      "Mecanismo de identidade estável para dedupe de eventos replicados — padrão reutilizável para evitar gravações duplicadas no transaction log.",
  },
  {
    id: "DD-16",
    title: "Portas de homologação com slots auditáveis",
    source: "Registro de Decisões · v1.9.0-prep",
    oqueGarante:
      "A homologação da Fase 20 seguirá o mesmo formato da Fase 19: slots A–D com contratos explícitos e corpo de código auditável, sem aceitar prosa como prova.",
  },
  {
    id: "DD-18",
    title: "Padrão Roadmap & Timeline",
    source: "Registro de Decisões · v1.9.0",
    oqueGarante:
      "Esta página nasce conectada à linha do tempo: o status 'Em curso' do roadmap reflete a homologação da Fase 19, e o progresso da Fase 20 atualizará a régua da v2.0.0.",
  },
];

interface ScopeItem {
  item: string;
  descricao: string;
  precedencia: string;
}

/* Rascunho do plano — para revisão antes de qualquer implementação em C++.
   Mesma ordem de dependência que fechou as Fases 18 e 19: dados primeiro,
   produtor autoritativo depois, consumidor por último, testes sempre. */
const SCOPE: ScopeItem[] = [
  {
    item: "F20-1",
    descricao:
      "USBAttributePersistenceDefinition / USBAttributePersistenceInstance (04_SandboxCore ou plugin novo 12_SandboxPersistence): Definition/Instance/RuntimeData para atributos persistíveis, com chave estável e lista branca de atributos opt-in.",
    precedencia: "DD-02 · DD-04",
  },
  {
    item: "F20-2",
    descricao:
      "TransactionLog transacional: cada mutação de atributo registrada com PredictionId e chave estável (upsert), permitindo replay e rollback completo até o último checkpoint confirmado pelo servidor.",
    precedencia: "DD-10 · DD-03",
  },
  {
    item: "F20-3",
    descricao:
      "Checkpoint e save: serialização do estado confirmado via USaveGame com fallback de gravação, e restore com validação de autoridade — HasAuthority() explícito em todo caminho de gravação.",
    precedencia: "F20-1 · F20-2",
  },
  {
    item: "F20-4",
    descricao:
      "SBAttributePersistenceTests: cenários de rollback simétrico (toda entrada tem saída), concorrência de duas mutações sobre a mesma chave estável, e anti-spill entre local players.",
    precedencia: "DD-16 · DD-03",
  },
  {
    item: "F20-5",
    descricao:
      "Playtest Dedicated Server: sessão salva e restaurada com persistência íntegra; teste de isolamento simétrico com hide do novo plugin, Exit Code 0.",
    precedencia: "F20-1 · F20-4",
  },
];

/* Checklist interativo — persistido em localStorage (padrão F17/F18/F19). */
const CHECKLIST_ITEMS = [
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
];

/* Trechos exatos para colar no Vault após a homologação real (mesmo padrão F17/F18/F19).
   A F20 não tem slots A–D ainda — o carimbo v2.0.0 só vale depois do playtest F20-9
   com suíte 100% e isolamento simétrico Exit Code 0. */
const VAULT20_DASHBOARD_SNIPPET = `### Fase 20 Concluída · v2.0.0 (Persistência Transacional de Atributos)
Homologação fechada: USBAttributePersistenceDefinition/Instance com opt-in e chave estável
(upsert — F20-1), TransactionLog por PredictionId com rollback simétrico (F20-2), checkpoint
e restore via USaveGame com HasAuthority() e rejeição de saves corrompidos (F20-3),
SBAttributePersistenceTests (concorrência em chave estável + anti-spill entre local players —
F20-4) e playtest em Dedicated Server com save/restore íntegro (F20-9 / F20-5).
DD-19 homologada. 11 de 11 plugins implementados · 0 em backlog.`;
/* Painel interativo de playtest F20-9 (Persistência transacional de atributos).
   Roteiro real do playtest em Dedicated Server, com verificação independente por etapa —
   cada passo só libera o próximo, e o estado sobrevive ao recarregamento (localStorage).
   O painel é roteiro de auditoria, NÃO é evidência: a homologação exige o playtest real. */
const F20_PLAYTEST_KEY = "sbf-f20-playtest";
interface PlaytestStep {
  id: string;
  label: string;
  expected: string;
  passLabel: string;
  failLabel: string;
}
const PLAYTEST_STEPS: PlaytestStep[] = [
  {
    id: "conn",
    label: "01 · Conexão", expected: "Cliente conecta ao Dedicated Server; handshake de sessão ok",
    passLabel: "Conexão ok", failLabel: "Falha de conexão",
  },
  {
    id: "mut",
    label: "02 · Mutação predita", expected: "Ação de gameplay prediz consumo de atributo localmente via PredictionId",
    passLabel: "Predição ok", failLabel: "Sem predição local",
  },
  {
    id: "log",
    label: "03 · TransactionLog", expected: "Mutação registrada no log com PredictionId + chave estável (upsert)",
    passLabel: "Log registrado", failLabel: "Log não gravado",
  },
  {
    id: "confirm",
    label: "04 · Confirmação server", expected: "Servidor valida e confirma (ou reverte) — cliente aplica o caminho do servidor",
    passLabel: "Confirmação ok", failLabel: "Sem confirmação",
  },
  {
    id: "checkpoint",
    label: "05 · Checkpoint authoritativo", expected: "Checkpoint gravado via USaveGame com HasAuthority() — nenhum write client-side",
    passLabel: "Checkpoint ok", failLabel: "Write sem authority",
  },
  {
    id: "disconnect",
    label: "06 · Saída limpa", expected: "Jogador fecha a sessão; save persistido e rollback simétrico intacto",
    passLabel: "Saída limpa", failLabel: "Estado perdido/corrompido",
  },
  {
    id: "restore",
    label: "07 · Restore validado", expected: "Nova sessão restaura atributos/inventário/checkpoint exatamente como deixou",
    passLabel: "Restore íntegro", failLabel: "Restore divergente",
  },
];
type PlaytestVerdict = "pass" | "fail" | null;
function readPlaytest(): Record<string, PlaytestVerdict> {
  try {
    const raw = localStorage.getItem(F20_PLAYTEST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, PlaytestVerdict> = {};
    for (const step of PLAYTEST_STEPS) out[step.id] = parsed[step.id] === "pass" ? "pass" : parsed[step.id] === "fail" ? "fail" : null;
    return out;
  } catch {
    return {};
  }
}

/* Componente do painel F20-9 — cada etapa libera a próxima (sequencialidade do roteiro).
   Passa para verde, falha para âmbar, e o status do painel reflete o pior estado. */
function PlaytestPanel() {
  const [revision, setRevision] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, PlaytestVerdict>>(() => readPlaytest());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === F20_PLAYTEST_KEY) setRevision((r) => r + 1);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", () => setRevision((r) => r + 1));
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolved = readPlaytest();
  const verdictsNow = revision >= 0 ? { ...verdicts } : resolved;
  Object.assign(verdictsNow, resolved);

  const record = (stepId: string, verdict: PlaytestVerdict) => {
    const next = { ...verdictsNow, [stepId]: verdict };
    setVerdicts(next);
    try {
      localStorage.setItem(F20_PLAYTEST_KEY, JSON.stringify(next));
    } catch {
      /* storage indisponível — comportamento segue em memória */
    }
  };
  const clearAll = () => {
    setVerdicts({});
    try {
      localStorage.removeItem(F20_PLAYTEST_KEY);
    } catch {
      /* storage indisponível */
    }
  };
  const allSteps = PLAYTEST_STEPS.map((s) => verdictsNow[s.id]);
  const concluded = allSteps.filter((v): v is NonNullable<PlaytestVerdict> => v !== null);
  const allPass = concluded.length === PLAYTEST_STEPS.length && concluded.every((v) => v === "pass");
  const hasFail = concluded.some((v) => v === "fail");
  const unlockedCount = (() => {
    let n = 0;
    for (const step of PLAYTEST_STEPS) {
      const prevDone = n === 0 || verdictsNow[PLAYTEST_STEPS[n - 1].id] === "pass";
      if (!prevDone) break;
      n++;
    }
    return n;
  })();

  const pct = Math.round((concluded.filter((v) => v === "pass").length / PLAYTEST_STEPS.length) * 100);
  return (
    <div className="mt-6 border border-border bg-card">
      <div className="px-4 py-3 border-b border-border bg-secondary/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            F20-9 · Playtest Dedicated Server — roteio de auditoria
          </span>
          <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed max-w-3xl">
            Marque cada etapa conforme o resultado observado na sessão. Etapas só liberam depois que a
            anterior passar; falha trava o roteiro e o status do painel vira âmbar — exatamente a disciplina
            de auditoria que a homologação exige.
          </p>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-amber-warn/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors active:scale-[0.97]"
        >
          <Eraser className="h-3 w-3" /> Limpar roteiro
        </button>
      </div>
      {/* Traço de progresso do roteiro */}
      <div className="h-1.5 w-full bg-secondary overflow-hidden">
        <div
          className={`h-1.5 ${allPass ? "bg-engineering" : hasFail ? "bg-amber-warn" : "bg-engineering/60"}`}
          style={{
            width: `${pct}%`,
            transition: `width 380ms ${F20_BAR_EASE}`,
          }}
        />
      </div>
      <ul className="divide-y divide-border">
        {PLAYTEST_STEPS.map((step, i) => {
          const v = verdictsNow[step.id];
          const locked = i >= unlockedCount && verdictsNow[PLAYTEST_STEPS[i - 1]?.id] !== "pass" && i > 0;
          return (
            <li key={step.id} className={`px-4 py-3 grid md:grid-cols-[1fr_auto] gap-3 items-start ${locked ? "opacity-45" : ""}`}>
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 border ${
                    v === "pass" ? "bg-engineering border-engineering" : v === "fail" ? "bg-amber-warn border-amber-warn" : "border-border bg-secondary/60"
                  }`} aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-mono text-[12px] font-semibold text-foreground">{step.label}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground leading-relaxed">
                    Esperado: <span className="text-foreground/80">{step.expected}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:justify-self-end">
                {v === null && !locked && (
                  <>
                    <button type="button" onClick={() => record(step.id, "pass")} className="inline-flex items-center gap-1 border border-engineering/50 text-engineering hover:bg-engineering/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors active:scale-[0.97]">
                      <CheckCircle2 className="h-3 w-3" /> {step.passLabel}
                    </button>
                    <button type="button" onClick={() => record(step.id, "fail")} className="inline-flex items-center gap-1 border border-amber-warn/60 text-amber-warn hover:bg-amber-warn/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors active:scale-[0.97]">
                      <AlertTriangle className="h-3 w-3" /> {step.failLabel}
                    </button>
                  </>
                )}
                {v === "pass" && (
                  <span className="inline-flex items-center gap-1 border border-engineering/60 bg-engineering/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-engineering">
                    <CheckCircle2 className="h-3 w-3" /> {step.passLabel} — <button type="button" onClick={() => record(step.id, null)} className="underline underline-offset-2 hover:text-foreground">desfazer</button>
                  </span>
                )}
                {v === "fail" && (
                  <span className="inline-flex items-center gap-1 border border-amber-warn/60 bg-amber-warn/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-amber-warn">
                    <AlertTriangle className="h-3 w-3" /> {step.failLabel} — <button type="button" onClick={() => record(step.id, null)} className="underline underline-offset-2 hover:text-foreground">desfazer</button>
                  </span>
                )}
                {locked && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">bloqueado · etapa anterior pendente</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {/* Faixa de conclusão — mesma disciplina da barra de progresso (transição maxHeight/opacity) */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: concluded.length === PLAYTEST_STEPS.length ? "3.5rem" : "0rem",
          opacity: concluded.length === PLAYTEST_STEPS.length ? 1 : 0,
          transition: `max-height 320ms ${F20_BAR_EASE}, opacity 240ms ${F20_BAR_EASE}`,
        }}
      >
        <div className={`px-4 py-3 border-t font-mono text-[11px] uppercase tracking-wider ${allPass ? "border-engineering/50 bg-engineering/5 text-engineering" : "border-amber-warn/50 bg-amber-warn/5 text-amber-warn"}`}>
          {allPass ? "Roteiro completo — playtest F20-9 íntegro · submeta o resultado à revisão" : "Roteiro concluído com falha · corrija antes de submeter à revisão"}
        </div>
      </div>
    </div>
  );
}

const VAULT20_TASK_SNIPPET = `## Fase 20 — Persistência Transacional de Atributos (v2.0.0)
- [x] 11.1. USBAttributePersistenceDefinition/Instance (opt-in + chave estável, upsert — F20-1)
- [x] 11.2. TransactionLog por PredictionId: rollback simétrico Entry/Exit (F20-2)
- [x] 11.3. Checkpoint/save via USaveGame — HasAuthority() em toda gravação (F20-3)
- [x] 11.4. Restore validado por autoridade + rejeição de saves corrompidos (F20-3)
- [x] 11.5. SBAttributePersistenceTests: concorrência em chave estável + anti-spill (F20-4)
- [x] 11.6. Isolamento simétrico: hide do plugin de persistência — Exit Code 0 (F20-5)
- [x] 11.7. Playtest Dedicated Server: save/restore íntegro (F20-9)
- [x] 11.8. DD-19 homologada (persistência transacional ancorada no PredictionId)
- [x] 11.9. Carimbo v2.0.0: task.md, Dashboard, walkthrough, V1 Unreal Engine, /fase-20`;

const CHECKLIST_META = {
  phase: "Fase 20",
  title: "Persistência Transacional de Atributos (v2.0.0 · planejada)",
  storageKey: "sbf-phase20-checklist",
  items: CHECKLIST_ITEMS,
};

/* Animação suave do traço de progresso (padrão Blueprint: ease-out custom, sem keyframes).
   A animação cobre apenas transform/width via transition, <300 ms, respeita prefers-reduced-motion. */
const F20_BAR_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/* Contador animado: anima o número de itens concluídos entre ticks do checklist. */
function useAnimatedCount(target: number): number {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    const from = display;
    if (from === target) return;
    const dur = Math.min(420, Math.max(180, Math.abs(target - from) * 120));
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return display;
}

/* Barra de progresso visual da Fase 20 — lê o checklist persistido em localStorage
   (mesma chave do PhaseChecklist) e reage a alterações de outras abas via storage event. */
function F20ProgressBanner() {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHECKLIST_KEY) setRevision((r) => r + 1);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", () => setRevision((r) => r + 1));
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Recalcula done/pending a cada tick de revisão (localStorage ou focus).
  const { done: doneNow, pending: pendingNow } = decodeChecklistProgress(CHECKLIST_META);
  const total = CHECKLIST_ITEMS.length;
  const pct = Math.round((doneNow.length / total) * 100);
  const doneAnimated = useAnimatedCount(doneNow.length);
  const doneAll = doneNow.length === total;

  return (
    <div className="mt-4 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Progresso da Fase 20
          </span>
          <span
            className="font-mono text-[11px] text-engineering font-semibold tabular-nums"
            style={{
              transition: `transform 200ms ${F20_BAR_EASE}, color 200ms ${F20_BAR_EASE}`,
            }}
          >
            {doneAnimated}/{total} itens concluídos ({pct}%)
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {pendingNow.length} pendente{pendingNow.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="h-2 w-full bg-secondary overflow-hidden">
        <div
          className="h-2 bg-engineering"
          style={{
            width: `${pct}%`,
            transition: `width 380ms ${F20_BAR_EASE}`,
          }}
        />
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-4 py-3 font-mono text-[10px] uppercase tracking-wider">
        <span className="text-engineering">■ concluído</span>
        <span className="text-muted-foreground">{doneNow.length} de {total}</span>
        <span className="text-border">■ pendente</span>
        <span className="text-muted-foreground">{pendingNow.length} de {total}</span>
      </div>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: doneAll ? "3.5rem" : "0rem",
          opacity: doneAll ? 1 : 0,
          transition: `max-height 320ms ${F20_BAR_EASE}, opacity 240ms ${F20_BAR_EASE}`,
        }}
      >
        <div className="px-4 py-3 border-t border-engineering/50 bg-engineering/5 font-mono text-[11px] uppercase tracking-wider text-engineering">
          Plano de implantação concluído — pronto para homologação da v2.0.0
        </div>
      </div>
    </div>
  );
}

export default function Phase20() {
  const active = useActiveSection(TOC.map((t) => t.id));
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <DocsLayout>
      {/* BANNER — fase planejada (padrão DD-18). O status da régua do /roadmap atualiza
          quando a Fase 19 fechar (4/4 slots) e esta página entrar em execução. */}
      <div className="border-b border-border bg-secondary/40">
        <div className="container py-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="text-sm leading-relaxed">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                v2.0.0 · fase planejada — aguardando a homologação da Fase 19
              </span>
              <p className="mt-1 text-muted-foreground max-w-3xl">
                Esta página é o convite para homologação da{" "}
                <strong className="text-foreground">Fase 20 — Persistência Transacional de Atributos</strong>.
                Ela entra em execução quando a Fase 19 fechar os quatro slots (v1.9.0 homologada); a partir
                daí, a régua do{" "}
                <Link href="/roadmap" className="text-engineering underline underline-offset-4">
                  roadmap
                </Link>{" "}
                passa a rastreá-la como próxima fase de gameplay.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HERO — wordmark gigante como fundo (padrão fuch.ai, espelhando a Home) */}
      <section className="paper-grain border-b border-border relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
          <span
            className="font-display font-black leading-[0.85] text-center text-engineering/[0.09] dark:text-engineering/[0.14] whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 13vw, 14rem)" }}
          >
            FASE 20
          </span>
        </div>
        <div className="container relative py-12 lg:py-16">
          <div className="fade-up">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              doc. 20 · v2.0.0 · planning gate
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <PhaseStamp phase="20" version="v2.0.0 · planejada" warn />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                persistência transacional de atributos · 11 plugins atuais · 0 em backlog
              </span>
            </div>
            <h1 className="mt-6 font-display font-black text-4xl md:text-5xl leading-[1.05] max-w-3xl">
              Persistência Transacional de Atributos
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              O jogador deve poder sair da partida e voltar encontrando exatamente o estado que deixou —
              atributos, inventário e progresso confirmados pelo servidor, nunca a última predição local. A
              Fase 20 introduz o{" "}
              <strong className="text-foreground">TransactionLog transacional</strong> ancorado no
              PredictionId da DD-10, fechado pelo checkpoint autorizado via SaveGame.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TOC.map((t, i) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:border-engineering/60 hover:text-engineering transition-colors"
                >
                  <span className="text-[9px]">{String(i + 1).padStart(2, "0")}</span>
                  {t.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container py-10 max-w-5xl">
        <TechRule label="Convite à homologação" />
        <h2 id="por-que-f20" className="mt-12 font-serif text-2xl font-bold">
          Por que a Fase 20 — e o momento dela
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          O framework já fecha as duas pontas que a persistência exige: a{" "}
          <strong>chave estável</strong> da DD-02 (nunca índice de array) e o{" "}
          <strong>PredictionId</strong> da DD-10, que identifica cada mutação predita e permite o rollback
          cirúrgico. O que falta é o <em>sistema</em>: um log transacional que transforme mutações
          confirmadas em checkpoints graváveis e que rejeite, com autoridade explícita, qualquer write
          local no caminho de save.
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          O momento também é certo por razões de risco: a Fase 19 estabilizou o último ponto sensível do
          caminho de dano, e a Fase 20 abre um novo subsistema <strong>sem tocar nos plugins existentes</strong> —
          ou fica um plugin novo 12_SandboxPersistence isolado em compilação, ou a definição/instância entra
          no 04_SandboxCore como os payloads da Fase 19. A decisão será registrada em DD-19 antes da
          implementação.
        </p>
        <AuditNote tone="info">
          Esta página é convite para homologação, não especificação fechada. Quando o plano executado da
          Fase 20 for submetido, a revisão segue o fluxo padrão: auditoria documental → simetria
          Entry/Exit → autoridade e replicação → testes → OK final → promoção de "planejada" para o estado
          homologado em <code className="font-mono text-[12px]">/fase-19</code>, task.md e Dashboard.
        </AuditNote>

        <h2 id="pre-requisitos" className="mt-12 font-serif text-2xl font-bold">
          Pré-requisitos homologados
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Nenhum item abaixo depende de nova decisão — todos são precedentes citáveis do Registro de
          Decisões e da tabela canônica do Message Router.
        </p>
        <div className="mt-6 space-y-4">
          {PREREQUISITES.map((p) => (
            <div key={p.id} className="border border-border bg-card">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-secondary/60">
                <span className="font-mono text-[11px] text-engineering">{p.id}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground text-right">
                  {p.source}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.oqueGarante}</p>
              </div>
            </div>
          ))}
        </div>

        <TechRule label="Proposta de escopo" />
        <h2 id="escopo" className="mt-12 font-serif text-2xl font-bold">
          Escopo proposto (contrato de homologação)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Rascunho do plano, para revisão antes de qualquer implementação em C++. Os cinco itens seguem a
          ordem de dependência: definição de dados primeiro, log transacional depois, checkpoint, testes e,
          por fim, playtest — mesmo padrão que fechou as Fases 18 e 19.
        </p>
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Item
                </th>
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Descrição
                </th>
                <th className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Precedência
                </th>
              </tr>
            </thead>
            <tbody>
              {SCOPE.map((s) => (
                <tr key={s.item} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap">{s.item}</td>
                  <td className="px-4 py-3 text-muted-foreground leading-relaxed">{s.descricao}</td>
                  <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">{s.precedencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="aceite" className="mt-12 font-serif text-2xl font-bold">
          Critérios de aceite preliminares
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          A homologação da Fase 20 exigirá, no mínimo: (1) rollback simétrico completo — toda entrada no
          TransactionLog com saída correspondente em todos os caminhos de falha; (2) teste de concorrência
          com duas mutações preditas sobre a mesma chave estável, resolvidas pelo servidor sem corromper o
          estado; (3) playtest multiplayer com Dedicated Server validando save/restore íntegro; (4) teste de
          isolamento simétrico com hide do novo plugin, Exit Code 0; (5) carimbo v2.0.0 em todos os
          documentos do Vault e neste site; (6) novo registro DD-19 documentando o mecanismo transacional
          homologado.
        </p>
        <AuditNote tone="warn">
          Ponto sensível: a autoridade do checkpoint. O cliente pode predizer o save, mas a gravação é{" "}
          <strong>sempre server-side</strong> com HasAuthority() explícito — um save escrito pelo cliente
          sem validação de autoridade é exatamente o tipo de bypass que o Manifesto proíbe. A revisão do
          plano executado exigirá o corpo real do código, não a descrição em prosa.
        </AuditNote>

        <TechRule label="Checklist interativo da Fase 20" />
        <h2 id="checklist" className="sr-only">
          Checklist interativo
        </h2>
        <F20ProgressBanner />
        <PhaseChecklist
          phaseLabel="Fase 20 — Persistência Transacional de Atributos (v2.0.0 · planejada)"
          storageKey={CHECKLIST_KEY}
          items={CHECKLIST_ITEMS}
          completeMessage="Checklist completo — pronto para submeter o plano executado da Fase 20 à revisão."
        />

        <TechRule label="Playtest F20-9" />
        <h2 id="playtest-painel" className="font-display text-2xl font-bold scroll-mt-24">
          Playtest F20-9 — painel de status
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Roteiro de auditoria do playtest em Dedicated Server: sete verificações sequenciais, da conexão ao
          restore validado. Marque cada etapa conforme o resultado observado na sessão real — o roteiro é
          ponto de entrada da evidência, não a evidência em si. Persistido em localStorage e sincronizado
          entre abas; uma falha trava o roteiro e marca o painel em âmbar até a correção.
        </p>
        <PlaytestPanel />

        <TechRule label="Trechos do Vault" />
        <h2 id="trechos-vault" className="font-display text-2xl font-bold scroll-mt-24">
          Trechos do Vault
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Mesma disciplina das Fases 17, 18 e 19: os blocos abaixo são os trechos exatos para o Dashboard e
          o task.md — mas a colagem só é permitida depois da homologação real (playtest F20-9 com save/restore
          íntegro, suíte de testes fechando 100% e isolamento simétrico Exit Code 0). O painel de playtest logo
          acima é o ponto de entrada da evidência; nenhum item aqui homologa a v2.0.0.
        </p>
        <VaultCopyWarning onOpenRules={() => setRulesOpen(true)} />
        <div className="mt-4 space-y-4">
          <div className="border border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
              <span className="font-mono text-[11px] text-engineering">
                00_Sandbox_Framework_Dashboard.md · F20 homologada · v2.0.0
              </span>
              <VaultCopyButton
                label="Copiar"
                value={VAULT20_DASHBOARD_SNIPPET}
                toastTitle="Trecho do Dashboard copiado"
                toastDesc="Cole no 00_Sandbox_Framework_Dashboard.md APENAS após a homologação real (playtest F20-9 íntegro + suíte 100% + isolamento Exit 0)."
                onOpenRules={() => setRulesOpen(true)}
              />
            </div>
            <CodeBlock path="00_Sandbox_Framework_Dashboard.md · v2.0.0 (pós-homologação)" language="text">
              {VAULT20_DASHBOARD_SNIPPET}
            </CodeBlock>
          </div>
          <div className="border border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/60">
              <span className="font-mono text-[11px] text-engineering">task.md · itens da Fase 20</span>
              <VaultCopyButton
                label="Copiar"
                value={VAULT20_TASK_SNIPPET}
                toastTitle="Trecho do task.md copiado"
                toastDesc="Cole no task.md APENAS após a homologação real (playtest F20-9 íntegro + suíte 100% + isolamento Exit 0)."
                onOpenRules={() => setRulesOpen(true)}
              />
            </div>
            <CodeBlock path="task.md · Fase 20 (checklist pós-homologação)" language="text">
              {VAULT20_TASK_SNIPPET}
            </CodeBlock>
          </div>
        </div>
        <HomologationRulesModal open={rulesOpen} onOpenChange={setRulesOpen} />

        {/* ----------------------------------------------------------------
           PORTA DE HOMOLOGAÇÃO DA F20 — slots F20-A…F20-D (padrão DD-16).
           Mesmos componentes da F19 (useSlotSubmissions/useSlotHistory,
           barra 0/4, exportar/importar .txt, Limpar + Desfazer 5s).
           ---------------------------------------------------------------- */}
        <TechRule label="Corpo do código — porta de homologação" />
        <h2 id="slots-homologacao" className="font-display text-2xl font-bold scroll-mt-24 mt-10">
          Porta de homologação (F20-A…F20-D)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Quatro blocos de código fecham a homologação da Fase 20 — os locais exatos onde a revisão exigirá
          o corpo real, não a descrição em prosa (padrão DD-16 da F19). Os slots A–D da Fase 19 não se
          transferem de fase: cada fase abre sua própria porta de contrato. Até o build ser submetido, cada
          bloco permanece como slot auditável; a prosa não fecha homologação.
        </p>
        <SlotsSection rulesOpen={rulesOpen} setRulesOpen={setRulesOpen} />

        <TechRule label="Changelog · v2.0.0-prep" />
        <h2 id="changelog" className="font-display text-2xl font-bold scroll-mt-24 mt-10">
          O que mudou nesta pré-versão
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Registro de alterações acumulado da pré-versão v2.0.0-prep (iniciada em 14/08/2026), para
          rastrear tudo que o site e a infraestrutura ganharam desde o fechamento local da v1.9.0. A
          versão v2.0.0 só é carimbada como homologada quando a Fase 20 fechar com build UBT + suíte
          100% + isolamento simétrico Exit 0.
        </p>
        <ChangelogFilter />

        <TechRule label="Navegação" />
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Linha do Tempo & Roadmap
          </Link>
                    <Link
            href="/decisoes#dd-19"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <FileText className="h-4 w-4" /> DD-19 · Persistência transacional
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/fase-19"
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-sm hover:border-engineering/60 hover:text-engineering transition-colors"
          >
            <FileText className="h-4 w-4" /> Fase 19 · Porta de homologação v1.9.0
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {/* Índice lateral (mesmo padrão numerado das páginas longas do Manual/SFPS) */}
      <div className="container py-10 max-w-6xl -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Índice · Plano F20
              </div>
              <ul className="mt-3 space-y-2">
                {TOC.map((t, i) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={`text-sm transition-colors ${
                        active === t.id
                          ? "text-engineering font-semibold"
                          : "text-muted-foreground hover:text-engineering"
                      }`}
                    >
                      <span className="font-mono text-[10px] mr-2 text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
      <BackToTop />
    </DocsLayout>
  );
}
