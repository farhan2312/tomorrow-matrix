import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const pillars = [
  { t: "Scientific Rigor", d: "Evidence-based methods aligned to ISO, GHG Protocol, and SBTi." },
  { t: "Investor-Grade Reporting", d: "Disclosures built for auditors, lenders, and rating agencies." },
  { t: "Independent Assurance", d: "Verification tracks separated from advisory to preserve credibility." },
  { t: "Practical Implementation", d: "Roadmaps designed for operating teams, not just boardrooms." },
  { t: "End-to-End Expertise", d: "Strategy through verification, held by one accountable partner." },
];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const val = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const rounded = useTransform(val, (v) => Math.round(v).toLocaleString() + suffix);
  useEffect(() => {
    if (inView) {
      const controls = animate(val, to, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, val]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function Viz({ i }: { i: number }) {
  if (i === 0)
    return (
      <svg viewBox="0 0 120 60" className="h-14 w-full">
        {[8, 20, 15, 28, 22, 34, 30, 42, 38].map((h, k) => (
          <motion.rect
            key={k}
            x={5 + k * 13}
            y={55 - h}
            width="8"
            height={h}
            rx="1.5"
            fill="var(--leaf)"
            opacity={0.5 + (k / 9) * 0.5}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.05, duration: 0.6 }}
            style={{ transformOrigin: `${5 + k * 13 + 4}px 55px` }}
          />
        ))}
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 120 60" className="h-14 w-full">
        <motion.path
          d="M5 45 L25 30 L45 40 L65 15 L85 25 L115 8"
          stroke="var(--clay)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
        />
        <motion.path
          d="M5 45 L25 30 L45 40 L65 15 L85 25 L115 8 L115 55 L5 55 Z"
          fill="url(#grad1)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
        <defs>
          <linearGradient id="grad1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--clay)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--clay)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  if (i === 2)
    return (
      <div className="flex h-14 items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--forest)] text-[var(--forest)]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    );
  if (i === 3)
    return (
      <svg viewBox="0 0 120 60" className="h-14 w-full">
        {[10, 30, 50, 70, 90, 110].map((x, k) => (
          <motion.circle
            key={k}
            cx={x}
            cy="30"
            r="4"
            fill="var(--ember)"
            initial={{ opacity: 0, cy: 60 }}
            whileInView={{ opacity: 1, cy: 30 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.1 }}
          />
        ))}
        <motion.line
          x1="10" y1="30" x2="110" y2="30"
          stroke="var(--ember)" strokeWidth="1" strokeDasharray="3 3"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
          viewport={{ once: true }} transition={{ duration: 1.2 }}
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 60" className="h-14 w-full">
      {Array.from({ length: 8 }).map((_, k) => {
        const a = (k / 8) * Math.PI * 2;
        const x = 60 + Math.cos(a) * 22;
        const y = 30 + Math.sin(a) * 22;
        return (
          <motion.circle
            key={k}
            cx={x}
            cy={y}
            r="3"
            fill="var(--leaf)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.08 }}
          />
        );
      })}
      <circle cx="60" cy="30" r="6" fill="var(--forest)" />
    </svg>
  );
}

export function WhyUs() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              05 — Why For Tomorrow
            </div>
            <h2 className="text-display text-[clamp(2.25rem,4.5vw,3.75rem)]">
              Proof, not <em className="italic text-gradient-brand">performance</em>.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 md:justify-self-end">
            <div>
              <div className="text-display text-4xl">
                <Counter to={12} />+
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Frameworks
              </div>
            </div>
            <div>
              <div className="text-display text-4xl">
                <Counter to={40} />+
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Verifications
              </div>
            </div>
            <div>
              <div className="text-display text-4xl">
                <Counter to={100} suffix="%" />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Assurable
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-[var(--leaf)] hover:shadow-lift"
            >
              <Viz i={i} />
              <div className="mt-4 text-display text-xl">{p.t}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
