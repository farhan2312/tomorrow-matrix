import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { services } from "@/lib/services-data";
import { ServiceVisual } from "@/components/site/ServiceVisual";

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <section id="services" ref={ref} className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              04 — Services
            </div>
            <h2 className="max-w-2xl text-display text-[clamp(2.25rem,4.5vw,3.75rem)]">
              End-to-end sustainability, from{" "}
              <em className="text-gradient-brand">ambition to assurance</em>.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Six connected practices. One integrated engagement model. Each card is its own
            product — hover to see it in motion, click to explore.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              style={{ transformStyle: "preserve-3d" }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
            >
              <ServiceVisual kind={s.visual} />
              <div className="mt-5 flex items-center justify-between">
                <div className="text-display text-2xl">{s.title}</div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.tagline}</p>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 transition-colors group-hover:text-[var(--clay)]"
              >
                Explore Service
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, transparent, color-mix(in oklab, var(--leaf) 30%, transparent), transparent)",
                  padding: "1px",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
