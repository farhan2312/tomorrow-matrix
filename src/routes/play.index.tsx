import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Activity, Coins, Trophy, ArrowRight } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { MYSTERIES, isMysteryUnlocked } from "@/lib/game/data";
import { mysteryCover } from "@/lib/game/media";
import { WorldMap } from "@/components/game/WorldMap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/")({
  component: WorldView,
});

function WorldView() {
  const { planetHealth, year, cap, solvedMysteries } = useGame();
  const total = MYSTERIES.length;
  const available = MYSTERIES.filter((m) => isMysteryUnlocked(m.id, solvedMysteries) && !solvedMysteries.includes(m.id));

  return (
    <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Year {year} · Terra Map</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Explore the planet. Solve the system.
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Each hotspot is a real climate mystery. Click one to investigate, arrange its causal chain, and restore Terra.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stat icon={Activity} label="Terra"    value={`${planetHealth}%`} tone={planetHealth >= 60 ? "terra" : "warmth"} />
          <Stat icon={Coins}    label="CAP"      value={String(cap)} tone="terra" />
          <Stat icon={Trophy}   label="Solved"   value={`${solvedMysteries.length}/${total}`} />
        </div>
      </header>

      <WorldMap />

      <section className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="surface-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Available investigations</h2>
            <Link to="/play/dashboard" className="text-xs text-[color:var(--terra-deep)] hover:underline">Full dashboard →</Link>
          </div>
          {available.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">All current mysteries solved. Visit the marketplace to invest in interventions and unlock more.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {available.slice(0, 4).map((m) => (
                <Link key={m.id} to="/play/mysteries/$id" params={{ id: m.id }}
                  className="group flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/60">
                  <img src={mysteryCover(m)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.title}</div>
                    <div className="text-[11px] text-muted-foreground">{m.region}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="surface-card p-5">
          <h2 className="font-display text-lg font-semibold">How it works</h2>
          <ol className="mt-3 space-y-2 text-sm text-foreground/80">
            <li><span className="mr-2 font-mono text-xs text-[color:var(--terra-deep)]">01</span>Click a hotspot on the map.</li>
            <li><span className="mr-2 font-mono text-xs text-[color:var(--terra-deep)]">02</span>Arrange 8 cards in causal order.</li>
            <li><span className="mr-2 font-mono text-xs text-[color:var(--terra-deep)]">03</span>Earn CAP. Restore Terra. Unlock more.</li>
          </ol>
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Sparkles className="mb-1 h-3.5 w-3.5 text-[color:var(--warmth)]" />
            Tip: every 4 mysteries solved triggers a live crisis event. Be ready.
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value, tone }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone?: "terra" | "warmth";
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div>
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          tone === "terra" && "text-[color:var(--terra-deep)]",
          tone === "warmth" && "text-[color:var(--warmth)]",
        )}>{value}</div>
      </div>
    </div>
  );
}
