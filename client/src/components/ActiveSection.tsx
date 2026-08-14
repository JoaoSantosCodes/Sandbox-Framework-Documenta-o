/*
  DESIGN: "Blueprint Técnico" — destaque da seção ativa no índice lateral.
  IntersectionObserver com rootMargin "-25% 0px -70% 0px" (seção ativa é a que
  cruza a linha a 25% do topo) + botão flutuante "Voltar ao topo" que aparece
  após 700px de rolagem. Usado por Manual, SFPS, Manifesto, F17/F18/F19.
*/
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Observa os ids informados e retorna o id da seção que cruza a janela de leitura.
 * Atualiza history.replaceState para manter o hash sincronizado com a rolagem.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          setActive(id);
          if (window.scrollY > 300) {
            history.replaceState(null, "", `#${id}`);
          }
        }
      },
      { rootMargin: "-25% 0px -70% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Botão flutuante "Voltar ao topo" — aparece após SCROLL_THRESHOLD px de rolagem. */
export function BackToTop({ threshold = 700 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 h-11 w-11 border border-border bg-card shadow-md font-mono text-[10px] uppercase tracking-wider text-engineering hover:bg-engineering/10 hover:border-engineering transition-colors duration-200 flex items-center justify-center"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
