import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, AlertTriangle, Sparkles, Coins, Activity, Trophy, Lock } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { MYSTERIES, isMysteryUnlocked } from "@/lib/game/data";
import { cn } from "@/lib/utils";

export function TerraProgressPanel() {
  // Start collapsed: as a fixed overlay it otherwise covers the centered content
  // (the sequence cards on mobile, the aside on desktop). Users can expand it.
  const [open, setOpen] = useState(false);
  const { planetHealth, cap, solvedMysteries, pendingCrisisId } = useGame();

  const total = MYSTERIES.length;
  const solvedCount = solvedMysteries.length;
  const unlockedCount = MYSTERIES.filter((m) => isMysteryUnlocked(m.id, solvedMysteries) && !solvedMysteries.includes(m.id)).length;
  const currentTier = solvedMysteries.length === 0
    ? 1
    : Math.max(...solvedMysteries.map((id) => MYSTERIES.find((m) => m.id === id)?.tier ?? 1));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-3 top-24 z-30 grid h-10 w-10 place-items-center rounded-l-xl border border-border bg-card shadow-md hover:bg-muted"
        aria-label="Open Terra panel"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside className="fixed right-3 top-20 z-30 w-64 surface-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
        <div className="font-display text-xs font-semibold uppercase tracking-wider">Terra Status</div>
        <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-muted">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {pendingCrisisId && (
        <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-3 py-2 text-xs text-destructive animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5" /> Active crisis, respond now
        </div>
      )}

      <div className="space-y-3 p-3 text-xs">
        <Row icon={Activity} label="Terra Health"   value={`${planetHealth}%`} tone={planetHealth >= 60 ? "terra" : planetHealth >= 35 ? "warmth" : "bad"} />
        <Row icon={Coins}    label="CAP"            value={String(cap)} tone="terra" />
        <Row icon={Trophy}   label="Solved"         value={`${solvedCount}/${total}`} />
        <Row icon={Sparkles} label="Remaining"      value={String(total - solvedCount)} />
        <Row icon={Lock}     label="Available now"  value={String(unlockedCount)} tone="warmth" />
        <Row icon={Trophy}   label="Current tier"   value={`T${currentTier}`} />

        <div className="pt-2">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Completion</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-500"
              style={{ width: `${total ? (solvedCount / total) * 100 : 0}%` }} />
          </div>
        </div>

        <Link to="/play" className="mt-2 block rounded-lg border border-border bg-card px-2.5 py-1.5 text-center text-[11px] font-medium hover:bg-muted">
          Open world map
        </Link>
      </div>
    </aside>
  );
}

function Row({
  icon: Icon, label, value, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "terra" | "warmth" | "bad";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className={cn(
        "font-mono tabular-nums font-semibold",
        tone === "terra" && "text-[color:var(--terra-deep)]",
        tone === "warmth" && "text-[color:var(--warmth)]",
        tone === "bad" && "text-destructive",
      )}>{value}</span>
    </div>
  );
}
