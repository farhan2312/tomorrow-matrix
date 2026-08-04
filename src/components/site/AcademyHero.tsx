import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type Module = {
  id: string;
  label: string;
  duration: string;
  level: "Foundational" | "Intermediate" | "Advanced";
  cert: string;
  outcomes: string[];
};

const MODULES: Module[] = [
  { id: "esg", label: "ESG", duration: "4 wks", level: "Foundational", cert: "ESG Fundamentals", outcomes: ["Materiality", "Governance", "Stakeholders"] },
  { id: "carbon", label: "Carbon Accounting", duration: "6 wks", level: "Intermediate", cert: "GHG Practitioner", outcomes: ["Scope 1–3", "Emission factors", "Boundaries"] },
  { id: "gri", label: "GRI", duration: "5 wks", level: "Intermediate", cert: "GRI Reporter", outcomes: ["Universal Standards", "Sector", "Report writing"] },
  { id: "s1", label: "IFRS S1", duration: "3 wks", level: "Intermediate", cert: "ISSB S1", outcomes: ["Governance", "Risk", "Metrics"] },
  { id: "s2", label: "IFRS S2", duration: "4 wks", level: "Advanced", cert: "ISSB S2", outcomes: ["Climate risk", "Scenarios", "Financial integration"] },
  { id: "csrd", label: "CSRD", duration: "8 wks", level: "Advanced", cert: "ESRS Practitioner", outcomes: ["Double materiality", "ESRS suite", "Assurance-ready"] },
  { id: "iso", label: "ISO 14064", duration: "4 wks", level: "Advanced", cert: "ISO 14064", outcomes: ["Parts 1–3", "Verification", "QA/QC"] },
  { id: "cdp", label: "CDP", duration: "3 wks", level: "Intermediate", cert: "CDP Scoring", outcomes: ["Disclosure", "Scoring", "Uplift"] },
  { id: "nz", label: "Net Zero", duration: "5 wks", level: "Advanced", cert: "Net Zero Strategy", outcomes: ["SBTi", "Transition plan", "Levers"] },
  { id: "risk", label: "Climate Risk", duration: "4 wks", level: "Advanced", cert: "Climate Risk Analyst", outcomes: ["TCFD", "Scenarios", "Physical & transition"] },
];

const STAGES = ["Assess", "Learn", "Practice", "Certify", "Implement", "Lead"];

export function AcademyHero({ height = 540, tone = "#e9c891" }: { height?: number; tone?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), 1700);
    return () => clearInterval(t);
  }, []);

  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 138;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        height,
        background:
          "linear-gradient(180deg, oklch(0.985 0.015 90) 0%, oklch(0.96 0.02 88) 100%)",
      }}
    >
      {/* soft grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.02 85) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.02 85) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      {/* header chip */}
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/70 shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: tone, boxShadow: `0 0 8px ${tone}` }} />
        For Tomorrow · Academy
      </div>
      <div className="absolute right-5 top-5 z-10 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-mono text-muted-foreground shadow-sm backdrop-blur">
        {MODULES.length} learning tracks
      </div>

      {/* Learning ecosystem — orbiting modules */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="max-h-full">
          <defs>
            <radialGradient id="hub" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="60%" stopColor={tone} stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--forest)" />
            </radialGradient>
            <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={tone} stopOpacity="0" />
              <stop offset="50%" stopColor={tone} stopOpacity="0.7" />
              <stop offset="100%" stopColor={tone} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* orbit rings */}
          {[radius - 10, radius + 8].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeOpacity="0.18" strokeDasharray="2 6" />
          ))}

          {/* knowledge flows */}
          {MODULES.map((m, i) => {
            const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            const on = hovered === m.id;
            return (
              <g key={m.id}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={on ? tone : "var(--forest)"}
                  strokeOpacity={on ? 0.6 : 0.15}
                  strokeWidth={on ? 1.4 : 0.8}
                />
                <motion.circle
                  r="2"
                  fill={tone}
                  initial={false}
                  animate={{
                    cx: [cx, x],
                    cy: [cy, y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2.4, delay: i * 0.2, repeat: Infinity, ease: "easeOut" }}
                />
              </g>
            );
          })}

          {/* central hub */}
          <motion.circle
            cx={cx}
            cy={cy}
            r="42"
            fill="url(#hub)"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 24px ${tone})` }}
          />
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-[9px] font-semibold uppercase tracking-widest">
            For Tomorrow
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" className="fill-white/80 text-[8px] uppercase tracking-widest">
            Academy
          </text>
        </svg>

        {/* module cards positioned over SVG */}
        <div className="pointer-events-none absolute inset-0">
          {MODULES.map((m, i) => {
            const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + (Math.cos(angle) * radius * 100) / size;
            const y = 50 + (Math.sin(angle) * radius * 100) / size;
            const on = hovered === m.id;
            return (
              <div
                key={m.id}
                className="pointer-events-auto absolute"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                  className="cursor-pointer rounded-md border border-border bg-white/95 px-2 py-1 text-[9px] font-medium leading-tight shadow-sm backdrop-blur transition-all hover:scale-110 hover:shadow-lift"
                  style={{ borderColor: on ? tone : undefined }}
                >
                  {m.label}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* hovered module expansion panel */}
      <AnimatePresence>
        {hovered && (() => {
          const m = MODULES.find((x) => x.id === hovered)!;
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-5 top-1/2 z-20 w-56 -translate-y-1/2 rounded-xl border border-border bg-white/95 p-4 shadow-lift backdrop-blur"
            >
              <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {m.level}
              </div>
              <div className="text-display text-lg leading-tight">{m.label}</div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>⏱ {m.duration}</span>
                <span>✓ {m.cert}</span>
              </div>
              <div className="mt-3 space-y-1">
                {m.outcomes.map((o) => (
                  <div key={o} className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                    <span className="h-1 w-1 rounded-full" style={{ background: tone }} />
                    {o}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Learner journey */}
      <div className="absolute inset-x-5 bottom-5 z-10 rounded-xl border border-border bg-white/85 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>Learner journey</span>
          <span>Auto-progressing</span>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-2 right-2 top-2 h-px bg-border" />
          <motion.div
            className="absolute left-2 top-2 h-px"
            animate={{ width: `${(Math.min(stage, STAGES.length - 1) / (STAGES.length - 1)) * 90}%` }}
            transition={{ duration: 0.6 }}
            style={{ background: `linear-gradient(90deg, ${tone}, var(--forest))` }}
          />
          {STAGES.map((s, i) => {
            const on = stage > i;
            return (
              <div key={s} className="relative z-10 flex flex-col items-center gap-1">
                <motion.div
                  animate={{ scale: on ? 1.1 : 0.9 }}
                  className="h-4 w-4 rounded-full ring-4 ring-white"
                  style={{
                    background: on ? tone : "var(--mist)",
                    boxShadow: on ? `0 0 12px ${tone}` : "none",
                  }}
                >
                  {on && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-full w-full items-center justify-center">
                      <svg viewBox="0 0 12 12" className="h-2 w-2">
                        <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
                <div className="text-[9px] font-medium uppercase tracking-wider text-foreground/70">{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
