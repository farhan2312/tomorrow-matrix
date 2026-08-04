import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SOCIAL, externalLink } from "@/lib/site-links";

const items = [
  { cat: "Whitepaper", t: "Building an audit-ready CSRD data spine", read: "18 min" },
  { cat: "Case Study", t: "Cement producer: Scope 3 disclosure to SBTi target", read: "12 min" },
  { cat: "Blog", t: "Assurance without theater: what regulators actually check", read: "6 min" },
  { cat: "Toolkit", t: "Double materiality workshop pack", read: "Download" },
  { cat: "Video", t: "The Tomorrow Matrix explained in 90 seconds", read: "1:30" },
  { cat: "Template", t: "Board-ready sustainability KPI dashboard", read: "Download" },
  { cat: "Article", t: "Why greenwashing is a supply-chain problem", read: "9 min" },
  { cat: "Case Study", t: "Bank ISSB rollout across three jurisdictions", read: "14 min" },
];

const cats = ["All", "Whitepaper", "Case Study", "Blog", "Toolkit", "Video", "Template", "Article"];

export function Knowledge() {
  const [f, setF] = useState("All");
  const shown = useMemo(() => (f === "All" ? items : items.filter((i) => i.cat === f)), [f]);
  return (
    <section id="knowledge" className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              08 — Knowledge hub
            </div>
            <h2 className="text-display text-[clamp(2.25rem,4.5vw,3.5rem)]">
              A living library of{" "}
              <em className="italic text-gradient-brand">what we've learned</em>.
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setF(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                  f === c
                    ? "border-[var(--ink)] bg-[var(--ink)] text-primary-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-foreground/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((it, i) => (
              <motion.a
                key={it.t}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                href={it.cat === "Video" ? SOCIAL.youtube : SOCIAL.linkedin}
                {...externalLink}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--leaf)_15%,white)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--forest)]">
                    {it.cat}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{it.read}</span>
                </div>
                <div className="text-display text-xl leading-tight">{it.t}</div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-foreground/70 transition-colors group-hover:text-[var(--clay)]">
                    {it.cat === "Video" ? "Watch on YouTube" : "Read"}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SOCIAL.linkedin)}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard
                        ?.writeText(typeof window !== "undefined" ? window.location.href : "")
                        .then(() => toast.success("Link copied"))
                        .catch(() => toast.error("Could not copy link"));
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Copy link
                  </button>
                </div>
                <div
                  className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  style={{ background: "color-mix(in oklab, var(--ember) 40%, transparent)" }}
                />
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
