/*
  DESIGN: "Blueprint Técnico" — layout de documentação
  Header com carimbo de versão + navegação lateral tipo sumário de especificação.
  Acento verde-engineering; tinta grafite sobre papel quente.
*/
import { Link, useLocation } from "wouter";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { ASSET_URLS } from "@/lib/siteData";

const NAV = [
  { href: "/", label: "Início", section: "01" },
  { href: "/fase-18", label: "Fase 18 — Interface Dinâmica", section: "02" },
  { href: "/plugins", label: "Topologia de Plugins", section: "03" },
  { href: "/fases", label: "Histórico de Fases", section: "04" },
  { href: "/manual", label: "Manual de Uso", section: "05" },
  { href: "/manifesto", label: "Manifesto & Padrões", section: "06" },
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
          <span className="phase-stamp hidden md:inline ml-2">v1.7.0 · 31/31 testes</span>
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
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-secondary/60">
        <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={ASSET_URLS.logo} alt="" className="h-6 w-6 opacity-70" />
            <p className="text-sm text-muted-foreground">
              Sandbox Framework · Documentação técnica de engenharia · Unreal Engine 5.8 · C++
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground tracking-wider">
            SPEC · v1.7.0 · 11 PLUGINS · ZERO DEPENDÊNCIAS CIRCULARES
          </span>
        </div>
      </footer>
    </div>
  );
}
