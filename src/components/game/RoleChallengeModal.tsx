import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGame } from "@/lib/game/store";
import { ROLE_QUESTIONS } from "@/lib/game/roles";
import { ROLES } from "@/lib/game/data";
import { BookOpen, Check, X, Sparkles, Target, Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleChallengeModal() {
  const pending = useGame((s) => s.pendingChallenge);
  const role = useGame((s) => s.role);
  const answer = useGame((s) => s.answerChallengeQuestion);
  const advance = useGame((s) => s.advanceChallenge);
  const skip = useGame((s) => s.skipCurrentQuestion);
  const dismiss = useGame((s) => s.dismissChallenge);

  const roleData = ROLES.find((r) => r.id === role);
  const currentQ = useMemo(() => {
    if (!pending) return null;
    const id = pending.questionIds[pending.cursor];
    return ROLE_QUESTIONS.find((q) => q.id === id) ?? null;
  }, [pending]);

  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; cap: number } | null>(null);

  // Reset per-question UI whenever the cursor advances
  useEffect(() => {
    setSelected(null);
    setText("");
    setFeedback(null);
  }, [pending?.cursor, pending?.kind]);

  if (!pending || !currentQ) return null;

  const totalQs = pending.questionIds.length;
  const stepN = pending.cursor + 1;
  const pct = Math.round((pending.cursor / totalQs) * 100);

  const onSubmit = () => {
    if (currentQ.kind === "reflection") {
      const r = answer(null, text);
      setFeedback({ correct: r.correct, cap: r.cap });
    } else {
      if (selected == null) return;
      const r = answer(selected, undefined);
      setFeedback({ correct: r.correct, cap: r.cap });
    }
  };

  const onContinue = () => {
    // Advance to the next question (or finish). The cursor-change effect clears
    // the local feedback/selection for the next question.
    setFeedback(null);
    advance();
  };

  const kindIcon =
    pending.kind === "orientation" ? <Sparkles className="h-3 w-3" /> :
    pending.kind === "mission" ? <Target className="h-3 w-3" /> :
    pending.kind === "assessment" ? <Trophy className="h-3 w-3" /> :
    <BookOpen className="h-3 w-3" />;

  return (
    <Dialog open onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="max-w-xl overflow-hidden border-border p-0 sm:rounded-2xl">
        {/* Header */}
        <div className="bg-[image:var(--gradient-terra)] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <span className="pill border-transparent bg-white/20 text-white">
              {kindIcon} {pending.title}
            </span>
            <span className="font-mono text-xs">
              {stepN} / {totalQs} · +{pending.baseBonus} CAP bonus
            </span>
          </div>
          <div className="mt-1 text-xs text-white/80">{roleData?.name ?? "Stakeholder"} · {pending.subtitle}</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold leading-snug">
            {currentQ.prompt}
          </h2>

          {currentQ.kind === "reflection" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={currentQ.placeholder ?? "Your reflection…"}
              rows={5}
              disabled={!!feedback}
              className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[color:var(--terra)] disabled:opacity-70"
            />
          ) : (
            <div className="space-y-2">
              {(currentQ.options ?? []).map((opt, i) => {
                const isSel = selected === i;
                const isAnswer = currentQ.correctIndex === i;
                // Once answered, reveal correctness: chosen option turns green/red,
                // and the right answer is highlighted even if it wasn't chosen.
                let tone: "idle" | "sel" | "correct" | "wrong" = "idle";
                if (feedback) tone = isSel ? (feedback.correct ? "correct" : "wrong") : (isAnswer ? "correct" : "idle");
                else if (isSel) tone = "sel";
                return (
                  <button
                    key={i}
                    onClick={() => { if (!feedback) setSelected(i); }}
                    disabled={!!feedback}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                      tone === "sel" && "border-[color:var(--terra)] bg-[color:var(--terra-soft)]",
                      tone === "idle" && "border-border bg-card" + (feedback ? " opacity-60" : " hover:border-[color:var(--terra)]"),
                      tone === "correct" && "border-[color:var(--terra)] bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]",
                      tone === "wrong" && "border-destructive bg-destructive/10 text-destructive",
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="flex-1">{opt}</span>
                    {tone === "correct" && <Check className="h-4 w-4 shrink-0 text-[color:var(--terra-deep)]" />}
                    {tone === "wrong" && <X className="h-4 w-4 shrink-0 text-destructive" />}
                  </button>
                );
              })}
            </div>
          )}

          {!feedback ? (
            <>
              <div className="flex items-center justify-between pt-1">
                <button onClick={skip} className="text-xs text-muted-foreground hover:text-foreground">
                  Skip question
                </button>
                <button
                  onClick={onSubmit}
                  disabled={currentQ.kind === "reflection" ? text.trim().length < 3 : selected == null}
                  className="rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
                >
                  {currentQ.kind === "reflection" ? "Submit reflection" : "Submit answer"}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {currentQ.kind === "mcq" && "Correct +5 CAP · Incorrect +1 CAP"}
                {currentQ.kind === "scenario" && "Best answer +10 CAP · Other answer +5 CAP"}
                {currentQ.kind === "reflection" && "Completing earns +5 CAP, no wrong answer."}
              </p>
            </>
          ) : (
            <ResultPanel
              correct={feedback.correct}
              cap={feedback.cap}
              kind={currentQ.kind}
              explanation={currentQ.explanation}
              isLast={pending.cursor + 1 >= totalQs}
              earnedCap={pending.earnedCap}
              correctMcq={pending.correctMcq}
              totalMcq={pending.totalMcq}
              onContinue={onContinue}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultPanel({
  correct, cap, kind, explanation, isLast, earnedCap, correctMcq, totalMcq, onContinue,
}: {
  correct: boolean; cap: number; kind: "mcq" | "scenario" | "reflection";
  explanation?: string; isLast: boolean; earnedCap: number; correctMcq: number; totalMcq: number;
  onContinue: () => void;
}) {
  // When the challenge has just been auto-finished, the modal already closes
  // (pendingChallenge becomes null). So this branch shows on intermediate questions only.
  if (isLast) {
    return (
      <div className="space-y-3 py-4 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[image:var(--gradient-terra)] text-white">
          <Award className="h-6 w-6" />
        </div>
        <div className="font-display text-xl font-semibold">Challenge complete</div>
        <div className="text-sm text-muted-foreground">
          You earned <span className="font-semibold text-foreground">+{earnedCap} CAP</span>
          {totalMcq > 0 && <> · MCQ score <span className="font-mono">{correctMcq}/{totalMcq}</span></>}
        </div>
        {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}
        <button
          onClick={onContinue}
          className="mt-1 inline-flex w-full justify-center rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white"
        >
          Finish
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-center">
      <div className={cn(
        "mx-auto grid h-12 w-12 place-items-center rounded-full",
        kind === "reflection"
          ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]"
          : correct
            ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]"
            : "bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]",
      )}>
        {kind === "reflection" ? <Check className="h-5 w-5" /> : correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </div>
      <div className="font-display text-lg font-semibold">
        {kind === "reflection" ? `Reflection recorded, +${cap} CAP` : correct ? `Correct, +${cap} CAP` : `Alternative answer, +${cap} CAP`}
      </div>
      {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}
      <button
        onClick={onContinue}
        className="mt-1 inline-flex w-full justify-center rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white"
      >
        Next question
      </button>
    </div>
  );
}
