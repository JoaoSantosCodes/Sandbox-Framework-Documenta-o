/*
  DESIGN: "Blueprint Técnico" — busca global (⌘/Ctrl+K) indexada por conteúdo.
  Estética de manual técnico: mono, carimbos, sem gradientes. cmdk com fuzzy leve.
*/
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PLUGINS } from "@/lib/siteData";
import { FileText, Layers, Milestone } from "lucide-react";

interface IndexEntry {
  id: string;
  title: string;
  subtitle: string;
  page: string;
  hash?: string;
  keywords: string;
  group: "paginas" | "plugins" | "eventos" | "classes" | "conceitos";
}

const PAGES: IndexEntry[] = [
  { id: "inicio", title: "Início", subtitle: "Visão geral, topologia e métricas do framework", page: "/", keywords: "home dashboard métricas topologia", group: "paginas" },
  { id: "fase18", title: "Fase 18 — Interface Dinâmica", subtitle: "Plano de implantação do 09_SandboxUI homologado", page: "/fase-18", keywords: "plano ui widget gerente fase", group: "paginas" },
  { id: "especificacao", title: "Especificação Estrutural (SFPS)", subtitle: "Topologia, Message Router, FSBBehaviorContext, interfaces", page: "/especificacao", keywords: "spec sfps router publishstate", group: "paginas" },
  { id: "guia", title: "Guia de Desenvolvimento (SFDG)", subtitle: "Procedimentos C++ por componente e subsistema", page: "/guia-cpp", keywords: "sfdg cpp guia desenvolvimento", group: "paginas" },
  { id: "message-router", title: "Message Router — Referência de Eventos", subtitle: "Tabela canônica de eventos Event.* e payloads", page: "/message-router", keywords: "router evento broadcast publishstate", group: "paginas" },
  { id: "plugins", title: "Topologia de Plugins", subtitle: "Dependências unidirecionais dos 11 plugins", page: "/plugins", keywords: "plugins dependências layer foundation", group: "paginas" },
  { id: "fases", title: "Histórico de Fases", subtitle: "Registro de homologação por versão", page: "/fases", keywords: "fases histórico versões specs", group: "paginas" },
  { id: "manifesto", title: "Manifesto e Padrões de Código", subtitle: "Os 10 princípios e standards A/B/C", page: "/manifesto", keywords: "manifesto princípios standards", group: "paginas" },
  { id: "manual", title: "Manual de Uso (v1.7.0)", subtitle: "Pré-requisitos, playtest, gameplay debugger, checklist", page: "/manual", keywords: "manual uso playtest debug", group: "paginas" },
];

const EVENTS: IndexEntry[] = [
  { id: "ev-avail", title: "Event.Interaction.Available", subtitle: "07 → UI: prompt contextual disponível", page: "/message-router", keywords: "available cleared interação", group: "eventos" },
  { id: "ev-progress", title: "Event.Interaction.Progress", subtitle: "07 → UI: barra de hold (throttle 60 Hz)", page: "/message-router", keywords: "progress hold interação", group: "eventos" },
  { id: "ev-added", title: "Event.Inventory.ItemAdded", subtitle: "08 → UI: slot adicionado ao grid", page: "/message-router", keywords: "item added inventário", group: "eventos" },
  { id: "ev-removed", title: "Event.Inventory.ItemRemoved", subtitle: "08 → UI: slot removido do grid", page: "/message-router", keywords: "item removed inventário", group: "eventos" },
  { id: "ev-equipped", title: "Event.Inventory.ItemEquipped", subtitle: "08 → UI: highlight de slot equipado", page: "/message-router", keywords: "item equipped inventário", group: "eventos" },
  { id: "ev-unequipped", title: "Event.Inventory.ItemUnequipped", subtitle: "08 → UI: slot desequipado", page: "/message-router", keywords: "item unequipped inventário", group: "eventos" },
  { id: "ev-attr", title: "Event.Attribute.Changed", subtitle: "05 → UI: barras de vida/mana/estamina", page: "/message-router", keywords: "attribute changed vida mana", group: "eventos" },
  { id: "ev-cd-start", title: "Event.Ability.CooldownStarted", subtitle: "05 → UI: overlay de cooldown iniciado", page: "/message-router", keywords: "cooldown started habilidade", group: "eventos" },
  { id: "ev-cd-end", title: "Event.Ability.CooldownEnded", subtitle: "05 → UI: cooldown encerrado", page: "/message-router", keywords: "cooldown ended habilidade", group: "eventos" },
  { id: "ev-weapon", title: "Event.Combat.WeaponEquipped", subtitle: "06 → UI: ícone de arma ativa", page: "/message-router", keywords: "weapon equipped combate", group: "eventos" },
  { id: "ev-ammo", title: "Event.Combat.AmmoDepleted", subtitle: "06 → UI: feedback de munição esgotada", page: "/message-router", keywords: "ammo depleted munição", group: "eventos" },
  { id: "ev-damage", title: "Event.Combat.DamageReceived", subtitle: "06 → UI: indicador direcional de dano", page: "/message-router", keywords: "damage received dano", group: "eventos" },
];

const CLASSES: IndexEntry[] = [
  { id: "c-ui-manager", title: "USBUIManager", subtitle: "ULocalPlayerSubsystem · camadas Game/Modal/Debug", page: "/fase-18", keywords: "ui manager subsystem localplayer", group: "classes" },
  { id: "c-ui-widget", title: "USBUserWidget", subtitle: "auto-unsubscribe cirúrgico em NativeDestruct", page: "/fase-18", keywords: "ui widget umg unsubscribe", group: "classes" },
  { id: "c-ui-element", title: "USBUIPromptWidget", subtitle: "Prompt contextual + barra de hold (sfdg_guide)", page: "/guia-cpp", keywords: "prompt widget interação", group: "classes" },
  { id: "c-stack", title: "USBBehaviorStackComponent", subtitle: "Pilha de comportamentos · FSBStackMutationGuard", page: "/especificacao", keywords: "behavior stack mutex reentrância", group: "classes" },
  { id: "c-router", title: "USBEventSubsystem", subtitle: "BroadcastMessage / PublishState · priorização", page: "/especificacao", keywords: "event subsystem router mensagens", group: "classes" },
  { id: "c-context", title: "FSBBehaviorContext", subtitle: "Contexto unificado gameplay/framework", page: "/especificacao", keywords: "behavior context framework", group: "classes" },
  { id: "c-debug", title: "ISBDebugInterface", subtitle: "FSBDebugLine · auto-descrição via crosshair", page: "/manual", keywords: "debug interface telemetry", group: "classes" },
  { id: "c-interaction", title: "ASBTestInteractableActor / ASBTestLockedChest", subtitle: "Atores de teste com locks e contagem de ativações", page: "/manual", keywords: "ator teste interação lock chest", group: "classes" },
];

const CONCEPTS: IndexEntry[] = [
  { id: "k-prediction", title: "Predição Client-Side + Autoridade Server-Side", subtitle: "RPC de validação · bSkipServerNotify", page: "/especificacao", keywords: "predição cliente servidor rpc", group: "conceitos" },
  { id: "k-dif", title: "Definition / Instance / RuntimeData", subtitle: "Data Asset estático · UObject runtime · struct transiente", page: "/especificacao", keywords: "definition instance runtime data asset", group: "conceitos" },
  { id: "k-upsert", title: "Upsert por Chave Estável", subtitle: "Nunca índice de array em estruturas replicadas", page: "/especificacao", keywords: "upsert chave replicação", group: "conceitos" },
  { id: "k-isolation", title: "Teste de Isolamento por Compilação", subtitle: "Pasta renomeada + .uplugin_disabled · UBT sem link", page: "/fases", keywords: "isolamento teste compilação ubt", group: "conceitos" },
  { id: "k-throttle", title: "Throttle de 60 Hz em Tick", subtitle: "Proteção do Slate contra re-render por frame", page: "/fase-18", keywords: "throttle tick frame ui", group: "conceitos" },
  { id: "k-anti-spill", title: "Filtro de Escopo Local (Anti-Spill)", subtitle: "TargetPawn == owning pawn antes de renderizar", page: "/fase-18", keywords: "anti spill escopo local player", group: "conceitos" },
  { id: "k-priority", title: "Prioridades de Evento", subtitle: "High(0) · Medium(10) · Low(20) · Lowest(30)", page: "/especificacao", keywords: "prioridade high medium low", group: "conceitos" },
];

const ALL_INDEX: IndexEntry[] = [
  ...PAGES,
  ...PLUGINS.map((p) => ({
    id: `plugin-${p.id}`,
    title: `${p.id}_${p.name}`,
    subtitle: p.description,
    page: "/plugins",
    keywords: `plugin ${p.layer} ${p.dependsOn.join(" ")}`,
    group: "plugins" as const,
  })),
  ...EVENTS,
  ...CLASSES,
  ...CONCEPTS,
];

const GROUP_META: Record<IndexEntry["group"], { label: string; icon: React.ElementType }> = {
  paginas: { label: "Páginas", icon: FileText },
  plugins: { label: "Plugins", icon: Layers },
  eventos: { label: "Eventos Event.*", icon: Milestone },
  classes: { label: "Classes & Interfaces", icon: Milestone },
  conceitos: { label: "Padrões & Conceitos", icon: Milestone },
};

function matches(entry: IndexEntry, q: string): boolean {
  const hay = `${entry.title} ${entry.subtitle} ${entry.keywords}`.toLowerCase();
  return hay.includes(q);
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Buscar no framework" description="Classes, eventos, plugins e páginas do Sandbox Framework">
      <CommandInput placeholder="Buscar classe, evento Event.*, plugin ou conceito…" />
      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
          Nenhum resultado. Tente outro termo — ex.: "Behavior Stack", "Cooldown", "07".
        </CommandEmpty>
        {(Object.keys(GROUP_META) as IndexEntry["group"][]).map((group) => {
          const entries = ALL_INDEX.filter((e) => e.group === group);
          if (!entries.length) return null;
          const { label, icon: Icon } = GROUP_META[group];
          return (
            <CommandGroup key={group} heading={label}>
              {entries
                .filter((e) => e.group === group)
                .map((e) => (
                  <CommandItem
                    key={e.id}
                    value={`${e.title} ${e.subtitle} ${e.keywords}`}
                    onSelect={() => {
                      setOpen(false);
                      navigate(e.page);
                    }}
                    className="gap-3"
                  >
                    <Icon className="h-3.5 w-3.5 opacity-50" />
                    <span className="flex flex-col min-w-0">
                      <span className="font-mono text-[11px] text-foreground truncate">{e.title}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{e.subtitle}</span>
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchShortcut() {
  return (
    <button
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
      className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border bg-background px-2.5 py-1.5 hover:border-engineering/60 hover:text-engineering transition-colors"
      aria-label="Abrir busca global"
    >
      <span className="opacity-60">⌘K</span>
    </button>
  );
}
