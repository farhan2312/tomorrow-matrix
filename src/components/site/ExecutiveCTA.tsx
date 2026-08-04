import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

export function ExecutiveCTA({ tone = "#84994f" }: { tone?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div
        className="relative overflow-hidden rounded-3xl p-10 md:p-16"
        style={{
          background: `linear-gradient(135deg, #0b1a12 0%, var(--ink) 60%, color-mix(in oklab, ${tone} 40%, #0b1a12) 100%)`,
        }}
      >
        {/* strategy map lines */}
        <svg viewBox="0 0 800 400" className="pointer-events-none absolute inset-0 h-full w-full opacity-40">
          {[80, 160, 240, 320].map((y) => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke={tone} strokeOpacity="0.08" />
          ))}
          {[100, 250, 400, 550, 700].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="400" stroke={tone} strokeOpacity="0.08" />
          ))}
          {[[100, 320, 250, 200], [250, 200, 400, 260], [400, 260, 550, 140], [550, 140, 700, 80]].map((p, i) => (
            <motion.line
              key={i}
              x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]}
              stroke={tone} strokeWidth="1.5"
              strokeDasharray="180"
              initial={{ strokeDashoffset: 180 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: i * 0.25 }}
            />
          ))}
          {[[100, 320], [250, 200], [400, 260], [550, 140], [700, 80]].map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} r="5" fill={tone}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </svg>

        {/* floating KPI chips */}
        {[
          { l: "Board Alignment", v: "100%", top: "18%", right: "8%" },
          { l: "Funding Readiness", v: "3×", top: "62%", right: "12%" },
          { l: "Net Zero", v: "2040", top: "38%", right: "35%" },
        ].map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="pointer-events-none absolute hidden rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-white backdrop-blur md:block"
            style={{ top: k.top, right: k.right }}
          >
            <div className="text-[9px] uppercase tracking-widest text-white/60">{k.l}</div>
            <div className="text-display text-xl">{k.v}</div>
          </motion.div>
        ))}

        <div className="relative z-10 max-w-2xl text-primary-foreground">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-primary-foreground/60">
            Boardroom session
          </div>
          <h2 className="text-display text-[clamp(2rem,4vw,3.25rem)]">
            The strategic partner your board has been waiting for.
          </h2>
          <p className="mt-4 max-w-lg text-sm text-primary-foreground/75">
            A 45-minute working session with Dr. Farida to pressure-test your
            ambition, define the transformation roadmap and align capital.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/book"
              search={{ service: "esg-strategy" } as any}
              className="group relative overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Book strategy session
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
            <Link to="/contact" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-primary-foreground hover:border-white">
              Talk to us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
