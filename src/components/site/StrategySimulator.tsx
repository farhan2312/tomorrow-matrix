import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SIMULATOR_QUESTIONS } from "@/lib/strategy-data";
import { Link } from "@tanstack/react-router";

type Answers = Record<string, string>;

function generate(a: Answers) {
  const priority: string[] = [];
  const frameworks = new Set<string>(["GRI"]);
  const kpis = new Set<string>(["Scope 1+2 emissions", "Board-level ESG KPI"]);
  const services = new Set<string>();

  if (a.regulation === "CSRD" || a.region === "EU") {
    frameworks.add("CSRD / ESRS"); frameworks.add("ISSB");
    priority.push("Launch CSRD gap assessment and double materiality");
    services.add("reporting-compliance");
  }
  if (a.carbon === "None" || a.carbon === "Scope 1&2") {
    priority.push("Build a Scope 1–3 GHG inventory to GHG Protocol");
    services.add("climate-carbon"); frameworks.add("GHG Protocol");
  }
  if (a.carbon === "Full Scope 1–3" || a.carbon === "SBTi validated") {
    priority.push("Design a fundable transition plan and capex sequence");
    frameworks.add("SBTi"); kpis.add("SBTi-aligned near-term target");
  }
  if (a.investors === "Listed / activist" || a.investors === "Private / PE") {
    priority.push("Prepare investor-grade narrative + ratings uplift plan");
    services.add("certifications-ratings"); kpis.add("EcoVadis / CDP grade");
  }
  if (a.reporting === "None" || a.reporting === "Voluntary GRI") {
    priority.push("Stand up an audited data spine for multi-framework use");
    services.add("reporting-compliance");
  }
  if (a.reporting === "Multi-framework" || a.reporting === "Assured") {
    priority.push("Move to reasonable assurance on material metrics");
    services.add("verification-assurance");
  }
  if (a.supply === "Global" || a.supply === "Deep tier") {
    priority.push("Roll out supplier engagement + Scope 3 category deep-dives");
    kpis.add("Scope 3 primary data coverage");
  }
  if (["Manufacturing", "Energy", "Infrastructure"].includes(a.industry)) {
    frameworks.add("TNFD");
    priority.push("Add TNFD nature-risk assessment for physical exposure");
  }
  if (!priority.length) priority.push("Anchor the strategy in a 12-topic double materiality assessment");
  services.add("esg-strategy"); services.add("training-capacity");

  const yearOne = "Materiality → data spine → Scope 1–3 inventory";
  const yearTwo = "Targets → transition plan → first assured disclosure";
  const yearThree = "Ratings uplift, ambition refresh, board embedded";

  return {
    strategy: `A ${a.ambition ?? "2050"} net-zero pathway anchored in ${a.industry ?? "your industry"} materiality, sequenced for board approval and investor credibility.`,
    priorities: priority.slice(0, 5),
    frameworks: Array.from(frameworks),
    kpis: Array.from(kpis),
    roadmap: [yearOne, yearTwo, yearThree],
    boardPriorities: [
      "Executive-owned ESG KPI in compensation",
      "Quarterly board ESG dashboard",
      "Assurance-ready working papers",
    ],
    services: Array.from(services).filter((s) => s !== "esg-strategy"),
  };
}

export function StrategySimulator({ tone = "#84994f" }: { tone?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const total = SIMULATOR_QUESTIONS.length;
  const q = SIMULATOR_QUESTIONS[step];
  const result = done ? generate(answers) : null;

  const set = (v: string) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    if (step === total - 1) setDone(true);
    else setStep(step + 1);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Interactive planning tool
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
          Build your <em className="text-gradient-brand">sustainability strategy</em>.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Nine choices. A tailored strategic outline in seconds — the first draft
          of the conversation we'd have in the boardroom.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-lift backdrop-blur md:p-10">
        {!done ? (
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Step {step + 1} of {total}
              </div>
              <div className="mt-2 text-display text-3xl">{q.label}</div>
              <div className="mt-6 h-1.5 w-full rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: tone }}
                  animate={{ width: `${((step + 1) / total) * 100}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {SIMULATOR_QUESTIONS.map((sq, i) => (
                  <button
                    key={sq.id}
                    onClick={() => setStep(i)}
                    className={`h-1.5 w-8 rounded-full transition ${i <= step ? "" : "bg-border"}`}
                    style={i <= step ? { background: tone } : undefined}
                    aria-label={sq.label}
                  />
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-2 sm:grid-cols-2"
              >
                {q.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => set(o)}
                    className="group rounded-xl border border-border bg-background/60 p-4 text-left text-sm transition hover:-translate-y-0.5 hover:border-[var(--leaf)] hover:shadow-soft"
                  >
                    <div className="font-medium">{o}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground/70">
                      Select →
                    </div>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Your strategic outline</div>
              <div className="mt-2 text-display text-2xl">{result!.strategy}</div>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Priority projects</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {result!.priorities.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 rounded-full" style={{ background: tone }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/60 p-5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Frameworks</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result!.frameworks.map((f) => (
                      <span key={f} className="rounded-full border border-border px-2.5 py-1 text-[11px]">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">KPIs</div>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                    {result!.kpis.map((k) => <li key={k}>· {k}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">3-year roadmap</div>
                <ol className="mt-2 space-y-2 text-sm">
                  {result!.roadmap.map((r, i) => (
                    <li key={r} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono text-white" style={{ background: tone }}>
                        Y{i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Board priorities</div>
                <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                  {result!.boardPriorities.map((b) => <li key={b}>· {b}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommended next services</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result!.services.map((s) => (
                    <Link key={s} to="/services/$slug" params={{ slug: s }} className="rounded-full border border-border px-3 py-1 text-[11px] hover:border-[var(--leaf)]">
                      {s.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setStep(0); setAnswers({}); setDone(false); }}
                  className="rounded-full border border-border px-4 py-2 text-xs hover:border-[var(--leaf)]"
                >
                  ← Start over
                </button>
                <Link
                  to="/book"
                  search={{ service: "esg-strategy" } as any}
                  className="rounded-full px-4 py-2 text-xs font-medium text-white"
                  style={{ background: "var(--ink)" }}
                >
                  Book strategy session →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
