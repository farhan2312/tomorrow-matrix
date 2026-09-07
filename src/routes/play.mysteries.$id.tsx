import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Lock, MapPin, Sparkles, Star, ArrowRight, ArrowLeftRight, Zap, AlertTriangle, Film, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole,
  roleRelationship, bonusForRole, influencesOf, influencedBy, ROLES,
} from "@/lib/game/data";
import { hasIntroVideo } from "@/lib/game/media";
import { useGame } from "@/lib/game/store";
import { useLobby } from "@/lib/multiplayer/store";
import { getClientId } from "@/lib/multiplayer/identity";
import { pushEvent } from "@/lib/multiplayer/api.functions";
import { CardSequencer } from "@/components/game/CardSequencer";
import { runTourOnce } from "@/lib/tour";
import { logEvent } from "@/lib/analytics";
import { AiTeamPanel } from "@/components/game/AiTeamPanel";
import { MysteryCompleteModal } from "@/components/game/MysteryCompleteModal";
import { MysteryIntroOverlay } from "@/components/game/MysteryIntroOverlay";
import { ExplanatoryVideoSection } from "@/components/game/ExplanatoryVideoSection";

export const Route = createFileRoute("/play/mysteries/$id")({
  loader: ({ params }) => {
    const mystery = MYSTERIES.find((m) => m.id === params.id);
    if (!mystery) throw notFound();
    return { mystery };
  },
  component: MysteryDetail,
});


function MysteryDetail() {
  const { mystery } = Route.useLoaderData();
  const navigate = useNavigate();
  const solvedMysteries = useGame((s) => s.solvedMysteries);
  const solveMystery = useGame((s) => s.solveMystery);
  const mode = useGame((s) => s.mode);
  const role = useGame((s) => s.role);
  const lobbyId = useLobby((s) => s.lobbyId);
  const broadcast = useServerFn(pushEvent);
  const alreadySolved = solvedMysteries.includes(mystery.id);
  const unlocked = isMysteryUnlocked(mystery.id, solvedMysteries);

  // First time on a mystery: coach-mark the sequence puzzle.
  useEffect(() => {
    if (!unlocked) return;
    const t = setTimeout(() => {
      runTourOnce("tm-tour-mystery-v1", [
        {
          element: '[data-tour="sequencer"]',
          popover: {
            title: "Solve the chain",
            description:
              "Drag these cards into the correct order, first cause to final impact, then hit Validate. Stuck? Use a Hint.",
          },
        },
      ]);
    }, 700);
    return () => clearTimeout(t);
  }, [unlocked]);
  const visible = isMysteryVisibleForRole(role, mystery);
  const rel = roleRelationship(role, mystery);
  const bonus = bonusForRole(role, mystery);
  const downstream = influencesOf(mystery);
  const upstream = influencedBy(mystery);

  const [completion, setCompletion] = useState<null | {
    attempts: number; hintsUsed: number; newlySolvedIds: string[];
  }>(null);
  const startedAtRef = useRef<number>(Date.now());

  // ---------------------------- Intro video ----------------------------
  const autoplayIntro = useGame((s) => s.autoplayIntro);
  const mediaState = useGame((s) => s.mediaState[mystery.id]);
  
  const introExists = hasIntroVideo(mystery.code);
  const seenIntro = !!(mediaState?.introWatched || mediaState?.introSkipped);
  const [introOpen, setIntroOpen] = useState(false);
  const [explainerAuto, setExplainerAuto] = useState(false);

  const emit = (kind: string, payload: Record<string, unknown>) => {
    if (mode !== "multiplayer" || !lobbyId) return;
    broadcast({ data: { lobbyId, clientId: getClientId(), kind, payload } }).catch(() => {});
  };

  // Auto-play the intro on entering the mystery (unless disabled after first watch).
  useEffect(() => {
    setIntroOpen(introExists && !alreadySolved && (autoplayIntro || !seenIntro));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mystery.id]);

  // Facilitator video commands (multiplayer only), force play / skip / replay.
  const events = useLobby((s) => s.events);
  const lastVideoCmd = useMemo(
    () => events.find((e) => e.kind === "video_cmd"),
    [events],
  );
  const handledCmdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lastVideoCmd || handledCmdRef.current === lastVideoCmd.id) return;
    handledCmdRef.current = lastVideoCmd.id;
    const action = (lastVideoCmd.payload as { action?: string })?.action;
    if (action === "play_intro" || action === "replay_intro") setIntroOpen(true);
    if (action === "skip_intro") setIntroOpen(false);
  }, [lastVideoCmd]);

  // Broadcast that the player opened this mystery (once per mount, only if unsolved).
  useEffect(() => {
    startedAtRef.current = Date.now();
    if (mode === "multiplayer" && lobbyId && !alreadySolved && unlocked) {
      broadcast({ data: {
        lobbyId, clientId: getClientId(),
        kind: "mystery_started",
        payload: { mysteryId: mystery.id, tier: mystery.tier, startedAt: startedAtRef.current },
      } }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mystery.id]);

  const onAttempt = (info: {
    attempt: number; correct: boolean; wrongCount: number;
    order: string[]; hintsUsed: number; timeMs: number;
  }) => {
    if (mode !== "multiplayer" || !lobbyId) return;
    broadcast({ data: {
      lobbyId, clientId: getClientId(),
      kind: "mystery_attempt",
      payload: { mysteryId: mystery.id, tier: mystery.tier, ...info },
    } }).catch(() => {});
  };

  const onSolved = ({ attempts, hintsUsed }: { attempts: number; hintsUsed: number }) => {
    const totalTimeMs = Date.now() - startedAtRef.current;
    if (!alreadySolved) {
      solveMystery(mystery.id, attempts, hintsUsed);
      logEvent("mystery_solved", { code: mystery.code, tier: mystery.tier, attempts, hintsUsed });
      if (mode === "multiplayer" && lobbyId) {
        broadcast({ data: {
          lobbyId, clientId: getClientId(),
          kind: "mystery_solved",
          payload: { mysteryId: mystery.id, tier: mystery.tier, attempts, hintsUsed, totalTimeMs },
        } }).catch(() => {});
        emit("explainer_unlocked", { mysteryId: mystery.id, code: mystery.code, source: "solve" });
      }
    }
    setCompletion({
      attempts,
      hintsUsed,
      newlySolvedIds: alreadySolved ? solvedMysteries : [...solvedMysteries, mystery.id],
    });
  };


  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <Link to="/play" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> World map
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Hero */}
          <div className="surface-lift relative overflow-hidden">
            <div className="relative aspect-[16/9] w-full">
              <img src={mystery.image} alt={mystery.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-1.5">
                <span className="pill chip-warmth"><Sparkles className="h-3 w-3" />{mystery.rarity}</span>
                <span className="pill bg-white/85 text-foreground border-white/50 backdrop-blur-sm">{mystery.code} · Tier {mystery.tier}</span>
                {rel === "primary" && (
                  <span className="pill bg-[color:var(--warmth)] text-white border-transparent">
                    <Star className="h-3 w-3" /> Primary role · +{bonus} CAP bonus
                  </span>
                )}
                {rel === "secondary" && (
                  <span className="pill bg-white/85 text-foreground border-white/50 backdrop-blur-sm">Secondary role</span>
                )}
                {!visible && role && (
                  <span className="pill bg-black/70 text-white border-transparent"><AlertTriangle className="h-3 w-3" /> Outside your role</span>
                )}
                {alreadySolved && <span className="pill bg-[color:var(--terra)] text-white border-transparent"><Check className="h-3 w-3" /> Solved</span>}
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-1.5 text-xs opacity-85"><MapPin className="h-3.5 w-3.5" />{mystery.region}</div>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-4xl">{mystery.title}</h1>
                <p className="mt-1.5 max-w-2xl text-sm opacity-90">{mystery.brief}</p>
              </div>
            </div>
          </div>

          {/* Sequencer */}
          <div data-tour="sequencer" className="surface-lift p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">System chain puzzle</h2>
                <p className="text-xs text-muted-foreground">Arrange the climate story, first cause to final impact.</p>
              </div>
              <div className="flex items-center gap-2">
                {introExists && (
                  <button
                    onClick={() => setIntroOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Replay intro
                  </button>
                )}
                <span className="pill chip-terra">up to {mystery.reward} CAP</span>
              </div>
            </div>

            {!unlocked ? (
              <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                <Lock className="h-5 w-5" />
                Locked. Solve prerequisite mysteries first.
              </div>
            ) : (
              <CardSequencer
                canonical={mystery.sequence}
                hints={mystery.hints ?? []}
                onSolved={onSolved}
                onAttempt={onAttempt}
                alreadySolved={alreadySolved}
              />
            )}
          </div>

          {/* Explanatory video, locked until solved (or unlocked with CAP) */}
          <div id="mystery-explainer">

            <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Film className="h-3 w-3" /> Mystery explanation
            </div>
            <ExplanatoryVideoSection mystery={mystery} onEvent={emit} autoOpen={explainerAuto} />
          </div>
        </div>


        <aside className="space-y-4">
          <AiTeamPanel context={mystery.category} contextKey={mystery.id} />
          <div className="surface-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Scoring</div>
            <ul className="mt-2 space-y-1 text-xs text-foreground/80">
              <li>· 1st attempt: <span className="font-mono text-[color:var(--terra-deep)]">100 CAP</span></li>
              <li>· 2nd attempt: <span className="font-mono">80</span> · 3rd: <span className="font-mono">60</span></li>
              <li>· 4th: <span className="font-mono">40</span> · 5th+: <span className="font-mono">20</span></li>
              <li>· Each hint used: <span className="font-mono text-[color:var(--warmth)]">−10 CAP</span></li>
            </ul>
          </div>
          {mystery.unlocksList && mystery.unlocksList.length > 0 && (
            <div className="surface-card p-4">
              <div className="text-xs uppercase tracking-wider text-[color:var(--terra-deep)]">Unlocks on solve</div>
              <ul className="mt-1 space-y-0.5 text-sm">
                {(mystery.unlocksList ?? []).slice(0, 4).map((u: string) => <li key={u}>· {u}</li>)}
              </ul>
            </div>
          )}

          {/* Influences (butterfly effect) */}
          <div className="surface-card p-4">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Butterfly effect
            </div>
            {upstream.length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Influenced by</div>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {upstream.slice(0, 4).map((m) => (
                    <li key={m.id} className="flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-[color:var(--terra)]" />
                      <Link to="/play/mysteries/$id" params={{ id: m.id }} className="hover:underline">
                        {m.code} · {m.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {downstream.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">This influences</div>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {downstream.slice(0, 4).map((m) => (
                    <li key={m.id} className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-[color:var(--warmth)]" />
                      <Link to="/play/mysteries/$id" params={{ id: m.id }} className="hover:underline">
                        {m.code} · {m.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {upstream.length === 0 && downstream.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">Root cause, no upstream mysteries yet.</p>
            )}
            {mystery.butterfly && mystery.butterfly.length > 1 && (
              <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
                Chain: {mystery.butterfly.join(" → ")}
              </div>
            )}
          </div>

          {/* Role lens */}
          <div className="surface-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Stakeholder lens</div>
            <div className="mt-2 space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[color:var(--warmth)]">Primary</span>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {mystery.primaryRoles.map((r: string) => {
                    const rd = ROLES.find((x) => x.id === r);
                    return <span key={r} className="pill chip-warmth text-[10px]">{rd?.name ?? r}</span>;
                  })}
                </div>
              </div>
              {mystery.secondaryRoles.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Secondary</span>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {mystery.secondaryRoles.map((r: string) => {
                      const rd = ROLES.find((x) => x.id === r);
                      return <span key={r} className="pill chip-stone text-[10px]">{rd?.name ?? r}</span>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(mystery.linkedCrises?.length || mystery.linkedInterventions?.length) ? (
            <div className="surface-card p-4 text-xs">
              {mystery.linkedCrises?.length ? (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--destructive)]">Linked crises</div>
                  <div className="mt-1">{mystery.linkedCrises.join(" · ")}</div>
                </div>
              ) : null}
              {mystery.linkedInterventions?.length ? (
                <div className="mt-2">
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">Linked interventions</div>
                  <div className="mt-1">{mystery.linkedInterventions.join(" · ")}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <MysteryIntroOverlay
        mystery={mystery}
        open={introOpen}
        onDone={({ skipped }) => {
          setIntroOpen(false);
          emit(skipped ? "intro_skipped" : "intro_watched", { mysteryId: mystery.id, code: mystery.code });
        }}
      />


      {completion && (
        <MysteryCompleteModal
          open
          mystery={mystery}
          attempts={completion.attempts}
          hintsUsed={completion.hintsUsed}
          alreadySolvedBefore={alreadySolved}
          newlySolvedIds={completion.newlySolvedIds}
          onContinue={() => { setCompletion(null); navigate({ to: "/play" }); }}
          onClose={() => setCompletion(null)}
          onWatchExplanation={() => {
            setCompletion(null);
            setExplainerAuto(true);
            requestAnimationFrame(() => {
              document.getElementById("mystery-explainer")?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
          }}
        />
      )}

    </main>
  );
}
