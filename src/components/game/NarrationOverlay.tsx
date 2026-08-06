import { useEffect } from "react";
import { Volume2, Pause, Play, RotateCcw, X } from "lucide-react";
import { useNarration, useAudioPrefs } from "@/lib/voice/store";

/** Floating speaker + subtitle bar. Auto-hides when nothing is playing. */
export function NarrationOverlay() {
  const { currentText, isPlaying, isPaused, pause, resume, replay, stop } = useNarration();
  const subtitlesOn = useAudioPrefs((s) => s.subtitlesOn);
  const voiceOn = useAudioPrefs((s) => s.voiceOn);

  // Prime voices list on mount (Chrome quirk)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  if (!voiceOn) return null;
  if (!isPlaying && !isPaused) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-border/60 bg-background/85 p-3 shadow-lg backdrop-blur-xl">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-current opacity-60 ${isPlaying ? "animate-ping" : ""}`} />
            <Volume2 className="h-4 w-4" />
          </span>
        </div>
        {subtitlesOn && currentText && (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground">{currentText}</p>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {isPlaying ? (
            <button onClick={pause} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Pause narration">
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={resume} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Resume narration">
              <Play className="h-4 w-4" />
            </button>
          )}
          <button onClick={replay} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Replay">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={stop} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Skip">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
