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

// Per-mystery cover art (M01…M66). Bundled via Vite glob so adding/removing a
// cover needs no code change. Falls back to the domain image below when absent.
const COVER_MODULES = import.meta.glob("../../assets/covers/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const COVERS: Record<string, string> = {};
for (const [path, url] of Object.entries(COVER_MODULES)) {
  const m = path.match(/(M\d{2})\.webp$/);
  if (m) COVERS[m[1]] = url;
}

// Per-mystery full-art solving cards: src/assets/cards/M01/1.webp … 8.webp.
// Card order (1…8) is the canonical (correct) causal chain. Building the
// sequence straight from the art gives every mystery a real 8-card puzzle.
const CARD_MODULES = import.meta.glob("../../assets/cards/*/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const CARD_SEQUENCES: Record<string, SequenceStep[]> = {};
for (const [path, url] of Object.entries(CARD_MODULES)) {
  const m = path.match(/(M\d{2})\/(\d+)\.webp$/);
  if (!m) continue;
  const [, code, n] = m;
  (CARD_SEQUENCES[code] ??= []).push({
    id: `${code}-c${n}`,
    label: "",
    icon: "",
    tone: "climate",
    image: url,
    _order: Number(n),
  } as SequenceStep & { _order: number });
}
for (const code of Object.keys(CARD_SEQUENCES)) {
  CARD_SEQUENCES[code].sort(
    (a, b) => (a as { _order: number })._order - (b as { _order: number })._order,
  );
}

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
  const sequence = CARD_SEQUENCES[r.code]
    ?? (useLegacy ? SEQUENCES[useLegacy] : synthSequence(r.sequence, r.code));
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
    image: COVERS[r.code] ?? IMG_BY_DOMAIN[domain] ?? imgArctic,
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

/**
 * Approximate positions on the equirectangular world map (x%, y%), tuned to
 * src/assets/world-map.jpg. Each is a plausible real-world region.
 */
const MAP_ANCHORS: Record<string, [number, number]> = {
  arctic: [40, 8], alaskaN: [12, 24], canadaN: [26, 20], usWest: [13, 36], usPlains: [22, 35], usEast: [28, 34],
  centralAm: [23, 51], amazon: [33, 62], brazil: [38, 63], andes: [30, 68], patagonia: [33, 84],
  nAtlantic: [35, 42], nPacific: [8, 40], pacific: [96, 56],
  wEurope: [46, 27], cEurope: [51, 28], scandinavia: [52, 19], medSea: [51, 40],
  sahara: [50, 46], sahel: [47, 52], guineaCoast: [48, 58], congo: [54, 61], eAfrica: [60, 56], southAfrica: [55, 75],
  middleEast: [59, 45], centralAsia: [63, 33], siberia: [73, 18],
  india: [69, 51], bengal: [73, 54], himalaya: [70, 42], china: [79, 40], japan: [88, 35],
  seAsia: [81, 61], philippines: [85, 53], ausOutback: [85, 77], ausReef: [90, 72],
};

/** Which anchor each mystery sits at, chosen for its theme (ice north, tropics
 *  on the equator, ocean issues on water, deserts in arid zones, and the more
 *  abstract economy/society/governance ones spread across populated regions). */
const MYSTERY_PLACEMENT: Record<string, string> = {
  M01: "arctic", M02: "medSea", M03: "centralAsia", M04: "seAsia", M05: "ausReef", M06: "nPacific",
  M07: "india", M08: "southAfrica", M09: "china", M10: "bengal", M11: "wEurope", M12: "pacific",
  M13: "congo", M14: "usEast", M15: "siberia", M16: "cEurope", M17: "andes", M18: "guineaCoast",
  M19: "wEurope", M20: "usEast", M21: "middleEast", M22: "bengal", M23: "india", M24: "india",
  M25: "scandinavia", M26: "usPlains", M27: "alaskaN", M28: "usPlains", M29: "amazon", M30: "china",
  M31: "sahel", M32: "middleEast", M33: "patagonia", M34: "himalaya", M35: "usWest", M36: "china",
  M37: "ausOutback", M38: "usPlains", M39: "bengal", M40: "japan", M41: "usWest", M42: "cEurope",
  M43: "usEast", M44: "sahara", M45: "amazon", M46: "guineaCoast", M47: "medSea", M48: "philippines",
  M49: "congo", M50: "sahel", M51: "nAtlantic", M52: "eAfrica", M53: "congo", M54: "seAsia",
  M55: "wEurope", M56: "brazil", M57: "sahel", M58: "brazil", M59: "siberia", M60: "arctic",
  M61: "amazon", M62: "nAtlantic", M63: "philippines", M64: "cEurope", M65: "usWest", M66: "seAsia",
};

// Deterministic 0..1 from a string, for a stable per-mystery jitter.
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}

/**
 * Build region hotspots placed geographically by theme, then relaxed so no two
 * pins overlap. Each mystery is anchored to a plausible real-world region
 * (MAP_ANCHORS × MYSTERY_PLACEMENT), nudged by a small deterministic jitter,
 * and a few relaxation passes push apart any pins that still sit too close.
 */
export function buildRegions(): Region[] {
  const pts = MYSTERIES.map((m) => {
    const a = MAP_ANCHORS[MYSTERY_PLACEMENT[m.code]] ?? [50, 50];
    return {
      m,
      x: a[0] + (hash01(m.code + "x") - 0.5) * 5,
      y: a[1] + (hash01(m.code + "y") - 0.5) * 5,
    };
  });

  // Relaxation: separate any two pins closer than MIN over a few gentle passes.
  const MIN = 4.2;
  for (let iter = 0; iter < 60; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < MIN) {
          const push = (MIN - d) / 2;
          dx /= d; dy /= d;
          pts[i].x -= dx * push; pts[i].y -= dy * push;
          pts[j].x += dx * push; pts[j].y += dy * push;
        }
      }
    }
  }

  return pts.map(({ m, x, y }) => ({
    id: `r-${m.id}`, name: m.region,
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(7, Math.min(90, y)),
    mysteryId: m.id,
    status: m.tier === 1 ? "critical" : m.tier === 2 ? "active" : "stable",
    label: m.title,
  }));
}
