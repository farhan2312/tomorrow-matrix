import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { COURSES } from "@/components/site/CourseLibrary";

const HIGHLIGHT = [
  "esg-awareness",
  "carbon-fundamentals",
  "carbon-comprehensive",
  "iso-14064",
  "gri",
  "ifrs-s1-s2",
  "reporting-frameworks",
];

export function BuildInternalCapability({ tone = "#84994f" }: { tone?: string }) {
  const items = COURSES.filter((c) => HIGHLIGHT.includes(c.id));
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Sustainability Academy
          </div>
          <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
            Build internal capability <em className="text-gradient-brand">alongside your strategy</em>.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Consulting delivers the plan. Capability makes it stick. Pair every
            strategic workstream with an Academy program so your teams own the
            next annual cycle.
          </p>
        </div>
        <Link to="/services/$slug" params={{ slug: "training-capacity" }} className="rounded-full border border-border bg-card px-5 py-2.5 text-xs font-medium hover:border-[var(--leaf)]">
          Visit the Academy →
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="rounded-full px-2 py-0.5" style={{ background: `color-mix(in oklab, ${tone} 18%, white)`, color: "var(--ink)" }}>
                {c.level}
              </span>
              <span>· {c.duration}</span>
            </div>
            <div className="text-display text-xl leading-tight">{c.title}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Delivery: {c.delivery}</div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              <span className="uppercase tracking-widest">Outcomes</span>
              <ul className="mt-1 space-y-0.5 text-foreground/80">
                {c.outcomes.slice(0, 3).map((o) => <li key={o}>· {o}</li>)}
              </ul>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              <span className="uppercase tracking-widest">Certification</span>
              <div className="text-foreground/80">{c.certificate}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/services/$slug"
                params={{ slug: "training-capacity" }}
                className="rounded-full px-3 py-1.5 text-[11px] font-medium text-white"
                style={{ background: "var(--ink)" }}
              >
                View Curriculum
              </Link>
              <Link
                to="/book"
                search={{ service: "training-capacity" } as any}
                className="rounded-full border border-border px-3 py-1.5 text-[11px] hover:border-[var(--leaf)]"
              >
                Enroll a team
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
