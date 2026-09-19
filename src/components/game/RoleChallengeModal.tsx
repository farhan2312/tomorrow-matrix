import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGame } from "@/lib/game/store";
import { ROLE_QUESTIONS } from "@/lib/game/roles";
import { ROLES } from "@/lib/game/data";
import { BookOpen, Check, X, Sparkles, Target, Award, Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RoleChallengeModal() {
  const pending = useGame((s) => s.pendingChallenge);
  const role = useGame((s) => s.role);
  const answer = useGame((s) => s.answerChallengeQuestion);
  const advance = useGame((s) => s.advanceChallenge);
  const skip = useGame((s) => s.skipCurrentQuestion);
  const dismiss = useGame((s) => s.dismissChallenge);
  const resultModalOpen = useGame((s) => s.resultModalOpen);
  const pendingPromotion = useGame((s) => s.pendingPromotion);

  const roleData = ROLES.find((r) => r.id === role);
  const currentQ = useMemo(() => {
    if (!pending) return null;
    const id = pending.questionIds[pending.cursor];
    return ROLE_QUESTIONS.find((q) => q.id === id) ?? null;
  }, [pending]);

  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; cap: number } | null>(null);
  // Interactive-question state: match = chosen def index per term (-1 = none);
  // order = current arrangement of the original option indices.
  const [matchAssign, setMatchAssign] = useState<number[]>([]);
  const [matchDefs, setMatchDefs] = useState<number[]>([]);   // display order of definitions
  const [orderArr, setOrderArr] = useState<number[]>([]);

  // Reset per-question UI whenever the cursor advances
  useEffect(() => {
    setSelected(null);
    setText("");
    setFeedback(null);
    // Seed interactive questions from the new current question.
    const q = pending && ROLE_QUESTIONS.find((x) => x.id === pending.questionIds[pending.cursor]);
    if (q?.kind === "match" && q.pairs) {
      setMatchAssign(new Array(q.pairs.length).fill(-1));
      setMatchDefs(shuffle(q.pairs.map((_, i) => i)));
    } else if (q?.kind === "order" && q.options) {
      setOrderArr(shuffle(q.options.map((_, i) => i)));
    }
  }, [pending?.cursor, pending?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wait for the mystery-result recap AND any promotion to close before
  // surfacing a bonus challenge. Otherwise the challenge modal opens on top of
  // (or under) those and leaves the page inert — the same collision the
  // promotion modal already guards against with resultModalOpen.
  if (!pending || !currentQ || resultModalOpen || pendingPromotion) return null;

  const totalQs = pending.questionIds.length;
  const stepN = pending.cursor + 1;
  const pct = Math.round((pending.cursor / totalQs) * 100);

  const onSubmit = () => {
    if (currentQ.kind === "reflection") {
      const r = answer(null, text);
      setFeedback({ correct: r.correct, cap: r.cap });
    } else if (currentQ.kind === "match") {
      if (matchAssign.some((v) => v < 0)) return;
      const correct = matchAssign.every((defIdx, termIdx) => defIdx === termIdx);
      const r = answer(null, undefined, correct);
      setFeedback({ correct: r.correct, cap: r.cap });
    } else if (currentQ.kind === "order") {
      const target = currentQ.correctOrder ?? [];
      const correct = orderArr.length === target.length && orderArr.every((v, i) => v === target[i]);
      const r = answer(null, undefined, correct);
      setFeedback({ correct: r.correct, cap: r.cap });
    } else {
      if (selected == null) return;
      const r = answer(selected, undefined);
      setFeedback({ correct: r.correct, cap: r.cap });
    }
  };

  const moveOrder = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= orderArr.length) return;
    setOrderArr((arr) => {
      const next = [...arr];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
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
          ) : currentQ.kind === "match" ? (
            <div className="space-y-2">
              {(currentQ.pairs ?? []).map((p, termIdx) => {
                const chosen = matchAssign[termIdx] ?? -1;
                const right = feedback && chosen === termIdx;
                const wrong = feedback && chosen !== termIdx;
                return (
                  <div key={termIdx} className={cn(
                    "flex flex-wrap items-center gap-2 rounded-xl border p-2.5 text-sm",
                    !feedback && "border-border bg-card",
                    right && "border-[color:var(--terra)] bg-[color:var(--terra-soft)]",
                    wrong && "border-destructive bg-destructive/10",
                  )}>
                    <span className="min-w-[96px] shrink-0 font-medium">{p.term}</span>
                    <span className="text-muted-foreground">→</span>
                    <select
                      value={chosen}
                      disabled={!!feedback}
                      onChange={(e) => setMatchAssign((a) => { const n = [...a]; n[termIdx] = Number(e.target.value); return n; })}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-card px-2 text-sm disabled:opacity-80"
                    >
                      <option value={-1} disabled>Choose…</option>
                      {matchDefs.map((defIdx) => (
                        <option key={defIdx} value={defIdx}>{(currentQ.pairs ?? [])[defIdx]?.def}</option>
                      ))}
                    </select>
                    {right && <Check className="h-4 w-4 shrink-0 text-[color:var(--terra-deep)]" />}
                    {wrong && <X className="h-4 w-4 shrink-0 text-destructive" />}
                    {wrong && <span className="w-full pl-[104px] text-[11px] text-[color:var(--terra-deep)]">Correct: {p.def}</span>}
                  </div>
                );
              })}
            </div>
          ) : currentQ.kind === "order" ? (
            <div className="space-y-2">
              {orderArr.map((optIdx, pos) => {
                const target = currentQ.correctOrder ?? [];
                const right = feedback && optIdx === target[pos];
                const wrong = feedback && optIdx !== target[pos];
                return (
                  <div key={optIdx} className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-sm",
                    !feedback && "border-border bg-card",
                    right && "border-[color:var(--terra)] bg-[color:var(--terra-soft)]",
                    wrong && "border-destructive bg-destructive/10",
                  )}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs">{pos + 1}</span>
                    <span className="min-w-0 flex-1">{(currentQ.options ?? [])[optIdx]}</span>
                    {!feedback && (
                      <div className="flex shrink-0 flex-col gap-0.5">
                        <button type="button" aria-label="Move up" onClick={() => moveOrder(pos, -1)} disabled={pos === 0}
                          className="grid h-5 w-6 place-items-center rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                        <button type="button" aria-label="Move down" onClick={() => moveOrder(pos, 1)} disabled={pos === orderArr.length - 1}
                          className="grid h-5 w-6 place-items-center rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                      </div>
                    )}
                    {right && <Check className="h-4 w-4 shrink-0 text-[color:var(--terra-deep)]" />}
                    {wrong && <X className="h-4 w-4 shrink-0 text-destructive" />}
                  </div>
                );
              })}
              {!feedback && <p className="text-[11px] text-muted-foreground">Use the arrows to arrange from first cause to final impact.</p>}
            </div>
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
                  disabled={
                    currentQ.kind === "reflection" ? text.trim().length < 3
                      : currentQ.kind === "match" ? matchAssign.some((v) => v < 0)
                      : currentQ.kind === "order" ? false
                      : selected == null
                  }
                  className="rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
                >
                  {currentQ.kind === "reflection" ? "Submit reflection" : "Submit answer"}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {currentQ.kind === "mcq" && "Correct +5 CAP · Incorrect +1 CAP"}
                {currentQ.kind === "scenario" && "Best answer +10 CAP · Other answer +5 CAP"}
                {(currentQ.kind === "match" || currentQ.kind === "order") && "All correct +10 CAP · Otherwise +3 CAP"}
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
  correct: boolean; cap: number; kind: "mcq" | "scenario" | "reflection" | "match" | "order";
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
