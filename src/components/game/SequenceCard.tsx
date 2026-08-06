import { type CSSProperties, forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { SequenceStep } from "@/lib/game/types";

// Tone → full-card gradient. The card title IS the artwork; no icons.
const TONE_BG: Record<SequenceStep["tone"], string> = {
  climate:  "linear-gradient(155deg, oklch(0.78 0.13 200), oklch(0.38 0.12 220))",
  heat:     "linear-gradient(155deg, oklch(0.82 0.16 60), oklch(0.50 0.20 25))",
  water:    "linear-gradient(155deg, oklch(0.78 0.12 220), oklch(0.38 0.13 240))",
  ice:      "linear-gradient(155deg, oklch(0.94 0.04 220), oklch(0.60 0.10 235))",
  bio:      "linear-gradient(155deg, oklch(0.80 0.13 150), oklch(0.40 0.13 155))",
  industry: "linear-gradient(155deg, oklch(0.58 0.04 260), oklch(0.26 0.04 260))",
  human:    "linear-gradient(155deg, oklch(0.80 0.11 40), oklch(0.46 0.12 28))",
  policy:   "linear-gradient(155deg, oklch(0.72 0.11 290), oklch(0.38 0.13 290))",
};

const TONE_LABEL: Record<SequenceStep["tone"], string> = {
  climate: "Climate", heat: "Heat", water: "Water", ice: "Cryosphere",
  bio: "Biosphere", industry: "Industry", human: "Human", policy: "Policy",
};

interface Props {
  step: SequenceStep;
  size?: "sm" | "md" | "lg";
  state?: "default" | "correct" | "wrong" | "hint";
  positionIndex?: number;
  className?: string;
  style?: CSSProperties;
  dragging?: boolean;
}

export const SequenceCard = forwardRef<HTMLDivElement, Props>(function SequenceCard(
  { step, size = "md", state = "default", positionIndex, className, style, dragging, ...rest },
  ref,
) {
  const dim =
    size === "sm" ? "h-28 w-20 text-[10px]" :
    size === "lg" ? "h-52 w-40 text-base" :
                    "h-40 w-28 text-xs";

  return (
    <div
      ref={ref}
      style={{ background: TONE_BG[step.tone], ...style }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border text-white shadow-lg transition-all select-none",
        dim,
        state === "correct" && "ring-2 ring-[color:var(--terra)] ring-offset-2 ring-offset-background",
        state === "wrong"   && "ring-2 ring-destructive ring-offset-2 ring-offset-background animate-pulse",
        state === "hint"    && "ring-2 ring-[color:var(--warmth)] ring-offset-2 ring-offset-background",
        dragging            && "scale-105 shadow-2xl rotate-[-1.5deg]",
        "border-white/15",
        className,
      )}
      {...rest}
    >
      {/* layered atmosphere */}
      <div className="pointer-events-none absolute inset-0 opacity-90 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(120% 60% at 30% 10%, rgba(255,255,255,0.45), transparent 55%)," +
            "radial-gradient(80% 60% at 80% 100%, rgba(0,0,0,0.55), transparent 60%)",
        }} />
      {/* faint texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 8px)",
        }} />

      {/* top chip */}
      <div className="relative flex items-center justify-between p-2">
        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider backdrop-blur-sm">
          {TONE_LABEL[step.tone]}
        </span>
        {typeof positionIndex === "number" && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-black/40 font-mono text-[10px] backdrop-blur-sm">
            {positionIndex + 1}
          </span>
        )}
      </div>

      {/* title — the artwork */}
      <div className="relative flex flex-1 items-end p-2.5">
        <div className={cn(
          "font-display font-semibold leading-tight drop-shadow-sm",
          size === "sm" ? "text-[11px]" : size === "lg" ? "text-lg" : "text-sm",
        )}>
          {step.label}
        </div>
      </div>

      {/* bottom shine */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
    </div>
  );
});
