import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTerra } from "../site/TerraHealth";

type Category =
  | "Climate"
  | "Biodiversity"
  | "Water"
  | "Pollution"
  | "Food"
  | "Cities"
  | "Supply Chain"
  | "Agriculture"
  | "Energy";

type Spot = {
  id: string;
  name: string;
  region: string;
  category: Category;
  x: number;
  y: number;
  chain: string[];
  preview: string;
};

const CAT_COLORS: Record<Category, string> = {
  Climate: "#fcb53b",
  Biodiversity: "#84994f",
  Water: "#7ac0d8",
  Pollution: "#a64b2a",
  Food: "#e9c891",
  Cities: "#e7fbb4",
  "Supply Chain": "#d06224",
  Agriculture: "#b5c99a",
  Energy: "#ffe797",
};

const spots: Spot[] = [
  { id: "amazon", name: "Amazon Deforestation", region: "Brazil", category: "Biodiversity", x: 33, y: 55, preview: "Rainforest loss cascading into rainfall disruption and food security stress across South America.", chain: ["Deforestation", "Carbon release", "Climate change", "Rainfall shift", "Food security"] },
  { id: "heat", name: "European Heat Domes", region: "Southern Europe", category: "Climate", x: 51, y: 30, preview: "Repeat heat waves stressing power grids and public health systems.", chain: ["Fossil combustion", "GHG accumulation", "Heat domes", "Grid stress", "Health impact"] },
  { id: "reef", name: "Great Barrier Reef", region: "Australia", category: "Biodiversity", x: 82, y: 66, preview: "Consecutive bleaching events collapsing reef fisheries and coastal protection.", chain: ["Ocean warming", "Thermal stress", "Symbiosis loss", "Reef mortality", "Coastal risk"] },
  { id: "capewater", name: "Cape Town Water", region: "South Africa", category: "Water", x: 54, y: 74, preview: "\"Day Zero\" cycles as reservoirs and aquifers thin.", chain: ["Precipitation decline", "Reservoir loss", "Rationing", "Migration pressure"] },
  { id: "arctic", name: "Arctic Ice Loss", region: "Arctic", category: "Climate", x: 50, y: 12, preview: "Retreat of sea ice accelerating albedo loss and jet-stream instability.", chain: ["Warming", "Ice melt", "Albedo loss", "Sea level rise", "Coastal flooding"] },
  { id: "oceanacid", name: "Pacific Acidification", region: "Pacific", category: "Water", x: 12, y: 45, preview: "Falling pH threatens shellfish and coral calcification globally.", chain: ["CO₂ dissolution", "pH decline", "Shell weakening", "Fishery collapse"] },
  { id: "sahel", name: "Sahel Food Systems", region: "West Africa", category: "Food", x: 47, y: 48, preview: "Heat and rain volatility undermining smallholder yields.", chain: ["Yield volatility", "Input costs", "Nutrition gaps", "Supply shock"] },
  { id: "delta", name: "Ganges-Brahmaputra Delta", region: "Bangladesh", category: "Water", x: 68, y: 44, preview: "Saltwater intrusion salinizing rice paddies and drinking water.", chain: ["Sea level rise", "Salt intrusion", "Yield loss", "Displacement"] },
  { id: "beijing", name: "Beijing Air Quality", region: "East Asia", category: "Pollution", x: 76, y: 34, preview: "PM2.5 spikes linked to fossil generation and industrial density.", chain: ["Fossil use", "PM2.5 emissions", "Respiratory disease", "Life-years lost"] },
  { id: "greatland", name: "Great Plains Aquifer", region: "USA", category: "Agriculture", x: 22, y: 34, preview: "Ogallala drawdown outpacing recharge — irrigated agriculture at risk.", chain: ["Over-abstraction", "Aquifer depletion", "Yield loss", "Rural decline"] },
  { id: "lagos", name: "Lagos Coastal Flood", region: "Nigeria", category: "Cities", x: 45, y: 55, preview: "Rapid growth on low-elevation coastline compounds sea level rise.", chain: ["Sea level rise", "Storm surge", "Displacement", "Economic loss"] },
  { id: "jakarta", name: "Jakarta Subsidence", region: "Indonesia", category: "Cities", x: 78, y: 60, preview: "City sinking as aquifers empty — capital being relocated.", chain: ["Groundwater over-use", "Subsidence", "Chronic flooding", "Relocation"] },
  { id: "boreal", name: "Boreal Fire Regime", region: "Canada / Siberia", category: "Climate", x: 30, y: 20, preview: "Wildfires releasing centuries-old peat carbon.", chain: ["Warming", "Drier fuels", "Megafires", "Peat carbon release"] },
  { id: "cattle", name: "Beef Supply Chain", region: "Global", category: "Supply Chain", x: 40, y: 46, preview: "Methane and land-use intensity of ruminant beef.", chain: ["Land conversion", "Methane", "Water use", "Emissions"] },
  { id: "palm", name: "Palm Oil Frontier", region: "SE Asia", category: "Supply Chain", x: 75, y: 55, preview: "Plantation expansion into peatland — carbon and biodiversity loss.", chain: ["Peat drainage", "Fire", "Emissions", "Habitat loss"] },
  { id: "cobalt", name: "Cobalt Mining", region: "DR Congo", category: "Supply Chain", x: 52, y: 58, preview: "EV battery demand driving artisanal mining and labor concerns.", chain: ["Demand growth", "Artisanal mining", "Labor risk", "Downstream ESG"] },
  { id: "solar", name: "Gobi Solar", region: "Mongolia", category: "Energy", x: 72, y: 30, preview: "Utility-scale renewables reshaping grid balance.", chain: ["Land availability", "PV deployment", "Grid balance", "Displacement of coal"] },
  { id: "wind", name: "North Sea Wind", region: "Europe", category: "Energy", x: 49, y: 22, preview: "Offshore wind cluster feeding continental decarbonization.", chain: ["Wind resource", "Turbine build", "Grid link", "Coal retirement"] },
  { id: "amazoncity", name: "São Paulo Water Crisis", region: "Brazil", category: "Cities", x: 36, y: 66, preview: "Megacity dependent on shrinking Cantareira watershed.", chain: ["Deforestation", "Rainfall shift", "Reservoir stress", "Rationing"] },
  { id: "med", name: "Mediterranean Dryland", region: "N. Africa", category: "Agriculture", x: 49, y: 40, preview: "Olive and grain belts shifting north with rising temperatures.", chain: ["Warming", "Rain decline", "Yield shift", "Trade disruption"] },
  { id: "plastic", name: "Pacific Gyre", region: "Pacific", category: "Pollution", x: 14, y: 50, preview: "Plastic accumulation entering the food web.", chain: ["Consumer plastic", "Leakage", "Microplastics", "Bioaccumulation"] },
  { id: "coral2", name: "Caribbean Reefs", region: "Caribbean", category: "Biodiversity", x: 25, y: 48, preview: "Reef decline undermining tourism and coastal defense.", chain: ["Warming", "Disease", "Reef loss", "Economic hit"] },
  { id: "himalaya", name: "Himalayan Glaciers", region: "Central Asia", category: "Water", x: 68, y: 35, preview: "Third-pole meltwater feeding a billion downstream people.", chain: ["Warming", "Glacier retreat", "River flow shift", "Water security"] },
  { id: "kerala", name: "Monsoon Volatility", region: "India", category: "Climate", x: 66, y: 46, preview: "Increasingly erratic monsoon disrupting agriculture and grid.", chain: ["Warming", "Monsoon shift", "Yield swing", "Flood/drought"] },
  { id: "chinese", name: "Yangtze Drought", region: "China", category: "Water", x: 78, y: 40, preview: "Record low flows constraining hydropower and shipping.", chain: ["Warming", "Drought", "Hydropower loss", "Industrial shutdown"] },
  { id: "california", name: "California Fire Belt", region: "USA West", category: "Climate", x: 15, y: 36, preview: "Wildfire seasons lengthening and encroaching on urban interfaces.", chain: ["Drier fuels", "Ignition", "Megafire", "Insurance retreat"] },
];

const CATS: (Category | "All")[] = [
  "All",
  "Climate",
  "Biodiversity",
  "Water",
  "Pollution",
  "Food",
  "Cities",
  "Supply Chain",
  "Agriculture",
  "Energy",
];

export function TomorrowMatrix() {
  const [active, setActive] = useState<Spot | null>(null);
  const [hover, setHover] = useState<Spot | null>(null);
  const [filter, setFilter] = useState<Category | "All">("All");
  const { bump } = useTerra();

  const visible = filter === "All" ? spots : spots.filter((s) => s.category === filter);

  return (
    <section id="matrix" className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            07 — The Tomorrow Matrix
          </div>
          <h2 className="mx-auto max-w-3xl text-display text-[clamp(2.25rem,5vw,4rem)]">
            Experience sustainability.
            <br />
            <em className="italic text-gradient-brand">Don't just read about it.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            {spots.length} interconnected climate signals. Hover to preview, click to trace the
            cause-and-effect chain. Every system connects.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                filter === c
                  ? "border-[var(--ink)] bg-[var(--ink)] text-primary-foreground"
                  : "border-border bg-card text-foreground/70 hover:border-foreground/40"
              }`}
            >
              {c !== "All" && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: CAT_COLORS[c as Category] }}
                />
              )}
              {c}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-border shadow-lift">
          <div
            className="relative aspect-[16/9] w-full"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, color-mix(in oklab, #1a3a5a 60%, #05121e) 0%, #04101a 55%, #020810 100%)
              `,
            }}
          >
            {/* Subtle stars */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {Array.from({ length: 60 }).map((_, i) => {
                const x = (i * 37) % 100;
                const y = (i * 53) % 56;
                return <circle key={i} cx={x} cy={y} r="0.08" fill="white" opacity={(i % 5) * 0.15 + 0.15} />;
              })}
            </svg>

            {/* Latitude/longitude grid */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={"h" + i} x1="0" x2="100" y1={i * 7} y2={i * 7} stroke="rgba(180,220,255,0.06)" strokeWidth="0.08" />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={"v" + i} y1="0" y2="56" x1={i * 7.5} x2={i * 7.5} stroke="rgba(180,220,255,0.06)" strokeWidth="0.08" />
              ))}
            </svg>

            {/* Continents — layered silhouettes */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <radialGradient id="landsat">
                  <stop offset="0%" stopColor="#3d6b3d" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#1a3a1a" stopOpacity="0.35" />
                </radialGradient>
                <linearGradient id="terra" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4a7a4a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2a4a2a" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Americas */}
              <path d="M14 20 Q 18 14 22 20 L 24 30 Q 22 38 20 40 L 18 44 Q 16 50 14 46 Z M 20 42 L 26 48 L 34 54 L 30 55 L 22 50 Z" fill="url(#terra)" />
              {/* Europe/Africa */}
              <path d="M46 12 Q 52 10 56 14 L 60 20 Q 58 24 54 22 L 52 26 Q 54 32 52 38 L 50 46 Q 46 52 44 46 L 42 34 Q 44 22 46 12 Z" fill="url(#terra)" />
              {/* Asia */}
              <path d="M60 12 Q 74 10 82 16 L 84 22 Q 78 26 72 22 L 66 24 Q 64 20 60 20 Z" fill="url(#terra)" />
              {/* SE Asia / Australia */}
              <path d="M74 40 Q 82 38 86 44 L 84 48 Q 78 50 74 46 Z M 76 34 Q 80 32 82 36 L 80 38 Q 76 38 76 34 Z" fill="url(#terra)" />
              {/* Contour lines */}
              <g stroke="rgba(150,220,150,0.15)" strokeWidth="0.08" fill="none">
                <path d="M14 22 Q 20 24 24 28" />
                <path d="M46 16 Q 52 20 54 26" />
                <path d="M62 14 Q 74 18 82 20" />
              </g>
            </svg>

            {/* Ocean currents */}
            <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cur" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(120,200,240,0)" />
                  <stop offset="50%" stopColor="rgba(120,200,240,0.55)" />
                  <stop offset="100%" stopColor="rgba(120,200,240,0)" />
                </linearGradient>
              </defs>
              {[
                "M2 30 Q 30 26 60 34 T 98 30",
                "M2 44 Q 30 50 60 46 T 98 42",
                "M2 18 Q 30 12 60 20 T 98 14",
              ].map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="url(#cur)"
                  strokeWidth="0.25"
                  fill="none"
                  strokeDasharray="1.5 3"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-30"
                    dur={`${18 + i * 6}s`}
                    repeatCount="indefinite"
                  />
                </path>
              ))}
            </svg>

            {/* Drifting clouds */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-16 w-40 rounded-full blur-2xl"
                  style={{
                    background: "rgba(200,220,240,0.35)",
                    top: `${15 + i * 20}%`,
                  }}
                  animate={{ x: ["-15%", "115%"] }}
                  transition={{ duration: 90 + i * 30, repeat: Infinity, ease: "linear", delay: -i * 25 }}
                />
              ))}
            </div>

            {/* Hotspots */}
            {visible.map((s, i) => {
              const color = CAT_COLORS[s.category];
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s);
                    bump(2);
                  }}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(null)}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <motion.span
                      className="absolute h-3 w-3 rounded-full"
                      style={{ background: color }}
                      animate={{ scale: [1, 2.8, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: (i % 8) * 0.25 }}
                    />
                    <span
                      className="relative h-1.5 w-1.5 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 10px ${color}, 0 0 2px white`,
                      }}
                    />
                  </span>
                </button>
              );
            })}

            {/* Hover preview card */}
            <AnimatePresence>
              {hover && !active && (
                <motion.div
                  key={hover.id}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  style={{
                    left: `min(${hover.x}%, 70%)`,
                    top: `min(${hover.y + 4}%, 82%)`,
                  }}
                  className="pointer-events-none absolute z-20 w-64 -translate-x-1/2 rounded-2xl glass-dark p-3 text-white shadow-lift"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: CAT_COLORS[hover.category], boxShadow: `0 0 8px ${CAT_COLORS[hover.category]}` }}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                      {hover.category} · {hover.region}
                    </span>
                  </div>
                  <div className="mt-1 text-display text-base leading-tight">{hover.name}</div>
                  <div className="mt-1 text-[11px] leading-snug text-white/70">{hover.preview}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full glass-dark px-3 py-1.5 text-[11px] text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ember)] animate-pulse-soft" />
              Live climate signal · {visible.length} systems
            </div>
            <div className="absolute right-5 bottom-5 rounded-full glass-dark px-3 py-1.5 text-[11px] text-white/70">
              Hover · Click to trace
            </div>

            {/* Chain overlay (clicked) */}
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-5 bottom-16 mx-auto max-w-3xl rounded-3xl glass-dark p-5 text-white z-30"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/60">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: CAT_COLORS[active.category] }}
                        />
                        {active.category} · {active.region} · Cause & effect chain
                      </div>
                      <div className="text-display text-xl">{active.name}</div>
                    </div>
                    <button
                      onClick={() => setActive(null)}
                      className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {active.chain.map((step, k) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: k * 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="rounded-full border px-3 py-1.5 text-xs"
                          style={{
                            background: `color-mix(in oklab, ${CAT_COLORS[active.category]} 15%, transparent)`,
                            borderColor: `color-mix(in oklab, ${CAT_COLORS[active.category]} 40%, transparent)`,
                          }}
                        >
                          {step}
                        </span>
                        {k < active.chain.length - 1 && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: k * 0.15 + 0.08 }}
                            style={{ color: CAT_COLORS[active.category] }}
                          >
                            →
                          </motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
          <div>
            <div className="text-display text-xl">
              The Tomorrow Matrix turns climate complexity into an interactive learning surface.
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Built for boards, teams, and educators.
            </div>
          </div>
          <a
            href="#assessment"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--clay)] px-5 py-3 text-sm font-medium text-white shadow-lift transition-transform hover:-translate-y-0.5"
          >
            Launch demo
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
