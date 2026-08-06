import { useMemo } from "react";
import type { NetworkNode, NetworkEdge, IndicatorKey } from "@/lib/game/types";

const GROUP_COLOR: Record<IndicatorKey, string> = {
  climate: "var(--ind-climate)",
  food:    "var(--ind-food)",
  water:   "var(--ind-water)",
  bio:     "var(--ind-bio)",
  economy: "var(--ind-economy)",
};

export function ButterflyNetwork({
  nodes, edges, height = 420,
}: { nodes: NetworkNode[]; edges: NetworkEdge[]; height?: number }) {
  const positioned = useMemo(() => {
    const W = 800;
    const H = height;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) * 0.36;
    return nodes.map((n, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      // Slight inward spiral so first nodes sit near center
      const r = radius * (0.55 + (i / Math.max(nodes.length, 1)) * 0.45);
      return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
  }, [nodes, height]);

  const byId = Object.fromEntries(positioned.map((n) => [n.id, n]));

  return (
    <div className="surface-card relative overflow-hidden bg-grid">
      <svg viewBox={`0 0 800 ${height}`} className="h-auto w-full">
        {edges.map((e, idx) => {
          const a = byId[e.from], b = byId[e.to];
          if (!a || !b) return null;
          return (
            <g key={idx}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="var(--color-border)" strokeWidth={1.5}
                strokeDasharray="3 4"
              />
            </g>
          );
        })}
        {positioned.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={28} fill="white" stroke={GROUP_COLOR[n.group]} strokeWidth={2.5} />
            <circle cx={n.x} cy={n.y} r={6} fill={GROUP_COLOR[n.group]} />
            <text
              x={n.x} y={n.y + 46}
              textAnchor="middle"
              className="fill-foreground"
              style={{ fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              {n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-2.5">
        {(Object.keys(GROUP_COLOR) as IndicatorKey[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLOR[k] }} />{k}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{nodes.length} nodes · {edges.length} links</span>
      </div>
    </div>
  );
}
