import { useEffect, useMemo, useState } from "react";
import type { Crisis, CrisisChoice, RoleId } from "@/lib/game/types";
import {
  AlertTriangle, MapPin, Clock, Sparkles, ShieldCheck, Eye, EyeOff,
  Microscope, Wheat, Landmark, Megaphone, Building2, Briefcase, Users, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import { useLobby } from "@/lib/multiplayer/store";
import { castVote } from "@/lib/multiplayer/api.functions";
import { getClientId } from "@/lib/multiplayer/identity";

const ROLE_ICON: Record<RoleId, typeof Microscope> = {
  scientist: Microscope, farmer: Wheat, policymaker: Landmark, activist: Megaphone,
  planner: Building2, business: Briefcase, citizen: Users, student: GraduationCap,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  climate:        "linear-gradient(135deg, oklch(0.62 0.18 30), oklch(0.55 0.16 25))",
  infrastructure: "linear-gradient(135deg, oklch(0.55 0.14 250), oklch(0.45 0.12 245))",
  social:         "linear-gradient(135deg, oklch(0.6 0.16 320), oklch(0.5 0.14 310))",
  health:         "linear-gradient(135deg, oklch(0.65 0.18 20),  oklch(0.55 0.16 15))",
  biodiversity:   "linear-gradient(135deg, oklch(0.55 0.16 150), oklch(0.45 0.14 165))",
};

type Phase = "decide" | "reveal";

export function CrisisModal({
  crisis, open, onClose, onResolve,
}: {
  crisis: Crisis | null;
  open: boolean;
  onClose: () => void;
  onResolve: (choiceId: string) => void;
}) {
  const [seconds, setSeconds] = useState(90);
  const [phase, setPhase]     = useState<Phase>("decide");
  const [picked, setPicked]   = useState<string | null>(null);
  const [showAllRoles, setShowAllRoles] = useState(false);

  const role = useGame((s) => s.role);
  const mode = useGame((s) => s.mode);
  const lobbyId = useLobby((s) => s.lobbyId);
  const votes = useLobby((s) => s.votes);
  const players = useLobby((s) => s.players);

  // Reset on new crisis
  useEffect(() => {
    if (!open) return;
    setSeconds(90); setPhase("decide"); setPicked(null); setShowAllRoles(false);
  }, [open, crisis?.id]);

  // Timer countdown
  useEffect(() => {
    if (!open || phase !== "decide") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open, phase, crisis?.id]);

  // Timeout → default consequence
  useEffect(() => {
    if (!open || phase !== "decide" || seconds > 0) return;
    setPhase("reveal");
    // Empty choiceId is interpreted by store.resolveCrisis as timeout/default.
    onResolve("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, open, phase]);

  // Multiplayer vote tally for this crisis
  const myVotes = useMemo(
    () => (crisis ? votes.filter((v) => v.crisis_id === crisis.id) : []),
    [votes, crisis],
  );
  const voteTally = useMemo(() => {
    const out: Record<string, number> = {};
    myVotes.forEach((v) => { out[v.choice_id] = (out[v.choice_id] ?? 0) + 1; });
    return out;
  }, [myVotes]);

  if (!crisis || !open) return null;

  const pct = (seconds / 90) * 100;
  const urgency = seconds <= 15 ? "extreme" : seconds <= 40 ? "high" : "ok";

  function handlePick(c: CrisisChoice) {
    if (phase !== "decide") return;
    setPicked(c.id);
    // Multiplayer: broadcast vote, but resolve locally immediately too
    if (mode === "multiplayer" && lobbyId) {
      castVote({
        data: {
          lobbyId,
          clientId: getClientId(),
          crisisId: crisis!.id,
          choiceId: c.id,
          responseMs: (90 - seconds) * 1000,
        },
      }).catch(() => {});
    }
    setPhase("reveal");
    onResolve(c.id);
  }

  const myRole = role;
  const myRoleInfo = myRole && crisis.roleInfo?.[myRole];
  const RoleIcon = myRole ? ROLE_ICON[myRole] : Sparkles;
  const myRoleData = myRole ? ROLES.find((r) => r.id === myRole) : null;

  const headerGradient = crisis.category
    ? CATEGORY_GRADIENT[crisis.category]
    : "var(--gradient-warmth)";

  const bestChoice = crisis.choices.find((c) => c.id === crisis.bestChoiceId) ?? crisis.choices[0];
  const pickedChoice = picked ? crisis.choices.find((c) => c.id === picked) : null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-stretch overflow-y-auto bg-background/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
        <div className="surface-card overflow-hidden">
          {/* HEADER */}
          <header
            className="relative px-6 py-5 text-white md:px-8"
            style={{ backgroundImage: headerGradient }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="pill border-transparent bg-white/20 text-white">
                <AlertTriangle className="h-3 w-3" /> CRISIS ALERT · {crisis.severity}
              </span>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-mono text-sm tabular-nums",
                  urgency === "extreme" && "animate-pulse bg-white/30",
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
              </div>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
              {crisis.emoji ? <span className="mr-2">{crisis.emoji}</span> : null}
              {crisis.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/90">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {crisis.location}</span>
              {crisis.category && (
                <span className="inline-flex items-center gap-1 capitalize">· {crisis.category} crisis</span>
              )}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-linear",
                  urgency === "extreme" ? "bg-white" : "bg-white/90",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </header>

          {/* DECIDE PHASE */}
          {phase === "decide" && (
            <div className="grid gap-0 md:grid-cols-[1fr_320px]">
              <div className="space-y-5 p-6 md:p-7">
                <p className="text-sm leading-relaxed text-foreground/90">{crisis.brief}</p>

                <div className="space-y-2">
                  {crisis.choices.map((c, i) => {
                    const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
                    const tally = voteTally[c.id] ?? 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handlePick(c)}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all",
                          "hover:border-[color:var(--terra)] hover:shadow-sm",
                          optionLetter === "A" && "hover:border-[color:var(--terra)]",
                          optionLetter === "D" && "hover:border-destructive/60",
                        )}
                      >
                        <div
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-semibold",
                            optionLetter === "A" && "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]",
                            optionLetter === "D" && "bg-destructive/10 text-destructive",
                            (optionLetter === "B" || optionLetter === "C") && "bg-muted text-foreground",
                          )}
                        >
                          {optionLetter}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium">{c.label}</span>
                            <div className="flex items-center gap-2">
                              {mode === "multiplayer" && tally > 0 && (
                                <span className="pill chip-terra font-mono text-[10px]">{tally} vote{tally === 1 ? "" : "s"}</span>
                              )}
                              {c.cost ? <span className="pill chip-stone font-mono text-[10px]">-{c.cost} CAP</span> : null}
                              <span className="pill chip-stone font-mono text-[10px]">
                                {c.planetHealth} Hp
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{c.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {mode === "multiplayer" && lobbyId && (
                  <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Team vote in progress.</strong>{" "}
                    Picking an option casts your vote and locks it in for the team. Each role's pick
                    is visible above. {myVotes.length}/{players.length || 1} stakeholders voted.
                  </div>
                )}
              </div>

              {/* ROLE INFO SIDEBAR */}
              <aside className="border-t border-border bg-muted/30 p-6 md:border-l md:border-t-0">
                {myRoleData ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]">
                        <RoleIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Your stakeholder briefing
                        </div>
                        <div className="text-sm font-medium">{myRoleData.name}</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm leading-relaxed">
                      {myRoleInfo ?? "No private intel available for this role on this crisis."}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Choose a role to receive private intel on this crisis.</div>
                )}

                <button
                  onClick={() => setShowAllRoles((v) => !v)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showAllRoles ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showAllRoles ? "Hide all stakeholder briefings" : "Show all stakeholder briefings"}
                </button>

                {showAllRoles && (
                  <ul className="mt-3 space-y-2 text-xs">
                    {(Object.keys(crisis.roleInfo ?? {}) as RoleId[]).map((rid) => {
                      const RIcon = ROLE_ICON[rid];
                      const r = ROLES.find((x) => x.id === rid);
                      return (
                        <li key={rid} className="rounded-lg border border-border bg-card p-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <RIcon className="h-3 w-3" /> {r?.name ?? rid}
                          </div>
                          <div className="mt-1 leading-relaxed">{crisis.roleInfo?.[rid]}</div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </aside>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === "reveal" && <RevealPanel crisis={crisis} bestChoice={bestChoice} pickedChoice={pickedChoice} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function defaultChoice(c: Crisis): CrisisChoice { return c.choices[c.choices.length - 1]; }
function defaultLabel(c: Crisis): string { return defaultChoice(c).label; }

function RevealPanel({
  crisis, bestChoice, pickedChoice, onClose,
}: {
  crisis: Crisis;
  bestChoice: CrisisChoice;
  pickedChoice: CrisisChoice | null | undefined;
  onClose: () => void;
}) {
  const outcome = useGame((s) => s.crisisLog.find((o) => o.crisisId === crisis.id) ?? null);

  const statusLabel = outcome
    ? ({ excellent: "✅ Excellent Decision", good: "✅ Excellent Decision", neutral: "🟡 Acceptable Decision",
         poor: "❌ Not the Best Choice", critical: "❌ Not the Best Choice" } as const)[outcome.status]
    : "Outcome recorded";
  const verdictTone = outcome
    ? ({ excellent: "terra", good: "terra", neutral: "warmth", poor: "destructive", critical: "destructive" } as const)[outcome.status]
    : "terra";

  const stars = outcome
    ? ({ excellent: 5, good: 4, neutral: 3, poor: 2, critical: 1 } as const)[outcome.status]
    : 3;

  const isBestPick = pickedChoice?.id === crisis.bestChoiceId;

  return (
    <div className="space-y-5 p-6 md:p-8 animate-fade-in">
      {/* HERO, Your Decision + verdict + stars */}
      <div className={cn(
        "rounded-2xl border p-5 text-center",
        verdictTone === "terra" && "border-[color:var(--terra)]/30 bg-[color:var(--terra-soft)]/40",
        verdictTone === "warmth" && "border-[color:var(--warmth)]/30 bg-[color:var(--warmth)]/10",
        verdictTone === "destructive" && "border-destructive/30 bg-destructive/5",
      )}>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your decision</div>
        <div className="mt-2 font-display text-2xl font-semibold leading-tight">
          {pickedChoice?.label ?? `Default consequence, ${defaultLabel(crisis)}`}
        </div>
        <div className="mt-3 flex items-center justify-center gap-0.5" aria-label={`${stars} of 5 stars`}>
          {[1,2,3,4,5].map((n) => (
            <span key={n} className={cn("text-2xl leading-none", n <= stars ? "text-[color:var(--warmth)]" : "text-muted-foreground/30")}>★</span>
          ))}
        </div>
        <div className="mt-2 text-base font-semibold">{statusLabel}</div>
        {outcome && (
          <div className={cn("mt-2 font-mono text-lg font-semibold tabular-nums",
            outcome.capDelta >= 0 ? "text-[color:var(--terra-deep)]" : "text-destructive")}>
            {outcome.capDelta >= 0 ? "+" : ""}{outcome.capDelta} CAP awarded
          </div>
        )}
        {isBestPick && <div className="mt-1 inline-block pill chip-terra">★ Best available intervention</div>}
      </div>

      {/* WHY YOUR CHOICE MATTERS, from the Crisis Event Library */}
      {pickedChoice && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Why your choice matters</div>
          <div className="mt-1 font-display font-semibold">{pickedChoice.label}</div>
          <p className="mt-2 text-sm leading-relaxed">{pickedChoice.description}</p>
        </div>
      )}

      {/* BEST AVAILABLE INTERVENTION, from the Crisis Event Library */}
      {!isBestPick && (
        <div className="rounded-xl border border-[color:var(--terra)]/30 bg-[color:var(--terra-soft)]/50 p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">
            <Sparkles className="h-3.5 w-3.5" /> Best available intervention
          </div>
          <div className="mt-1 font-display font-semibold">{bestChoice.label}</div>
          <p className="mt-2 text-sm leading-relaxed">{bestChoice.description}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{crisis.bestReasoning}</p>
        </div>
      )}


      {/* CAP changes */}
      {outcome && outcome.capBreakdown.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Climate Action Points {outcome.capDelta >= 0 ? "earned" : "lost"}
            </div>
            <div className={cn("font-display text-2xl font-semibold tabular-nums",
              outcome.capDelta >= 0 ? "text-[color:var(--terra-deep)]" : "text-destructive")}>
              {outcome.capDelta >= 0 ? "+" : ""}{outcome.capDelta} CAP
            </div>
          </div>
          <ul className="mt-3 divide-y divide-border/60 text-sm">
            {outcome.capBreakdown.map((b, i) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">{b.label}</span>
                <span className={cn("font-mono font-semibold tabular-nums",
                  b.value >= 0 ? "text-[color:var(--terra-deep)]" : "text-destructive")}>
                  {b.value >= 0 ? "+" : ""}{b.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terra impact */}
      {outcome && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Terra impact</div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            <IndicatorRow label="Terra Health" before={outcome.planetHealthBefore} after={outcome.planetHealthAfter} />
            {(["climate","food","water","bio","economy"] as const).map((k) => (
              <IndicatorRow key={k}
                label={({climate:"Climate",food:"Food",water:"Water",bio:"Biodiversity",economy:"Economy"} as const)[k]}
                before={outcome.indicatorsBefore[k]} after={outcome.indicatorsAfter[k]} />
            ))}
          </ul>
        </div>
      )}

      {/* Stakeholder impact */}
      {outcome && (outcome.benefitedRoles.length > 0 || outcome.harmedRoles.length > 0) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stakeholder impact</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-[color:var(--terra-deep)]">Benefited</div>
              <ul className="mt-1 space-y-1 text-sm">
                {outcome.benefitedRoles.length === 0 ? <li className="text-muted-foreground text-xs">No clear winners.</li> :
                  outcome.benefitedRoles.map((r) => (
                    <li key={r}>✓ {ROLES.find((x) => x.id === r)?.name ?? r}</li>
                  ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-[color:var(--warmth)]">Negatively affected</div>
              <ul className="mt-1 space-y-1 text-sm">
                {outcome.harmedRoles.length === 0 ? <li className="text-muted-foreground text-xs">No groups harmed.</li> :
                  outcome.harmedRoles.map((r) => (
                    <li key={r}>⚠ {ROLES.find((x) => x.id === r)?.name ?? r}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Future consequences + butterfly */}
      {outcome && (outcome.futureConsequences.length > 0 || outcome.butterflyEffects.length > 0) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Future consequences</div>
          <ul className="mt-2 space-y-1 text-sm">
            {outcome.futureConsequences.map((t, i) => <li key={i}>• {t}</li>)}
          </ul>
          {outcome.butterflyEffects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {outcome.butterflyEffects.map((e, i) => (
                <span key={i} className={cn("pill", e.direction === "up" ? "chip-terra" : "chip-warmth")}>
                  {e.direction === "up" ? "↑" : "↓"} {e.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learning outcome */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Learning outcome
        </div>
        <p className="mt-2 text-sm leading-relaxed">{outcome?.insight ?? crisis.bestReasoning}</p>
      </div>

      {crisis.debrief && crisis.debrief.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Facilitator debrief</div>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            {crisis.debrief.map((q, i) => <li key={i}>{q}</li>)}
          </ol>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg bg-[image:var(--gradient-terra)] px-5 py-2 text-sm font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
        >
          Return to Terra
        </button>
      </div>
    </div>
  );
}

function IndicatorRow({ label, before, after }: { label: string; before: number; after: number }) {
  const delta = after - before;
  return (
    <li className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">
        {before} → <strong>{after}</strong>{" "}
        <span className={cn("ml-1 text-xs",
          delta > 0 ? "text-[color:var(--terra-deep)]" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </span>
    </li>
  );
}
