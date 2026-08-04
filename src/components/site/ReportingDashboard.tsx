import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const FRAMEWORKS = ["GRI", "ISSB", "TCFD", "CSRD", "CDP", "SASB"];

const FRAMEWORK_META: Record<string, { color: string; sections: string[] }> = {
  GRI: { color: "#84994f", sections: ["GRI 2 · General", "GRI 305 · Emissions", "GRI 303 · Water"] },
  ISSB: { color: "#3a7ca5", sections: ["IFRS S1 · General", "IFRS S2 · Climate", "Metrics & Targets"] },
  TCFD: { color: "#d06224", sections: ["Governance", "Strategy", "Risk Mgmt", "Metrics"] },
  CSRD: { color: "#a64b2a", sections: ["ESRS 1/2", "ESRS E1 · Climate", "ESRS S1 · Own Workforce"] },
  CDP: { color: "#2e7d5b", sections: ["Climate Change", "Water Security", "Forests"] },
  SASB: { color: "#5f6b7a", sections: ["Industry Std", "Financially Material", "Metrics"] },
};

/**
 * Living Sustainability Reporting Operating System.
 * A glass dashboard where one dataset transforms through every major framework.
 */
export function ReportingDashboard({ height = 520 }: { height?: number }) {
  const [activeFw, setActiveFw] = useState(0);
  const [hoverFw, setHoverFw] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveFw((i) => (i + 1) % FRAMEWORKS.length), 2400);
    return () => clearInterval(t);
  }, []);

  const currentFw = hoverFw ?? FRAMEWORKS[activeFw];
  const meta = FRAMEWORK_META[currentFw];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        height,
        background:
          "linear-gradient(135deg, #fbfbf7 0%, #f3f5ee 100%)",
      }}
    >
      {/* subtle grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="rd-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 H0 V28" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rd-grid)" />
      </svg>

      {/* Ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `color-mix(in oklab, ${meta.color} 35%, transparent)` }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--leaf) 25%, transparent)" }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      {/* Dashboard chrome header */}
      <div className="relative z-10 flex items-center justify-between border-b border-black/5 bg-white/40 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--ember)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--sand)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--leaf)]" />
          <div className="ml-3 font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/60">
            reporting.os · live
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: meta.color }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] text-foreground/60">syncing</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative z-10 grid h-[calc(100%-40px)] grid-cols-6 grid-rows-6 gap-3 p-4">
        {/* LEFT: incoming data stream */}
        <div className="col-span-2 row-span-3 relative rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              Company Data
            </div>
            <div className="text-[9px] font-mono text-foreground/40">128 sources</div>
          </div>
          <DataStream color={meta.color} />
          <div className="mt-2 space-y-1">
            {["Energy meters", "HR systems", "Suppliers", "Finance ERP"].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-1.5 text-[10px] text-foreground/70"
              >
                <motion.span
                  className="h-1 w-1 rounded-full"
                  style={{ background: meta.color }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity }}
                />
                {s}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CENTER TOP: KPI cards */}
        <div className="col-span-2 row-span-2 rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-2 text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
            ESG KPIs
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KPI label="Emissions" value="41.2k" unit="tCO₂e" color={meta.color} trend="down" />
            <KPI label="Data quality" value="94" unit="%" color="#84994f" trend="up" />
          </div>
        </div>

        {/* CENTER MID: Materiality matrix */}
        <div className="col-span-2 row-span-2 rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-1 text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
            Double Materiality
          </div>
          <MaterialityMatrix color={meta.color} />
        </div>

        {/* RIGHT: Framework selector */}
        <div className="col-span-2 row-span-3 relative rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              Framework Output
            </div>
            <motion.div
              key={currentFw}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold"
              style={{
                background: `color-mix(in oklab, ${meta.color} 15%, white)`,
                color: meta.color,
              }}
            >
              {currentFw}
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {FRAMEWORKS.map((f) => {
              const on = currentFw === f;
              const c = FRAMEWORK_META[f].color;
              return (
                <button
                  key={f}
                  onMouseEnter={() => setHoverFw(f)}
                  onMouseLeave={() => setHoverFw(null)}
                  className="group relative overflow-hidden rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all"
                  style={{
                    borderColor: on ? c : "rgba(0,0,0,0.08)",
                    background: on ? `color-mix(in oklab, ${c} 12%, white)` : "white",
                    color: on ? c : "rgba(0,0,0,0.65)",
                    boxShadow: on ? `0 4px 14px -6px ${c}` : "none",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Generated disclosure sections */}
          <div className="mt-3 space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/40">
              Auto-generated sections
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFw}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="space-y-1"
              >
                {meta.sections.map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-1.5 rounded border border-black/5 bg-white/70 px-2 py-1 text-[10px] text-foreground/75"
                  >
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                      <path
                        d="M2 6 L5 9 L10 3"
                        stroke={meta.color}
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {s}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM CENTER: Progress chart */}
        <div className="col-span-4 row-span-3 rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              Disclosure Coverage · 12 months
            </div>
            <div className="flex items-center gap-2 text-[9px] text-foreground/60">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                Coverage
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--leaf)]" />
                Assured
              </span>
            </div>
          </div>
          <CoverageChart color={meta.color} />
        </div>

        {/* BOTTOM RIGHT: Governance indicators */}
        <div className="col-span-2 row-span-3 rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur-md shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]">
          <div className="mb-2 text-[9px] font-mono uppercase tracking-[0.2em] text-foreground/50">
            Governance
          </div>
          <div className="space-y-2">
            {[
              { label: "Board oversight", v: 92 },
              { label: "Audit trail", v: 100 },
              { label: "Evidence linked", v: 87 },
              { label: "Assurance ready", v: 95 },
            ].map((r, i) => (
              <div key={r.label}>
                <div className="mb-0.5 flex items-center justify-between text-[9.5px]">
                  <span className="text-foreground/70">{r.label}</span>
                  <span className="font-mono text-foreground/60">{r.v}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-black/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.v}%` }}
                    transition={{ duration: 1.4, delay: i * 0.15, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${meta.color}, color-mix(in oklab, ${meta.color} 40%, var(--leaf)))`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flowing connector lines overlay */}
      <ConnectorLines color={meta.color} />
    </div>
  );
}

function KPI({
  label,
  value,
  unit,
  color,
  trend,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  trend: "up" | "down";
}) {
  return (
    <div className="rounded-lg border border-black/5 bg-white/70 p-2">
      <div className="text-[8.5px] font-mono uppercase tracking-widest text-foreground/50">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-display text-base leading-none" style={{ color }}>
          {value}
        </span>
        <span className="text-[9px] text-foreground/50">{unit}</span>
      </div>
      <svg viewBox="0 0 60 14" className="mt-1 h-3 w-full">
        <motion.path
          d={
            trend === "down"
              ? "M0 4 L12 6 L24 5 L36 9 L48 8 L60 12"
              : "M0 12 L12 10 L24 11 L36 6 L48 7 L60 3"
          }
          stroke={color}
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6 }}
        />
      </svg>
    </div>
  );
}

function DataStream({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 40" className="h-8 w-full">
      <line x1="0" y1="20" x2="200" y2="20" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 3" />
      {[0, 1, 2, 3, 4].map((n) => (
        <motion.circle
          key={n}
          cy="20"
          r="2"
          fill={color}
          initial={{ cx: 0, opacity: 0 }}
          animate={{ cx: 200, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, delay: n * 0.45, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </svg>
  );
}

function MaterialityMatrix({ color }: { color: string }) {
  const dots = [
    { x: 25, y: 70, r: 3 },
    { x: 40, y: 50, r: 4 },
    { x: 55, y: 30, r: 5.5 },
    { x: 70, y: 20, r: 6 },
    { x: 35, y: 30, r: 3 },
    { x: 60, y: 55, r: 4 },
    { x: 80, y: 45, r: 3.5 },
  ];
  return (
    <svg viewBox="0 0 100 90" className="h-[calc(100%-14px)] w-full">
      <line x1="15" y1="80" x2="95" y2="80" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="15" y1="10" x2="15" y2="80" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <text x="55" y="88" textAnchor="middle" fontSize="5" fill="rgba(0,0,0,0.4)">
        Financial materiality →
      </text>
      <text x="8" y="45" textAnchor="middle" fontSize="5" fill="rgba(0,0,0,0.4)" transform="rotate(-90 8 45)">
        Impact →
      </text>
      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={color}
          fillOpacity={0.7}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
        />
      ))}
    </svg>
  );
}

function CoverageChart({ color }: { color: string }) {
  const months = 12;
  return (
    <svg viewBox="0 0 320 120" className="h-[calc(100%-16px)] w-full">
      <defs>
        <linearGradient id="rd-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 30, 60, 90].map((y) => (
        <line key={y} x1="0" y1={y + 10} x2="320" y2={y + 10} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
      ))}
      {(() => {
        const pts = Array.from({ length: months + 1 }, (_, i) => {
          const x = (i / months) * 320;
          const y = 100 - (25 + i * 5 + Math.sin(i) * 4);
          return `${x},${y}`;
        });
        const d = "M" + pts.join(" L");
        const area = d + ` L 320 110 L 0 110 Z`;
        return (
          <>
            <motion.path
              d={area}
              fill="url(#rd-area)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8 }}
            />
            {/* assured line — leaf */}
            <motion.path
              d={
                "M " +
                Array.from({ length: months + 1 }, (_, i) => {
                  const x = (i / months) * 320;
                  const y = 100 - (10 + i * 4 + Math.cos(i) * 3);
                  return `${x},${y}`;
                }).join(" L")
              }
              fill="none"
              stroke="var(--leaf)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.4 }}
            />
          </>
        );
      })()}
    </svg>
  );
}

function ConnectorLines({ color }: { color: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="rd-line" x1="0" x2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* particle flow paths — decorative */}
      <motion.path
        d="M 100 180 C 200 160, 300 200, 460 180"
        fill="none"
        stroke="url(#rd-line)"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2 }}
      />
    </svg>
  );
}
