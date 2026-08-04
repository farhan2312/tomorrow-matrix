import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTerra } from "../site/TerraHealth";

const challenges = [
  { t: "Climate Risk", d: "Physical & transition risk exposure across operations and supply." },
  { t: "Carbon", d: "Scope 1–3 measurement, targets aligned to science and investor demand." },
  { t: "Investor Pressure", d: "Rising expectations from lenders, insurers, and shareholders." },
  { t: "CSRD & Regulation", d: "Complex, moving disclosure regimes across jurisdictions." },
  { t: "Supply Chains", d: "Traceability, human rights, and Scope 3 accounting depth." },
  { t: "Reporting", d: "Consolidated, assurable data across GRI, ISSB, TCFD, CDP." },
  { t: "Greenwashing", d: "Defensible claims that withstand regulator and NGO scrutiny." },
  { t: "Transformation", d: "Turning ambition into operating rhythm and measurable outcomes." },
];

export function Challenges() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { bump } = useTerra();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="approach" ref={ref} className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              01 — The friction
            </div>
            <h2 className="text-display text-[clamp(2.25rem,4.5vw,3.75rem)] text-foreground">
              What keeps sustainability leaders <em className="text-gradient-brand">awake</em>?
            </h2>
          </div>
          <p className="text-lg text-muted-foreground md:pl-8">
            Fragmented mandates. Data everywhere and nowhere. Regulators, investors, and
            stakeholders all asking harder questions in parallel. Hover any tension to see how we
            resolve it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {challenges.map((c, i) => (
            <motion.button
              type="button"
              key={c.t}
              onMouseEnter={() => {
                setOpen(i);
                bump(0.5);
              }}
              onFocus={() => setOpen(i)}
              onMouseLeave={() => setOpen((v) => (v === i ? null : v))}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              style={{
                animation: `drift ${9 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
              className="group relative overflow-hidden rounded-2xl glass p-5 text-left shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{i + 1}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ember)] opacity-70 group-hover:animate-pulse-soft" />
              </div>
              <div className="text-display text-2xl leading-tight text-foreground">{c.t}</div>
              <div
                className={`mt-3 overflow-hidden text-xs leading-relaxed text-muted-foreground transition-all duration-500 ${
                  open === i ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {c.d}
              </div>
              <div className="pointer-events-none absolute inset-x-4 bottom-2 h-px bg-gradient-to-r from-transparent via-[var(--leaf)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

const flow = ["Strategy", "Measure", "Report", "Verify", "Improve"];

export function Framework() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <section ref={ref} className="relative z-10 py-32">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          02 — Chaos becomes order
        </div>
        <h2 className="mx-auto max-w-3xl text-display text-[clamp(2.25rem,4.5vw,3.75rem)]">
          Every tension resolves into a{" "}
          <span className="text-gradient-brand italic">connected framework</span>.
        </h2>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:gap-0">
          {flow.map((step, i) => (
            <div key={step} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.18 }}
                className="group relative rounded-2xl border border-border bg-card px-5 py-6 shadow-soft transition-all hover:-translate-y-1 hover:border-[var(--leaf)] hover:shadow-lift"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Step 0{i + 1}
                </div>
                <div className="mt-1 text-display text-2xl">{step}</div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 100%, color-mix(in oklab, var(--leaf) 25%, transparent), transparent 70%)",
                    }}
                  />
                </div>
              </motion.div>
              {i < flow.length - 1 && (
                <motion.svg
                  initial={{ opacity: 0, width: 0 }}
                  animate={inView ? { opacity: 1, width: 56 } : {}}
                  transition={{ duration: 0.7, delay: 0.18 * i + 0.15 }}
                  viewBox="0 0 56 20"
                  className="h-5 max-md:hidden"
                >
                  <path
                    d="M2 10 L48 10"
                    stroke="url(#g)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    fill="none"
                  />
                  <path d="M46 5 L54 10 L46 15" stroke="var(--leaf)" strokeWidth="1.5" fill="none" />
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0" stopColor="var(--leaf)" stopOpacity="0.3" />
                      <stop offset="1" stopColor="var(--leaf)" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
