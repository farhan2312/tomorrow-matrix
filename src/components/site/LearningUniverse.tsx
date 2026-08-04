import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Track = {
  id: string;
  label: string;
  angle: number;
  modules: string[];
  color: string;
};

const TRACKS: Track[] = [
  { id: "esg", label: "ESG Awareness", angle: -90, color: "#84994f", modules: ["Introduction", "Environmental", "Social", "Governance", "Materiality", "Strategy", "Certification"] },
  { id: "carbon", label: "Carbon Accounting", angle: -30, color: "#fcb53b", modules: ["GHG Protocol", "Scopes", "Calculations", "Reporting", "Verification", "Net Zero", "Certificate"] },
  { id: "gri", label: "GRI", angle: 30, color: "#b5c99a", modules: ["Materiality", "Universal Standards", "Environmental", "Social", "Report Writing", "Verification", "Certificate"] },
  { id: "ifrs", label: "IFRS S1 & S2", angle: 90, color: "#d06224", modules: ["Governance", "Risk", "Strategy", "Metrics", "Scenario Analysis", "Implementation", "Certificate"] },
  { id: "iso", label: "ISO 14064", angle: 150, color: "#a64b2a", modules: ["Inventory", "Projects", "Verification", "Implementation", "Certificate"] },
  { id: "csrd", label: "CSRD / ESRS", angle: 210, color: "#6b8b3c", modules: ["Double Materiality", "ESRS Suite", "Data Spine", "Assurance", "Certificate"] },
];

export function LearningUniverse({ tone = "#e9c891" }: { tone?: string }) {
  const [active, setActive] = useState<string | null>(TRACKS[1].id);
  const [completed, setCompleted] = useState<Set<string>>(new Set(["esg", "carbon"]));

  const size = 640;
  const cx = size / 2;
  const cy = size / 2;
  const trackRadius = 200;
  const moduleRadius = 90;

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Signature experience
          </div>
          <h2 className="text-display text-[clamp(2rem,3.8vw,3.2rem)]">
            The Sustainability{" "}
            <em className="text-gradient-brand">Learning Universe</em>.
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Click a track to unfold its module constellation. Mark modules complete to
          light up your learning path across the ecosystem.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color-mix(in_oklab,var(--ink)_92%,black)] to-[color-mix(in_oklab,var(--ink)_82%,var(--forest))] shadow-lift">
        {/* subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-center" style={{ height: 640 }}>
          <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" className="max-h-full">
            <defs>
              <radialGradient id="lu-hub" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="50%" stopColor={tone} stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--forest)" stopOpacity="0.6" />
              </radialGradient>
            </defs>

            {/* orbit rings */}
            {[trackRadius, trackRadius + 60].map((r, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity="0.08" strokeDasharray="1 4" />
            ))}

            {/* connections hub → track */}
            {TRACKS.map((t) => {
              const rad = (t.angle * Math.PI) / 180;
              const x = cx + Math.cos(rad) * trackRadius;
              const y = cy + Math.sin(rad) * trackRadius;
              const on = active === t.id;
              return (
                <g key={`c-${t.id}`}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={on ? t.color : "white"}
                    strokeOpacity={on ? 0.7 : 0.15}
                    strokeWidth={on ? 1.5 : 0.8}
                  />
                  {on && (
                    <motion.circle
                      r="2.5"
                      fill={t.color}
                      animate={{ cx: [cx, x], cy: [cy, y], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}

            {/* module constellations for active track */}
            {TRACKS.map((t) => {
              const rad = (t.angle * Math.PI) / 180;
              const tx = cx + Math.cos(rad) * trackRadius;
              const ty = cy + Math.sin(rad) * trackRadius;
              const on = active === t.id;
              if (!on) return null;
              return (
                <g key={`mods-${t.id}`}>
                  {t.modules.map((m, i) => {
                    const spread = Math.PI * 0.7;
                    const base = rad + Math.PI;
                    const a = base - spread / 2 + (spread * i) / Math.max(1, t.modules.length - 1);
                    const mx = tx + Math.cos(a) * moduleRadius;
                    const my = ty + Math.sin(a) * moduleRadius;
                    const key = `${t.id}-${i}`;
                    const done = completed.has(t.id) && i < 3;
                    return (
                      <motion.g
                        key={key}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <line x1={tx} y1={ty} x2={mx} y2={my} stroke={t.color} strokeOpacity="0.4" strokeWidth="0.6" />
                        <circle cx={mx} cy={my} r={done ? 5 : 4} fill={done ? t.color : "white"} fillOpacity={done ? 1 : 0.9} />
                        {done && (
                          <circle cx={mx} cy={my} r="9" fill="none" stroke={t.color} strokeOpacity="0.4" />
                        )}
                        <text
                          x={mx}
                          y={my + (my > ty ? 16 : -8)}
                          textAnchor="middle"
                          className="fill-white/80 text-[9px] font-medium"
                          style={{ letterSpacing: "0.05em" }}
                        >
                          {m}
                        </text>
                      </motion.g>
                    );
                  })}
                </g>
              );
            })}

            {/* track nodes */}
            {TRACKS.map((t) => {
              const rad = (t.angle * Math.PI) / 180;
              const x = cx + Math.cos(rad) * trackRadius;
              const y = cy + Math.sin(rad) * trackRadius;
              const on = active === t.id;
              const done = completed.has(t.id);
              return (
                <g key={t.id} style={{ cursor: "pointer" }} onClick={() => setActive(t.id)}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={on ? 14 : 10}
                    fill={t.color}
                    style={{ filter: `drop-shadow(0 0 ${on ? 16 : 8}px ${t.color})` }}
                    animate={{ scale: on ? [1, 1.08, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {done && (
                    <text x={x} y={y + 3} textAnchor="middle" className="fill-white text-[10px] font-bold">
                      ✓
                    </text>
                  )}
                  <text
                    x={x}
                    y={y - 22}
                    textAnchor="middle"
                    className={`text-[10px] font-semibold uppercase ${on ? "fill-white" : "fill-white/60"}`}
                    style={{ letterSpacing: "0.15em" }}
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}

            {/* hub */}
            <motion.circle
              cx={cx}
              cy={cy}
              r="52"
              fill="url(#lu-hub)"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 30px ${tone})` }}
            />
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-[10px] font-bold uppercase tracking-widest">
              For Tomorrow
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="fill-white/70 text-[9px] uppercase tracking-widest">
              Academy
            </text>
          </svg>
        </div>

        {/* controls */}
        <div className="border-t border-white/10 bg-black/30 p-4 backdrop-blur">
          <AnimatePresence mode="wait">
            {active && (() => {
              const t = TRACKS.find((x) => x.id === active)!;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
                    <div className="text-display text-lg text-white">{t.label}</div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                      {t.modules.length} modules · {completed.has(t.id) ? "In progress" : "Not started"}
                    </span>
                  </div>
                  <button
                    onClick={() => toggle(t.id)}
                    className="rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {completed.has(t.id) ? "Mark not started" : "Start learning path"}
                  </button>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
