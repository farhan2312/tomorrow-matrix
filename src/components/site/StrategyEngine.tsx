import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { STRATEGY_NODES } from "@/lib/strategy-data";

export function StrategyEngine({ tone = "#84994f", height = 540 }: { tone?: string; height?: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 300;
  const cy = 260;
  const r = 200;

  const positions = useMemo(() => {
    return STRATEGY_NODES.map((n) => {
      const rad = (n.angle * Math.PI) / 180;
      return { ...n, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    });
  }, []);

  const highlightSet = hovered
    ? new Set<string>([hovered, ...(STRATEGY_NODES.find((n) => n.id === hovered)?.related ?? [])])
    : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 600 540" className="h-full w-full">
        <defs>
          <radialGradient id="se-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor={tone} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f3d2e" />
          </radialGradient>
          <linearGradient id="se-link" x1="0" x2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.05" />
            <stop offset="50%" stopColor={tone} stopOpacity="0.6" />
            <stop offset="100%" stopColor={tone} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* orbit rings */}
        {[110, 160, 210].map((rr) => (
          <circle key={rr} cx={cx} cy={cy} r={rr} fill="none" stroke={tone} strokeOpacity="0.12" strokeDasharray="2 4" />
        ))}

        {/* spokes to center */}
        {positions.map((p) => {
          const on = !highlightSet || highlightSet.has(p.id);
          return (
            <motion.line
              key={`s-${p.id}`}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={tone}
              strokeOpacity={on ? 0.55 : 0.08}
              strokeWidth={on ? 1.2 : 0.6}
              initial={false}
              animate={{ strokeOpacity: on ? 0.55 : 0.08 }}
            />
          );
        })}

        {/* interconnections between related nodes */}
        {positions.map((p) =>
          p.related.map((rid) => {
            const q = positions.find((n) => n.id === rid);
            if (!q || p.id > q.id) return null;
            const on = highlightSet ? highlightSet.has(p.id) && highlightSet.has(q.id) : false;
            return (
              <motion.line
                key={`${p.id}-${rid}`}
                x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                stroke="url(#se-link)"
                strokeOpacity={on ? 0.9 : 0.15}
                strokeWidth={on ? 1.4 : 0.5}
              />
            );
          }),
        )}

        {/* traveling data pulses along active connections */}
        {highlightSet &&
          positions
            .filter((p) => highlightSet.has(p.id) && p.id !== hovered)
            .map((p, i) => {
              const anchor = positions.find((n) => n.id === hovered)!;
              return (
                <motion.circle
                  key={`pulse-${p.id}`}
                  r="3"
                  fill={tone}
                  initial={{ cx: anchor.x, cy: anchor.y, opacity: 0 }}
                  animate={{ cx: [anchor.x, p.x], cy: [anchor.y, p.y], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              );
            })}

        {/* center: business strategy */}
        <motion.circle
          cx={cx} cy={cy} r="70"
          fill="url(#se-core)"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          Business
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-white" style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
          Strategy
        </text>

        {/* nodes */}
        {positions.map((p) => {
          const on = !highlightSet || highlightSet.has(p.id);
          const isCenter = p.id === hovered;
          return (
            <g
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <motion.circle
                cx={p.x} cy={p.y}
                animate={{ r: isCenter ? 26 : on ? 22 : 16, opacity: on ? 1 : 0.35 }}
                fill="white"
                stroke={tone}
                strokeWidth={isCenter ? 2.5 : 1.5}
                style={{ filter: on ? `drop-shadow(0 0 10px ${tone})` : "none" }}
              />
              <text
                x={p.x} y={p.y + 4}
                textAnchor="middle"
                className="pointer-events-none"
                style={{ fontFamily: "var(--font-sans)", fontSize: 9, fontWeight: 600, fill: "var(--ink)", opacity: on ? 1 : 0.5 }}
              >
                {p.label.length > 10 ? p.label.slice(0, 8) + "…" : p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        Hover a layer · everything is connected
      </div>
    </div>
  );
}
