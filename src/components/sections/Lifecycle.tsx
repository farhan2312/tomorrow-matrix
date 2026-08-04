import { motion } from "framer-motion";
import { useState } from "react";
import { useTerra } from "../site/TerraHealth";

type Stage = {
  key: string;
  title: string;
  body: string;
  tone: string;
};

const stages: Stage[] = [
  {
    key: "strategy",
    title: "Strategy",
    body: "Define what matters. Materiality, targets, and an integrated roadmap grounded in your business model.",
    tone: "#84994f",
  },
  {
    key: "measure",
    title: "Measure",
    body: "Scope 1–3 inventories, water, waste, biodiversity, and social baselines with defensible methodology.",
    tone: "#fcb53b",
  },
  {
    key: "report",
    title: "Report",
    body: "GRI, ISSB, TCFD, CSRD, CDP — investor-grade disclosures generated from a single audited source of truth.",
    tone: "#d06224",
  },
  {
    key: "verify",
    title: "Verify",
    body: "Independent limited or reasonable assurance so every claim withstands regulator and stakeholder scrutiny.",
    tone: "#a64b2a",
  },
  {
    key: "improve",
    title: "Improve",
    body: "Operating rhythm: reduction pathways, capital allocation, and continuous performance tracking.",
    tone: "#b5c99a",
  },
];

const N = stages.length;
const CX = 250;
const CY = 250;
const R = 180;

function nodePos(i: number) {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R, a };
}

// Curve between two node positions bending toward center
function arcPath(i: number, j: number, bend = 0.35) {
  const p1 = nodePos(i);
  const p2 = nodePos(j);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  // control point pulled toward center
  const cx = mx + (CX - mx) * bend;
  const cy = my + (CY - my) * bend;
  return `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`;
}

function spokePath(i: number) {
  const p = nodePos(i);
  return `M ${CX},${CY} L ${p.x},${p.y}`;
}

export function Lifecycle() {
  const [active, setActive] = useState(0);
  const { bump } = useTerra();

  // All unordered pairs of nodes → complete graph of connections
  const pairs: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) pairs.push([i, j]);
  }

  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            03 — The Sustainability Operating System
          </div>
          <h2 className="mx-auto max-w-3xl text-display text-[clamp(2.25rem,4.5vw,3.75rem)]">
            One <em className="text-gradient-brand">living</em> system. Five intelligent stages.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground">
            Data flows continuously between every stage — never linear, always adapting.
            Hover any node to see how energy re-routes through the system.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full">
              <defs>
                <radialGradient id="core">
                  <stop offset="0%" stopColor="#ffe797" />
                  <stop offset="45%" stopColor="#fcb53b" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#d06224" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="coreHalo">
                  <stop offset="0%" stopColor="#fcb53b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fcb53b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="edgeGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#84994f" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#fcb53b" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#a64b2a" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="edgeGradHot" x1="0" x2="1">
                  <stop offset="0%" stopColor="#fcb53b" />
                  <stop offset="100%" stopColor="#d06224" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.4" />
                </filter>
                {stages.map((s, i) => (
                  <radialGradient key={s.key} id={`node-${i}`}>
                    <stop offset="0%" stopColor={s.tone} />
                    <stop offset="80%" stopColor={s.tone} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={s.tone} stopOpacity="0.2" />
                  </radialGradient>
                ))}
              </defs>

              {/* Faint orbital rings */}
              {[R - 14, R, R + 12].map((r, k) => (
                <circle
                  key={r}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="color-mix(in oklab, var(--forest) 22%, transparent)"
                  strokeDasharray={k === 1 ? "4 8" : "1 10"}
                  strokeWidth={k === 1 ? 1 : 0.6}
                  opacity={k === 1 ? 0.7 : 0.4}
                >
                  {k === 1 && (
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from={`0 ${CX} ${CY}`}
                      to={`360 ${CX} ${CY}`}
                      dur="90s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              ))}

              {/* Neural edges — every pair, dim by default, hot on active */}
              {pairs.map(([i, j], k) => {
                const hot = active === i || active === j;
                const d = arcPath(i, j, 0.32);
                return (
                  <g key={k}>
                    <path
                      d={d}
                      fill="none"
                      stroke={hot ? "url(#edgeGradHot)" : "url(#edgeGrad)"}
                      strokeWidth={hot ? 1.4 : 0.55}
                      opacity={hot ? 0.9 : 0.28}
                      style={{ transition: "all 500ms ease" }}
                    />
                    {/* one particle per edge; more on hot */}
                    <circle
                      r={hot ? 2.4 : 1.6}
                      fill={hot ? "#fcb53b" : stages[i].tone}
                      opacity={hot ? 1 : 0.55}
                      filter="url(#softGlow)"
                    >
                      <animateMotion
                        dur={hot ? "3.5s" : `${6 + (k % 5)}s`}
                        repeatCount="indefinite"
                        path={d}
                        begin={`${(k * 0.4) % 4}s`}
                      />
                    </circle>
                    {hot && (
                      <circle r={2} fill="#ffe797" filter="url(#softGlow)">
                        <animateMotion dur="2.2s" repeatCount="indefinite" path={d} begin="0.8s" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Spokes to central core — always flowing inward */}
              {stages.map((s, i) => {
                const on = active === i;
                const d = spokePath(i);
                const p = nodePos(i);
                return (
                  <g key={s.key}>
                    <path
                      d={d}
                      stroke={on ? s.tone : "color-mix(in oklab, var(--forest) 30%, transparent)"}
                      strokeWidth={on ? 1.6 : 0.5}
                      opacity={on ? 0.9 : 0.35}
                      strokeDasharray={on ? "0" : "3 6"}
                      style={{ transition: "all 500ms ease" }}
                    >
                      {!on && (
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0"
                          to="-18"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      )}
                    </path>
                    {/* particles flowing toward center */}
                    {[0, 0.5].map((off) => (
                      <circle
                        key={off}
                        r={on ? 3 : 1.8}
                        fill={s.tone}
                        opacity={on ? 1 : 0.7}
                        filter="url(#softGlow)"
                      >
                        <animateMotion
                          dur={on ? "1.6s" : "3s"}
                          repeatCount="indefinite"
                          begin={`${off * (on ? 1.6 : 3)}s`}
                          path={`M ${p.x},${p.y} L ${CX},${CY}`}
                        />
                      </circle>
                    ))}
                    {/* absorbed burst at core */}
                    {on && (
                      <circle cx={CX} cy={CY} r="8" fill={s.tone} opacity="0.45" filter="url(#glow)">
                        <animate attributeName="r" values="6;16;6" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Central sustainability core */}
              <g>
                <circle cx={CX} cy={CY} r="60" fill="url(#coreHalo)" filter="url(#glow)">
                  <animate attributeName="r" values="55;68;55" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx={CX} cy={CY} r="34" fill="url(#core)">
                  <animate attributeName="r" values="32;38;32" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={CX}
                  cy={CY}
                  r="42"
                  fill="none"
                  stroke="rgba(255,231,151,0.5)"
                  strokeWidth="0.6"
                  strokeDasharray="2 4"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${CX} ${CY}`}
                    to={`360 ${CX} ${CY}`}
                    dur="16s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={CX}
                  y={CY - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(30,20,10,0.7)"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="2"
                >
                  CORE
                </text>
                <text
                  x={CX}
                  y={CY + 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill="rgba(30,20,10,0.9)"
                  fontFamily="ui-serif, Georgia, serif"
                  fontStyle="italic"
                >
                  {stages[active].title}
                </text>
              </g>

              {/* Nodes — rendered last so they sit above edges */}
              {stages.map((s, i) => {
                const p = nodePos(i);
                const on = active === i;
                return (
                  <g
                    key={s.key}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => {
                      setActive(i);
                      bump(0.8);
                    }}
                    onFocus={() => setActive(i)}
                  >
                    {/* Glow halo */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={on ? 34 : 22}
                      fill={s.tone}
                      opacity={on ? 0.35 : 0.15}
                      filter="url(#glow)"
                      style={{ transition: "all 500ms ease" }}
                    >
                      {on && (
                        <animate
                          attributeName="r"
                          values="28;40;28"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    {/* Node body */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={on ? 22 : 16}
                      fill={`url(#node-${i})`}
                      stroke="white"
                      strokeWidth={on ? 2.2 : 1.4}
                      style={{ transition: "all 500ms ease" }}
                    />
                    {/* Inner ring */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={on ? 12 : 9}
                      fill="none"
                      stroke="rgba(255,255,255,0.75)"
                      strokeWidth="0.8"
                      strokeDasharray="1 3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${p.x} ${p.y}`}
                        to={`360 ${p.x} ${p.y}`}
                        dur={on ? "6s" : "20s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x={p.x}
                      y={p.y + 3}
                      textAnchor="middle"
                      fontSize={on ? "10" : "9"}
                      fill="white"
                      fontFamily="ui-sans-serif, system-ui"
                      fontWeight="600"
                      letterSpacing="0.5"
                    >
                      0{i + 1}
                    </text>
                    {/* Label outside */}
                    <text
                      x={p.x + Math.cos(p.a) * 36}
                      y={p.y + Math.sin(p.a) * 36 + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill={on ? "rgba(20,20,20,0.95)" : "rgba(20,20,20,0.6)"}
                      fontFamily="ui-sans-serif, system-ui"
                      fontWeight={on ? 600 : 500}
                      style={{ transition: "all 300ms ease" }}
                    >
                      {s.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating hover explanation */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full glass px-3 py-1.5 text-[11px] font-medium text-foreground/80 shadow-soft"
            >
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: stages[active].tone, boxShadow: `0 0 8px ${stages[active].tone}` }}
              />
              {stages[active].title} · data re-routing
            </motion.div>
          </div>

          <div className="space-y-3">
            {stages.map((s, i) => (
              <motion.button
                key={s.key}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                animate={{
                  backgroundColor:
                    active === i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                }}
                className={`block w-full overflow-hidden rounded-2xl border border-border p-5 text-left backdrop-blur transition-all ${
                  active === i ? "shadow-lift" : ""
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.tone, boxShadow: `0 0 10px ${s.tone}` }}
                    />
                    <div className="text-display text-2xl">{s.title}</div>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">STAGE 0{i + 1}</div>
                </div>
                <motion.div
                  animate={{ height: active === i ? "auto" : 0, opacity: active === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
