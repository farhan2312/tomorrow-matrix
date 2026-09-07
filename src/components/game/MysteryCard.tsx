import { Link } from "@tanstack/react-router";
import type { Mystery } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { mysteryCover } from "@/lib/game/media";
import { Sparkles, Lock, Check } from "lucide-react";

const TIER_LABEL = { 1: "Starter", 2: "Medium", 3: "Hard", 4: "Expert" } as const;
const RARITY_CLASS = {
  common:   "chip-stone",
  uncommon: "chip-terra",
  rare:     "chip-warmth",
  epic:     "bg-[color:var(--ink)] text-white border-transparent",
} as const;

export function MysteryCard({
  mystery, solved, locked, compact,
}: { mystery: Mystery; solved?: boolean; locked?: boolean; compact?: boolean }) {
  const className = cn(
    "group relative block overflow-hidden surface-card card-hover",
    locked && "pointer-events-none opacity-60",
  );

  const inner = (
    <>
      <div className={cn("relative w-full overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[5/3]")}>
        <img
          src={mysteryCover(mystery)}
          alt={mystery.title}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={cn("pill", RARITY_CLASS[mystery.rarity])}>
            <Sparkles className="h-3 w-3" />{mystery.rarity}
          </span>
          <span className="pill bg-white/85 text-foreground border-white/50 backdrop-blur-sm">
            Tier {mystery.tier} · {TIER_LABEL[mystery.tier]}
          </span>
        </div>

        {solved && (
          <span className="pill absolute right-3 top-3 bg-[color:var(--terra)] text-white border-transparent">
            <Check className="h-3 w-3" /> Solved
          </span>
        )}
        {locked && (
          <span className="pill absolute right-3 top-3 bg-black/60 text-white border-transparent">
            <Lock className="h-3 w-3" /> Locked
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">{mystery.region}</div>
          <div className="font-display text-lg font-semibold leading-tight">{mystery.title}</div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-3 p-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{mystery.brief}</p>
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-1.5">
              <span className="pill chip-terra">+{mystery.reward} CAP</span>
              {mystery.unlocks && <span className="pill chip-stone">unlocks {mystery.unlocks}</span>}
            </div>
            <span className="font-medium text-[color:var(--terra-deep)] group-hover:underline">
              Solve →
            </span>
          </div>
        </div>
      )}
    </>
  );

  if (locked) return <div className={className}>{inner}</div>;
  return (
    <Link to="/play/mysteries/$id" params={{ id: mystery.id }} className={className}>
      {inner}
    </Link>
  );
}
