import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useTerra } from "../site/TerraHealth";
import { SiteFooter } from "../site/SiteFooter";

export function Final() {
  const { health } = useTerra();
  const thriving = health > 92;
  const t = Math.min(1, Math.max(0, (health - 40) / 60));

  return (
    <section id="final" className="relative z-10 pb-24 pt-32">
      {/* Cinematic hope layer — reveals with health */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
        style={{ opacity: 0.3 + t * 0.6 }}
      >
        {/* Light rays */}
        <svg viewBox="0 0 1200 520" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff5c9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff5c9" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[240, 480, 720, 900, 1080].map((x, i) => (
            <motion.polygon
              key={x}
              points={`${x - 12},0 ${x + 12},0 ${x + 60},520 ${x - 60},520`}
              fill="url(#ray)"
              opacity={0.06 + t * 0.12}
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>

        {/* Birds fly across when nearing 100 */}
        {t > 0.6 &&
          [0, 1, 2, 3, 4].map((i) => (
            <motion.svg
              key={i}
              viewBox="0 0 20 8"
              className="absolute h-3 w-8"
              style={{ top: `${18 + i * 12}%` }}
              initial={{ x: "-10%" }}
              animate={{ x: "110vw", y: [0, -6, 0] }}
              transition={{
                x: { duration: 24 + i * 4, repeat: Infinity, ease: "linear", delay: i * 3 },
                y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <path
                d="M2 6 q 3 -4 6 0 q 3 -4 6 0"
                stroke="#3d2b1a"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
            </motion.svg>
          ))}

        {/* Wind turbines rotating at high health */}
        {t > 0.7 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-around">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <svg key={i} viewBox="0 0 40 80" className="h-16 w-8 opacity-40">
                <line x1="20" y1="40" x2="20" y2="80" stroke="#3d5540" strokeWidth="1.2" />
                <motion.g
                  style={{ transformOrigin: "20px 40px" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M20 40 L 22 12 L 18 12 Z" fill="#5a7a5a" />
                  <path d="M20 40 L 44 46 L 44 42 Z" fill="#5a7a5a" transform="rotate(120 20 40)" />
                  <path d="M20 40 L 44 46 L 44 42 Z" fill="#5a7a5a" transform="rotate(240 20 40)" />
                </motion.g>
                <circle cx="20" cy="40" r="1.5" fill="#3d5540" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative mx-auto mb-10 flex h-40 w-40 items-center justify-center"
        >
          <div
            className="absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000"
            style={{
              opacity: 0.4 + t * 0.6,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--leaf) 65%, transparent), transparent 65%)",
            }}
          />
          <div
            className="animate-breathe relative h-32 w-32 rounded-full shadow-lift transition-all duration-1000"
            style={{
              filter: `saturate(${0.5 + t * 0.8}) brightness(${0.8 + t * 0.3})`,
              background: `
                radial-gradient(circle at 30% 30%, color-mix(in oklab, white 40%, transparent), transparent 55%),
                conic-gradient(from 220deg, var(--forest), var(--leaf), #2b6ea3, var(--forest))
              `,
            }}
          />
          {/* Orbiting ring lights up at 100 */}
          {thriving && (
            <motion.div
              className="absolute inset-[-14px] rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "var(--leaf)",
                borderRightColor: "var(--ember)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {thriving && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--forest)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--leaf)] animate-pulse-soft" />
            Terra Health · 100% · Restored
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]"
        >
          Every meaningful decision
          <br />
          <em className="italic text-gradient-brand">shapes tomorrow.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
        >
          Imagine what your organization could achieve when sustainability becomes the operating
          system — not the appendix.
        </motion.p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/book"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-4 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
          >
            Book consultation
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#assessment"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-4 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-[var(--leaf)]"
          >
            Download ESG Readiness Guide
          </a>
        </div>
      </div>

      <div className="mt-24">
        <SiteFooter />
      </div>
    </section>
  );
}
