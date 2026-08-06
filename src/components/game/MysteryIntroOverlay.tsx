import { useEffect, useState } from "react";
import { SkipForward, Play, Film } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { introVideo } from "@/lib/game/media";
import { useGame } from "@/lib/game/store";
import type { Mystery } from "@/lib/game/types";

interface Props {
  mystery: Mystery;
  open: boolean;
  /** Called when the intro is finished or skipped — the puzzle then begins. */
  onDone: (info: { skipped: boolean }) => void;
}

/** Cinematic pre-puzzle intro. Sets the scene without revealing the sequence. */
export function MysteryIntroOverlay({ mystery, open, onDone }: Props) {
  const media = introVideo(mystery);
  const mediaState = useGame((s) => s.mediaState[mystery.id]);
  const markIntroWatched = useGame((s) => s.markIntroWatched);
  const markIntroSkipped = useGame((s) => s.markIntroSkipped);
  const savePosition = useGame((s) => s.saveMediaPosition);
  const [ended, setEnded] = useState(false);

  useEffect(() => { if (open) setEnded(false); }, [open, mystery.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const skip = () => { markIntroSkipped(mystery.id); onDone({ skipped: true }); };
  const begin = () => { onDone({ skipped: false }); };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 backdrop-blur-sm animate-[fade-in_220ms_ease-out]">
      <div className="w-full max-w-4xl">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="text-white">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/65">
              <Film className="h-3 w-3" /> Mystery briefing · {mystery.code} · Tier {mystery.tier}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">{mystery.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/70">{mystery.brief}</p>
          </div>
          <button
            onClick={skip}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <SkipForward className="h-3.5 w-3.5" /> Skip intro
          </button>
        </div>

        <VideoPlayer
          src={media.src}
          poster={media.poster ?? mystery.image}
          captions={media.captions}
          title={media.title}
          autoPlay
          startAt={mediaState?.positions?.intro ?? 0}
          onPosition={(s) => savePosition(mystery.id, "intro", s)}
          onEnded={() => { markIntroWatched(mystery.id); setEnded(true); }}
          onStarted={() => { /* watched-count is credited on completion */ }}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-white/55">
            {ended
              ? "Briefing complete — the chain is yours to reconstruct."
              : "The briefing sets the real-world context. It never reveals the correct order."}
          </p>
          <button
            onClick={begin}
            className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Play className="h-4 w-4" /> Begin the puzzle
          </button>
        </div>
      </div>
    </div>
  );
}
