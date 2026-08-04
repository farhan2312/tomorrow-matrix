import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Cert = {
  id: string;
  name: string;
  current: string;
  target: string;
  gap: string;
  readiness: number; // 0-100
  value: string;
  progression: string[]; // e.g. ["C","B","A-","A"]
  angle: number;
};

const CERTS: Cert[] = [
  { id: "ecovadis", name: "EcoVadis",       current: "Silver",  target: "Platinum", gap: "22 pts",  readiness: 68, value: "Supplier tier upgrade", progression: ["Bronze","Silver","Gold","Platinum"], angle: -90 },
  { id: "cdp",      name: "CDP",            current: "B",       target: "A",        gap: "1 grade", readiness: 74, value: "Investor short-lists",  progression: ["C","B","A-","A"], angle: -45 },
  { id: "iso14064", name: "ISO 14064",      current: "Prep",    target: "Certified",gap: "Audit",   readiness: 82, value: "Verified inventory",    progression: ["Prep","Audit","Cert.","Renewal"], angle: 0 },
  { id: "iso14001", name: "ISO 14001",      current: "Gap",     target: "Certified",gap: "12 wks",  readiness: 55, value: "EMS credibility",       progression: ["Gap","Impl.","Audit","Cert."], angle: 45 },
  { id: "iso50001", name: "ISO 50001",      current: "Baseline",target: "Certified",gap: "16 wks",  readiness: 42, value: "Energy savings 8–12%",  progression: ["Base","Impl.","Audit","Cert."], angle: 90 },
  { id: "msci",     name: "MSCI ESG",       current: "BBB",     target: "AA",       gap: "2 tiers", readiness: 61, value: "Index inclusion",       progression: ["BB","BBB","A","AA"], angle: 135 },
  { id: "susta",    name: "Sustainalytics", current: "Medium",  target: "Low Risk", gap: "6 pts",   readiness: 70, value: "Lower cost of capital", progression: ["High","Med","Low","Neg."], angle: 180 },
  { id: "sbti",     name: "SBTi",           current: "Committed",target: "Validated",gap: "Docs",   readiness: 78, value: "1.5°C alignment",       progression: ["Comm.","Draft","Sub.","Val."], angle: 225 },
];

export function CertificationDashboard({ height = 540, tone = "#d06224" }: { height?: number; tone?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const active = CERTS.find((c) => c.id === hovered) ?? null;
  const R = 200;

  return (
    <div
      className="relative overflow-hidden rounded-[22px]"
      style={{
        height,
        background:
          "radial-gradient(120% 90% at 50% 40%, #fff 0%, #fbf6ee 55%, #f2e6d1 100%)",
      }}
    >
      {/* soft ambient rings */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <svg viewBox="-260 -260 520 520" className="h-full w-full">
          {[130, 170, 210, 250].map((r) => (
            <circle key={r} cx="0" cy="0" r={r} fill="none" stroke={tone} strokeOpacity="0.08" strokeDasharray="2 6" />
          ))}
        </svg>
      </div>

      {/* header chip */}
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-foreground/70 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone, boxShadow: `0 0 8px ${tone}` }} />
        Certification Intelligence
      </div>
      <div className="absolute right-5 top-5 z-10 rounded-full border border-border/60 bg-white/80 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-foreground/70 backdrop-blur">
        Live · scoring
      </div>

      {/* central profile */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="-260 -260 520 520" className="h-full w-full">
          {/* orbit connector lines */}
          {CERTS.map((c) => {
            const rad = (c.angle * Math.PI) / 180;
            const x = Math.cos(rad) * R;
            const y = Math.sin(rad) * R;
            const on = hovered === c.id;
            return (
              <line
                key={`l-${c.id}`}
                x1="0" y1="0" x2={x} y2={y}
                stroke={tone}
                strokeOpacity={on ? 0.6 : 0.15}
                strokeWidth={on ? 1.2 : 0.7}
                strokeDasharray={on ? "0" : "3 5"}
              />
            );
          })}

          {/* center */}
          <circle cx="0" cy="0" r="70" fill="white" stroke={tone} strokeOpacity="0.25" />
          <circle cx="0" cy="0" r="70" fill="url(#centerGrad)" />
          <defs>
            <radialGradient id="centerGrad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f5ead6" />
            </radialGradient>
          </defs>
          <text x="0" y="-8" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" letterSpacing="2" fill="#666">
            COMPANY
          </text>
          <text x="0" y="10" textAnchor="middle" fontSize="14" fontFamily="Instrument Serif, serif" fill="#1a1a1a">
            Profile
          </text>
          <text x="0" y="26" textAnchor="middle" fontSize="9" fill={tone} fontFamily="ui-monospace" letterSpacing="1">
            8 SYSTEMS
          </text>

          {/* badges */}
          {CERTS.map((c, i) => {
            const rad = (c.angle * Math.PI) / 180;
            const x = Math.cos(rad) * R;
            const y = Math.sin(rad) * R;
            const on = hovered === c.id;
            // scroll through progression continuously
            const progIdx = (tick + i) % c.progression.length;
            const scoreLabel = c.progression[progIdx];
            return (
              <g
                key={c.id}
                transform={`translate(${x} ${y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.circle
                  r={on ? 34 : 30}
                  fill="white"
                  stroke={tone}
                  strokeOpacity={on ? 1 : 0.35}
                  strokeWidth={on ? 2 : 1}
                  animate={{
                    filter: on
                      ? `drop-shadow(0 0 14px ${tone})`
                      : `drop-shadow(0 2px 6px rgba(0,0,0,0.08))`,
                  }}
                />
                {/* readiness arc */}
                <circle
                  r="26"
                  fill="none"
                  stroke={tone}
                  strokeOpacity="0.12"
                  strokeWidth="3"
                />
                <motion.circle
                  r="26"
                  fill="none"
                  stroke={tone}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - c.readiness / 100) }}
                  transition={{ duration: 1.2 }}
                  transform="rotate(-90)"
                />
                <text textAnchor="middle" y="-3" fontSize="8" fontFamily="ui-monospace" letterSpacing="1" fill="#666">
                  {c.name.toUpperCase()}
                </text>
                <AnimatePresence mode="wait">
                  <motion.text
                    key={scoreLabel}
                    textAnchor="middle"
                    y="10"
                    fontSize="12"
                    fontFamily="Instrument Serif, serif"
                    fill={tone}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 10 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.4 }}
                  >
                    {scoreLabel}
                  </motion.text>
                </AnimatePresence>
              </g>
            );
          })}

          {/* animated data pulses along active line */}
          {active && (() => {
            const rad = (active.angle * Math.PI) / 180;
            const x = Math.cos(rad) * R;
            const y = Math.sin(rad) * R;
            return (
              <motion.circle
                r="3"
                fill={tone}
                initial={{ cx: 0, cy: 0, opacity: 1 }}
                animate={{ cx: x, cy: y, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            );
          })()}
        </svg>
      </div>

      {/* Hover detail card */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-5 left-5 right-5 z-10 rounded-2xl border border-border/60 bg-white/95 p-4 shadow-lift backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Certification</div>
                <div className="text-display text-xl leading-tight">{active.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{active.value}</div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-[10px]">
                <MiniStat label="Current" value={active.current} tone={tone} />
                <MiniStat label="Target"  value={active.target}  tone={tone} strong />
                <MiniStat label="Gap"     value={active.gap}     tone={tone} />
                <MiniStat label="Ready"   value={`${active.readiness}%`} tone={tone} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value, tone, strong }: { label: string; value: string; tone: string; strong?: boolean }) {
  return (
    <div className="text-center">
      <div className="font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className="mt-0.5 text-sm"
        style={{ color: strong ? tone : "var(--ink)", fontWeight: strong ? 600 : 500 }}
      >
        {value}
      </div>
    </div>
  );
}
