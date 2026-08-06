import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Minus, X, History, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import { ROLES } from "@/lib/game/data";
import { EXTENDED_INDICATORS, trendFor, toneFor, type ExtendedIndicator } from "@/lib/game/indicators-ext";

/**
 * Permanent dashboard panel showing all 12 planetary indicators with
 * color-coded bars, live trends and tooltips → detail drawer with history.
 */
export function PlanetaryIndicatorsPanel() {
  const state = useGame();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(() => EXTENDED_INDICATORS.map((ind) => {
    const value = ind.compute(state as never);
    const trend = trendFor(ind.primaryKey, state.indicatorLog);
    return { ind, value, trend };
  }), [state]);

  const openInd = items.find((i) => i.ind.id === openId);

  return (
    <div className="surface-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Planetary indicators</h2>
        <span className="text-xs text-muted-foreground">Live state of Terra · click any indicator for details</span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ ind, value, trend }) => (
          <button
            key={ind.id}
            onClick={() => setOpenId(ind.id)}
            className={cn(
              "group rounded-xl border border-border bg-card p-3 text-left transition-all",
              "hover:border-[color:var(--terra)] hover:shadow-sm",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden>{ind.emoji}</span>
                <span className="truncate">{ind.label}</span>
              </div>
              <TrendBadge trend={trend} />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={cn(
                "font-display text-xl font-semibold tabular-nums",
                toneFor(value) === "good" && "text-[color:var(--terra-deep)]",
                toneFor(value) === "warn" && "text-[color:var(--warmth)]",
                toneFor(value) === "bad" && "text-destructive",
              )}>
                {value}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  toneFor(value) === "good" && "bg-[image:var(--gradient-terra)]",
                  toneFor(value) === "warn" && "bg-[color:var(--warmth)]",
                  toneFor(value) === "bad" && "bg-destructive",
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {openInd && (
        <IndicatorDetail
          ind={openInd.ind}
          value={openInd.value}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "stable" | "declining" }) {
  const Icon = trend === "improving" ? ArrowUp : trend === "declining" ? ArrowDown : Minus;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
      trend === "improving" && "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]",
      trend === "declining" && "bg-destructive/10 text-destructive",
      trend === "stable" && "bg-muted text-muted-foreground",
    )}>
      <Icon className="h-3 w-3" />
      {trend === "improving" ? "Improving" : trend === "declining" ? "Declining" : "Stable"}
    </span>
  );
}

function IndicatorDetail({ ind, value, onClose }: {
  ind: ExtendedIndicator;
  value: number;
  onClose: () => void;
}) {
  const log = useGame((s) => s.indicatorLog).filter((e) => e.key === ind.primaryKey);
  const values = log.map((l) => l.after);
  const starting = log.length > 0 ? log[log.length - 1].before : value;
  const highest = values.length ? Math.max(...values, starting) : value;
  const lowest  = values.length ? Math.min(...values, starting) : value;
  const positiveChanges = log.filter((l) => l.delta > 0).slice(0, 4);
  const negativeChanges = log.filter((l) => l.delta < 0).slice(0, 4);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-background/85 backdrop-blur-md px-4 py-6">
      <div className="surface-card relative max-h-[88vh] w-full max-w-2xl overflow-y-auto p-6">
        <button onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="text-3xl" aria-hidden>{ind.emoji}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Planetary indicator</div>
            <h3 className="font-display text-2xl font-semibold">{ind.label}</h3>
            <div className="mt-1 text-sm text-muted-foreground">{ind.shortDescription}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Stat label="Current" value={`${value}%`} tone={toneFor(value)} />
          <Stat label="Starting" value={`${starting}%`} />
          <Stat label="Highest" value={`${highest}%`} tone="terra" />
          <Stat label="Lowest" value={`${lowest}%`} tone="warn" />
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Info className="h-3 w-3" /> Why it matters
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{ind.whyItMatters}</p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <PillList title="Affected by mysteries" items={ind.affectedByMysteries} />
          <PillList title="Improved by" items={ind.improvedByActions} />
        </div>

        <div className="mt-3 rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stakeholder influence</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {ind.stakeholders.map((r) => {
              const role = ROLES.find((x) => x.id === r);
              return <span key={r} className="pill chip-stone text-[10px]">{role?.name ?? r}</span>;
            })}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <History className="h-3 w-3" /> Timeline of changes
          </div>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No changes recorded yet for this indicator.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border/60 text-sm">
              {log.slice(0, 10).map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <div className="truncate">{e.reason}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{e.source} · {new Date(e.ts).toLocaleTimeString()}</div>
                  </div>
                  <span className={cn(
                    "font-mono text-xs tabular-nums",
                    e.delta > 0 ? "text-[color:var(--terra-deep)]" : "text-destructive",
                  )}>
                    {e.before} → <strong>{e.after}</strong> ({e.delta > 0 ? `+${e.delta}` : e.delta})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(positiveChanges.length > 0 || negativeChanges.length > 0) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {positiveChanges.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-medium text-[color:var(--terra-deep)]">Major improvements</div>
                <ul className="mt-1.5 space-y-0.5 text-sm">
                  {positiveChanges.map((c) => <li key={c.id}>✓ {c.reason}</li>)}
                </ul>
              </div>
            )}
            {negativeChanges.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-medium text-[color:var(--warmth)]">Major declines</div>
                <ul className="mt-1.5 space-y-0.5 text-sm">
                  {negativeChanges.map((c) => <li key={c.id}>⚠ {c.reason}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "bad" | "terra" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn(
        "mt-1 font-display text-xl font-semibold tabular-nums",
        (tone === "good" || tone === "terra") && "text-[color:var(--terra-deep)]",
        tone === "warn" && "text-[color:var(--warmth)]",
        tone === "bad" && "text-destructive",
      )}>{value}</div>
    </div>
  );
}

function PillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {items.map((t, i) => <span key={i} className="pill chip-stone text-[10px]">{t}</span>)}
      </div>
    </div>
  );
}
