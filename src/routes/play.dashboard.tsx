import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronRight, Lock, Check, Sparkles, Globe2, Coins, Activity, Trophy, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { MYSTERIES, CRISES, isMysteryUnlocked } from "@/lib/game/data";
import { mysteryCover } from "@/lib/game/media";
import { HealthGauge } from "@/components/game/HealthGauge";
import { PlanetaryIndicatorsPanel } from "@/components/game/PlanetaryIndicatorsPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { planetHealth, year, cap, solvedMysteries, crisisStats, resolvedCrises, crisisLog } = useGame();

  const total = MYSTERIES.length;
  const solvedCount = solvedMysteries.length;
  const remaining = total - solvedCount;

  const tierStats = [1, 2, 3].map((tier) => {
    const all = MYSTERIES.filter((m) => m.tier === tier);
    const done = all.filter((m) => solvedMysteries.includes(m.id)).length;
    return { tier, total: all.length, done, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  });

  const recentlyUnlocked = MYSTERIES.filter(
    (m) => isMysteryUnlocked(m.id, solvedMysteries) && !solvedMysteries.includes(m.id),
  );

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header className="surface-lift overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
          <div className="flex justify-center md:justify-start"><HealthGauge value={planetHealth} /></div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Year {year} · Mission control</div>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-4xl">
              Restore Terra to <span className="text-[color:var(--terra-deep)]">70%</span> by 2050
            </h1>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatTile icon={Trophy}  label="Solved"     value={`${solvedCount}/${total}`} tone="terra" />
              <StatTile icon={Sparkles} label="Remaining"  value={String(remaining)} />
              <StatTile icon={Coins}    label="CAP"        value={String(cap)} tone="terra" />
              <StatTile icon={Activity} label="Terra Hp"   value={`${planetHealth}%`} tone={planetHealth >= 60 ? "terra" : "warmth"} />
            </div>
          </div>
        </div>
      </header>

      <PlanetaryIndicatorsPanel />

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">Tier progression</h2>
              <span className="text-xs text-muted-foreground">Higher tiers unlock as you solve</span>
            </div>
            <div className="mt-4 space-y-4">
              {tierStats.map((t) => (
                <div key={t.tier}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">Tier {t.tier}</span>
                    <span className="font-mono text-muted-foreground">{t.done}/{t.total} · {t.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-700"
                      style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crisis analytics, from Crisis Event Library */}
          <div className="surface-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[color:var(--warmth)]" /> Crisis response
              </h2>
              <Link to="/play/network" className="text-xs text-[color:var(--terra-deep)] hover:underline">Butterfly view →</Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <StatTile icon={AlertTriangle} label="Faced"     value={String(crisisStats.faced)} tone="warmth" />
              <StatTile icon={Check}         label="Resolved"  value={`${crisisStats.resolved}/${CRISES.length}`} tone="terra" />
              <StatTile icon={ShieldCheck}   label="Best picks" value={String(crisisStats.bestPicks)} tone="terra" />
              <StatTile icon={Clock}         label="Avg resp." value={crisisStats.resolved ? `${(crisisStats.totalResponseMs / crisisStats.resolved / 1000).toFixed(1)}s` : "-"} />
            </div>
            {resolvedCrises.length > 0 && (
              <ul className="mt-4 divide-y divide-border/60 text-sm">
                {resolvedCrises.slice(-4).reverse().map((cid) => {
                  const c = CRISES.find((x) => x.id === cid);
                  const choiceId = crisisStats.choices[cid];
                  const ch = c?.choices.find((x) => x.id === choiceId);
                  const isBest = ch && ch.id === c?.bestChoiceId;
                  if (!c) return null;
                  return (
                    <li key={cid} className="flex items-start justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate"><span className="mr-1">{c.emoji}</span><strong>{c.title}</strong></div>
                        <div className="truncate text-xs text-muted-foreground">→ {ch?.label ?? "default consequence"}</div>
                      </div>
                      {isBest
                        ? <span className="pill chip-terra shrink-0"><ShieldCheck className="h-3 w-3" /> Best</span>
                        : <span className="pill chip-stone shrink-0">{ch?.planetHealth ?? "-"} Hp</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Crisis history */}
          {crisisLog.length > 0 && (
            <div className="surface-card p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">Crisis history</h2>
                <span className="text-xs text-muted-foreground">{crisisLog.length} decision{crisisLog.length === 1 ? "" : "s"}</span>
              </div>
              <ul className="mt-3 divide-y divide-border/60 text-sm">
                {crisisLog.slice(0, 6).map((o) => {
                  const statusLabel = ({ excellent: "Excellent", good: "Good", neutral: "Neutral", poor: "Poor", critical: "Critical" } as const)[o.status];
                  const positive = o.status === "excellent" || o.status === "good";
                  return (
                    <li key={o.id} className="flex items-start justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate"><span className="mr-1">{o.emoji}</span><strong>{o.title}</strong></div>
                        <div className="truncate text-xs text-muted-foreground">→ {o.choiceLabel} · {new Date(o.ts).toLocaleString()}</div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn("pill", positive ? "chip-terra" : o.status === "neutral" ? "chip-stone" : "chip-warmth")}>{statusLabel}</span>
                        <span className={cn("font-mono text-xs", o.capDelta >= 0 ? "text-[color:var(--terra-deep)]" : "text-destructive")}>
                          {o.capDelta >= 0 ? "+" : ""}{o.capDelta} CAP
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="surface-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">Recently unlocked</h2>
              <Link to="/play/mysteries" className="text-xs text-[color:var(--terra-deep)] hover:underline">View all →</Link>
            </div>
            {recentlyUnlocked.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">All current mysteries are solved. Advance time or invest to unlock more.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {recentlyUnlocked.slice(0, 4).map((m) => (
                  <Link key={m.id} to="/play/mysteries/$id" params={{ id: m.id }}
                    className="group flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/60">
                    <img src={mysteryCover(m)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{m.title}</div>
                      <div className="text-[11px] text-muted-foreground">{m.region}</div>
                    </div>
                    <span className="pill chip-terra">+{m.reward}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-lg font-semibold">Quick actions</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Link to="/play" className="rounded-xl bg-[image:var(--gradient-terra)] px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:scale-[1.02] transition-transform">
                <Globe2 className="mx-auto mb-1 h-4 w-4" /> World Map
              </Link>
              <Link to="/play/marketplace" className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium hover:bg-muted">
                Marketplace
              </Link>
              <Link to="/play/archive" className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium hover:bg-muted">
                Card Archive
              </Link>
            </div>
          </div>
        </div>

        <MysteryProgressPanel />
      </section>
    </main>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: typeof Trophy; label: string; value: string; tone?: "terra" | "warmth" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={cn(
        "mt-1 font-display text-xl font-semibold tabular-nums",
        tone === "terra"  && "text-[color:var(--terra-deep)]",
        tone === "warmth" && "text-[color:var(--warmth)]",
      )}>{value}</div>
    </div>
  );
}

function MysteryProgressPanel() {
  const solved = useGame((s) => s.solvedMysteries);
  const [openTiers, setOpenTiers] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: false });

  return (
    <aside className="surface-card divide-y divide-border overflow-hidden self-start">
      <div className="bg-muted/40 px-4 py-3">
        <div className="font-display text-sm font-semibold">All mysteries</div>
        <div className="text-[11px] text-muted-foreground">Click to jump in</div>
      </div>
      {[1, 2, 3].map((tier) => {
        const list = MYSTERIES.filter((m) => m.tier === tier);
        if (list.length === 0) return null;
        const isOpen = openTiers[tier];
        return (
          <div key={tier}>
            <button onClick={() => setOpenTiers((p) => ({ ...p, [tier]: !p[tier] }))}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50">
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="text-sm font-medium">Tier {tier}</span>
                <span className="text-xs text-muted-foreground">({list.length})</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {list.filter((m) => solved.includes(m.id)).length}/{list.length}
              </span>
            </button>
            {isOpen && (
              <ul className="divide-y divide-border/60">
                {list.map((m) => {
                  const isSolved = solved.includes(m.id);
                  const isUnlocked = isMysteryUnlocked(m.id, solved);
                  const row = (
                    <div className="flex items-center gap-2.5 px-4 py-2.5">
                      <StatusDot solved={isSolved} unlocked={isUnlocked} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{m.title}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {isSolved ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}
                        </div>
                      </div>
                      {isSolved ? <Check className="h-3.5 w-3.5 text-[color:var(--terra-deep)]" /> :
                        !isUnlocked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                    </div>
                  );
                  return (
                    <li key={m.id}>
                      {isUnlocked && !isSolved ? (
                        <Link to="/play/mysteries/$id" params={{ id: m.id }} className="block hover:bg-muted/40">{row}</Link>
                      ) : isSolved ? (
                        <Link to="/play/archive" className="block hover:bg-muted/40">{row}</Link>
                      ) : (
                        <div className="opacity-60">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}

function StatusDot({ solved, unlocked }: { solved: boolean; unlocked: boolean }) {
  return (
    <span className={cn(
      "h-2 w-2 shrink-0 rounded-full",
      solved ? "bg-[color:var(--terra)]" : unlocked ? "bg-[color:var(--warmth)]" : "bg-muted-foreground/40",
    )} />
  );
}
