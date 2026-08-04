import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { COURSES, type Course } from "@/lib/courses-data";

export { COURSES };
export type { Course };

export function CourseLibrary({ tone = "#e9c891" }: { tone?: string }) {
  const [open, setOpen] = useState<string | null>(COURSES[2].id);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {COURSES.map((c, i) => {
        const isOpen = open === c.id;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.05 }}
            layout
            className={`group relative overflow-hidden rounded-2xl border bg-card shadow-soft transition-all ${
              c.flagship ? "border-[color-mix(in_oklab,var(--ember)_35%,var(--border))]" : "border-border"
            } ${isOpen ? "shadow-lift" : "hover:shadow-lift"} ${c.flagship ? "md:col-span-2" : ""}`}
          >
            {c.flagship && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }}
              />
            )}
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              className="flex w-full items-start justify-between gap-4 p-5 text-left"
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      background: c.flagship ? tone : `color-mix(in oklab, ${tone} 18%, white)`,
                      color: c.flagship ? "white" : "var(--ink)",
                    }}
                  >
                    {c.level}
                  </span>
                  <span>· {c.duration}</span>
                  <span>· {c.certificate}</span>
                  {c.flagship && <span className="text-[color-mix(in_oklab,var(--ember)_80%,black)]">★ Flagship</span>}
                </div>
                <div className="text-display text-2xl leading-tight">{c.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.delivery}</div>
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                className="mt-1 text-2xl leading-none"
                style={{ color: tone }}
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border p-5 pt-4">
                    <div className="mb-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Learning outcomes
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.outcomes.map((o) => (
                          <span
                            key={o}
                            className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>Curriculum · {c.modules.length} modules</span>
                        <span>Preview syllabus</span>
                      </div>
                      <div className={`grid gap-1.5 ${c.flagship ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                        {c.modules.map((m, mi) => (
                          <motion.div
                            key={m}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: mi * 0.03 }}
                            className="flex items-center gap-2 rounded-md border border-border/70 bg-background/50 px-2.5 py-1.5 text-[11px]"
                          >
                            <span
                              className="font-mono text-[9px] text-muted-foreground"
                              style={{ minWidth: 18 }}
                            >
                              {String(mi + 1).padStart(2, "0")}
                            </span>
                            <span className="text-foreground/85">{m}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/courses/$courseId"
                        params={{ courseId: c.id }}
                        className="rounded-full px-4 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: "var(--ink)" }}
                      >
                        Enrol now →
                      </Link>
                      <Link
                        to="/courses/$courseId"
                        params={{ courseId: c.id }}
                        hash="curriculum"
                        className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                      >
                        View curriculum
                      </Link>
                      <Link
                        to="/contact"
                        search={{ course: c.id }}
                        className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                      >
                        Register interest
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
