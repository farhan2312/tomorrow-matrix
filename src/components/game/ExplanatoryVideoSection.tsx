import { useState } from "react";
import {
  Lock, Play, Sparkles, Coins, GraduationCap, Network, Zap,
  AlertTriangle, RotateCcw, ArrowRight, Film, Check,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { VideoPlayer } from "./VideoPlayer";
import { EXPLAINER_UNLOCK_COST, explainerVideo, extraMedia, learningPoints, mysteryCover } from "@/lib/game/media";
import { influencesOf, influencedBy } from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import type { Mystery } from "@/lib/game/types";

interface Props {
  mystery: Mystery;
  /** Notify multiplayer / facilitator analytics. */
  onEvent?: (kind: string, payload: Record<string, unknown>) => void;
  /** Force the player open (e.g. straight after the completion screen). */
  autoOpen?: boolean;
}

export function ExplanatoryVideoSection({ mystery, onEvent, autoOpen }: Props) {
  const media = explainerVideo(mystery);
  const extras = extraMedia(mystery.code);
  const cap = useGame((s) => s.cap);
  const mediaState = useGame((s) => s.mediaState[mystery.id]);
  const unlockWithCap = useGame((s) => s.unlockExplainerWithCap);
  const markWatched = useGame((s) => s.markExplainerWatched);
  const savePosition = useGame((s) => s.saveMediaPosition);

  const unlockSource = mediaState?.explainerUnlock ?? null;
  const unlocked = !!unlockSource;
  const [confirm, setConfirm] = useState(false);
  const [playing, setPlaying] = useState(!!autoOpen);
  const [finished, setFinished] = useState(false);

  const affordable = cap >= EXPLAINER_UNLOCK_COST;

  const doUnlock = () => {
    const ok = unlockWithCap(mystery.id, EXPLAINER_UNLOCK_COST);
    setConfirm(false);
    if (ok) {
      setPlaying(true);
      onEvent?.("explainer_unlocked", {
        mysteryId: mystery.id, code: mystery.code, source: "cap", cost: EXPLAINER_UNLOCK_COST,
      });
    }
  };

  // ------------------------------- LOCKED -------------------------------
  if (!unlocked) {
    return (
      <>
        <button
          onClick={() => setConfirm(true)}
          className="group surface-lift relative block w-full overflow-hidden text-left"
        >
          <div className="relative aspect-[16/7] w-full">
            <img
              src={media.poster ?? mysteryCover(mystery)}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover blur-[6px] brightness-[0.45] transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
            <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
                  <Lock className="h-5 w-5" />
                </span>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/70">
                  <Sparkles className="h-3 w-3" /> Locked
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold md:text-2xl">Unlock the Science</h3>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-white/75">
                  Solve the chain to earn this explanation, or want a hint? Unlock it now
                  using Climate Action Points.
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-4 py-2 text-xs font-semibold text-black">
                  <Coins className="h-3.5 w-3.5 text-[color:var(--warmth)]" />
                  Unlock for {EXPLAINER_UNLOCK_COST} CAP
                </span>
              </div>
            </div>
          </div>
        </button>

        <Dialog open={confirm} onOpenChange={setConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Unlock Explanation Video</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 pt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-[color:var(--terra-soft)]/40 p-3">
                    <Coins className="h-4 w-4 text-[color:var(--warmth)]" />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Cost</div>
                      <div className="font-display text-lg font-semibold text-foreground">
                        {EXPLAINER_UNLOCK_COST} Climate Action Points
                      </div>
                    </div>
                    <div className="ml-auto text-right text-xs">
                      <div className="text-muted-foreground">Balance</div>
                      <div className="font-mono text-foreground">{cap}</div>
                    </div>
                  </div>
                  <p>
                    Watching this video before solving the mystery will help you understand the
                    complete cause-and-effect chain, but it will cost Climate Action Points.
                  </p>
                  {!affordable && (
                    <p className="flex items-center gap-1.5 text-[color:var(--destructive)]">
                      <AlertTriangle className="h-3.5 w-3.5" /> Not enough CAP yet, solve a mystery to earn more.
                    </p>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={doUnlock}
                disabled={!affordable}
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Lock className="h-4 w-4" /> Unlock Video
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ------------------------------ UNLOCKED ------------------------------
  return (
    <div className="surface-lift overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--terra-deep)]">
            <Check className="h-3 w-3" />
            {unlockSource === "solve" ? "Unlocked by solving" : "Unlocked with CAP"}
          </div>
          <h3 className="mt-0.5 font-display text-lg font-semibold">See How It All Connects</h3>
          <p className="text-xs text-muted-foreground">
            Yours permanently, replay it any time, no further cost.
          </p>
        </div>
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Play className="h-4 w-4" /> Watch Explanation
          </button>
        )}
      </div>

      {playing && (
        <div className="p-4">
          <VideoPlayer
            src={media.src}
            poster={media.poster ?? mysteryCover(mystery)}
            captions={media.captions}
            title={media.title}
            autoPlay
            startAt={mediaState?.positions?.explainer ?? 0}
            onPosition={(s) => savePosition(mystery.id, "explainer", s)}
            onStarted={() => onEvent?.("explainer_watch_started", { mysteryId: mystery.id, code: mystery.code })}
            onEnded={() => {
              markWatched(mystery.id);
              setFinished(true);
              onEvent?.("explainer_watched", { mysteryId: mystery.id, code: mystery.code });
            }}
          />

          {finished && <PostVideoLearning mystery={mystery} onReplay={() => setFinished(false)} />}

          {extras.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Film className="h-3 w-3" /> More from this mystery
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {extras.map((x, i) => (
                  <div key={`${x.kind}-${i}`}>
                    <div className="mb-1 text-xs font-medium">{x.label ?? x.kind ?? "Extra"}</div>
                    <VideoPlayer
                      src={x.src}
                      poster={x.poster ?? mysteryCover(mystery)}
                      captions={x.captions}
                      title={x.title ?? x.label}
                      startAt={mediaState?.positions?.[`extra-${i}`] ?? 0}
                      onPosition={(s) => savePosition(mystery.id, `extra-${i}`, s)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostVideoLearning({ mystery, onReplay }: { mystery: Mystery; onReplay: () => void }) {
  const points = learningPoints(mystery);
  const downstream = influencesOf(mystery).slice(0, 4);
  const upstream = influencedBy(mystery).slice(0, 3);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-[color:var(--terra-soft)]/35 p-5 animate-[fade-in_320ms_ease-out]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--terra-deep)]">
        <GraduationCap className="h-3.5 w-3.5" /> Reflection
      </div>
      <h4 className="mt-1 font-display text-xl font-semibold">What did you learn?</h4>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Key learning points</div>
          <ul className="mt-1.5 space-y-1.5 text-sm">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--terra)]" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {(upstream.length > 0 || downstream.length > 0) && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Network className="h-3 w-3" /> Butterfly network connections
              </div>
              <ul className="mt-1.5 space-y-1 text-sm">
                {upstream.map((m) => (
                  <li key={`u-${m.id}`} className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-[color:var(--terra)]" />
                    <Link to="/play/mysteries/$id" params={{ id: m.id }} className="hover:underline">
                      Caused by {m.code} · {m.title}
                    </Link>
                  </li>
                ))}
                {downstream.map((m) => (
                  <li key={`d-${m.id}`} className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-[color:var(--warmth)]" />
                    <Link to="/play/mysteries/$id" params={{ id: m.id }} className="hover:underline">
                      Leads to {m.code} · {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!mystery.linkedInterventions?.length && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">Related interventions</div>
              <div className="mt-1 text-sm">{mystery.linkedInterventions.slice(0, 4).join(" · ")}</div>
            </div>
          )}
          {!!mystery.linkedCrises?.length && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--destructive)]">Related crisis events</div>
              <div className="mt-1 text-sm">{mystery.linkedCrises.slice(0, 4).join(" · ")}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replay video
        </button>
        <Link
          to="/play/network"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
        >
          <Network className="h-3.5 w-3.5" /> Explore Butterfly Network
        </Link>
        <Link
          to="/play"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2 text-xs font-medium text-white"
        >
          Continue journey <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
