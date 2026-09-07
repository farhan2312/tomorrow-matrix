import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { MYSTERIES } from "@/lib/game/data";
import { mysteryCover } from "@/lib/game/media";
import { useGame } from "@/lib/game/store";
import { SequenceCard } from "@/components/game/SequenceCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/archive")({
  component: Archive,
});

function Archive() {
  const solved = useGame((s) => s.solvedMysteries);
  const collected = MYSTERIES.filter((m) => solved.includes(m.id));
  const [openId, setOpenId] = useState<string | null>(null);
  const open = collected.find((m) => m.id === openId);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Card Archive</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Your Climate Codex</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every solved mystery becomes a collectible card. Click any card to revisit the system chain.
        </p>
      </header>

      {collected.length === 0 ? (
        <div className="surface-card grid place-items-center p-16 text-center text-sm text-muted-foreground">
          No cards yet. Solve a mystery to begin your codex.
          <Link to="/play/mysteries" className="mt-3 text-[color:var(--terra-deep)] hover:underline">Browse mysteries →</Link>
        </div>
      ) : open ? (
        <div className="surface-lift overflow-hidden">
          <button onClick={() => setOpenId(null)} className="inline-flex items-center gap-1.5 px-5 pt-5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to codex
          </button>
          <div className="grid gap-6 p-5 lg:grid-cols-[420px_1fr] lg:items-start">
            <div className="overflow-hidden rounded-2xl">
              <img src={mysteryCover(open)} alt={open.title} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div>
              <div className="pill chip-terra w-fit"><Sparkles className="h-3 w-3" /> {open.rarity}</div>
              <h2 className="mt-3 font-display text-3xl font-semibold">{open.title}</h2>
              <div className="text-sm text-muted-foreground">{open.region}</div>
              <p className="mt-3 text-sm">{open.brief}</p>

              <div className="mt-5 text-[10px] uppercase tracking-wider text-muted-foreground">System chain</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {open.sequence.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <SequenceCard step={s} positionIndex={i} size="sm" />
                    {i < open.sequence.length - 1 && <span className="text-[color:var(--terra-deep)]">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collected.map((m) => (
            <button key={m.id} onClick={() => setOpenId(m.id)}
              className={cn("surface-card card-hover group overflow-hidden text-left")}>
              <div className="relative aspect-[4/5]">
                <img src={mysteryCover(m)} alt={m.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{m.region}</div>
                  <div className="font-display text-lg font-semibold leading-tight">{m.title}</div>
                </div>
                <span className="pill absolute right-3 top-3 bg-white/85 text-foreground border-white/50 backdrop-blur-sm">Tier {m.tier}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
