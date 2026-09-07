import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

/**
 * Runtime media override registry. The admin console writes rows to
 * `media_overrides` (key -> url); the app reads them here and prefers an
 * override over the bundled/default asset. Publicly readable (RLS).
 *
 * Keys: "video/M01/intro" | "video/M01/explainer" | "video/M01/animation"
 *       | "video/bookend/intro-T1" | "cover/M01" | "card/M01/3"
 *       | "intervention/energy" | "scene/world-map" | "social/og" ...
 */
interface MediaState {
  map: Record<string, string>;
  loaded: boolean;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

async function fetchMap(): Promise<Record<string, string>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from("media_overrides").select("key, url");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.fromEntries((data ?? []).map((r: any) => [r.key, r.url]));
  } catch {
    return {};
  }
}

export const useMediaOverrides = create<MediaState>((set, get) => ({
  map: {},
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    set({ map: await fetchMap(), loaded: true });
  },
  refresh: async () => set({ map: await fetchMap(), loaded: true }),
}));

/** Non-reactive resolver for module code (e.g. media.ts). */
export function mediaOverride(key: string): string | undefined {
  return useMediaOverrides.getState().map[key];
}

/** Resolve `key` to its override, or the bundled fallback. */
export function resolveMedia(key: string, fallback: string): string {
  return useMediaOverrides.getState().map[key] ?? fallback;
}
