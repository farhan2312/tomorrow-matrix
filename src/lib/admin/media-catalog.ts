import { MYSTERIES } from "@/lib/game/data";
import { hasExplainerVideo, hasIntroVideo, extraMedia } from "@/lib/game/media";

/**
 * The full catalog of admin-manageable media slots, derived from the mystery
 * library. Each slot's `key` matches the runtime override key that the app
 * reads (see media-overrides.ts): `cover/M01`, `video/M01/intro`,
 * `card/M01/3`, `video/bookend/intro-T2`, etc.
 */
export type MediaKind = "image" | "video";

export interface MediaSlot {
  key: string;
  label: string;
  kind: MediaKind;
  /** Bundled default asset URL, when one exists (for preview / "using default"). */
  default?: string;
}

export interface MediaGroup {
  id: string;
  title: string;
  subtitle?: string;
  slots: MediaSlot[];
}

export interface MediaSection {
  id: string;
  title: string;
  groups: MediaGroup[];
}

const CARD_ID = /^(M\d{2})-c(\d+)$/;

function mysteryGroup(m: (typeof MYSTERIES)[number]): MediaGroup {
  const slots: MediaSlot[] = [
    { key: `cover/${m.code}`, label: "Cover art", kind: "image", default: m.image },
    { key: `video/${m.code}/intro`, label: "Intro video", kind: "video", default: hasIntroVideo(m.code) ? "bundled" : undefined },
    { key: `video/${m.code}/explainer`, label: "Explainer video", kind: "video", default: hasExplainerVideo(m.code) ? "bundled" : undefined },
  ];
  if (extraMedia(m.code).some((x) => x.kind === "animation")) {
    slots.push({ key: `video/${m.code}/animation`, label: "Animation", kind: "video", default: "bundled" });
  }
  // Full-art solving cards, in chain order.
  for (const step of m.sequence ?? []) {
    const cm = CARD_ID.exec(step.id);
    if (cm && step.image) {
      slots.push({ key: `card/${m.code}/${cm[2]}`, label: `Card ${cm[2]}`, kind: "image", default: step.image });
    }
  }
  return { id: m.code, title: `${m.code} · ${m.title}`, subtitle: m.domain, slots };
}

export function buildMediaCatalog(): MediaSection[] {
  const sections: MediaSection[] = [];

  for (const tier of [1, 2, 3, 4]) {
    const groups = MYSTERIES.filter((m) => m.tier === tier).map(mysteryGroup);
    if (groups.length) {
      sections.push({ id: `tier-${tier}`, title: `Tier ${tier}`, groups });
    }
  }

  // Tier bookend intros / outros.
  const bookendSlots: MediaSlot[] = [];
  for (const t of [1, 2, 3, 4]) bookendSlots.push({ key: `video/bookend/intro-T${t}`, label: `Tier ${t} intro`, kind: "video", default: "bundled" });
  for (const t of [1, 2, 3, 4]) bookendSlots.push({ key: `video/bookend/outro-T${t}`, label: `Tier ${t} outro`, kind: "video", default: "bundled" });
  sections.push({
    id: "bookends",
    title: "Tier bookends",
    groups: [{ id: "bookends", title: "Intro / outro videos", slots: bookendSlots }],
  });

  return sections;
}

export function catalogCounts(sections: MediaSection[]): { slots: number; groups: number } {
  let slots = 0, groups = 0;
  for (const s of sections) for (const g of s.groups) { groups++; slots += g.slots.length; }
  return { slots, groups };
}
