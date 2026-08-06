import { cn } from "@/lib/utils";
import type { IndicatorKey } from "@/lib/game/types";

const META: Record<IndicatorKey, { label: string; color: string; icon: string }> = {
  climate: { label: "Climate", color: "var(--ind-climate)", icon: "☁️" },
  food:    { label: "Food",    color: "var(--ind-food)",    icon: "🌾" },
  water:   { label: "Water",   color: "var(--ind-water)",   icon: "💧" },
  bio:     { label: "Biodiversity", color: "var(--ind-bio)", icon: "🌿" },
  economy: { label: "Economy", color: "var(--ind-economy)", icon: "⚖️" },
};

export function IndicatorBar({
  k, value, className,
}: { k: IndicatorKey; value: number; className?: string }) {
  const m = META[k];
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span aria-hidden>{m.icon}</span>{m.label}
        </span>
        <span className="font-mono tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, background: m.color }}
        />
      </div>
    </div>
  );
}
