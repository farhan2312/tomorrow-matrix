import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicatorKey } from "@/lib/game/types";
import { EXTENDED_INDICATORS } from "@/lib/game/indicators-ext";

interface Props {
  indicatorsBefore: Record<IndicatorKey, number>;
  indicatorsAfter:  Record<IndicatorKey, number>;
  planetBefore: number;
  planetAfter:  number;
  /** Optional explanations, keyed by indicator or 'planet' */
  reasonByKey?: Partial<Record<IndicatorKey | "planet", string>>;
  /** Show derived/extended indicators that are non-trivially affected too */
  showExtended?: boolean;
}

/**
 * Renders an animated indicator-change panel, appears post-solve or post-crisis
 * so players can immediately see what their decision moved.
 */
export function IndicatorChangePanel({
  indicatorsBefore, indicatorsAfter, planetBefore, planetAfter, reasonByKey, showExtended = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  // Build mock "states" so we can reuse the EXTENDED_INDICATORS.compute pipeline.
  // We only need the indicators + planetHealth + an empty interventions list for
  // the trend snapshot; activity-derived components are computed via current state.
  const rows = EXTENDED_INDICATORS.map((ind) => {
    const fakeBefore = { indicators: indicatorsBefore, planetHealth: planetBefore, purchasedInterventions: [] } as never;
    const fakeAfter  = { indicators: indicatorsAfter,  planetHealth: planetAfter,  purchasedInterventions: [] } as never;
    const before = ind.compute(fakeBefore);
    const after  = ind.compute(fakeAfter);
    const delta  = after - before;
    return { ind, before, after, delta };
  })
  .filter((r) => (showExtended ? r.delta !== 0 : ["terra","climate","water","food","bio","economy"].includes(r.ind.id) || r.delta !== 0));

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Indicators held steady, no measurable change from this action.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map(({ ind, before, after, delta }, i) => {
        const tone = delta > 0 ? "good" : delta < 0 ? "bad" : "neutral";
        const Arrow = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
        const widthAfter = Math.max(2, after);
        const widthBefore = Math.max(2, before);
        const reason = reasonByKey?.[ind.primaryKey];
        return (
          <div
            key={ind.id}
            className="rounded-lg border border-border bg-card p-3"
            style={{ animation: `fade-in 400ms ease-out ${i * 60}ms both` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span aria-hidden>{ind.emoji}</span>
                <span className="font-medium">{ind.label}</span>
              </div>
              <div className={cn(
                "inline-flex items-center gap-1 font-mono text-sm tabular-nums",
                tone === "good" && "text-[color:var(--terra-deep)]",
                tone === "bad" && "text-destructive",
                tone === "neutral" && "text-muted-foreground",
              )}>
                <Arrow className="h-3.5 w-3.5" />
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted">
              {/* ghost = before */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/30 transition-all duration-700"
                   style={{ width: `${widthBefore}%` }} />
              {/* animated = after */}
              <div className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-[1100ms] ease-out",
                tone === "good" ? "bg-[image:var(--gradient-terra)]" :
                tone === "bad"  ? "bg-destructive" : "bg-muted-foreground/60",
              )}
                style={{ width: `${mounted ? widthAfter : widthBefore}%` }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-mono tabular-nums">{before} → <strong className="text-foreground">{after}</strong></span>
              {reason && <span className="truncate pl-2 italic">{reason}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
