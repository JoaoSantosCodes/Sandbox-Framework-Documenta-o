/*
  DESIGN: "Blueprint Técnico" — layout de documentação
  Header com carimbo de versão + navegação lateral tipo sumário de especificação.
  Acento verde-engineering; tinta grafite sobre papel quente.
*/
import { Link, useLocation } from "wouter";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { ASSET_URLS } from "@/lib/siteData";
import { SearchPalette, SearchShortcut } from "@/components/SearchPalette";
import { Search } from "lucide-react";

const NAV = [
  { href: "/", label: "Início", section: "01" },
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
      </footer>
    </div>
  );
}
