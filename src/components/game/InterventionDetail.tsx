import { useMemo, useState, useEffect } from "react";
import type { Intervention, ExtEffectKey } from "@/lib/game/types";
import { MYSTERIES } from "@/lib/game/data";
import { cn } from "@/lib/utils";
import { Star, Check, X, ArrowRight, Loader2, Sparkles, Zap, Users, Target, BookOpen, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { artFor, CATEGORY_TINT } from "@/lib/game/intervention-art";
import { INTERVENTIONS } from "@/lib/game/data";
import { mysteryCover } from "@/lib/game/media";

const INDICATOR_META: Record<ExtEffectKey, { label: string; emoji: string }> = {
  terra:      { label: "Terra Health",             emoji: "🌍" },
  climate:    { label: "Climate Stability",        emoji: "🌡" },
  water:      { label: "Water Security",           emoji: "💧" },
  food:       { label: "Food Security",            emoji: "🌾" },
  bio:        { label: "Biodiversity",             emoji: "🌿" },
  community:  { label: "Community Resilience",     emoji: "🏙" },
  air:        { label: "Air Quality",              emoji: "🌬" },
  forest:     { label: "Forest Health",            emoji: "🌳" },
  ocean:      { label: "Ocean Health",             emoji: "🐟" },
  energy:     { label: "Energy Transition",        emoji: "⚡" },
  industrial: { label: "Industrial Sustainability", emoji: "🏭" },
  economy:    { label: "Economic Stability",       emoji: "💰" },
};

const ORDER: ExtEffectKey[] = [
  "climate", "water", "food", "bio",
  "community", "air", "forest", "ocean",
  "energy", "industrial", "economy", "terra",
];

const STAKEHOLDERS_BY_CATEGORY: Record<string, string[]> = {
  energy:   ["Policymakers", "Business Leaders", "Community Representatives"],
  water:    ["City Planners", "Farmers", "Community Representatives"],
  food:     ["Farmers", "Community Representatives", "Scientists"],
  nature:   ["Scientists", "Activists", "Farmers"],
  cities:   ["City Planners", "Community Representatives", "Policymakers"],
  economy:  ["Business Leaders", "Policymakers", "Community Representatives"],
  society:  ["Activists", "Students", "Community Representatives"],
  ai:       ["Scientists", "Policymakers", "Business Leaders"],
  systemic: ["Policymakers", "Scientists", "All stakeholders"],
};

const DIFFICULTY = (cost: number) =>
  cost <= 60 ? { label: "Foundational", dots: 1 }
  : cost <= 100 ? { label: "Moderate", dots: 2 }
  : cost <= 150 ? { label: "Ambitious", dots: 3 }
  : { label: "Legendary", dots: 4 };

export function InterventionDetail({
  intervention, cap, owned, onClose, onConfirm,
}: {
  intervention: Intervention | null;
  cap: number;
  owned: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);

  useEffect(() => { setConfirming(false); setJustPurchased(false); }, [intervention?.id]);

  const linkedMysteries = useMemo(() => {
    if (!intervention?.linkedMysteries) return [];
    return intervention.linkedMysteries
      .map((code) => MYSTERIES.find((m) => m.code === code))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [intervention]);

  const related = useMemo(() => {
    if (!intervention) return [];
    return INTERVENTIONS
      .filter((i) => i.id !== intervention.id && i.categoryId === intervention.categoryId)
      .slice(0, 3);
  }, [intervention]);

  if (!intervention) return null;
  const canAfford = cap >= intervention.cost;
  const effects = intervention.effects12 ?? {};
  const art = artFor(intervention.categoryId);
  const tint = CATEGORY_TINT[intervention.categoryId ?? ""] ?? "";
  const difficulty = DIFFICULTY(intervention.cost);
  const stakeholders = STAKEHOLDERS_BY_CATEGORY[intervention.categoryId ?? ""] ?? ["All stakeholders"];

  const handleConfirm = () => {
    setPurchasing(true);
    setTimeout(() => {
      onConfirm(intervention.id);
      setPurchasing(false);
      setJustPurchased(true);
      setTimeout(() => { setConfirming(false); onClose(); }, 1200);
    }, 500);
  };

  return (
    <Dialog open={!!intervention} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-slate-950 text-white border-white/10">
        {/* Cinematic hero */}
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center animate-[fade-in_0.6s_ease-out]"
            style={{ backgroundImage: `url(${art})` }} />
          <div className={cn("absolute inset-0 bg-gradient-to-b", tint)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur hover:bg-black/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-6">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/80">
                <span className="text-base">{intervention.categoryEmoji}</span>
                <span>{intervention.categoryLabel}</span>
                <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] text-white/90">
                  {intervention.id}
                </span>
              </div>
              <h2 className="font-display text-4xl font-semibold tracking-tight drop-shadow-lg">
                {intervention.name}
              </h2>
            </div>
            <div className="shrink-0 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 px-4 py-3 shadow-2xl ring-2 ring-amber-200/40">
              <div className="flex items-center gap-1.5 font-display text-3xl font-bold tabular-nums text-amber-950">
                <Star className="h-5 w-5 fill-amber-950" strokeWidth={0} />
                {intervention.cost}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-900/80">
                CAP
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 md:p-8">
          {/* Description */}
          <section className="animate-[fade-in_0.5s_ease-out]">
            <SectionTitle icon={<BookOpen className="h-3.5 w-3.5" />}>Strategic Overview</SectionTitle>
            <p className="mt-2 text-base leading-relaxed text-white/85">{intervention.description}</p>
          </section>

          {/* Planetary Indicator Matrix */}
          <section className="animate-[fade-in_0.6s_ease-out]">
            <SectionTitle icon={<Zap className="h-3.5 w-3.5" />}>Planetary Indicator Matrix</SectionTitle>
            <p className="mt-1 text-xs text-white/60">
              How this intervention shifts Terra's twelve vital signs.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {ORDER.map((k) => {
                const v = effects[k] ?? 0;
                const tone = v > 0 ? "up" : v < 0 ? "down" : "flat";
                const mag = Math.min(Math.abs(v), 20) / 20;
                return (
                  <div
                    key={k}
                    className={cn(
                      "relative overflow-hidden rounded-xl border p-3 backdrop-blur",
                      tone === "up" && "border-emerald-400/30 bg-emerald-500/10",
                      tone === "down" && "border-red-400/30 bg-red-500/10",
                      tone === "flat" && "border-white/10 bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{INDICATOR_META[k].emoji}</span>
                        <span className="truncate text-xs font-medium text-white/90">
                          {INDICATOR_META[k].label}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-display text-base font-bold tabular-nums",
                          tone === "up" && "text-emerald-300",
                          tone === "down" && "text-red-300",
                          tone === "flat" && "text-white/40",
                        )}
                      >
                        {tone === "up" ? "▲" : tone === "down" ? "▼" : "-"}
                        {v !== 0 && <span className="ml-1">{Math.abs(v)}</span>}
                      </span>
                    </div>
                    {tone !== "flat" && (
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={cn(
                            "h-full transition-all duration-700",
                            tone === "up" ? "bg-emerald-400" : "bg-red-400",
                          )}
                          style={{ width: `${mag * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ripple Effects */}
          {intervention.ripples && intervention.ripples.length > 0 && (
            <section className="animate-[fade-in_0.7s_ease-out]">
              <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />}>
                Ripple Effects Across Terra
              </SectionTitle>
              <p className="mt-1 text-xs text-white/60">
                How this intervention breaks each linked mystery's crisis chain.
              </p>
              <div className="mt-4 space-y-2">
                {intervention.ripples.map((r) => {
                  const mystery = linkedMysteries.find((m) => m.code === r.code);
                  return (
                    <div key={r.code} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur transition-colors hover:bg-white/10">
                      {mystery && (
                        <div className="flex items-center gap-3 border-b border-white/10 bg-black/30 p-3">
                          <img src={mysteryCover(mystery)} alt="" className="h-12 w-16 rounded-lg object-cover ring-1 ring-white/10" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                              {r.code} · Tier {mystery.tier}
                            </div>
                            <div className="truncate font-display text-base font-semibold">
                              {mystery.title}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-emerald-300" />
                        </div>
                      )}
                      <p className="p-3 text-sm leading-relaxed text-white/80">{r.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Stakeholders + Difficulty grid */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <SectionTitle icon={<Users className="h-3.5 w-3.5" />}>Stakeholders Benefiting</SectionTitle>
              <ul className="mt-2 space-y-1.5">
                {stakeholders.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <SectionTitle icon={<Target className="h-3.5 w-3.5" />}>Implementation Difficulty</SectionTitle>
              <div className="mt-2 flex items-center gap-2">
                {[1,2,3,4].map((n) => (
                  <span key={n} className={cn(
                    "h-3 w-8 rounded-full",
                    n <= difficulty.dots ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-white/10",
                  )} />
                ))}
              </div>
              <div className="mt-2 font-display text-lg font-semibold">{difficulty.label}</div>
              <p className="mt-1 text-xs text-white/60">
                {difficulty.dots === 1 && "Achievable with local coordination and modest funding."}
                {difficulty.dots === 2 && "Requires cross-sector cooperation and multi-year commitment."}
                {difficulty.dots === 3 && "Demands systemic policy shifts and significant capital deployment."}
                {difficulty.dots === 4 && "A civilisational-scale undertaking with generational impact."}
              </p>
            </div>
          </section>

          {/* Educational Insight */}
          <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-5 animate-[fade-in_0.8s_ease-out]">
            <SectionTitle icon={<BookOpen className="h-3.5 w-3.5" />}>Educational Insight</SectionTitle>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              This intervention operates as a systems lever: its {intervention.ripples?.length ?? 0} ripple
              connection{intervention.ripples?.length === 1 ? "" : "s"} across the Butterfly Network mean the
              gains compound beyond its immediate indicator effects. Systems thinkers call this a{" "}
              <em>leverage point</em>, a small, well-placed shift that reshapes many downstream outcomes.
            </p>
          </section>

          {/* Related Interventions */}
          {related.length > 0 && (
            <section className="animate-[fade-in_0.9s_ease-out]">
              <SectionTitle icon={<TrendingUp className="h-3.5 w-3.5" />}>Suggested Next Purchases</SectionTitle>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {related.map((r) => (
                  <div key={r.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-white/50">{r.id}</div>
                        <div className="truncate font-display text-sm font-semibold">{r.name}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                        ⭐ {r.cost}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">{r.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky purchase footer */}
        <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl">
          {justPurchased ? (
            <div className="flex items-center justify-center gap-2 py-2 text-emerald-300 animate-[scale-in_0.4s_ease-out]">
              <Sparkles className="h-5 w-5" />
              <span className="font-display text-lg font-semibold">Ripples propagating across the network…</span>
            </div>
          ) : !confirming ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                You have <span className="font-mono font-semibold text-white">{cap} CAP</span>
                {!owned && (
                  <> · After purchase: <span className="font-mono font-semibold text-white">{cap - intervention.cost} CAP</span></>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10">
                  Close
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  disabled={owned || !canAfford}
                  className={cn(
                    "rounded-xl px-6 py-2.5 text-sm font-semibold transition",
                    owned
                      ? "cursor-default bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                      : canAfford
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-lg hover:brightness-110"
                        : "cursor-not-allowed bg-white/10 text-white/40",
                  )}
                >
                  {owned ? (<><Check className="mr-1 inline h-4 w-4" /> Invested</>)
                    : canAfford ? "Deploy intervention"
                    : "Not enough CAP"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-white/90">
                Deploy <span className="font-semibold">{intervention.name}</span> for{" "}
                <span className="font-mono font-semibold text-amber-300">{intervention.cost} CAP</span>?
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirming(false)} disabled={purchasing}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10">
                  <X className="mr-1 inline h-4 w-4" /> Cancel
                </button>
                <button onClick={handleConfirm} disabled={purchasing}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-sm font-semibold text-amber-950 shadow-lg hover:brightness-110 disabled:opacity-70">
                  {purchasing ? (<><Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> Deploying…</>)
                    : (<><Check className="mr-1 inline h-4 w-4" /> Confirm deployment</>)}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
      {icon}
      {children}
    </div>
  );
}
