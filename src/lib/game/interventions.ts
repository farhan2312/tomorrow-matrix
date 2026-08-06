import type { Intervention, ExtEffectKey, IndicatorKey } from "./types";
import raw from "./interventions.data.json";

interface RawIntervention {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  categoryEmoji: string;
  cost: number;
  description: string;
  effects: Partial<Record<ExtEffectKey, number>>;
  linkedMysteries?: string[];
  ripple?: { code: string; name: string; explanation: string }[];
}

/** Map library category → legacy narrow category used by missions/dashboards. */
const CATEGORY_MAP: Record<string, Intervention["category"]> = {
  energy: "energy",
  water: "nature",
  food: "agriculture",
  nature: "nature",
  cities: "policy",
  economy: "policy",
  society: "policy",
  ai: "tech",
  systemic: "policy",
};

/** Map 12-indicator library keys → 5 core indicators used by the game math. */
function coreEffects(e: Partial<Record<ExtEffectKey, number>>): Partial<Record<IndicatorKey, number>> {
  const clim = (e.climate ?? 0) + (e.air ?? 0) * 0.4 + (e.forest ?? 0) * 0.2;
  const water = (e.water ?? 0) + (e.ocean ?? 0) * 0.5;
  const food = e.food ?? 0;
  const bio = (e.bio ?? 0) + (e.forest ?? 0) * 0.5 + (e.ocean ?? 0) * 0.3;
  const eco = (e.economy ?? 0) + (e.industrial ?? 0) * 0.4 + (e.energy ?? 0) * 0.3 + (e.community ?? 0) * 0.3;
  const out: Partial<Record<IndicatorKey, number>> = {};
  if (clim) out.climate = Math.round(clim);
  if (water) out.water = Math.round(water);
  if (food) out.food = Math.round(food);
  if (bio) out.bio = Math.round(bio);
  if (eco) out.economy = Math.round(eco);
  return out;
}

function shortRipple(r: RawIntervention): string {
  if (r.ripple && r.ripple.length > 0) {
    const first = r.ripple[0];
    return `${first.name} — ${first.explanation.split(".")[0]}`;
  }
  return `Ripples across ${r.linkedMysteries?.length ?? 0} linked mysteries`;
}

export const INTERVENTIONS: Intervention[] = (raw as RawIntervention[]).map((r) => ({
  id: r.id,
  name: r.name,
  category: CATEGORY_MAP[r.categoryId] ?? "policy",
  categoryId: r.categoryId,
  categoryLabel: r.categoryLabel,
  categoryEmoji: r.categoryEmoji,
  cost: r.cost,
  description: r.description,
  effects: coreEffects(r.effects),
  effects12: r.effects,
  planetHealth: r.effects.terra ?? 0,
  ripple: shortRipple(r),
  ripples: r.ripple ?? [],
  linkedMysteries: r.linkedMysteries ?? [],
}));

export const INTERVENTION_CATEGORIES: { id: string; label: string; emoji: string }[] = (() => {
  const seen = new Map<string, { id: string; label: string; emoji: string }>();
  for (const i of INTERVENTIONS) {
    const id = i.categoryId ?? "other";
    if (!seen.has(id)) seen.set(id, { id, label: i.categoryLabel ?? id, emoji: i.categoryEmoji ?? "•" });
  }
  return Array.from(seen.values());
})();
