import type {
  Mystery, MysteryDomain, IndicatorKey, SequenceStep, RoleId, Region,
} from "./types";
import { SEQUENCES, HINTS } from "./sequences";
import raw from "./mysteries.data.json";

import imgArctic   from "@/assets/mystery-arctic.jpg";
import imgCoral    from "@/assets/mystery-coral.jpg";
import imgAmazon   from "@/assets/mystery-amazon.jpg";
import imgDrought  from "@/assets/mystery-drought.jpg";
import imgHeat     from "@/assets/mystery-heat.jpg";
import imgMangrove from "@/assets/mystery-mangrove.jpg";

interface RawMystery {
  code: string;
  id: string;
  title: string;
  category: string;       // narrative category from doc
  categoryLabel?: string;
  brief: string;
  primaryRoles: RoleId[];
  secondaryRoles: RoleId[];
  sequence: string[];
  unlocks: string[];
  linkedCrises: string[];
  linkedInterventions: string[];
  butterfly: string[];
  tier: 1 | 2 | 3 | 4;
  aiConnection?: string;
}

// Map narrative domain → indicator for scoring/tinting.
const DOMAIN_TO_INDICATOR: Record<string, IndicatorKey> = {
  climate: "climate", water: "water", food: "food", bio: "bio",
  oceans: "water", cities: "climate", society: "economy",
  governance: "economy", economy: "economy", energy: "economy",
  health: "food", pollution: "climate",
};
const DOMAIN_NORMALIZE = (s: string): MysteryDomain => {
  const v = (s ?? "climate").toLowerCase();
  return (
    ["climate","water","food","bio","oceans","cities","society",
     "governance","economy","energy","health","pollution"].includes(v)
      ? (v as MysteryDomain) : "climate"
  );
};

// Image picker per tier+domain.
const IMG_BY_DOMAIN: Record<string, string> = {
  climate: imgArctic, oceans: imgCoral, water: imgDrought, food: imgAmazon,
  cities: imgHeat,    bio: imgAmazon,   society: imgMangrove,
  governance: imgMangrove, economy: imgMangrove,
  energy: imgHeat, health: imgMangrove, pollution: imgHeat,
};

const RARITY_BY_TIER: Record<number, Mystery["rarity"]> = {
  1: "common", 2: "uncommon", 3: "rare", 4: "epic",
};

// For pretty regions, derive from domain
const REGION_BY_DOMAIN: Record<string, string> = {
  climate: "Atmospheric Systems",
  oceans: "Global Oceans",
  water: "Watersheds & Aquifers",
  food: "Agricultural Belts",
  cities: "Urban Centres",
  bio: "Ecosystems & Habitats",
  society: "Communities",
  governance: "Policy Arenas",
  economy: "Global Markets",
  energy: "Energy Systems",
  health: "Public Health Systems",
  pollution: "Industrial Corridors",
};

// Map known M-codes → existing legacy short-id (used by SEQUENCES/HINTS)
const LEGACY_SEQ_ID: Record<string, keyof typeof SEQUENCES> = {
  M01: "arctic", M02: "heat", M03: "drought",
  M04: "amazon", M05: "coral", M06: "fish",
};
const LEGACY_HINT_ID: Record<string, keyof typeof HINTS> = LEGACY_SEQ_ID as never;

function synthSequence(labels: string[], code: string): SequenceStep[] {
  const tones: SequenceStep["tone"][] = [
    "industry","climate","heat","water","bio","human","policy","ice",
  ];
  const filled = [...labels];
  while (filled.length < 8) filled.push("System Pressure");
  return filled.slice(0, 8).map((label, i) => ({
    id: `${code.toLowerCase()}-s${i}`,
    label,
    icon: "Sparkles",
    tone: tones[i % tones.length],
  }));
}

function toMystery(r: RawMystery): Mystery {
  const domain = DOMAIN_NORMALIZE(r.category);
  const indicator = DOMAIN_TO_INDICATOR[domain] ?? "climate";
  const useLegacy = LEGACY_SEQ_ID[r.code];
  const sequence = useLegacy
    ? SEQUENCES[useLegacy]
    : synthSequence(r.sequence, r.code);
  const hints = useLegacy ? HINTS[LEGACY_HINT_ID[r.code]] : undefined;

  return {
    id: r.id,
    code: r.code,
    title: r.title,
    region: REGION_BY_DOMAIN[domain] ?? "Terra",
    tier: r.tier,
    rarity: RARITY_BY_TIER[r.tier] ?? "common",
    category: indicator,
    domain,
    brief: r.brief,
    sequence,
    hints,
    reward: 60 + r.tier * 20,                // 80 / 100 / 120 / 140
    unlocks: r.unlocks?.[0],
    unlocksList: r.unlocks ?? [],
    primaryRoles: r.primaryRoles ?? [],
    secondaryRoles: r.secondaryRoles ?? [],
    butterfly: r.butterfly ?? [],
    linkedCrises: r.linkedCrises ?? [],
    linkedInterventions: r.linkedInterventions ?? [],
    aiConnection: r.aiConnection,
    image: IMG_BY_DOMAIN[domain] ?? imgArctic,
  };
}

export const MYSTERIES: Mystery[] = (raw as RawMystery[]).map(toMystery);

const TIER_UNLOCK_THRESHOLD: Record<number, number> = {
  1: 0, 2: 4, 3: 12, 4: 22,
};

/** Tier-gated: tier N needs `TIER_UNLOCK_THRESHOLD[N]` total solved mysteries. */
export function isMysteryUnlocked(id: string, solved: string[]): boolean {
  const m = MYSTERIES.find((x) => x.id === id);
  if (!m) return false;
  if (m.prereqs?.length && !m.prereqs.every((p) => solved.includes(p))) return false;
  const needed = TIER_UNLOCK_THRESHOLD[m.tier] ?? 0;
  return solved.length >= needed;
}

/**
 * Tier 1 role allocation (source of truth: Tomorrow Matrix design doc).
 * `all` = the 10 Tier 1 mysteries visible to the role.
 * `priority` = the 4 role-specific "Role Priority" mysteries within that set.
 */
const T1 = (nums: number[]) => nums.map((n) => `m${String(n).padStart(2, "0")}`);
export const TIER1_ROLE_MYSTERIES: Record<RoleId, { all: string[]; priority: string[] }> = {
  farmer:      { all: T1([3,7,8,15,17,24,2,4,19,25]),   priority: T1([7,8,17,24]) },
  planner:     { all: T1([9,10,11,20,26,30,2,3,15,25]), priority: T1([10,11,20,30]) },
  student:     { all: T1([13,14,22,23,28,12,4,9,19,20]),priority: T1([13,14,22,23]) },
  policymaker: { all: T1([1,4,9,15,16,19,25,28,13,29]), priority: T1([19,25,16,15]) },
  business:    { all: T1([6,12,16,18,22,25,4,9,19,15]), priority: T1([16,18,22,12]) },
  citizen:     { all: T1([3,9,10,13,21,26,29,2,7,15]),  priority: T1([26,29,21,13]) },
  scientist:   { all: T1([1,5,6,15,20,24,27,2,4,19]),   priority: T1([1,5,27,24]) },
  activist:    { all: T1([4,12,14,19,23,27,28,29,8,22]),priority: T1([28,29,14,4]) },
};

export function isTier1RolePriority(role: RoleId | null, m: Mystery): boolean {
  if (!role || m.tier !== 1) return false;
  return TIER1_ROLE_MYSTERIES[role]?.priority.includes(m.id) ?? false;
}

/**
 * Visibility rules (Tomorrow Matrix MVP):
 * - Tier 1: role-gated to the 10 allocated mysteries.
 * - Tier 2/3/4: common, visible to every role.
 */
export function isMysteryVisibleForRole(role: RoleId | null, m: Mystery): boolean {
  if (!role) return true;
  if (m.tier === 1) return TIER1_ROLE_MYSTERIES[role]?.all.includes(m.id) ?? false;
  return true;
}

export function roleRelationship(role: RoleId | null, m: Mystery): "primary" | "secondary" | "none" {
  if (!role) return "none";
  if (m.tier === 1) return isTier1RolePriority(role, m) ? "primary" : "secondary";
  if (m.primaryRoles.includes(role)) return "primary";
  if (m.secondaryRoles.includes(role)) return "secondary";
  return "none";
}

/** Filter the mystery list to those visible for the given role. */
export function visibleMysteries(role: RoleId | null): Mystery[] {
  return MYSTERIES.filter((m) => isMysteryVisibleForRole(role, m));
}

/** Title-based lookup used to map butterfly chain entries to actual mysteries. */
const TITLE_INDEX = new Map<string, Mystery>();
for (const m of MYSTERIES) TITLE_INDEX.set(m.title.toLowerCase(), m);

/** Mysteries this one CAUSES (next in any chain, or in its `unlocksList`). */
export function influencesOf(m: Mystery): Mystery[] {
  const out = new Set<Mystery>();
  for (const t of m.unlocksList ?? []) {
    const hit = TITLE_INDEX.get(t.toLowerCase());
    if (hit && hit.id !== m.id) out.add(hit);
  }
  // also follow butterfly chain: this mystery's title → next entry → mystery
  const chain = m.butterfly ?? [];
  const idx = chain.findIndex((s) => s.toLowerCase() === m.title.toLowerCase());
  if (idx >= 0 && idx < chain.length - 1) {
    const hit = TITLE_INDEX.get(chain[idx + 1].toLowerCase());
    if (hit) out.add(hit);
  }
  return [...out];
}

/** Mysteries that influence this one (reverse lookup). */
export function influencedBy(m: Mystery): Mystery[] {
  return MYSTERIES.filter((o) => influencesOf(o).some((x) => x.id === m.id));
}

export function bonusForRole(role: RoleId | null, m: Mystery): number {
  return roleRelationship(role, m) === "primary" ? 25 : 0;
}

/** Build region hotspots dynamically, distribute across the world map by tier ring. */
export function buildRegions(): Region[] {
  const ringRadius = { 1: 0.32, 2: 0.40, 3: 0.46, 4: 0.50 } as const;
  const cx = 50, cy = 50;
  const perTier: Record<number, Mystery[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const m of MYSTERIES) perTier[m.tier].push(m);
  const out: Region[] = [];
  (Object.keys(perTier).map(Number) as (1|2|3|4)[]).forEach((tier) => {
    const arr = perTier[tier];
    const r = ringRadius[tier] * 100;
    arr.forEach((m, i) => {
      const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
      out.push({
        id: `r-${m.id}`, name: m.region,
        x: Math.max(5, Math.min(95, cx + Math.cos(angle) * r * 1.5)),
        y: Math.max(8, Math.min(92, cy + Math.sin(angle) * r * 0.85)),
        mysteryId: m.id,
        status: tier === 1 ? "critical" : tier === 2 ? "active" : "stable",
        label: m.title,
      });
    });
  });
  return out;
}
