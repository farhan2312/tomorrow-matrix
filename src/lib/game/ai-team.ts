import type { AiTeammate, RoleId, Mystery } from "./types";

export const AI_ROSTER: AiTeammate[] = [
  { id: "ai-sci",  role: "scientist",   name: "Dr. Vega" },
  { id: "ai-farm", role: "farmer",      name: "Mira Okafor" },
  { id: "ai-act",  role: "activist",    name: "Jonah Reyes" },
  { id: "ai-pol",  role: "policymaker", name: "Sec. Lin" },
  { id: "ai-biz",  role: "business",    name: "Kavi Shah" },
];

/** The slice of a mystery an AI teammate reacts to. */
export interface TeamContext {
  id: string;
  title: string;
  category: string;     // human label lowercased, e.g. "climate", "water"
  effect: string;       // the immediate downstream effect this mystery triggers
  impact: string;       // the ultimate consequence down the chain
  chain: string;        // a short readable cascade, e.g. "A → B → C"
}

/** Readable word for each indicator key, used in the stakeholder lines. */
const CATEGORY_LABEL: Record<string, string> = {
  climate: "climate",
  water: "water",
  bio: "biodiversity",
  oceans: "ocean",
  food: "food",
  cities: "urban",
  society: "social",
  economy: "economic",
  governance: "governance",
};

/**
 * Build the context an AI line is filled from. `downstream` is the mystery's own
 * cause → impact cascade (the titles of the mysteries it influences, resolved by
 * the caller via influencesOf). Because each mystery has a different cascade, the
 * lines come out specific to the mystery. Everything falls back to a
 * category-flavoured phrase so a mystery with no downstream still reads cleanly.
 */
export function teamContext(
  m: { id: string; title: string; category?: string; butterfly?: string[] },
  downstream: string[] = [],
): TeamContext {
  const cat = CATEGORY_LABEL[m.category ?? ""] || (m.category ?? "climate").toLowerCase();

  // Prefer the resolved downstream cascade; fall back to the raw butterfly chain
  // (minus the mystery's own title) when no downstream was supplied.
  let chainTitles = downstream.filter((t) => !!t && t.trim().length > 0);
  if (chainTitles.length === 0) {
    chainTitles = (m.butterfly ?? [])
      .filter((b): b is string => !!b && b.trim().length > 0)
      .filter((b) => b.toLowerCase() !== m.title.toLowerCase());
  }

  const effect = chainTitles[0] || `worse ${cat} stress`;
  const impact = chainTitles[chainTitles.length - 1] || `a wider ${cat} crisis`;
  const chain = chainTitles.length >= 1
    ? [m.title, ...chainTitles.slice(0, 2)].join(" → ")
    : `${m.title} → ${impact}`;

  return { id: m.id, title: m.title, category: cat, effect, impact, chain };
}

// A few "seeds" (variant takes) per role. One is chosen deterministically per
// mystery, so each mystery shows a stable, distinct set of perspectives and
// different mysteries read differently — no model call, just the mystery's own
// data poured into each stakeholder's voice.
type Tmpl = (c: TeamContext) => string;

const TEMPLATES: Partial<Record<RoleId, Tmpl[]>> = {
  scientist: [
    (c) => `${c.title} sets off a clear ${c.category} cascade: ${c.chain}. The data backs every link.`,
    (c) => `On ${c.title}, the models show it driving ${c.effect} downstream. Intervene before that locks in.`,
    (c) => `Left unchecked, ${c.title} ends in ${c.impact}. That's the figure that should worry us.`,
    (c) => `${c.title} isn't isolated. The evidence ties it straight to ${c.effect}.`,
  ],
  farmer: [
    (c) => `${c.title}? We feel ${c.impact} on the land long before the headlines do.`,
    (c) => `Trace it out: ${c.chain}. That cascade is my livelihood.`,
    (c) => `${c.title} leads to ${c.effect}, and that's when the harvest starts to fail.`,
    (c) => `Whatever you choose on ${c.title}, ${c.impact} is what lands on us.`,
  ],
  activist: [
    (c) => `${c.title} hits frontline communities first, and it only worsens as it becomes ${c.effect}.`,
    (c) => `People need to see the chain: ${c.chain}. That story is what moves them.`,
    (c) => `This isn't just ${c.category}, it's justice. Stop ${c.title} before it becomes ${c.impact}.`,
    (c) => `Let's mobilize on ${c.title} now, before ${c.effect} makes it everyone's problem.`,
  ],
  policymaker: [
    (c) => `${c.title} needs a framework that heads off ${c.effect} before it reaches ${c.impact}.`,
    (c) => `We can regulate the drivers of ${c.title} this cycle. That's the lever on ${c.chain}.`,
    (c) => `Coordinated action on ${c.title} is the only thing that stops the slide to ${c.impact}.`,
    (c) => `On ${c.title}, the feasible move is acting early, before ${c.effect} forces our hand.`,
  ],
  business: [
    (c) => `${c.title} is a supply-chain risk. ${c.impact} is a cost nobody wants on the books.`,
    (c) => `Investors are already pricing ${c.category} risk; ${c.title} tipping into ${c.effect} is on the radar.`,
    (c) => `There's a business case in getting ahead of ${c.title} before it becomes ${c.impact}.`,
    (c) => `On ${c.title}, early movers win. The cascade to ${c.effect} is expensive to ignore.`,
  ],
};

const GENERIC: Tmpl[] = [
  (c) => `Whatever we decide on ${c.title}, the community lives with ${c.impact}.`,
  (c) => `Can someone connect how ${c.title} ends up causing ${c.impact}?`,
  (c) => `${c.title} touches all of us. Let's be deliberate before it becomes ${c.effect}.`,
];

function seedIndex(key: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % Math.max(1, n);
}

/**
 * The line a teammate says about a given mystery. Deterministic per
 * (mystery, role): the same mystery always shows the same take from each
 * teammate, and different mysteries read differently.
 */
export function teammateLine(role: RoleId, ctx: TeamContext): string {
  const bank = TEMPLATES[role] ?? GENERIC;
  const tmpl = bank[seedIndex(`${ctx.id}:${role}`, bank.length)];
  return tmpl(ctx);
}

/**
 * Walk a mystery's downstream cascade up to `depth` hops, returning the ordered
 * titles of the mysteries it leads to. `resolve` is influencesOf (injected to
 * avoid a module cycle). The walk stops at the first repeat so loops terminate.
 */
export function downstreamTitles(
  m: Mystery,
  resolve: (x: Mystery) => Mystery[],
  depth = 3,
): string[] {
  const titles: string[] = [];
  const seen = new Set<string>([m.id]);
  let cur: Mystery | undefined = m;
  for (let i = 0; i < depth && cur; i++) {
    const next: Mystery | undefined = resolve(cur).find((x) => !seen.has(x.id));
    if (!next) break;
    titles.push(next.title);
    seen.add(next.id);
    cur = next;
  }
  return titles;
}
