import { useState } from "react";
import { motion } from "framer-motion";
import { FLYWHEEL_STAGES } from "@/lib/strategy-data";

const STAGE_DETAIL: Record<string, string> = {
  "Business Vision": "The North Star — purpose, ambition and the case for change.",
  "Materiality": "Double materiality: what matters to the business and to the world.",
  "Capital Allocation": "Green capex, sustainable finance, priority-weighted budgets.",
  "Climate Strategy": "Targets, transition levers and dependency mapping.",
  "Operational Changes": "Process, product, procurement and people initiatives.",
  "Measurement": "Metrics with lineage — one audited data spine.",
  "Reporting": "Framework-aligned narrative for investors and regulators.",
  "Verification": "Independent assurance builds durable trust.",
  "Continuous Improvement": "Learn, re-materialise, raise ambition, repeat.",
};

export function StrategyFlywheel({ tone = "#84994f" }: { tone?: string }) {
  const [paused, setPaused] = useState<string | null>(null);
  const r = 150;
  const cx = 200;
  const cy = 200;
  const n = FLYWHEEL_STAGES.length;

  return (
    <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-[400px_1fr]">
      <div className="relative h-[400px] w-full">
        <motion.svg
          viewBox="0 0 400 400"
          className="h-full w-full"
          animate={{ rotate: paused ? 0 : 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50% 50%" }}
        >
          <defs>
            <radialGradient id="fw-hub" cx="50%" cy="50%">
              <stop offset="0%" stopColor="white" />
              <stop offset="60%" stopColor={tone} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeOpacity="0.2" strokeDasharray="3 4" />
          <circle cx={cx} cy={cy} r="60" fill="url(#fw-hub)" />
          {FLYWHEEL_STAGES.map((label, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const on = paused === label;
            return (
              <g
                key={label}
                onMouseEnter={() => setPaused(label)}
                onMouseLeave={() => setPaused(null)}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r={on ? 22 : 16} fill="white" stroke={tone} strokeWidth={on ? 2 : 1.2}
                  style={{ filter: on ? `drop-shadow(0 0 8px ${tone})` : "none" }} />
                <text x={x} y={y + 3} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: "var(--ink)" }}>
                  {label.split(" ").map((w) => w[0]).join("")}
                </text>
              </g>
            );
          })}
        </motion.svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Operating model</div>
            <div className="text-display text-xl">Flywheel</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          {paused ? "Focused" : "Hover to pause · explore each stage"}
        </div>
        <div className="text-display text-3xl">{paused ?? "Business Vision → Improvement"}</div>
        <p className="mt-3 text-sm text-muted-foreground">
          {paused ? STAGE_DETAIL[paused] : "A continuous loop where every rotation compounds trust, capability, and business value."}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {FLYWHEEL_STAGES.map((s) => (
            <button
              key={s}
              onMouseEnter={() => setPaused(s)}
              onMouseLeave={() => setPaused(null)}
              className={`rounded-full border px-3 py-1.5 text-[10px] transition ${paused === s ? "border-transparent text-white" : "border-border text-foreground/70 hover:text-foreground"}`}
              style={paused === s ? { background: tone } : undefined}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
