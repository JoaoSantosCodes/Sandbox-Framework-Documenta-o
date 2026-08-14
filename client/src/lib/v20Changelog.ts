/* Estilo do site: blueprint técnico (DD-14) — dados compartilhados do
   changelog v2.0.0-prep entre a Home (visão consolidada) e a /fase-20
   (changelog completo). Fonte única de verdade: este arquivo. */
import { useEffect, useState } from "react";

export interface ChangelogEntry {
  tag: string;
  title: string;
  body: string;
}

export interface ChangelogEntryCategory extends ChangelogEntry {
  category: "Novidade" | "Correção" | "Auditoria";
}

export type ChangelogFilterKey = "all" | "Novidade" | "Correção" | "Auditoria";

const CHANGELOG_FILTER_META: Record<ChangelogFilterKey, { label: string }> = {
  all: { label: "Todas" },
  Novidade: { label: "Novidades" },
  Correção: { label: "Correções" },
  Auditoria: { label: "Auditoria" },
};

/* Alterações da pré-versão v2.0.0-prep — registro documental; nenhum item homologa a fase. */
export const V20_CHANGELOG: ChangelogEntryCategory[] = [
  {
    tag: "Home · Changelog",
    category: "Novidade",
    title: "Changelog consolidado da v2.0.0-prep na página inicial",
    body: "A Home ganhou a seção 'Changelog · v2.0.0-prep' (Seção 06) com os mesmos chips de categoria da /fase-20 — Novidades, Correções, Auditoria — e o mesmo filtro compartilhado (persistido entre as duas páginas). O link 'Ver changelog completo' leva ao registro integral na /fase-20. Fonte única de dados: client/src/lib/v20Changelog.ts.",
  },
  {
    tag: "Tooltip",
    category: "Auditoria",
    title: "Explicação do secret VAULT_MIRROR_REPO no botão 'Disparar audit'",
    body: "O tooltip do botão 'Disparar audit' (rodapé) declara o que muda com e sem o secret: com VAULT_MIRROR_REPO = JoaoSantosCodes/Sandbox-Framework-Vault o CI audita o Vault em tempo real; sem ele, o workflow cai no espelho embutido scripts/vault-mirror/ e o resultado reflete o snapshot, não o estado atual da máquina.",
  },
  {
    tag: "F20 · JSON",
    category: "Novidade",
    title: "Exportação estruturada dos slots F20 em JSON",
    body: "Além do backup .txt, a barra de progresso dos slots F20-A…F20-D oferece 'Exportar (.json)': payload estruturado com metadados (data, versão do site, fase, aviso de homologação) e submissões chaveadas pelo slot. A importação agora aceita ambos os formatos (.txt e .json), validando cada bloco e reportando vazios ou corrompidos.",
  },
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

/* Hook de filtro compartilhado (Home + /fase-20): o filtro ativo reflete
   entre as páginas via a mesma chave sbf-changelog-filter. */
export function useChangelogFilter() {
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
  return { filter, setFilter };
}

export function changelogFilterMeta() {
  return CHANGELOG_FILTER_META;
}
