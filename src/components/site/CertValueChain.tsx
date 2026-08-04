import { motion } from "framer-motion";

const STEPS = [
  { label: "Organization",        note: "Purpose, teams, scope" },
  { label: "Controls",            note: "Policies, workflows" },
  { label: "Evidence",            note: "Records, KPIs, audits" },
  { label: "Assessment",          note: "Third-party review" },
  { label: "Certification",       note: "Badge awarded" },
  { label: "Customer Approval",   note: "Supplier tier unlock" },
  { label: "Investor Confidence", note: "Capital access" },
  { label: "Revenue Opportunity", note: "New markets, deals" },
];

export function CertValueChain({ tone = "#d06224" }: { tone?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Business value chain
        </div>
        <h3 className="text-display text-2xl">
          Certifications are <em className="text-gradient-brand">business enablers</em> — not paperwork.
        </h3>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="relative flex min-w-[880px] items-stretch gap-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.07 }}
              className="group relative flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div
                className="mb-2 grid h-7 w-7 place-items-center rounded-full text-[10px] font-mono text-white"
                style={{ background: tone, boxShadow: `0 6px 14px -6px ${tone}` }}
              >
                {i + 1}
              </div>
              <div className="text-sm font-medium leading-tight">{s.label}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.note}</div>
              {i < STEPS.length - 1 && (
                <div className="pointer-events-none absolute right-[-14px] top-1/2 z-10 -translate-y-1/2">
                  <motion.svg width="26" height="10" viewBox="0 0 26 10">
                    <motion.path
                      d="M0 5 H20 M16 1 L20 5 L16 9"
                      stroke={tone}
                      strokeWidth="1.2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.3 }}
                    />
                  </motion.svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
