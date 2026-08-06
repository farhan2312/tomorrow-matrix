import type { Intervention } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import { artFor, CATEGORY_TINT, CATEGORY_GLOW } from "@/lib/game/intervention-art";

export function InterventionCard({
  intervention, cap, owned, onOpen, onHoverChange,
}: {
  intervention: Intervention;
  cap: number;
  owned: boolean;
  onOpen: () => void;
  onHoverChange?: (linked: string[] | null) => void;
}) {
  const canAfford = cap >= intervention.cost;
  const art = artFor(intervention.categoryId);
  const tint = CATEGORY_TINT[intervention.categoryId ?? ""] ?? "from-slate-500/70 to-slate-900/80";
  const glow = CATEGORY_GLOW[intervention.categoryId ?? ""] ?? "";
  const rippleCount = intervention.ripples?.length ?? 0;

  const topEffects = intervention.effects12
    ? Object.entries(intervention.effects12)
        .filter(([, v]) => (v as number) > 0)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
    : [];

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => onHoverChange?.(intervention.linkedMysteries ?? [])}
      onMouseLeave={() => onHoverChange?.(null)}
      className={cn(
        "group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-3xl text-left",
        "border border-white/10 bg-slate-900 transition-all duration-300",
        "hover:-translate-y-2 hover:scale-[1.02]",
        glow,
        owned && "ring-2 ring-[color:var(--terra)]/70",
      )}
    >
      {/* Hero art */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${art})` }}
      />
      {/* Tint overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-b", tint)} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
      {/* Sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top row: category chip + CAP gold badge */}
      <div className="relative z-10 flex items-start justify-between p-4">
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/90 backdrop-blur">
          <span>{intervention.categoryEmoji}</span>
          <span>{intervention.categoryLabel}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 font-display text-sm font-bold tabular-nums shadow-lg",
            "bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-amber-950",
            "ring-2 ring-amber-200/40",
          )}
        >
          <Star className="h-3.5 w-3.5 fill-amber-950" strokeWidth={0} />
          {intervention.cost}
        </div>
      </div>

      {/* Spacer pushes content down */}
      <div className="flex-1" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 p-4 pt-2 text-white">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
          {intervention.id}
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight drop-shadow-md">
          {intervention.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-white/70">
          {intervention.description}
        </p>

        {topEffects.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {topEffects.map(([k, v]) => (
              <span
                key={k}
                className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-400/30"
              >
                ▲{v} {k}
              </span>
            ))}
          </div>
        )}

        {rippleCount > 0 && (
          <div className="pt-1 text-[10px] font-medium text-white/60">
            {rippleCount} ripple{rippleCount === 1 ? "" : "s"} across Terra
          </div>
        )}
      </div>

      {/* Owned badge */}
      {owned && (
        <div className="absolute right-3 top-14 z-10 flex items-center gap-1 rounded-full bg-[color:var(--terra)] px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
          <Check className="h-3 w-3" /> Invested
        </div>
      )}

      {/* CTA sliver on hover */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur transition-colors group-hover:bg-white/10 group-hover:text-white">
        {owned ? "View strategy" : canAfford ? "View strategy →" : "Insufficient CAP"}
      </div>
    </button>
  );
}
