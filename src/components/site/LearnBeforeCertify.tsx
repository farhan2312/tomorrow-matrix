import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { COURSES } from "@/components/site/CourseLibrary";

const HIGHLIGHT_IDS = [
  "esg-awareness",
  "carbon-fundamentals",
  "carbon-comprehensive",
  "iso-14064",
  "gri",
  "ifrs-s1-s2",
  "reporting-frameworks",
];

export function LearnBeforeCertify({ tone = "#d06224" }: { tone?: string }) {
  const items = COURSES.filter((c) => HIGHLIGHT_IDS.includes(c.id));
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Learn before you certify
          </div>
          <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
            Pair every certification with <em className="text-gradient-brand">capability</em>.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            The best certification programs combine external audit with internal upskilling.
            Our Sustainability Academy prepares your teams so the certification sticks — and the
            next annual cycle is easier than the last.
          </p>
        </div>
        <Link
          to="/services/$slug"
          params={{ slug: "training-capacity" }}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-xs font-medium hover:border-[var(--leaf)]"
        >
          Visit the Academy →
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              layout
              className={`overflow-hidden rounded-2xl border bg-card shadow-soft transition-all ${
                isOpen ? "shadow-lift" : "hover:shadow-lift"
              }`}
              style={{ borderColor: isOpen ? `color-mix(in oklab, ${tone} 40%, var(--border))` : "var(--border)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
              >
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{ background: `color-mix(in oklab, ${tone} 18%, white)`, color: "var(--ink)" }}
                    >
                      {c.level}
                    </span>
                    <span>· {c.duration}</span>
                  </div>
                  <div className="text-display text-xl leading-tight">{c.title}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Pathway: {c.certificate}
                  </div>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  className="mt-1 text-xl leading-none"
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
                      <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Learning objectives
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
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to="/services/$slug"
                          params={{ slug: "training-capacity" }}
                          className="rounded-full px-4 py-2 text-xs font-medium text-white"
                          style={{ background: "var(--ink)" }}
                        >
                          View Curriculum
                        </Link>
                        <span className="rounded-full border border-border px-3 py-2 text-[11px] text-muted-foreground">
                          Delivery: {c.delivery}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
