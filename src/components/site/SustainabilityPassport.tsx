import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Badge = {
  id: string;
  name: string;
  status: "Achieved" | "In progress" | "Scheduled";
  score: string;
  readiness: number;
  expiry: string;
};

const BADGES: Badge[] = [
  { id: "iso14064", name: "ISO 14064",       status: "Achieved",    score: "Certified",   readiness: 100, expiry: "2027" },
  { id: "iso14001", name: "ISO 14001",       status: "In progress", score: "Stage 1",     readiness: 62,  expiry: "—" },
  { id: "iso50001", name: "ISO 50001",       status: "Scheduled",   score: "Baseline",    readiness: 28,  expiry: "—" },
  { id: "ecovadis", name: "EcoVadis",        status: "Achieved",    score: "Gold · 74",   readiness: 100, expiry: "Annual" },
  { id: "cdp",      name: "CDP",             status: "In progress", score: "B",           readiness: 78,  expiry: "Annual" },
  { id: "msci",     name: "MSCI ESG",        status: "Achieved",    score: "A",           readiness: 100, expiry: "Rolling" },
  { id: "susta",    name: "Sustainalytics",  status: "In progress", score: "Medium",      readiness: 55,  expiry: "Rolling" },
  { id: "sbti",     name: "SBTi",            status: "Achieved",    score: "Validated",   readiness: 100, expiry: "2030" },
];

export function SustainabilityPassport({ tone = "#d06224" }: { tone?: string }) {
  const [active, setActive] = useState<string>(BADGES[3].id);
  const achieved = BADGES.filter((b) => b.status === "Achieved").length;
  const total = BADGES.length;
  const pct = Math.round((achieved / total) * 100);
  const current = BADGES.find((b) => b.id === active)!;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Signature · Sustainability Passport
          </div>
          <h2 className="text-display text-[clamp(2rem,3.8vw,3.2rem)]">
            One passport. <em className="text-gradient-brand">Every credential.</em>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            A living digital record of your certifications, ratings, and readiness. Every badge
            earned opens new markets, new investors, and new customer contracts.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Passport filled</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-display text-3xl" style={{ color: tone }}>{pct}%</span>
            <span className="text-xs text-muted-foreground">· {achieved}/{total} credentials live</span>
          </div>
          <div className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-[var(--mist)]">
            <motion.div className="h-full" style={{ background: tone }} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Passport cover */}
        <div
          className="relative overflow-hidden rounded-3xl border p-6 shadow-lift"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a1a10 100%)",
            borderColor: `color-mix(in oklab, ${tone} 35%, transparent)`,
          }}
        >
          {/* gold ribbon */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
            style={{ background: tone }}
          />
          <div className="relative z-10 mb-6 flex items-center justify-between text-white">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60">
                For Tomorrow · Passport
              </div>
              <div className="mt-1 text-display text-2xl">Sustainability Credentials</div>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="grid h-14 w-14 place-items-center rounded-full border"
              style={{ borderColor: tone, background: `color-mix(in oklab, ${tone} 20%, transparent)` }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={tone} strokeWidth="1.6">
                <circle cx="12" cy="10" r="5" />
                <path d="M8 14 L6 22 L12 19 L18 22 L16 14" />
              </svg>
            </motion.div>
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-3">
            {BADGES.map((b, i) => {
              const on = b.id === active;
              const done = b.status === "Achieved";
              return (
                <motion.button
                  key={b.id}
                  onClick={() => setActive(b.id)}
                  onMouseEnter={() => setActive(b.id)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all"
                  style={{
                    background: done
                      ? `linear-gradient(135deg, color-mix(in oklab, ${tone} 22%, transparent), transparent)`
                      : "rgba(255,255,255,0.03)",
                    borderColor: on
                      ? tone
                      : done
                        ? `color-mix(in oklab, ${tone} 40%, transparent)`
                        : "rgba(255,255,255,0.1)",
                    boxShadow: on ? `0 0 24px ${tone}` : "none",
                  }}
                >
                  {done && (
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 rounded-2xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                      style={{ boxShadow: `inset 0 0 20px color-mix(in oklab, ${tone} 30%, transparent)` }}
                    />
                  )}
                  <div className="relative z-10 grid h-8 w-8 place-items-center rounded-full border" style={{ borderColor: done ? tone : "rgba(255,255,255,0.3)" }}>
                    {done ? (
                      <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10 l4 4 l8 -9" />
                      </svg>
                    ) : (
                      <span className="text-[9px] font-mono text-white/50">{Math.round(b.readiness)}%</span>
                    )}
                  </div>
                  <div className="relative z-10 mt-2 text-[10px] font-mono uppercase tracking-widest text-white/80">
                    {b.name}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
            <span>ID · FT-{new Date().getFullYear()}-084</span>
            <span>Verified by For Tomorrow</span>
          </div>
        </div>

        {/* Detail dashboard */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Credential</div>
                  <div className="text-display text-2xl">{current.name}</div>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest"
                  style={{
                    background: current.status === "Achieved" ? `color-mix(in oklab, ${tone} 18%, white)` : "var(--mist)",
                    color: current.status === "Achieved" ? tone : "var(--foreground)",
                  }}
                >
                  {current.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatCard label="Score / Level" value={current.score} tone={tone} />
                <StatCard label="Readiness" value={`${current.readiness}%`} tone={tone} />
                <StatCard label="Renewal" value={current.expiry} tone={tone} />
                <StatCard label="Business value" value={valueFor(current.id)} tone={tone} small />
              </div>
              <div className="mt-5">
                <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Progress</div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--mist)]">
                  <motion.div
                    className="h-full"
                    style={{ background: `linear-gradient(90deg, ${tone}, color-mix(in oklab, ${tone} 30%, var(--forest)))` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${current.readiness}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button className="rounded-full px-4 py-2 text-xs font-medium text-white" style={{ background: "var(--ink)" }}>
                  View evidence pack
                </button>
                <button className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]">
                  Download certificate
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function valueFor(id: string) {
  const m: Record<string, string> = {
    iso14064: "Verified inventory",
    iso14001: "EMS credibility",
    iso50001: "Energy 8–12% ↓",
    ecovadis: "Supplier tier up",
    cdp: "Investor short-lists",
    msci: "Index inclusion",
    susta: "Lower cost of capital",
    sbti: "1.5°C alignment",
  };
  return m[id] ?? "Market access";
}

function StatCard({ label, value, tone, small }: { label: string; value: string; tone: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 ${small ? "text-sm" : "text-lg"} text-display`} style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}
