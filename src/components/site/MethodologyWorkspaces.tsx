import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Ws = {
  key: string;
  title: string;
  blurb: string;
  activities: string[];
  outputs: string[];
};

const WORKSPACES: Ws[] = [
  {
    key: "materiality",
    title: "Materiality Workspace",
    blurb: "Double materiality heatmap of stakeholder impact × financial materiality.",
    activities: ["Peer & regulator scan", "Stakeholder listening", "Impact / financial scoring"],
    outputs: ["Materiality matrix", "Top 8–12 topics", "Board briefing"],
  },
  {
    key: "vision",
    title: "Vision Workshop",
    blurb: "Executive workshop board — sticky notes crystallise into a North Star.",
    activities: ["Executive interviews", "Ambition workshop", "Purpose narrative drafting"],
    outputs: ["Vision statement", "Strategic pillars", "Ambition case"],
  },
  {
    key: "roadmap",
    title: "Roadmap Studio",
    blurb: "Initiatives, budgets, teams and dependencies laid out on one timeline.",
    activities: ["Initiative portfolio", "Capex + opex model", "Sequencing & owners"],
    outputs: ["3-year roadmap", "Business case", "Governance plan"],
  },
  {
    key: "op",
    title: "Operating Model",
    blurb: "Committees, KPIs and decision paths — the wiring that keeps strategy alive.",
    activities: ["Committee design", "KPI cascade", "Decision-rights mapping"],
    outputs: ["Governance charter", "KPI dashboard", "RACI"],
  },
];

export function MethodologyWorkspaces({ tone = "#84994f" }: { tone?: string }) {
  const [open, setOpen] = useState<string>(WORKSPACES[0].key);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {WORKSPACES.map((w) => {
        const isOpen = open === w.key;
        return (
          <motion.div
            key={w.key}
            layout
            onMouseEnter={() => setOpen(w.key)}
            className={`overflow-hidden rounded-2xl border bg-card shadow-soft transition-all ${
              isOpen ? "shadow-lift" : ""
            }`}
            style={{ borderColor: isOpen ? `color-mix(in oklab, ${tone} 35%, var(--border))` : "var(--border)" }}
          >
            <div className="relative">
              <div className="p-5">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Workspace
                </div>
                <div className="text-display text-2xl">{w.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{w.blurb}</p>
              </div>
              {w.key === "materiality" && <MiniHeatmap tone={tone} />}
              {w.key === "vision" && <MiniStickies tone={tone} />}
              {w.key === "roadmap" && <MiniGantt tone={tone} />}
              {w.key === "op" && <MiniOrg tone={tone} />}
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 border-t border-border p-5 text-xs">
                    <div>
                      <div className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Activities</div>
                      <ul className="space-y-1">{w.activities.map((a) => <li key={a}>· {a}</li>)}</ul>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Outputs</div>
                      <ul className="space-y-1">{w.outputs.map((o) => <li key={o}>· {o}</li>)}</ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function MiniHeatmap({ tone }: { tone: string }) {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="mx-5 mb-5 rounded-xl border border-border bg-background/60 p-3">
      <div className="grid grid-cols-5 gap-1">
        {cells.map((i) => {
          const row = Math.floor(i / 5); const col = i % 5;
          const heat = Math.min(1, (row + col) / 8);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              className="aspect-square rounded"
              style={{ background: `color-mix(in oklab, ${tone} ${Math.round(heat * 100)}%, white)` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
        <span>Stakeholder impact →</span><span>Financial ↑</span>
      </div>
    </div>
  );
}

function MiniStickies({ tone }: { tone: string }) {
  const notes = ["Net Zero 2040", "Circular products", "Just transition", "Nature positive", "Trusted brand"];
  return (
    <div className="relative mx-5 mb-5 h-24 rounded-xl border border-border bg-background/60 p-3">
      {notes.map((n, i) => (
        <motion.div
          key={n}
          initial={{ opacity: 0, y: 8, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: (i - 2) * 4 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="absolute rounded-md px-2 py-1 text-[10px] font-medium shadow-soft"
          style={{
            background: i % 2 ? "#fff2c9" : `color-mix(in oklab, ${tone} 25%, white)`,
            left: `${8 + i * 18}%`,
            top: `${i % 2 ? 40 : 10}%`,
          }}
        >
          {n}
        </motion.div>
      ))}
    </div>
  );
}

function MiniGantt({ tone }: { tone: string }) {
  const bars = [
    { w: 60, x: 0 },
    { w: 45, x: 15 },
    { w: 70, x: 25 },
    { w: 35, x: 60 },
  ];
  return (
    <div className="mx-5 mb-5 space-y-1.5 rounded-xl border border-border bg-background/60 p-3">
      {bars.map((b, i) => (
        <div key={i} className="relative h-3 rounded bg-border/50">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            style={{ background: tone, marginLeft: `${b.x}%`, width: `${b.w}%`, transformOrigin: "left" }}
            className="absolute inset-y-0 rounded"
          />
        </div>
      ))}
    </div>
  );
}

function MiniOrg({ tone }: { tone: string }) {
  return (
    <div className="mx-5 mb-5 rounded-xl border border-border bg-background/60 p-3">
      <svg viewBox="0 0 200 80" className="h-16 w-full">
        <line x1="100" y1="20" x2="40" y2="60" stroke={tone} strokeOpacity="0.4" />
        <line x1="100" y1="20" x2="100" y2="60" stroke={tone} strokeOpacity="0.4" />
        <line x1="100" y1="20" x2="160" y2="60" stroke={tone} strokeOpacity="0.4" />
        {[[100,20,"Board"],[40,60,"Risk"],[100,60,"ESG Cmt"],[160,60,"Exec"]].map(([x,y,l]:any) => (
          <g key={l}>
            <circle cx={x} cy={y} r="10" fill="white" stroke={tone} />
            <text x={x} y={y + 3} textAnchor="middle" style={{ fontSize: 6, fill: "var(--ink)" }}>{l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
