import { motion } from "framer-motion";

const TRACKS = [
  { name: "EcoVadis",  stages: ["Bronze", "Silver", "Gold", "Platinum"] },
  { name: "CDP",       stages: ["C", "B", "A-", "A"] },
  { name: "MSCI ESG",  stages: ["BB", "BBB", "A", "AA"] },
  { name: "ISO 14001", stages: ["Prep", "Impl.", "Audit", "Cert."] },
];

export function RatingsJourney({ tone = "#d06224" }: { tone?: string }) {
  const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Ratings Journey
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
          Continuous improvement, <em className="text-gradient-brand">year over year</em>.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every cycle compounds. Our clients typically climb two tiers per rating across three years
          — a trajectory that unlocks investors, buyers, and market access at each step.
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[720px] rounded-3xl border border-border bg-card p-6 shadow-soft">
          {/* Year header */}
          <div className="mb-4 grid" style={{ gridTemplateColumns: `160px repeat(${years.length}, 1fr)` }}>
            <div />
            {years.map((y) => (
              <div key={y} className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {y}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {TRACKS.map((t, ti) => (
              <div key={t.name} className="grid items-center" style={{ gridTemplateColumns: `160px repeat(${years.length}, 1fr)` }}>
                <div className="text-sm font-medium text-foreground/90">{t.name}</div>
                <div className="col-span-4 relative">
                  <div className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-border" />
                  <motion.div
                    className="absolute left-4 top-1/2 h-px -translate-y-1/2 origin-left"
                    style={{ right: 16, background: `linear-gradient(90deg, ${tone}, color-mix(in oklab, ${tone} 40%, var(--forest)))` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: ti * 0.15 }}
                  />
                  <div className="relative grid" style={{ gridTemplateColumns: `repeat(${t.stages.length}, 1fr)` }}>
                    {t.stages.map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-1.5">
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: ti * 0.15 + i * 0.2 + 0.3, type: "spring", stiffness: 260 }}
                          className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-mono uppercase tracking-widest text-white"
                          style={{
                            background: tone,
                            boxShadow: `0 6px 16px -6px ${tone}, 0 0 0 4px color-mix(in oklab, ${tone} 12%, transparent)`,
                            opacity: 0.6 + i * 0.13,
                          }}
                        >
                          {s.slice(0, 4)}
                        </motion.div>
                        <div className="text-[10px] text-muted-foreground">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
