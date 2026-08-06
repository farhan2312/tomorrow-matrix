import energy from "@/assets/interventions/energy.jpg";
import water from "@/assets/interventions/water.jpg";
import food from "@/assets/interventions/food.jpg";
import nature from "@/assets/interventions/nature.jpg";
import cities from "@/assets/interventions/cities.jpg";
import economy from "@/assets/interventions/economy.jpg";
import society from "@/assets/interventions/society.jpg";
import ai from "@/assets/interventions/ai.jpg";
import systemic from "@/assets/interventions/systemic.jpg";

export const CATEGORY_ART: Record<string, string> = {
  energy, water, food, nature, cities, economy, society, ai, systemic,
};

export function artFor(categoryId: string | undefined): string {
  return CATEGORY_ART[categoryId ?? "systemic"] ?? systemic;
}

export const CATEGORY_TINT: Record<string, string> = {
  energy:   "from-amber-500/70 to-orange-700/80",
  water:    "from-sky-500/70 to-blue-800/80",
  food:     "from-lime-500/70 to-emerald-800/80",
  nature:   "from-emerald-500/70 to-green-900/80",
  cities:   "from-slate-400/70 to-slate-800/80",
  economy:  "from-orange-500/70 to-amber-800/80",
  society:  "from-rose-500/70 to-pink-800/80",
  ai:       "from-violet-500/70 to-indigo-900/80",
  systemic: "from-teal-500/70 to-cyan-900/80",
};

export const CATEGORY_GLOW: Record<string, string> = {
  energy:   "shadow-[0_20px_60px_-20px_rgba(245,158,11,0.55)]",
  water:    "shadow-[0_20px_60px_-20px_rgba(14,165,233,0.55)]",
  food:     "shadow-[0_20px_60px_-20px_rgba(132,204,22,0.55)]",
  nature:   "shadow-[0_20px_60px_-20px_rgba(16,185,129,0.55)]",
  cities:   "shadow-[0_20px_60px_-20px_rgba(100,116,139,0.55)]",
  economy:  "shadow-[0_20px_60px_-20px_rgba(249,115,22,0.55)]",
  society:  "shadow-[0_20px_60px_-20px_rgba(244,63,94,0.55)]",
  ai:       "shadow-[0_20px_60px_-20px_rgba(139,92,246,0.55)]",
  systemic: "shadow-[0_20px_60px_-20px_rgba(20,184,166,0.55)]",
};
