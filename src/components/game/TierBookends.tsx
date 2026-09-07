import { useEffect, useRef, useState } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { MYSTERIES } from "@/lib/game/data";
import { VideoPlayer } from "./VideoPlayer";

const BASE = "https://pub-69120684814b4cf79407e38e0e03c45f.r2.dev/videos/bookend";
const KEY = "tm-bookends-shown-v1";
const THRESHOLD: Record<number, number> = { 1: 0, 2: 4, 3: 12, 4: 22 };

function getShown(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); }
}
function markShown(id: string) {
  try {
    const s = getShown(); s.add(id);
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch { /* storage unavailable */ }
}

/** Bookends that are currently "earned": tier 2-4 intros on unlock, all tier outros on completion. */
function earned(solved: string[]): string[] {
  const count = solved.length;
  const out: string[] = [];
  for (const t of [2, 3, 4]) if (count >= THRESHOLD[t]) out.push(`intro-T${t}`);
  for (const t of [1, 2, 3, 4]) {
    const tierM = MYSTERIES.filter((m) => m.tier === t);
    if (tierM.length && tierM.every((m) => solved.includes(m.id))) out.push(`outro-T${t}`);
  }
  return out;
}

/**
 * Plays the tier intro / outro bookend videos at the right moments:
 * a Tier 2-4 "intro" when that tier unlocks, and a tier "outro" when every
 * mystery in a tier is solved. Each plays once per browser; nothing replays on
 * reload (the first mount just records what's already earned as a baseline).
 */
export function TierBookends() {
  const solved = useGame((s) => s.solvedMysteries);
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const avail = earned(solved);
    if (!initialized.current) {
      initialized.current = true;
      avail.forEach(markShown); // baseline: don't replay past transitions on load
      return;
    }
    const shown = getShown();
    const fresh = avail.filter((id) => !shown.has(id));
    if (fresh.length) setQueue((q) => [...q, ...fresh.filter((f) => !q.includes(f) && f !== current)]);
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  // Preview any bookend directly, e.g. /play?bookend=intro-T2 (handy for QA).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("bookend");
    if (p && /^(intro|outro)-T[1-4]$/.test(p)) setCurrent(p);
  }, []);

  if (!current) return null;

  const isIntro = current.startsWith("intro");
  const tier = current.split("-T")[1];
  const done = () => { markShown(current); setCurrent(null); };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/92 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {isIntro
              ? <><Sparkles className="h-3.5 w-3.5 text-[color:var(--terra)]" /> Entering Tier {tier}</>
              : <><Trophy className="h-3.5 w-3.5 text-[color:var(--warmth)]" /> Tier {tier} Complete</>}
          </div>
          <button onClick={done} className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10">
            Skip →
          </button>
        </div>

        <VideoPlayer
          src={`${BASE}/${current}.mp4`}
          title={isIntro ? `Tier ${tier}` : `Tier ${tier} complete`}
          autoPlay
          onEnded={done}
        />

        <div className="mt-4 text-center">
          <button onClick={done} className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-7 py-2.5 text-sm font-medium text-white">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
