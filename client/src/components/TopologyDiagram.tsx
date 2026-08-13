/*
  DESIGN: "Blueprint Técnico" — diagrama de topologia SVG nativo (hero structural).
  11 plugins em 5 camadas; setas unidirecionais de dependência.
  Tinta grafite + verde-engineering sobre papel; estilo desenho técnico.
*/
import { LAYER_META, PLUGINS, Plugin } from "@/lib/siteData";

type Point = { x: number; y: number };

const LAYER_OFFSETS = {
  foundation: 0,
  "gameplay-base": 0.2,
  extension: 0.55,
  presentation: 0.72,
  tools: 0.72,
};

/* positions (in a 1000x560 viewBox): manually placed per layer */
const POS: Record<string, Point> = {
  "01": { x: 90, y: 90 },
  "02": { x: 230, y: 90 },
  "03": { x: 370, y: 90 },
  "04": { x: 510, y: 90 },
  "05": { x: 500, y: 210 },
  "06": { x: 130, y: 330 },
  "07": { x: 315, y: 330 },
  "08": { x: 500, y: 330 },
  "09": { x: 700, y: 330 },
  "10": { x: 870, y: 330 },
  "11": { x: 785, y: 455 },
};

const W = 148;
const H = 64;

function Node({ p }: { p: Plugin }) {
  const pos = POS[p.id];
  const meta = LAYER_META[p.layer];
  return (
    <g transform={`translate(${pos.x},${pos.y})`}>
      <rect
        width={W}
        height={H}
        rx={2}
        className="fill-card stroke-2"
        style={{ stroke: "var(--ink)", opacity: 1 }}
      />
      <rect width={4} height={H} className="fill-[var(--engineering)]" opacity={p.layer === "gameplay-base" || p.layer === "extension" || p.layer === "foundation" ? 1 : 0.55} />
      <text x={12} y={26} className="font-mono font-bold" style={{ fontSize: 11, fill: "var(--engineering)" }}>
        {p.id}
      </text>
      <text x={12} y={42} style={{ fontSize: 11.5, fill: "var(--ink)", fontFamily: "JetBrains Mono" }}>
        {p.name.replace("Sandbox", "SB")}
      </text>
      <text x={12} y={57} style={{ fontSize: 9, fill: "var(--muted-foreground)" }}>
        {meta.label}
      </text>
      {p.status === "stub" && (
        <g transform={`translate(${W - 16}, -8)`}>
          <circle r={6} className="fill-[var(--amber-warn)]" />
          <text x={0} y={3} textAnchor="middle" style={{ fontSize: 8, fill: "#fff", fontWeight: 700 }}>!</text>
        </g>
      )}
    </g>
  );
}

function Arrow({ from, to }: { from: string; to: string }) {
  const a = POS[from];
  const b = POS[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  /* offset start to node edge and end before target node */
  const r = 34;
  const x1 = a.x + W / 2 + ux * (r - 20);
  const y1 = a.y + H / 2 + uy * (r - 20);
  const x2 = b.x + W / 2 - ux * (r + 10);
  const y2 = b.y + H / 2 - uy * (r + 10);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  /* control point: curve to avoid overlaps */
  const cx = mx + (Math.abs(dy) > 60 ? 0 : 0);
  const cy = my + (Math.abs(dx) > 100 && Math.abs(dy) < 80 ? -26 : 0);
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke="var(--ink)" strokeWidth={1.2} opacity={0.45} markerEnd="url(#arrowhead)" />
    </g>
  );
}

const ARROWS: [string, string][] = [
  ["02", "01"], ["03", "01"], ["04", "01"], ["04", "03"], ["04", "02"],
  ["05", "04"],
  ["06", "05"], ["07", "05"], ["08", "05"],
  ["09", "02"], ["09", "04"], ["10", "02"], ["10", "04"],
];

export function TopologyDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 560"
      className={`w-full h-auto ${compact ? "" : "max-w-4xl"}`}
      role="img"
      aria-label="Topologia de dependências dos 11 plugins do Sandbox Framework"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--ink)" opacity={0.6} />
        </marker>
      </defs>
      {ARROWS.map(([from, to], i) => (
        <Arrow key={`${from}-${to}-${i}`} from={from} to={to} />
      ))}
      {PLUGINS.map((p) => (
        <Node key={p.id} p={p} />
      ))}
    </svg>
  );
}
