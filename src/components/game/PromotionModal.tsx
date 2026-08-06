import { useGame } from "@/lib/game/store";
import { Award, Sparkles, Trophy } from "lucide-react";

export function PromotionModal() {
  const promo = useGame((s) => s.pendingPromotion);
  const dismiss = useGame((s) => s.dismissPromotion);
  if (!promo) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="surface-card w-full max-w-md overflow-hidden text-center animate-scale-in">
        <div className="bg-[image:var(--gradient-terra)] px-6 py-8 text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.25em] opacity-80">Congratulations</div>
          <h2 className="mt-1 font-display text-2xl font-semibold">You have been promoted</h2>
        </div>
        <div className="px-6 py-6">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">New title</div>
          <div className="mt-1 font-display text-2xl font-semibold text-[color:var(--terra-deep)]">{promo.to.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{promo.theme}</div>

          <ul className="mt-5 space-y-2 text-left text-sm">
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[color:var(--terra-deep)]" /> +{promo.bonus} Climate Action Points</li>
            <li className="flex items-center gap-2"><Award className="h-4 w-4 text-[color:var(--terra-deep)]" /> Level {promo.to.level} badge unlocked</li>
            <li className="flex items-center gap-2"><Trophy className="h-4 w-4 text-[color:var(--terra-deep)]" /> Profile banner updated</li>
          </ul>

          <button
            onClick={dismiss}
            className="mt-6 w-full rounded-lg bg-[image:var(--gradient-terra)] px-5 py-2 text-sm font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
