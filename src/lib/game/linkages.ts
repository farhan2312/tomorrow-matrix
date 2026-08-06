import raw from "./linkages.data.json";
import { MYSTERIES } from "./mysteries";
import type { Mystery } from "./types";

export interface Linkage {
  from: string;             // M-code, e.g. "M01"
  to: string;               // M-code or "SPECIES_DECLINE" | "VICTORY"
  toName: string;
  kind: "cascade" | "bridge" | "soft";
  chain: string[] | null;
  explanation: string;
}

export const LINKAGES: Linkage[] = raw as Linkage[];

const byPair = new Map<string, Linkage>();
for (const l of LINKAGES) byPair.set(`${l.from}→${l.to}`, l);

const byCode = new Map<string, Mystery>();
for (const m of MYSTERIES) byCode.set(m.code, m);

export function findLinkage(fromCode: string, toCode: string): Linkage | undefined {
  return byPair.get(`${fromCode}→${toCode}`);
}

export function mysteryByCode(code: string): Mystery | undefined {
  return byCode.get(code);
}

/** Plain-English rewrite of the doc explanation for the "Why does this happen?" toggle. */
export function plainEnglish(l: Linkage, fromTitle: string, toTitle: string): string {
  if (l.kind === "cascade" && l.chain && l.chain.length > 1) {
    return `Think of it like a line of dominoes. ${l.chain[0]} tips over first, then each step pushes the next — ${l.chain.slice(1, -1).join(", ")}${l.chain.length > 2 ? "," : ""} and finally ${l.chain[l.chain.length - 1]}. Each link is small on its own, but together they add up to a big shift.`;
  }
  if (l.kind === "soft") {
    return `${fromTitle} doesn't unlock a specific card on the board — instead it adds ecological pressure that flows into whichever related mystery is closest, like Biodiversity Collapse or Fish Population Decline.`;
  }
  return `${fromTitle} acts like a support beam holding ${toTitle} back. When it fails or gets ignored, ${toTitle} arrives sooner and hits harder. Solving ${fromTitle} well buys ${toTitle} more time.`;
}

/** Short "systems thinking" line explaining why the two seem unrelated but aren't. */
export function systemsInsight(fromTitle: string, toTitle: string): string {
  return `Although ${fromTitle} and ${toTitle} may appear unrelated, Earth's systems are tightly coupled — a shift in one biome, market, or policy propagates through feedback loops until it reshapes another domain entirely. This is systems thinking in action.`;
}

/** Follow outgoing edges up to `maxHops` starting from `code` — for "Explore Full Cascade". */
export function fullCascade(code: string, maxHops = 6): string[] {
  const seen = new Set<string>([code]);
  const path: string[] = [code];
  let cur = code;
  for (let i = 0; i < maxHops; i++) {
    const next = LINKAGES.find(
      (l) => l.from === cur && l.to.startsWith("M") && !seen.has(l.to) && byCode.has(l.to),
    );
    if (!next) break;
    seen.add(next.to);
    path.push(next.to);
    cur = next.to;
  }
  return path;
}

/** Mystery codes that this mystery is upstream/downstream of, from the doc. */
export function outgoingCodes(code: string): string[] {
  return LINKAGES.filter((l) => l.from === code && l.to.startsWith("M")).map((l) => l.to);
}
export function incomingCodes(code: string): string[] {
  return LINKAGES.filter((l) => l.to === code).map((l) => l.from);
}
