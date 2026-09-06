export type RoleId =
  | "scientist"
  | "farmer"
  | "policymaker"
  | "activist"
  | "business"
  | "planner"
  | "citizen"   // legacy id → now displayed as "Community Representative"
  | "student";

export type IndicatorKey = "climate" | "food" | "water" | "bio" | "economy";

export type GameMode = "solo" | "ai-team" | "multiplayer";

export interface Role {
  id: RoleId;
  name: string;
  focus: string;
  tagline: string;
  mission: string;
  rewardLabel: string;
  access: string[];
  accent: "terra" | "warmth" | "stone";
}

export interface SequenceStep {
  id: string;
  label: string;        // shown on the card face when there's no art
  icon: string;         // legacy field, no longer used on play cards
  tone: "climate" | "heat" | "water" | "ice" | "bio" | "industry" | "human" | "policy";
  /** Full-art card image (WebP). When set, it replaces the gradient/label face. */
  image?: string;
}

export type MysteryDomain =
  | "climate" | "water" | "food" | "bio" | "oceans"
  | "cities"  | "society" | "governance" | "economy"
  | "energy"  | "health" | "pollution";

export interface Mystery {
  id: string;
  code: string;              // M01, M02, ...
  title: string;
  region: string;
  tier: 1 | 2 | 3 | 4;
  rarity: "common" | "uncommon" | "rare" | "epic";
  category: IndicatorKey;    // mapped indicator (for tinting / scoring)
  domain: MysteryDomain;     // narrative grouping shown in UI
  brief: string;
  sequence: SequenceStep[];
  hints?: string[];
  prereqs?: string[];
  reward: number;
  unlocks?: string;            // legacy single-string display
  unlocksList?: string[];      // titles of mysteries this one cascades into
  primaryRoles: RoleId[];      // roles for which this mystery is highlighted & bonus
  secondaryRoles: RoleId[];    // roles that can also see / play it
  butterfly?: string[];        // ordered narrative chain (cause → final impact)
  linkedCrises?: string[];
  linkedInterventions?: string[];
  aiConnection?: string;       // "AI & Sustainability" narrative (M61+)
  image: string;
}

export interface Region {
  id: string;
  name: string;
  x: number;
  y: number;
  mysteryId?: string;
  status: "critical" | "active" | "stable";
  label: string;
}

/** 12-indicator ID space used by the Intervention Library (see interventions.data.json). */
export type ExtEffectKey =
  | "terra" | "climate" | "water" | "food" | "bio" | "community"
  | "air" | "energy" | "industrial" | "ocean" | "forest" | "economy";

export interface InterventionRipple {
  code: string;               // e.g. "M01"
  name: string;
  explanation: string;
}

export interface Intervention {
  id: string;
  name: string;
  /** Legacy narrow category, kept for missions / dashboards. */
  category: "energy" | "nature" | "policy" | "tech" | "agriculture";
  /** Library category id (energy, water, food, nature, cities, economy, society, ai, systemic). */
  categoryId?: string;
  categoryLabel?: string;
  categoryEmoji?: string;
  cost: number;
  description: string;
  /** Legacy 5-core-indicator effect map (still used by store math). */
  effects: Partial<Record<IndicatorKey, number>>;
  /** Full 12-indicator effect map from the library. */
  effects12?: Partial<Record<ExtEffectKey, number>>;
  /** Terra Health delta applied on purchase. */
  planetHealth: number;
  /** Legacy short ripple string (dashboard fallback). */
  ripple: string;
  /** Full ripple explanations per linked mystery. */
  ripples?: InterventionRipple[];
  linkedMysteries?: string[];
  linkedCrises?: string[];
}

export interface CrisisChoice {
  id: string;
  label: string;
  description: string;
  effects: Partial<Record<IndicatorKey, number>>;
  planetHealth: number;
  cost?: number;
  /** Library health-impact in points (mitigated damage). */
  healthImpactPts?: number;
}

export type CrisisCategory =
  | "climate" | "infrastructure" | "social" | "health" | "biodiversity";

export interface Crisis {
  id: string;
  title: string;
  location: string;
  severity: "medium" | "high" | "extreme";
  brief: string;
  choices: CrisisChoice[];
  /** Library extensions */
  emoji?: string;
  category?: CrisisCategory;
  triggerHint?: string;
  /** id of the canonical best answer (Option A in the library) */
  bestChoiceId?: string;
  /** Per-role private intelligence shown only to that role. */
  roleInfo?: Partial<Record<RoleId, string>>;
  /** Narrative summary of indicators affected (verbatim from library). */
  indicatorNarrative?: string;
  /** Why the best answer is best (revealed after vote). */
  bestReasoning?: string;
  /** Facilitator debrief questions. */
  debrief?: string[];
  /** Mysteries that, when solved, raise probability of this crisis firing. */
  linkedMysteryCodes?: string[];
}

export interface NetworkNode { id: string; label: string; group: IndicatorKey; }
export interface NetworkEdge { from: string; to: string; label?: string; }

export interface AiTeammate {
  id: string;
  role: RoleId;
  name: string;
}
