/**
 * Extended planetary indicators view (12 indicators).
 *
 * The underlying game model has 5 core indicators (climate, food, water,
 * bio, economy) plus planetHealth. The dashboard surfaces twelve player-
 * facing indicators by deriving the additional seven from the core values
 * + activity (purchased interventions). All values are 0–100.
 */

import type { IndicatorKey, RoleId } from "./types";
import type { GameState } from "./store";
import { INTERVENTIONS } from "./data";

export type ExtendedIndicatorId =
  | "terra"        | "climate"      | "water"     | "food"
  | "bio"          | "community"    | "air"       | "energy"
  | "industrial"   | "ocean"        | "forest"    | "economy";

export interface ExtendedIndicator {
  id: ExtendedIndicatorId;
  label: string;
  emoji: string;
  shortDescription: string;
  whyItMatters: string;
  affectedByMysteries: string[];
  improvedByActions: string[];
  stakeholders: RoleId[];
  /** Returns a 0..100 value derived from current game state. */
  compute: (s: GameState) => number;
  /** Maps to a core indicator key for history/trend lookups. `null` = planetHealth. */
  primaryKey: IndicatorKey | "planet";
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));

function countInterventionsByCategory(s: GameState, cat: string): number {
  return s.purchasedInterventions.filter((id) => {
    const i = INTERVENTIONS.find((x) => x.id === id);
    return i?.category === cat;
  }).length;
}

export const EXTENDED_INDICATORS: ExtendedIndicator[] = [
  {
    id: "terra", label: "Terra Health", emoji: "🌍",
    shortDescription: "Overall health of the planet, the master indicator of the game.",
    whyItMatters: "Reflects the combined state of climate, ecosystems, society and economy. Reach 70% by 2050 to win.",
    affectedByMysteries: ["All mysteries contribute when solved"],
    improvedByActions: ["Solving mysteries", "Best-answer crisis decisions", "Targeted interventions"],
    stakeholders: ["scientist", "policymaker", "activist", "planner", "business", "citizen", "farmer", "student"],
    primaryKey: "planet",
    compute: (s) => clamp(s.planetHealth),
  },
  {
    id: "climate", label: "Climate Stability", emoji: "🌡",
    shortDescription: "Resilience of the climate system, temperature trends, carbon balance, storm frequency.",
    whyItMatters: "Stable climate underpins every other system. Falling climate stability cascades into water, food and economic stress.",
    affectedByMysteries: ["Coral Reef Bleaching", "Methane Permafrost Release", "Glacial Retreat"],
    improvedByActions: ["Carbon capture", "Renewable rollouts", "Reforestation"],
    stakeholders: ["scientist", "policymaker", "activist"],
    primaryKey: "climate",
    compute: (s) => clamp(s.indicators.climate),
  },
  {
    id: "water", label: "Water Security", emoji: "💧",
    shortDescription: "Availability and resilience of freshwater resources for people and ecosystems.",
    whyItMatters: "Water shortages cascade quickly into food and health crises. Securing supply is foundational.",
    affectedByMysteries: ["Water Scarcity", "Drought", "Reservoir Depletion"],
    improvedByActions: ["Water conservation", "Sustainable agriculture", "Wetland restoration"],
    stakeholders: ["farmer", "citizen", "planner"],
    primaryKey: "water",
    compute: (s) => clamp(s.indicators.water),
  },
  {
    id: "food", label: "Food Security", emoji: "🌾",
    shortDescription: "Reliability of food production and distribution across the planet.",
    whyItMatters: "Food shocks destabilize societies fast. Soil, water and climate health all show up here.",
    affectedByMysteries: ["Soil Depletion", "Pollinator Decline", "Drought"],
    improvedByActions: ["Regenerative farming", "Sustainable agriculture", "Local food networks"],
    stakeholders: ["farmer", "citizen"],
    primaryKey: "food",
    compute: (s) => clamp(s.indicators.food),
  },
  {
    id: "bio", label: "Biodiversity", emoji: "🌿",
    shortDescription: "Diversity and abundance of life, species, habitats, genetic variation.",
    whyItMatters: "Biodiversity is the safety net of every ecosystem service we depend on.",
    affectedByMysteries: ["Habitat Loss", "Coral Bleaching", "Deforestation"],
    improvedByActions: ["Coral restoration", "Reforestation", "Protected areas"],
    stakeholders: ["scientist", "activist"],
    primaryKey: "bio",
    compute: (s) => clamp(s.indicators.bio),
  },
  {
    id: "community", label: "Community Resilience", emoji: "🏙",
    shortDescription: "Capacity of communities to adapt, support each other and recover from shocks.",
    whyItMatters: "Resilient communities turn crisis events into learning, not collapse.",
    affectedByMysteries: ["Heatwave Mortality", "Climate Migration", "Air Quality crises"],
    improvedByActions: ["Cooling centers", "Community gardens", "Inclusive planning"],
    stakeholders: ["citizen", "planner", "activist", "student"],
    primaryKey: "economy",
    compute: (s) =>
      clamp((s.indicators.food + s.indicators.water + s.indicators.economy) / 3),
  },
  {
    id: "air", label: "Air Quality", emoji: "🌬",
    shortDescription: "Cleanliness of the air people breathe, particulate matter, ozone, smoke.",
    whyItMatters: "Bad air drives heart and lung disease and signals deeper energy and industrial issues.",
    affectedByMysteries: ["Urban Smog", "Wildfire Smoke", "Industrial Pollution"],
    improvedByActions: ["Urban greening", "Clean energy transitions", "Public transit"],
    stakeholders: ["citizen", "policymaker", "planner"],
    primaryKey: "climate",
    compute: (s) =>
      clamp(s.indicators.climate * 0.7 + countInterventionsByCategory(s, "tech") * 4 + countInterventionsByCategory(s, "nature") * 2 + 10),
  },
  {
    id: "energy", label: "Energy Transition", emoji: "⚡",
    shortDescription: "Progress shifting the global energy mix toward clean, distributed sources.",
    whyItMatters: "Without an energy transition, every other gain is eventually undone.",
    affectedByMysteries: ["Grid Collapse", "Fossil Lock-in"],
    improvedByActions: ["Renewable rollouts", "Storage tech", "Demand-side efficiency"],
    stakeholders: ["business", "policymaker", "scientist"],
    primaryKey: "economy",
    compute: (s) =>
      clamp(20 + countInterventionsByCategory(s, "tech") * 14 + s.indicators.economy * 0.35),
  },
  {
    id: "industrial", label: "Industrial Sustainability", emoji: "🏭",
    shortDescription: "How circular, low-carbon and worker-fair industrial activity has become.",
    whyItMatters: "Industry is where economy meets ecology. Sustainable industry compounds across decades.",
    affectedByMysteries: ["Supply Chain Collapse", "Toxic Waste", "E-Waste"],
    improvedByActions: ["Circular economy", "Green manufacturing", "Worker safety"],
    stakeholders: ["business", "policymaker"],
    primaryKey: "economy",
    compute: (s) =>
      clamp(s.indicators.economy * 0.7 + countInterventionsByCategory(s, "policy") * 6 + countInterventionsByCategory(s, "tech") * 4),
  },
  {
    id: "ocean", label: "Ocean Health", emoji: "🐟",
    shortDescription: "State of marine ecosystems, temperature, acidity, fish stocks, coral cover.",
    whyItMatters: "Oceans regulate climate and feed billions. Recovery times are measured in decades.",
    affectedByMysteries: ["Coral Reef Bleaching", "Ocean Acidification", "Plastic Pollution"],
    improvedByActions: ["Marine protected areas", "Sustainable fisheries", "Plastic reduction"],
    stakeholders: ["scientist", "activist", "citizen"],
    primaryKey: "water",
    compute: (s) => clamp((s.indicators.water + s.indicators.bio) / 2),
  },
  {
    id: "forest", label: "Forest Health", emoji: "🌳",
    shortDescription: "Extent and vitality of forests, old growth, regrowth, fire resilience.",
    whyItMatters: "Forests store carbon, regulate water and host most terrestrial biodiversity.",
    affectedByMysteries: ["Deforestation", "Forest Die-back", "Wildfire"],
    improvedByActions: ["Reforestation", "Indigenous stewardship", "Fire management"],
    stakeholders: ["scientist", "farmer", "activist"],
    primaryKey: "bio",
    compute: (s) => clamp(s.indicators.bio * 0.85 + countInterventionsByCategory(s, "nature") * 6),
  },
  {
    id: "economy", label: "Economic Stability", emoji: "💰",
    shortDescription: "Robustness of the economy in the face of climate and resource shocks.",
    whyItMatters: "Economic stability funds the transition and keeps communities able to adapt.",
    affectedByMysteries: ["Insurance Collapse", "Supply Chain Crisis", "Stranded Assets"],
    improvedByActions: ["Green finance", "Diversification", "Skills retraining"],
    stakeholders: ["business", "policymaker"],
    primaryKey: "economy",
    compute: (s) => clamp(s.indicators.economy),
  },
];

export type Trend = "improving" | "stable" | "declining";

export function trendFor(
  primaryKey: IndicatorKey | "planet",
  log: { key: IndicatorKey | "planet"; delta: number }[],
  window = 5,
): Trend {
  const relevant = log.filter((e) => e.key === primaryKey).slice(0, window);
  if (relevant.length === 0) return "stable";
  const net = relevant.reduce((a, e) => a + e.delta, 0);
  if (net >= 2) return "improving";
  if (net <= -2) return "declining";
  return "stable";
}

export function toneFor(value: number): "good" | "warn" | "bad" {
  if (value >= 60) return "good";
  if (value >= 35) return "warn";
  return "bad";
}
