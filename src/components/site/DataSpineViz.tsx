import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Fw = {
  key: string;
  label: string;
  color: string;
  jurisdiction: string;
  sections: string[];
  kpis: string[];
  assurance: string;
};

const FRAMEWORKS: Fw[] = [
  {
    key: "gri",
    label: "GRI",
    color: "#84994f",
    jurisdiction: "Global · Multi-stakeholder",
    sections: ["GRI 2 General", "GRI 305 Emissions", "GRI 303 Water"],
    kpis: ["Scope 1/2/3", "Water withdrawal", "Diversity ratios"],
    assurance: "Limited (AA1000AS)",
  },
  {
    key: "issb",
    label: "ISSB S1/S2",
    color: "#3a7ca5",
    jurisdiction: "Global · Investor-grade",
    sections: ["Governance", "Strategy", "Risk & Metrics"],
    kpis: ["Climate-related risks", "Transition plan", "Scope 1/2/3"],
    assurance: "Reasonable (ISAE 3410)",
  },
  {
    key: "tcfd",
    label: "TCFD",
    color: "#d06224",
    jurisdiction: "Global · Folded into IFRS S2",
    sections: ["Governance", "Strategy", "Risk", "Metrics"],
    kpis: ["Physical risk", "Transition risk", "Emissions"],
    assurance: "Limited",
  },
  {
    key: "csrd",
    label: "CSRD / ESRS",
    color: "#a64b2a",
    jurisdiction: "European Union",
    sections: ["ESRS 1/2", "ESRS E1 Climate", "ESRS S1 Workforce"],
    kpis: ["Double materiality", "Value chain", "Policies & actions"],
    assurance: "Limited → Reasonable (2028)",
  },
  {
    key: "cdp",
    label: "CDP",
    color: "#2e7d5b",
    jurisdiction: "Global · Investor & buyer",
    sections: ["Climate Change", "Water", "Forests"],
    kpis: ["Scope 1/2/3", "Verified emissions", "Targets"],
    assurance: "Third-party verification",
  },
  {
    key: "sasb",
    label: "SASB",
    color: "#5f6b7a",
    jurisdiction: "Industry-specific · US-origin",
    sections: ["Industry standard", "Financially material"],
    kpis: ["Sector KPIs", "Activity metrics"],
    assurance: "Limited",
  },
  {
    key: "ifrs",
    label: "IFRS S1",
    color: "#4a6d8c",
    jurisdiction: "Global · General disclosures",
    sections: ["Governance", "Strategy", "Sustainability risks"],
    kpis: ["Material topics", "Value-chain data"],
    assurance: "Reasonable",
  },
];

/**
 * Signature section: One audited data spine → many frameworks.
 * Central node radiates animated data streams to each framework card.
 */
export function DataSpineViz({ tone = "#84994f" }: { tone?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          The signature workflow
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)] leading-tight">
          One audited data spine.{" "}
          <em className="text-gradient-brand">Every major framework.</em>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Hover any framework to see how the same trusted dataset generates its disclosures,
          KPIs, and evidence chain — with no duplicated work.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-white/70 to-[var(--cream)]/60 p-6 backdrop-blur-md md:p-10"
        style={{
          boxShadow:
            "0 30px 80px -30px color-mix(in oklab, var(--forest) 25%, transparent), 0 0 0 1px rgba(255,255,255,0.5) inset",
        }}
      >
        {/* ambient glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: `color-mix(in oklab, ${tone} 22%, transparent)` }}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* LEFT — the spine visual */}
          <div className="relative aspect-square w-full">
            <SpineSVG frameworks={FRAMEWORKS} hovered={hovered} tone={tone} />
          </div>

          {/* RIGHT — framework grid + detail */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FRAMEWORKS.map((f) => {
                const on = hovered === f.key;
                return (
                  <button
                    key={f.key}
                    onMouseEnter={() => setHovered(f.key)}
                    onFocus={() => setHovered(f.key)}
                    onMouseLeave={() => setHovered(null)}
                    className="group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all"
                    style={{
                      borderColor: on ? f.color : "hsl(var(--border))",
                      background: on
                        ? `color-mix(in oklab, ${f.color} 10%, white)`
                        : "rgba(255,255,255,0.6)",
                      boxShadow: on ? `0 8px 24px -10px ${f.color}` : "none",
                      transform: on ? "translateY(-2px)" : "translateY(0)",
                    }}
                  >
                    <div
                      className="mb-1 h-1 w-6 rounded-full transition-all"
                      style={{
                        background: f.color,
                        opacity: on ? 1 : 0.4,
                        width: on ? "24px" : "16px",
                      }}
                    />
                    <div className="text-sm font-medium text-foreground">{f.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {f.jurisdiction.split(" · ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview panel */}
            <div className="relative min-h-[220px] rounded-2xl border border-border bg-white/70 p-5 backdrop-blur">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hovered ?? "idle"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  {(() => {
                    const f = FRAMEWORKS.find((x) => x.key === hovered);
                    if (!f) {
                      return (
                        <div className="text-sm text-muted-foreground">
                          <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.24em] text-foreground/50">
                            Hover a framework
                          </div>
                          <p>
                            Watch the same audited dataset generate its unique disclosures,
                            KPIs, and evidence links — instantly.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: f.color, boxShadow: `0 0 10px ${f.color}` }}
                          />
                          <div className="text-display text-lg" style={{ color: f.color }}>
                            {f.label}
                          </div>
                          <div className="ml-auto text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            {f.jurisdiction}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <PreviewCol title="Disclosure sections" items={f.sections} color={f.color} />
                          <PreviewCol title="KPIs generated" items={f.kpis} color={f.color} />
                          <PreviewCol title="Assurance" items={[f.assurance, "Evidence linked", "Audit trail"]} color={f.color} />
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCol({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[9.5px] font-mono uppercase tracking-[0.2em] text-foreground/50">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-1.5 text-[11px] leading-snug text-foreground/80"
          >
            <svg viewBox="0 0 12 12" className="mt-0.5 h-2.5 w-2.5 shrink-0">
              <path
                d="M2 6 L5 9 L10 3"
                stroke={color}
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {s}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function SpineSVG({
  frameworks,
  hovered,
  tone,
}: {
  frameworks: Fw[];
  hovered: string | null;
  tone: string;
}) {
  const cx = 200;
  const cy = 200;
  const R = 155;
  const n = frameworks.length;

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <radialGradient id="ds-core" cx="50%" cy="50%">
          <stop offset="0%" stopColor={tone} stopOpacity="0.95" />
          <stop offset="60%" stopColor={tone} stopOpacity="0.6" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ds-halo" cx="50%" cy="50%">
          <stop offset="0%" stopColor={tone} stopOpacity="0.25" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer halo */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={185}
        fill="url(#ds-halo)"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ transformOrigin: "200px 200px" }}
      />

      {/* Orbit rings */}
      {[70, 120, 155].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="0.5"
          strokeOpacity={0.15 + i * 0.05}
          strokeDasharray={i === 2 ? "2 4" : "0"}
        />
      ))}

      {/* Connector lines */}
      {frameworks.map((f, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        const on = hovered === f.key;
        return (
          <g key={f.key}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={on ? f.color : tone}
              strokeWidth={on ? 1.8 : 0.8}
              strokeOpacity={on ? 0.9 : 0.25}
              style={{ transition: "all 0.3s" }}
            />
            {/* Particles flowing outward */}
            {[0, 1].map((p) => (
              <motion.circle
                key={p}
                r={on ? 3 : 2}
                fill={on ? f.color : tone}
                initial={{ cx, cy, opacity: 0 }}
                animate={{
                  cx: [cx, x],
                  cy: [cy, y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: on ? 1.2 : 2.4,
                  delay: p * (on ? 0.4 : 0.9) + (i * 0.1),
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </g>
        );
      })}

      {/* Framework nodes */}
      {frameworks.map((f, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        const on = hovered === f.key;
        return (
          <g key={f.key} style={{ transition: "all 0.3s" }}>
            <motion.circle
              cx={x}
              cy={y}
              r={on ? 24 : 20}
              fill="white"
              stroke={f.color}
              strokeWidth={on ? 2 : 1.2}
              style={{
                filter: on
                  ? `drop-shadow(0 0 12px ${f.color})`
                  : "drop-shadow(0 2px 6px rgba(0,0,0,0.1))",
                transition: "all 0.3s",
              }}
            />
            <text
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={f.color}
            >
              {f.label.length > 6 ? f.label.slice(0, 5) : f.label}
            </text>
          </g>
        );
      })}

      {/* Central core */}
      <circle cx={cx} cy={cy} r="55" fill="url(#ds-core)" />
      <motion.circle
        cx={cx}
        cy={cy}
        r="40"
        fill="white"
        stroke={tone}
        strokeWidth="1.5"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={tone}>
        AUDITED
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.55)">
        DATA SPINE
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="6.5" fill="rgba(0,0,0,0.4)">
        Single source of truth
      </text>
    </svg>
  );
}
