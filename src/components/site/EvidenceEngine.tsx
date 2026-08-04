import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const SOURCES = [
  { id: "inv", label: "Carbon Inventory", angle: -110 },
  { id: "util", label: "Utility Bills", angle: -75 },
  { id: "erp", label: "ERP Data", angle: -40 },
  { id: "sup", label: "Supplier Records", angle: -5 },
  { id: "site", label: "Site Inspections", angle: 30 },
  { id: "int", label: "Interviews", angle: 65 },
  { id: "met", label: "Meter Readings", angle: 100 },
  { id: "pol", label: "Policies", angle: 135 },
] as const;

const CONTROLS = ["Completeness", "Accuracy", "Cut-off", "Existence", "Valuation"];

export function EvidenceEngine({ tone = "#84994f" }: { tone?: string }) {
  const [hover, setHover] = useState<string | null>(null);

  const W = 900;
  const H = 480;
  const cx = 300;
  const cy = H / 2;
  const r = 170;

  const opinionX = 720;
  const opinionY = H / 2;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 max-w-3xl">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          The signature
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)] leading-tight">
          Evidence → Testing → Review →{" "}
          <em className="text-gradient-brand">Assurance Opinion</em>.
        </h2>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Hover any evidence source to trace how raw data is collected, tested against controls,
          reviewed, and released as an independent assurance opinion.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-white/70 to-white/40 p-4 backdrop-blur-xl"
        style={{ boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--forest) 25%, transparent)" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <radialGradient id="ee-core">
              <stop offset="0%" stopColor={tone} stopOpacity="0.9" />
              <stop offset="60%" stopColor={tone} stopOpacity="0.25" />
              <stop offset="100%" stopColor={tone} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ee-line" x1="0" x2="1">
              <stop offset="0%" stopColor={tone} stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--leaf)" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* halo */}
          <circle cx={cx} cy={cy} r={110} fill="url(#ee-core)" opacity="0.6" />
          <motion.circle
            cx={cx}
            cy={cy}
            r={80}
            fill="none"
            stroke={tone}
            strokeWidth="1"
            strokeDasharray="4 5"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* central repository */}
          <g>
            <circle cx={cx} cy={cy} r={54} fill="white" stroke={tone} strokeWidth="1.5" />
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1.5"
              fill="var(--foreground)"
              opacity="0.55"
            >
              VERIFIED
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              fontSize="12"
              fontFamily="ui-serif, Georgia, serif"
              fontStyle="italic"
              fill="var(--foreground)"
            >
              Evidence Repository
            </text>
            <text
              x={cx}
              y={cy + 24}
              textAnchor="middle"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1"
              fill={tone}
            >
              {hover ? "TRACING" : "IDLE"}
            </text>
          </g>

          {/* Sources */}
          {SOURCES.map((s) => {
            const rad = (s.angle * Math.PI) / 180;
            const sx = cx + Math.cos(rad) * r;
            const sy = cy + Math.sin(rad) * r;
            const active = hover === s.id;
            const anyHover = hover !== null;
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover((h) => (h === s.id ? null : h))}
                style={{ cursor: "pointer" }}
              >
                {/* connector to core */}
                <line
                  x1={sx}
                  y1={sy}
                  x2={cx}
                  y2={cy}
                  stroke={active ? tone : "var(--mist)"}
                  strokeWidth={active ? 1.4 : 0.7}
                  opacity={anyHover && !active ? 0.15 : 0.6}
                />
                {active && (
                  <motion.circle
                    r="3"
                    fill={tone}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <animateMotion
                      dur="1.4s"
                      repeatCount="indefinite"
                      path={`M ${sx} ${sy} L ${cx} ${cy}`}
                    />
                  </motion.circle>
                )}
                <rect
                  x={sx - 58}
                  y={sy - 12}
                  width="116"
                  height="24"
                  rx="12"
                  fill={active ? "white" : "white"}
                  stroke={active ? tone : "var(--mist)"}
                  strokeWidth={active ? 1.2 : 0.8}
                  opacity={anyHover && !active ? 0.4 : 1}
                />
                <text
                  x={sx}
                  y={sy + 3.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fill="var(--foreground)"
                  opacity={anyHover && !active ? 0.5 : 0.85}
                >
                  {s.label}
                </text>
              </g>
            );
          })}

          {/* pipeline from core → opinion */}
          <line
            x1={cx + 54}
            y1={cy}
            x2={opinionX - 80}
            y2={opinionY}
            stroke="url(#ee-line)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          {hover && (
            <motion.circle r="4" fill={tone}>
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={`M ${cx + 54} ${cy} L ${opinionX - 80} ${opinionY}`}
              />
            </motion.circle>
          )}

          {/* Controls stack along pipeline */}
          {CONTROLS.map((c, i) => {
            const px = cx + 100 + i * 55;
            const py = cy - 60;
            return (
              <g key={c}>
                <line x1={px} y1={cy} x2={px} y2={py + 18} stroke="var(--mist)" strokeWidth="0.6" />
                <rect
                  x={px - 26}
                  y={py}
                  width="52"
                  height="18"
                  rx="9"
                  fill="white"
                  stroke={hover ? tone : "var(--mist)"}
                  strokeWidth="0.8"
                />
                <text
                  x={px}
                  y={py + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="0.5"
                  fill="var(--foreground)"
                  opacity="0.75"
                >
                  {c}
                </text>
                {hover && (
                  <motion.circle
                    cx={px}
                    cy={py + 9}
                    r={hover ? 12 : 0}
                    fill="none"
                    stroke={tone}
                    strokeWidth="0.6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                  />
                )}
              </g>
            );
          })}

          {/* Assurance Opinion card */}
          <g>
            <rect
              x={opinionX - 80}
              y={opinionY - 70}
              width="160"
              height="140"
              rx="14"
              fill="white"
              stroke={tone}
              strokeWidth="1.2"
            />
            <text
              x={opinionX}
              y={opinionY - 46}
              textAnchor="middle"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1.5"
              fill={tone}
            >
              INDEPENDENT
            </text>
            <text
              x={opinionX}
              y={opinionY - 30}
              textAnchor="middle"
              fontSize="14"
              fontFamily="ui-serif, Georgia, serif"
              fontStyle="italic"
              fill="var(--foreground)"
            >
              Assurance Opinion
            </text>
            <line
              x1={opinionX - 60}
              y1={opinionY - 18}
              x2={opinionX + 60}
              y2={opinionY - 18}
              stroke="var(--mist)"
            />
            {[
              "Scope · GHG assertion",
              "Standard · ISAE 3410",
              "Level · Reasonable",
              "Result · Unqualified",
            ].map((line, i) => (
              <text
                key={line}
                x={opinionX - 60}
                y={opinionY - 4 + i * 12}
                fontSize="8.5"
                fontFamily="ui-monospace, monospace"
                fill="var(--foreground)"
                opacity="0.75"
              >
                {line}
              </text>
            ))}
            {/* seal */}
            <g transform={`translate(${opinionX + 42}, ${opinionY + 46})`}>
              <motion.circle
                r="14"
                fill="none"
                stroke={tone}
                strokeWidth="1"
                strokeDasharray="3 3"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <circle r="8" fill={`color-mix(in oklab, ${tone} 15%, white)`} stroke={tone} strokeWidth="0.8" />
              <path
                d="M -4 0 L -1 3 L 5 -4"
                stroke={tone}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            {/* signature */}
            <motion.path
              d={`M ${opinionX - 60} ${opinionY + 54} C ${opinionX - 40} ${opinionY + 40}, ${opinionX - 20} ${opinionY + 62}, ${opinionX} ${opinionY + 50} S ${opinionX + 28} ${opinionY + 58}, ${opinionX + 20} ${opinionY + 54}`}
              fill="none"
              stroke={tone}
              strokeWidth="1.1"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: hover ? 1 : 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </g>
        </svg>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-4 left-6 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
            Evidence
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--forest)]" />
            Controls
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--leaf)]" />
            Opinion
          </span>
        </div>

        <AnimatePresence>
          {hover && (
            <motion.div
              key={hover}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute right-6 top-4 rounded-full border border-border bg-card/80 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/70 backdrop-blur"
            >
              Tracing: {SOURCES.find((s) => s.id === hover)?.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
