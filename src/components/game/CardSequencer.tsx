import { useMemo, useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent, DragOverlay, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, arrayMove, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import type { SequenceStep } from "@/lib/game/types";
import { SequenceCard, cardMediaKey } from "./SequenceCard";
import { resolveMedia } from "@/lib/media-overrides";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SortableCell({
  step, index, status, onExpand,
}: {
  step: SequenceStep; index: number; status: "default" | "correct" | "wrong" | "hint"; onExpand?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
      <SequenceCard step={step} positionIndex={index} state={status} onExpand={onExpand} />
    </div>
  );
}

/** Full-size, readable view of a single card. */
function CardLightbox({ step, onClose }: { step: SequenceStep; onClose: () => void }) {
  const k = cardMediaKey(step.id);
  const src = step.image ? (k ? resolveMedia(k, step.image) : step.image) : undefined;
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-6 backdrop-blur-sm animate-[fade-in_150ms_ease-out]"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {src ? (
          <img src={src} alt={step.label || "card"} className="max-h-[80vh] w-auto rounded-2xl border border-white/15 shadow-2xl" />
        ) : (
          <div className="w-[min(90vw,420px)]"><SequenceCard step={step} size="lg" /></div>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-lg hover:scale-105"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export interface CardSequencerProps {
  canonical: SequenceStep[];
  hints?: string[];
  onSolved: (info: { attempts: number; hintsUsed: number }) => void;
  onAttempt?: (info: {
    attempt: number;
    correct: boolean;
    wrongCount: number;
    order: string[];
    hintsUsed: number;
    timeMs: number;
  }) => void;
  alreadySolved?: boolean;
}

export function CardSequencer({ canonical, hints = [], onSolved, onAttempt, alreadySolved }: CardSequencerProps) {
  const [order, setOrder] = useState<SequenceStep[]>(() => shuffle(canonical));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [check, setCheck] = useState<null | { correct: boolean; wrongIds: string[] }>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solved, setSolved] = useState(alreadySolved ?? false);
  const [expanded, setExpanded] = useState<SequenceStep | null>(null);
  const [startedAt] = useState(() => Date.now());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activeStep = useMemo(() => order.find((s) => s.id === activeId) ?? null, [order, activeId]);
  const currentHint = hintsUsed > 0 ? hints[Math.min(hintsUsed - 1, hints.length - 1)] : null;
  const hintTargetId = hintsUsed > 0 && check && check.wrongIds.length > 0 ? check.wrongIds[0] : null;

  function handleDragStart(e: DragStartEvent) { setActiveId(String(e.active.id)); }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.findIndex((s) => s.id === active.id);
    const newIdx = order.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setOrder(arrayMove(order, oldIdx, newIdx));
    setCheck(null);
  }

  function validate() {
    const wrongIds: string[] = [];
    order.forEach((s, i) => { if (canonical[i].id !== s.id) wrongIds.push(s.id); });
    const correct = wrongIds.length === 0;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setCheck({ correct, wrongIds });
    onAttempt?.({
      attempt: nextAttempts,
      correct,
      wrongCount: wrongIds.length,
      order: order.map((s) => s.id),
      hintsUsed,
      timeMs: Date.now() - startedAt,
    });
    if (correct) {
      setSolved(true);
      setTimeout(() => onSolved({ attempts: nextAttempts, hintsUsed }), 600);
    }
  }

  function useHint() {
    if (hintsUsed >= hints.length) return;
    setHintsUsed((h) => h + 1);
    // Run a silent validation so we can highlight a wrong card position
    const wrongIds: string[] = [];
    order.forEach((s, i) => { if (canonical[i].id !== s.id) wrongIds.push(s.id); });
    if (wrongIds.length > 0) setCheck({ correct: false, wrongIds });
  }

  function reshuffle() { setOrder(shuffle(canonical)); setCheck(null); }

  if (solved) {
    return (
      <div className="rounded-2xl border border-[color:var(--terra)]/40 bg-[color:var(--terra-soft)]/50 p-6 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-[color:var(--terra-deep)]" />
        <div className="mt-2 font-display text-lg font-semibold text-[color:var(--terra-deep)]">Chain validated!</div>
        <div className="text-xs text-muted-foreground">Your results are ready, see the recap.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={order.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3 md:p-4">
            <div className="flex flex-wrap items-start justify-center gap-2 md:gap-3">
              {order.map((s, i) => {
                let status: "default" | "correct" | "wrong" | "hint" = "default";
                if (check) status = check.wrongIds.includes(s.id) ? "wrong" : "correct";
                if (hintTargetId === s.id) status = "hint";
                return <SortableCell key={s.id} step={s} index={i} status={status} onExpand={() => setExpanded(s)} />;
              })}
            </div>
            <p className="mt-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
              Arrange the climate story, first cause to final impact.
            </p>
          </div>
        </SortableContext>
        <DragOverlay>{activeStep ? <SequenceCard step={activeStep} dragging /> : null}</DragOverlay>
      </DndContext>

      {/* Hint panel */}
      {currentHint && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--warmth)]/30 bg-[color:var(--warmth-soft)]/60 p-3 text-sm">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--warmth)]" />
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--warmth)]">
              Hint {hintsUsed} · −{hintsUsed * 10} CAP
            </div>
            <div className="text-foreground/80">{currentHint}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={reshuffle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Shuffle
          </button>
          <button
            onClick={useHint}
            disabled={hintsUsed >= hints.length || hints.length === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              hintsUsed >= hints.length || hints.length === 0
                ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/60"
                : "border-[color:var(--warmth)]/40 bg-[color:var(--warmth-soft)] text-[color:var(--warmth)] hover:bg-[color:var(--warmth)]/15",
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {hintsUsed >= hints.length
              ? "All hints used"
              : `Hint ${hintsUsed + 1}/${hints.length} (−10 CAP)`}
          </button>
        </div>

        <div className={cn("text-xs", check?.correct === false ? "text-destructive" : "text-muted-foreground")}>
          {attempts > 0 && (
            <span>
              {check?.correct === false && `${check.wrongIds.length} out of place · `}
              Attempt {attempts}
            </span>
          )}
        </div>

        <button
          onClick={validate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4" /> Validate sequence
        </button>
      </div>

      {expanded && <CardLightbox step={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
