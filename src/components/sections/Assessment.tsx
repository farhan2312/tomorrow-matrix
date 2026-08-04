import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useTerra } from "../site/TerraHealth";

type Q = { q: string; options: { label: string; score: number }[] };

const questions: Q[] = [
  {
    q: "How is sustainability governed in your organization?",
    options: [
      { label: "Ad-hoc, no clear owner", score: 1 },
      { label: "Sustainability lead, limited authority", score: 2 },
      { label: "Cross-functional committee", score: 3 },
      { label: "Board-level oversight with KPIs", score: 4 },
    ],
  },
  {
    q: "How mature is your carbon footprint measurement?",
    options: [
      { label: "Not yet measured", score: 1 },
      { label: "Scope 1 & 2 estimated", score: 2 },
      { label: "Scope 1, 2 and partial Scope 3", score: 3 },
      { label: "Full inventory, third-party assured", score: 4 },
    ],
  },
  {
    q: "Which frameworks do you disclose against?",
    options: [
      { label: "None yet", score: 1 },
      { label: "One (e.g. GRI or CDP)", score: 2 },
      { label: "Two to three, partially aligned", score: 3 },
      { label: "Full alignment with ISSB / CSRD", score: 4 },
    ],
  },
  {
    q: "How defensible are your sustainability claims?",
    options: [
      { label: "Marketing-led", score: 1 },
      { label: "Reviewed internally", score: 2 },
      { label: "Third-party limited assurance", score: 3 },
      { label: "Reasonable assurance, board-signed", score: 4 },
    ],
  },
];

export function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { bump } = useTerra();
  const done = step >= questions.length;
  const score = answers.reduce((a, b) => a + b, 0);
  const max = questions.length * 4;
  const pct = Math.round((score / max) * 100);

  const level = useMemo(() => {
    if (pct < 40) return { name: "Emerging", tone: "You're at the start — clarity of ambition first." };
    if (pct < 70) return { name: "Developing", tone: "Foundations in place — time to structure and connect." };
    if (pct < 90) return { name: "Advanced", tone: "Strong practice — sharpen assurance and Scope 3." };
    return { name: "Leading", tone: "Investor-grade — differentiate through transparency." };
  }, [pct]);

  const pick = (score: number) => {
    setAnswers((a) => [...a, score]);
    setStep((s) => s + 1);
    bump(3);
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <section id="assessment" className="relative z-10 py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            09 — Readiness assessment
          </div>
          <h2 className="text-display text-[clamp(2.25rem,4.5vw,3.5rem)]">
            Two minutes. A picture of your{" "}
            <em className="italic text-gradient-brand">sustainability maturity</em>.
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-border bg-card p-8 shadow-lift md:p-12">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
              <motion.div
                animate={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--leaf)] to-[var(--ember)]"
              />
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {Math.min(step, questions.length)} / {questions.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Question 0{step + 1}
                </div>
                <h3 className="mt-2 text-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
                  {questions[step].q}
                </h3>
                <div className="mt-8 grid gap-3 md:grid-cols-2">
                  {questions[step].options.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => pick(o.score)}
                      className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--leaf)] hover:bg-card hover:shadow-soft"
                    >
                      <span className="text-sm font-medium">{o.label}</span>
                      <span className="text-[var(--leaf)] opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Result
                </div>
                <h3 className="mt-2 text-display text-[clamp(2rem,4vw,3rem)]">
                  You are <em className="text-gradient-brand italic">{level.name}</em>.
                </h3>
                <p className="mt-2 text-muted-foreground">{level.tone}</p>
                <div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr_1fr] md:items-center">
                  {/* Score dial */}
                  <div className="relative h-32 w-32">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--mist)" strokeWidth="6" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="url(#resg)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 276` }}
                        animate={{ strokeDasharray: `${(pct / 100) * 276} 276` }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="resg" x1="0" x2="1">
                          <stop offset="0" stopColor="var(--leaf)" />
                          <stop offset="1" stopColor="var(--ember)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-display text-3xl">
                      {pct}%
                    </div>
                  </div>

                  {/* Radar / spider chart */}
                  {(() => {
                    const dims = ["Governance", "Measurement", "Reporting", "Assurance"];
                    const cx = 100, cy = 100, R = 78;
                    const pts = answers.slice(0, 4).map((a, i) => {
                      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                      const r = ((a || 0) / 4) * R;
                      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
                    });
                    const poly = pts.map((p) => p.join(",")).join(" ");
                    return (
                      <div className="relative">
                        <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48">
                          <defs>
                            <radialGradient id="radarFill">
                              <stop offset="0%" stopColor="var(--leaf)" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="var(--ember)" stopOpacity="0.25" />
                            </radialGradient>
                          </defs>
                          {/* Rings */}
                          {[0.25, 0.5, 0.75, 1].map((s) => (
                            <polygon
                              key={s}
                              points={[0, 1, 2, 3]
                                .map((i) => {
                                  const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                                  return `${cx + Math.cos(angle) * R * s},${cy + Math.sin(angle) * R * s}`;
                                })
                                .join(" ")}
                              fill="none"
                              stroke="color-mix(in oklab, var(--forest) 15%, transparent)"
                              strokeWidth="0.6"
                            />
                          ))}
                          {/* Axes */}
                          {[0, 1, 2, 3].map((i) => {
                            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                            return (
                              <line
                                key={i}
                                x1={cx}
                                y1={cy}
                                x2={cx + Math.cos(angle) * R}
                                y2={cy + Math.sin(angle) * R}
                                stroke="color-mix(in oklab, var(--forest) 20%, transparent)"
                                strokeWidth="0.5"
                              />
                            );
                          })}
                          {/* Data shape */}
                          <motion.polygon
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                            points={poly}
                            fill="url(#radarFill)"
                            stroke="var(--forest)"
                            strokeWidth="1.2"
                          />
                          {pts.map(([x, y], i) => (
                            <motion.circle
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.9 + i * 0.1, type: "spring", stiffness: 200 }}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="var(--ember)"
                            />
                          ))}
                          {/* Labels */}
                          {dims.map((d, i) => {
                            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                            const lx = cx + Math.cos(angle) * (R + 14);
                            const ly = cy + Math.sin(angle) * (R + 14);
                            return (
                              <text
                                key={d}
                                x={lx}
                                y={ly}
                                fontSize="8"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="currentColor"
                                className="fill-foreground/70 font-mono"
                              >
                                {d.toUpperCase()}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}

                  {/* Priority roadmap */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Priority roadmap
                    </div>
                    {["Governance", "Measurement", "Reporting", "Assurance"]
                      .map((d, i) => ({ d, score: answers[i] || 0 }))
                      .sort((a, b) => a.score - b.score)
                      .map((row, k) => (
                        <motion.div
                          key={row.d}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + k * 0.12 }}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ember)]/20 font-mono text-[10px] text-[var(--clay)]">
                            {k + 1}
                          </span>
                          <div className="flex-1">
                            <div className="text-xs font-medium">{row.d}</div>
                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-mist">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${row.score * 25}%` }}
                                transition={{ delay: 0.8 + k * 0.12, duration: 0.7 }}
                                className="h-full rounded-full bg-gradient-to-r from-[var(--leaf)] to-[var(--ember)]"
                              />
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {row.score * 25}%
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#final"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
                  >
                    Book your sustainability consultation →
                  </a>
                  <a
                    href="#final"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-[var(--leaf)]"
                  >
                    Download PDF report
                  </a>
                  <button
                    onClick={reset}
                    className="rounded-full border border-border px-5 py-3 text-sm text-foreground/70 hover:border-foreground/40"
                  >
                    Retake assessment
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
