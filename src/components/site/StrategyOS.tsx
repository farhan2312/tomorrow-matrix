import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STRATEGY_PILLARS } from "@/lib/strategy-data";

export function StrategyOS({ tone = "#84994f" }: { tone?: string }) {
  const [active, setActive] = useState<string>(STRATEGY_PILLARS[0].id);
  const cx = 300;
  const cy = 260;
  const r = 180;
  const n = STRATEGY_PILLARS.length;

  const positions = STRATEGY_PILLARS.map((p, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { ...p, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const activeP = positions.find((p) => p.id === active)!;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Signature · Sustainability Operating System
          </div>
          <h2 className="text-display text-[clamp(2rem,3.8vw,3.2rem)]">
            A living <em className="text-gradient-brand">digital twin</em> of your strategy.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Every strategic pillar connects to real initiatives, owners and data.
            Click a pillar to expand the flows that make it operational.
          </p>
        </div>
      </div>

      <div className="grid gap-8 rounded-3xl border border-border bg-card/70 p-6 shadow-lift backdrop-blur lg:grid-cols-[1.1fr_1fr] lg:p-8">
        <div className="relative h-[520px]">
          <svg viewBox="0 0 600 520" className="h-full w-full">
            <defs>
              <radialGradient id="os-core" cx="50%" cy="50%">
                <stop offset="0%" stopColor="white" />
                <stop offset="55%" stopColor={tone} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f3d2e" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={r + 30} fill="none" stroke={tone} strokeOpacity="0.08" strokeDasharray="2 4" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeOpacity="0.15" />

            {positions.map((p) => (
              <line key={`l-${p.id}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
                stroke={tone} strokeOpacity={active === p.id ? 0.6 : 0.15} strokeWidth={active === p.id ? 1.4 : 0.7} />
            ))}

            {/* particles from active pillar to hub */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={`p-${i}`}
                r="3" fill={tone}
                initial={{ cx: activeP.x, cy: activeP.y, opacity: 0 }}
                animate={{ cx: [activeP.x, cx], cy: [activeP.y, cy], opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              />
            ))}

            <motion.circle cx={cx} cy={cy} r="70" fill="url(#os-core)" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }} style={{ transformOrigin: `${cx}px ${cy}px` }} />
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white" style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Sustainability</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="fill-white" style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>OS</text>

            {positions.map((p) => {
              const on = active === p.id;
              return (
                <g key={p.id} onClick={() => setActive(p.id)} className="cursor-pointer">
                  <motion.circle cx={p.x} cy={p.y} r={on ? 30 : 22} fill="white" stroke={tone}
                    strokeWidth={on ? 2.5 : 1.2}
                    style={{ filter: on ? `drop-shadow(0 0 12px ${tone})` : "none" }}
                    animate={{ scale: on ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <text x={p.x} y={p.y + 3} textAnchor="middle" style={{ fontSize: 9, fontWeight: 600, fill: "var(--ink)" }}>
                    {p.label.length > 10 ? p.label.slice(0, 8) + "…" : p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Pillar detail
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mt-2 text-display text-4xl">{activeP.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Live initiatives, owners and dependencies wired into this pillar.
              </p>
              <div className="mt-6 space-y-2">
                {activeP.initiatives.map((it, i) => (
                  <motion.div
                    key={it}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono text-white" style={{ background: tone }}>
                        {i + 1}
                      </span>
                      {it}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {STRATEGY_PILLARS.filter((p) => p.id !== active).slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className="rounded-full border border-border px-3 py-1 text-[10px] hover:border-[var(--leaf)]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
