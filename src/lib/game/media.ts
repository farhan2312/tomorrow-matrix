import raw from "./media.data.json";
import { MYSTERIES } from "./mysteries";
import type { Mystery } from "./types";
import { mediaOverride, resolveMedia } from "@/lib/media-overrides";

/** Cost (in Climate Action Points) to unlock an explanation video before solving. */
export const EXPLAINER_UNLOCK_COST = 25;

/** Cover art for a mystery, preferring a runtime admin override (key `cover/${code}`). */
export function mysteryCover(m: Pick<Mystery, "code" | "image">): string {
  return resolveMedia(`cover/${m.code}`, m.image);
}

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
    title: e.title ?? `${m.title}, Introduction`,
    ...e,
    src: mediaOverride(`video/${m.code}/intro`) ?? e.src,
  };
}

export function explainerVideo(m: Pick<Mystery, "code" | "title">): MediaItem {
  const e = entry(m.code).explainer ?? {};
  return {
    title: e.title ?? `${m.title}, The Science`,
    ...e,
    src: mediaOverride(`video/${m.code}/explainer`) ?? e.src,
  };
}

export function extraMedia(code: string): MediaItem[] {
  return (entry(code).extra ?? []).map((x) =>
    x.kind === "animation" ? { ...x, src: mediaOverride(`video/${code}/animation`) ?? x.src } : x,
  );
}

export function hasIntroVideo(code: string): boolean {
  return !!(mediaOverride(`video/${code}/intro`) ?? entry(code).intro?.src);
}

export function hasExplainerVideo(code: string): boolean {
  return !!(mediaOverride(`video/${code}/explainer`) ?? entry(code).explainer?.src);
}

/** Learning points shown after the explanatory video. Uses media data, else derives from the mystery. */
export function learningPoints(m: Mystery): string[] {
  const fromMedia = explainerVideo(m).keyPoints;
  if (fromMedia?.length) return fromMedia;
  const chain = m.butterfly ?? [];
  const out: string[] = [];
  if (m.sequence?.length) {
    const first = m.sequence[0].label;
    const last = m.sequence[m.sequence.length - 1].label;
    if (first && last) out.push(`The chain runs ${first} → ${last}.`);
  }
  if (chain.length > 1) out.push(`Butterfly cascade: ${chain.join(" → ")}.`);
  if (m.aiConnection) out.push(m.aiConnection);
  out.push(m.brief);
  return out.slice(0, 4);
}

/** Total media slots defined across the library, used for dashboard progress copy. */
export function mediaCoverage(): { withIntro: number; withExplainer: number; total: number } {
  let withIntro = 0;
  let withExplainer = 0;
  for (const m of MYSTERIES) {
    if (hasIntroVideo(m.code)) withIntro += 1;
    if (hasExplainerVideo(m.code)) withExplainer += 1;
  }
  return { withIntro, withExplainer, total: MYSTERIES.length };
}
