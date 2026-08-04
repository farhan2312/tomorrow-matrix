import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

type Choice = { id: string; label: string };
type Step = { key: string; question: string; choices: Choice[] };

const STEPS: Step[] = [
  { key: "industry", question: "Industry", choices: [
    { id: "mfg", label: "Manufacturing" },
    { id: "fin", label: "Financial Services" },
    { id: "tech", label: "Technology" },
    { id: "energy", label: "Energy" },
    { id: "retail", label: "Retail / Consumer" },
    { id: "health", label: "Healthcare" },
  ]},
  { key: "size", question: "Company size", choices: [
    { id: "sme", label: "< 500 employees" },
    { id: "mid", label: "500 – 5,000" },
    { id: "large", label: "5,000+" },
  ]},
  { key: "customer", question: "Customer requirements", choices: [
    { id: "b2b", label: "B2B / enterprise procurement" },
    { id: "b2c", label: "B2C / consumer brand" },
    { id: "gov", label: "Public sector tenders" },
  ]},
  { key: "region", question: "Primary region", choices: [
    { id: "eu", label: "EU" },
    { id: "us", label: "North America" },
    { id: "apac", label: "APAC" },
    { id: "global", label: "Global" },
  ]},
  { key: "maturity", question: "ESG maturity", choices: [
    { id: "start", label: "Starting" },
    { id: "prog", label: "Progressing" },
    { id: "mature", label: "Mature" },
  ]},
];

type Answers = Record<string, string>;

function recommend(a: Answers) {
  const required: string[] = [];
  const recommended: string[] = [];
  if (a.customer === "b2b" || a.customer === "gov") required.push("EcoVadis");
  if (a.industry === "mfg" || a.industry === "energy") { required.push("ISO 14001"); recommended.push("ISO 50001"); }
  if (a.industry === "tech" || a.industry === "fin") recommended.push("MSCI ESG", "Sustainalytics");
  if (a.region === "eu" || a.region === "global") required.push("CDP");
  if (a.size === "large" || a.customer === "b2b") required.push("ISO 14064");
  if (a.maturity !== "start") recommended.push("SBTi");
  const uniq = (xs: string[]) => Array.from(new Set(xs));
  return {
    required: uniq(required),
    recommended: uniq(recommended.filter((r) => !required.includes(r))),
    timeline: a.size === "large" ? "12–18 months" : a.size === "mid" ? "9–12 months" : "6–9 months",
    impact:
      a.customer === "b2b"
        ? "Unlock enterprise procurement + tier-1 supplier status"
        : a.customer === "gov"
          ? "Qualify for public tenders + regulated markets"
          : "Strengthen brand trust and investor positioning",
  };
}

export function CertificationNavigator({ tone = "#d06224" }: { tone?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= STEPS.length;
  const rec = useMemo(() => recommend(answers), [answers]);
  const s = STEPS[step];
  const progress = done ? 100 : Math.round((step / STEPS.length) * 100);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Certification Navigator
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
          Which certifications <em className="text-gradient-brand">unlock your next</em> deal?
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Answer a few questions. We map your priorities to the certifications and ratings that
          matter for your buyers, investors, and regulators.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Interview */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Step {Math.min(step + 1, STEPS.length)} / {STEPS.length}
            </div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-[var(--mist)]">
              <motion.div className="h-full" style={{ background: tone }} animate={{ width: `${progress}%` }} />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={s.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <div className="text-display text-2xl">{s.question}</div>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {s.choices.map((c) => {
                    const on = answers[s.key] === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setAnswers((a) => ({ ...a, [s.key]: c.id }));
                          setTimeout(() => setStep((x) => x + 1), 180);
                        }}
                        className="rounded-xl border px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: on ? tone : "var(--border)",
                          background: on ? `color-mix(in oklab, ${tone} 10%, white)` : "var(--card)",
                          boxShadow: on ? `0 0 0 3px color-mix(in oklab, ${tone} 20%, transparent)` : "none",
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <button
                    disabled={step === 0}
                    onClick={() => setStep((x) => Math.max(0, x - 1))}
                    className="text-muted-foreground disabled:opacity-40"
                  >
                    ← Back
                  </button>
                  <span className="text-muted-foreground">Answers stay private.</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Diagnosis complete</div>
                <div className="text-display text-2xl">Your certification roadmap</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on your responses, here's what to prioritize.
                </p>
                <button
                  onClick={() => { setStep(0); setAnswers({}); }}
                  className="mt-4 rounded-full border border-border px-4 py-2 text-xs hover:border-[var(--leaf)]"
                >
                  Restart
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live recommendation */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-white/90 to-[var(--cream)] p-6 shadow-lift">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live recommendation</div>
          <div className="mt-1 text-display text-2xl">Your priority stack</div>

          <div className="mt-5">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Required</div>
            <div className="flex flex-wrap gap-2">
              {rec.required.length === 0 && <span className="text-xs text-muted-foreground">— answer a few questions —</span>}
              <AnimatePresence>
                {rec.required.map((r) => (
                  <motion.span
                    key={r}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ background: tone, boxShadow: `0 4px 10px -4px ${tone}` }}
                  >
                    {r}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recommended</div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {rec.recommended.map((r) => (
                  <motion.span
                    key={r}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs"
                  >
                    {r}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-white/70 p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Timeline</div>
              <div className="mt-1 text-display text-xl" style={{ color: tone }}>{rec.timeline}</div>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Business impact</div>
              <div className="mt-1 text-xs leading-snug text-foreground/85">{rec.impact}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
