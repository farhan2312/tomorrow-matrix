import { create } from "zustand";
import { persist } from "zustand/middleware";
import voiceData from "@/lib/game/voice.data.json";

export interface VoiceEntry { id: string; trigger: string; line: string }
export const VOICE: VoiceEntry[] = voiceData as VoiceEntry[];
const BY_ID = new Map(VOICE.map((v) => [v.id, v]));

export function getVoice(id: string): VoiceEntry | undefined { return BY_ID.get(id); }

interface AudioPrefs {
  voiceOn: boolean;
  subtitlesOn: boolean;
  muteAll: boolean;
  volumes: { master: number; music: number; sfx: number; voice: number };
  language: string;
  bookmarks: string[];    // glossary term ids
  recent: string[];       // recently viewed glossary term ids
  toggleVoice: () => void;
  toggleSubtitles: () => void;
  toggleMute: () => void;
  setVolume: (k: keyof AudioPrefs["volumes"], v: number) => void;
  setLanguage: (l: string) => void;
  bookmark: (id: string) => void;
  unbookmark: (id: string) => void;
  markRecent: (id: string) => void;
}

export const useAudioPrefs = create<AudioPrefs>()(
  persist(
    (set, get) => ({
      voiceOn: false,
      subtitlesOn: true,
      muteAll: false,
      volumes: { master: 80, music: 60, sfx: 70, voice: 90 },
      language: "en",
      bookmarks: [],
      recent: [],
      toggleVoice: () => set({ voiceOn: !get().voiceOn }),
      toggleSubtitles: () => set({ subtitlesOn: !get().subtitlesOn }),
      toggleMute: () => set({ muteAll: !get().muteAll }),
      setVolume: (k, v) => set({ volumes: { ...get().volumes, [k]: Math.max(0, Math.min(100, v)) } }),
      setLanguage: (l) => set({ language: l }),
      bookmark: (id) => set({ bookmarks: Array.from(new Set([...get().bookmarks, id])) }),
      unbookmark: (id) => set({ bookmarks: get().bookmarks.filter((x) => x !== id) }),
      markRecent: (id) => set({ recent: [id, ...get().recent.filter((x) => x !== id)].slice(0, 12) }),
    }),
    { name: "tm-audio-prefs" },
  ),
);

/* ---------------- Narration engine (SpeechSynthesis) ---------------- */

interface NarrationState {
  currentId: string | null;
  currentText: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  play: (id: string, vars?: Record<string, string | number>) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let fadeTimer: number | null = null;

function interpolate(line: string, vars?: Record<string, string | number>): string {
  if (!vars) return line;
  return line.replace(/\[([A-Z0-9 %_-]+)\]/g, (m, key: string) => {
    const norm = key.trim();
    const v = vars[norm] ?? vars[norm.toLowerCase()];
    return v !== undefined ? String(v) : m;
  });
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer warm English voices
  const prefs = ["Samantha", "Google UK English Female", "Karen", "Serena", "Victoria", "Google US English"];
  for (const name of prefs) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) || voices[0];
}

export const useNarration = create<NarrationState>((set, get) => ({
  currentId: null,
  currentText: null,
  isPlaying: false,
  isPaused: false,
  play: (id, vars) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const prefs = useAudioPrefs.getState();
    if (!prefs.voiceOn || prefs.muteAll) return;
    const entry = getVoice(id);
    if (!entry) return;

    // Fade / stop existing
    try { window.speechSynthesis.cancel(); } catch {}
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }

    const text = interpolate(entry.line, vars);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    const vol = (prefs.volumes.master / 100) * (prefs.volumes.voice / 100);
    u.volume = Math.max(0, Math.min(1, vol));
    const v = pickVoice();
    if (v) u.voice = v;

    u.onend = () => {
      if (currentUtterance === u) {
        currentUtterance = null;
        set({ isPlaying: false, isPaused: false });
      }
    };
    u.onerror = u.onend;
    currentUtterance = u;
    set({ currentId: id, currentText: text, isPlaying: true, isPaused: false });
    try { window.speechSynthesis.speak(u); } catch {}
  },
  stop: () => {
    if (typeof window === "undefined") return;
    try { window.speechSynthesis.cancel(); } catch {}
    currentUtterance = null;
    set({ isPlaying: false, isPaused: false, currentId: null, currentText: null });
  },
  pause: () => {
    try { window.speechSynthesis.pause(); } catch {}
    set({ isPaused: true, isPlaying: false });
  },
  resume: () => {
    try { window.speechSynthesis.resume(); } catch {}
    set({ isPaused: false, isPlaying: true });
  },
  replay: () => {
    const id = get().currentId;
    if (id) get().play(id);
  },
}));

/** Fire-and-forget helper for gameplay events. Safe to call even when voice is off. */
export function narrate(id: string, vars?: Record<string, string | number>) {
  try { useNarration.getState().play(id, vars); } catch {}
}
