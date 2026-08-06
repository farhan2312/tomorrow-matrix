import raw from "./media.data.json";
import { MYSTERIES } from "./mysteries";
import type { Mystery } from "./types";

/** Cost (in Climate Action Points) to unlock an explanation video before solving. */
export const EXPLAINER_UNLOCK_COST = 25;

export type MediaKind = "intro" | "explainer" | string;

export interface MediaItem {
  /** Video URL (mp4/webm/HLS-in-<video>). When absent the slot renders as "coming soon". */
  src?: string;
  poster?: string;
  /** WebVTT captions track. */
  captions?: string;
  title?: string;
  description?: string;
  durationLabel?: string;
  /** Post-video "What did you learn?" bullets. Falls back to mystery data. */
  keyPoints?: string[];
  /** Extras only. */
  kind?: MediaKind;
  label?: string;
}

export interface MysteryMedia {
  intro?: MediaItem;
  explainer?: MediaItem;
  /** Future media: expert interviews, 3D simulations, interactive visualizations… */
  extra?: MediaItem[];
}

const REGISTRY = raw as unknown as Record<string, MysteryMedia>;

function entry(code: string): MysteryMedia {
  const hit = REGISTRY[code];
  return hit && typeof hit === "object" && !Array.isArray(hit) ? hit : {};
}

export function introVideo(m: Pick<Mystery, "code" | "title">): MediaItem {
  const e = entry(m.code).intro ?? {};
  return {
    title: e.title ?? `${m.title} — Introduction`,
    ...e,
  };
}

export function explainerVideo(m: Pick<Mystery, "code" | "title">): MediaItem {
  const e = entry(m.code).explainer ?? {};
  return {
    title: e.title ?? `${m.title} — The Science`,
    ...e,
  };
}

export function extraMedia(code: string): MediaItem[] {
  return entry(code).extra ?? [];
}

export function hasIntroVideo(code: string): boolean {
  return !!entry(code).intro?.src;
}

export function hasExplainerVideo(code: string): boolean {
  return !!entry(code).explainer?.src;
}

/** Learning points shown after the explanatory video. Uses media data, else derives from the mystery. */
export function learningPoints(m: Mystery): string[] {
  const fromMedia = explainerVideo(m).keyPoints;
  if (fromMedia?.length) return fromMedia;
  const chain = m.butterfly ?? [];
  const out: string[] = [];
  if (m.sequence?.length) {
    out.push(`The chain runs ${m.sequence[0].label} → ${m.sequence[m.sequence.length - 1].label}.`);
  }
  if (chain.length > 1) out.push(`Butterfly cascade: ${chain.join(" → ")}.`);
  if (m.aiConnection) out.push(m.aiConnection);
  out.push(m.brief);
  return out.slice(0, 4);
}

/** Total media slots defined across the library — used for dashboard progress copy. */
export function mediaCoverage(): { withIntro: number; withExplainer: number; total: number } {
  let withIntro = 0;
  let withExplainer = 0;
  for (const m of MYSTERIES) {
    if (hasIntroVideo(m.code)) withIntro += 1;
    if (hasExplainerVideo(m.code)) withExplainer += 1;
  }
  return { withIntro, withExplainer, total: MYSTERIES.length };
}
