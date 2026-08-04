import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSFORMATION_STAGES } from "@/lib/strategy-data";

export function TransformationTimeline({ tone = "#84994f" }: { tone?: string }) {
  const [open, setOpen] = useState<string | null>(TRANSFORMATION_STAGES[3].key);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Transformation timeline
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
          From today <em className="text-gradient-brand">to net zero</em>.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every stage is a decision point — expand to see the milestones, KPIs,
          governance, dependencies and investment that make it real.
        </p>
      </div>

      <ol className="relative">
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
        {TRANSFORMATION_STAGES.map((s, i) => {
          const isOpen = open === s.key;
          const isRight = i % 2 === 1;
          return (
            <li key={s.key} className="relative pl-16 pb-6 md:pl-0 md:pb-8">
              <button
                onClick={() => setOpen(isOpen ? null : s.key)}
                className={`md:grid md:grid-cols-2 md:gap-10 md:${isRight ? "text-left" : "text-right"} w-full text-left`}
              >
                {/* dot */}
                <span className="absolute left-4 top-2 md:left-1/2 md:-translate-x-1/2">
                  <motion.span
                    animate={{
                      boxShadow: isOpen
                        ? `0 0 0 6px color-mix(in oklab, ${tone} 20%, transparent), 0 0 20px ${tone}`
                        : `0 0 0 0 transparent`,
                    }}
                    className="block h-4 w-4 rounded-full ring-4 ring-background"
                    style={{ background: tone }}
                  />
                </span>

                <div className={`${isRight ? "md:col-start-2" : "md:col-start-1"} md:pr-0`}>
                  <div className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground ${isRight ? "md:ml-0" : "md:ml-auto"}`}>
                    {s.horizon}
                  </div>
                  <div className="mt-2 text-display text-2xl">{s.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">KPI · {s.kpi}</div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`overflow-hidden md:grid md:grid-cols-2 md:gap-10 ${isRight ? "" : ""}`}
                  >
                    <div className={`${isRight ? "md:col-start-2" : "md:col-start-1"} mt-3`}>
                      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                          Milestones
                        </div>
                        <ul className="mb-4 space-y-1.5 text-sm">
                          {s.milestones.map((m) => (
                            <li key={m} className="flex items-start gap-2">
                              <span className="mt-2 h-1 w-1 rounded-full" style={{ background: tone }} />
                              {m}
                            </li>
                          ))}
                        </ul>
                        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                          <div><span className="text-muted-foreground">Investment</span> <span className="font-mono">{s.investment}</span></div>
                          <div><span className="text-muted-foreground">Business impact</span> {s.impact}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
