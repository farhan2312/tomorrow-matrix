import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Lock, Sparkles } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole } from "@/lib/game/data";
import { mysteryCover } from "@/lib/game/media";

export const Route = createFileRoute("/play/map")({
  component: DependencyMap,
});

// Hand-tuned tier columns (no graph layout engine needed for 6 nodes)
const COLS: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
const NODE_W = 220;
const NODE_H = 96;
const COL_GAP = 80;
const ROW_GAP = 28;

function DependencyMap() {
  const solved = useGame((s) => s.solvedMysteries);
  const role = useGame((s) => s.role);
  const navigate = useNavigate();

  // Group by tier; filter by role visibility
  const visible = MYSTERIES.filter((m) => isMysteryVisibleForRole(role, m));
  const byTier: Record<number, typeof MYSTERIES> = { 1: [], 2: [], 3: [], 4: [] };
  visible.forEach((m) => { (byTier[m.tier] ?? (byTier[m.tier] = [])).push(m); });

  // Compute positions per mystery
  const pos = new Map<string, { x: number; y: number }>();
  Object.entries(byTier).forEach(([tierStr, list]) => {
    const tier = Number(tierStr);
    const col = COLS[tier] ?? tier - 1;
    list.forEach((m, i) => {
      pos.set(m.id, {
        x: col * (NODE_W + COL_GAP),
        y: i * (NODE_H + ROW_GAP),
      });
    });
  });

  const colCount = Math.max(...Object.values(COLS)) + 1;
  const maxRows = Math.max(...Object.values(byTier).map((l) => l.length));
  const width  = colCount * NODE_W + (colCount - 1) * COL_GAP;
  const height = maxRows * NODE_H + (maxRows - 1) * ROW_GAP;

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header className="max-w-2xl">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mystery dependency map</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">The Climate Web</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mysteries cascade. Solving one unlocks the next. Lines show prerequisites.
        </p>
      </header>

      <div className="surface-lift overflow-x-auto p-6">
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            {MYSTERIES.map((m) =>
              (m.prereqs ?? []).map((p) => {
                const from = pos.get(p);
                const to = pos.get(m.id);
                if (!from || !to) return null;
                const x1 = from.x + NODE_W;
                const y1 = from.y + NODE_H / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_H / 2;
                const isLive = solved.includes(p);
                return (
                  <path key={`${p}-${m.id}`}
                    d={`M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isLive ? "var(--terra)" : "oklch(0.85 0.01 150)"}
                    strokeWidth={isLive ? 2.5 : 1.5}
                    strokeDasharray={isLive ? "0" : "4 4"}
                  />
                );
              }),
            )}
          </svg>

          {MYSTERIES.map((m) => {
            const p = pos.get(m.id)!;
            const isSolved = solved.includes(m.id);
            const unlocked = isMysteryUnlocked(m.id, solved);
            return (
              <button key={m.id}
                onClick={() => unlocked && navigate({ to: "/play/mysteries/$id", params: { id: m.id } })}
                disabled={!unlocked}
                className={`group absolute flex flex-col gap-1 overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all ${
                  unlocked ? "card-hover" : "cursor-not-allowed opacity-65"
                } ${isSolved ? "ring-2 ring-[color:var(--terra)]" : ""}`}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
              >
                <div className="relative h-12 w-full overflow-hidden">
                  <img src={mysteryCover(m)} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="pill absolute right-1.5 top-1.5 bg-white/85 text-foreground border-white/50 backdrop-blur-sm text-[10px]">T{m.tier}</span>
                  {isSolved && <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[color:var(--terra)] text-white"><Check className="h-3 w-3" /></span>}
                  {!unlocked && <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white"><Lock className="h-3 w-3" /></span>}
                </div>
                <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-0.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.title}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{m.region}</div>
                  </div>
                  <span className="pill chip-terra text-[10px]"><Sparkles className="h-2.5 w-2.5" />{m.reward}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--terra)]" /> Completed</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--warmth)]" /> Unlocked</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Locked</span>
      </div>
    </main>
  );
}
