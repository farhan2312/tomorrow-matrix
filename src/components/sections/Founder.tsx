import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Counter } from "../site/Counter";
import { SOCIAL, externalLink } from "@/lib/site-links";
import faridaImg from "@/assets/farida.jpg.asset.json";

const timeline = [
  { y: "2005", t: "Education", d: "Environmental science & policy foundations." },
  { y: "2008", t: "Research", d: "Climate resilience and industrial decarbonization." },
  { y: "2012", t: "Framework Expertise", d: "GRI, ISSB, TCFD, CSRD, CDP, SASB, SBTi." },
  { y: "2015", t: "Global Consulting", d: "Cross-sector engagements across MENA, EU, and APAC." },
  { y: "2018", t: "Carbon Accounting", d: "Corporate inventories and product footprints." },
  { y: "2020", t: "Verification", d: "Independent assurance across sustainability disclosures." },
  { y: "2022", t: "Training", d: "Executive and technical capacity building." },
  { y: "2024", t: "Thought Leadership", d: "Publishing, panels, and standards contribution." },
];

const frameworks = ["GRI", "ISSB", "TCFD", "CSRD", "CDP", "SBTi", "GHG-P", "ISO 14064", "EcoVadis"];

const stats = [
  { k: 20, s: "+", v: "Years practice" },
  { k: 14, s: "", v: "Countries" },
  { k: 60, s: "+", v: "Engagements" },
  { k: 9, s: "", v: "Frameworks" },
];

export function Founder() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              06 — The face behind the practice
            </div>
            <h2 className="text-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[0.95]">
              Dr. Farida.
              <br />
              <em className="text-gradient-brand">Scientist. Strategist.</em>
              <br />
              Assuror.
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative mt-10 aspect-[4/5] max-w-md overflow-hidden rounded-3xl border border-border shadow-lift"
            >
              <img
                src={faridaImg.url}
                alt="Dr. Farida, founder and principal environmental scientist"
                width={1024}
                height={1280}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Soft gradient wash for depth */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--ink) 55%, transparent), transparent 45%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="glass rounded-2xl p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Founder & Principal
                  </div>
                  <div className="mt-1 text-display text-2xl">Dr. Farida</div>
                  <div className="text-xs text-muted-foreground">
                    Environmental scientist · ESG framework specialist
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="mt-6 grid max-w-md grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-card/60 p-3 backdrop-blur">
                  <Counter to={s.k} suffix={s.s} className="text-display text-2xl text-foreground" />
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a href={SOCIAL.linkedin} {...externalLink} className="rounded-full px-4 py-2 text-xs font-medium text-white" style={{ background: "#0a66c2" }}>
                LinkedIn →
              </a>
              <Link to="/courses" className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]">
                Training programs
              </Link>
              <Link to="/book" className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]">
                Book consultation
              </Link>
            </div>

            {/* Animated framework strip */}
            <div className="mt-6 flex flex-wrap gap-1.5">
              {frameworks.map((f, i) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, scale: 0.9, y: 6 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3, borderColor: "var(--leaf)" }}
                  className="cursor-default rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] text-foreground/75 transition-colors"
                >
                  {f}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="relative pl-6 lg:pl-10">
            <div className="absolute left-0 top-2 h-full w-px bg-gradient-to-b from-transparent via-[var(--leaf)] to-transparent" />
            <ul className="space-y-10">
              {timeline.map((item, i) => (
                <motion.li
                  key={item.t}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="relative"
                >
                  <span className="absolute -left-[29px] top-2.5 flex h-3 w-3 items-center justify-center">
                    <motion.span
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                      className="absolute inset-0 rounded-full bg-[var(--leaf)]"
                    />
                    <span className="relative h-2.5 w-2.5 rounded-full border border-[var(--forest)] bg-background" />
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Chapter 0{i + 1}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--clay)]">{item.y}</div>
                  </div>
                  <div className="mt-1 text-display text-2xl">{item.t}</div>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {item.d}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
