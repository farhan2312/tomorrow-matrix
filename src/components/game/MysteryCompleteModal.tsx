import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, ArrowRight, TrendingUp, Globe2, Coins, PlayCircle } from "lucide-react";
import { SequenceCard } from "./SequenceCard";
import { IndicatorChangePanel } from "./IndicatorChangePanel";
import type { Mystery, SequenceStep } from "@/lib/game/types";
import { MYSTERIES, isMysteryUnlocked, computePayout } from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import { hasExplainerVideo } from "@/lib/game/media";

interface Props {
  open: boolean;
  mystery: Mystery;
  attempts: number;
  hintsUsed: number;
  alreadySolvedBefore: boolean;
  newlySolvedIds: string[];   // mysteries solved in this run (for unlock check)
  onContinue: () => void;
  onClose: () => void;
  /** Reveal the newly unlocked explanatory video on this page. */
  onWatchExplanation?: () => void;
}

const STAGE_DURATION = 900;

export function MysteryCompleteModal({
  open, mystery, attempts, hintsUsed, alreadySolvedBefore, newlySolvedIds, onContinue, onClose,
  onWatchExplanation,
}: Props) {

  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!open) { setStage(0); return; }
    const timers = [1, 2, 3, 4].map((s) =>
      setTimeout(() => setStage(s), s * STAGE_DURATION),
    );
    return () => timers.forEach(clearTimeout);
  }, [open, mystery.id]);

  const payout = computePayout(attempts, hintsUsed);
  const sequence: SequenceStep[] = mystery.sequence;

  // Compute which mysteries newly unlock thanks to this solve
  const newlyUnlocked = MYSTERIES.filter((m) =>
    !newlySolvedIds.includes(m.id) &&
    !isMysteryUnlocked(m.id, newlySolvedIds.filter((id) => id !== mystery.id)) &&
    isMysteryUnlocked(m.id, newlySolvedIds),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden border-border p-0 sm:rounded-2xl">
        <div className="relative bg-[image:var(--gradient-terra)] px-6 py-5 text-white">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-85">
            <Sparkles className="h-3 w-3" /> Mystery resolved
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold">{mystery.title}</h2>
          <div className="text-xs opacity-85">{mystery.region}</div>
        </div>

        <div className="space-y-5 p-6">
          {/* STAGE 1+, chain reveal */}
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">The system chain</div>
            <div className="flex flex-wrap items-center gap-2">
              {sequence.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    style={{
                      animationDelay: `${i * 110}ms`,
                      opacity: stage >= 1 ? undefined : 0,
                    }}
                    className={stage >= 1 ? "animate-[fade-in_350ms_ease-out_both]" : ""}
                  >
                    <SequenceCard step={s} positionIndex={i} size="sm" />
                  </div>
                  {i < sequence.length - 1 && (
                    <span
                      style={{ animationDelay: `${i * 110 + 60}ms`, opacity: stage >= 2 ? undefined : 0 }}
                      className={stage >= 2 ? "text-[color:var(--terra-deep)] animate-[fade-in_350ms_ease-out_both]" : "text-muted-foreground/30"}
                    >→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 3, CAP breakdown */}
          <div
            className={`grid gap-3 sm:grid-cols-2 transition-opacity duration-500 ${stage >= 3 ? "opacity-100" : "opacity-0"}`}
          >
            <div className="rounded-xl border border-border bg-[color:var(--terra-soft)]/50 p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">
                <Coins className="h-3 w-3" /> Climate Action Points
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-[color:var(--terra-deep)]">
                +{alreadySolvedBefore ? 0 : payout.total}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {alreadySolvedBefore ? (
                  "Already solved, no payout this time."
                ) : (
                  <>
                    Base {payout.base} (attempt {attempts})
                    {payout.penalty > 0 ? ` · −${payout.penalty} hints` : ""}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Terra impact
              </div>
              <div className="mt-2">
                <MysteryIndicatorDeltaInline />
              </div>
            </div>
          </div>

          {/* STAGE 4, unlocks */}
          <div
            className={`rounded-xl border border-border bg-muted/30 p-4 transition-opacity duration-500 ${stage >= 4 ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Globe2 className="h-3 w-3" /> Network effects
            </div>
            {newlyUnlocked.length > 0 ? (
              <div className="mt-2">
                <div className="text-sm">Newly unlocked:</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {newlyUnlocked.map((m) => (
                    <span key={m.id} className="pill chip-warmth">{m.title}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">
                {mystery.unlocks
                  ? `Building toward: ${mystery.unlocks}`
                  : "No new mysteries unlock from this one, but Terra Health rises."}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Stay here
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {onWatchExplanation && hasExplainerVideo(mystery.code) && (
                <button
                  onClick={onWatchExplanation}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <PlayCircle className="h-4 w-4 text-[color:var(--terra-deep)]" /> Unlock the Science
                </button>
              )}
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
              >
                Back to world map <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function MysteryIndicatorDeltaInline() {
  const delta = useGame((s) => s.lastMysteryDelta);
  if (!delta) {
    return <div className="text-sm text-muted-foreground">Indicators held steady.</div>;
  }
  return (
    <IndicatorChangePanel
      indicatorsBefore={delta.indicatorsBefore}
      indicatorsAfter={delta.indicatorsAfter}
      planetBefore={delta.planetBefore}
      planetAfter={delta.planetAfter}
      reasonByKey={delta.reasonByKey}
      showExtended={false}
    />
  );
}
