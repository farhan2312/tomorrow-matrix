import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize,
  Captions, Gauge, PictureInPicture2, Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export interface VideoPlayerProps {
  src?: string;
  poster?: string;
  captions?: string;
  title?: string;
  autoPlay?: boolean;
  /** Resume position (seconds) to seek to on mount. */
  startAt?: number;
  /** Called periodically with the current position so callers can persist it. */
  onPosition?: (seconds: number) => void;
  onEnded?: () => void;
  onStarted?: () => void;
  className?: string;
  /** Extra node rendered in the top-right of the frame (e.g. Skip intro). */
  overlayTopRight?: React.ReactNode;
}

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export function VideoPlayer({
  src, poster, captions, title, autoPlay, startAt = 0,
  onPosition, onEnded, onStarted, className, overlayTopRight,
}: VideoPlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [fs, setFs] = useState(false);
  const startedRef = useRef(false);

  // Resume position
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src || !startAt) return;
    const apply = () => { if (startAt < (v.duration || Infinity) - 1) v.currentTime = startAt; };
    if (v.readyState >= 1) apply();
    else v.addEventListener("loadedmetadata", apply, { once: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Persist position on unmount
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v && onPosition) onPosition(v.currentTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  }, []);

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };

  const seek = (pct: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = (pct / 100) * v.duration;
  };

  const toggleCaptions = () => {
    const v = videoRef.current;
    if (!v) return;
    const track = v.textTracks?.[0];
    if (!track) return;
    const next = !capsOn;
    track.mode = next ? "showing" : "hidden";
    setCapsOn(next);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch { /* ignore */ }
  };

  const togglePip = async () => {
    const v = videoRef.current as (HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> }) | null;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v?.requestPictureInPicture?.();
    } catch { /* ignore */ }
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  if (!src) {
    return (
      <div className={cn("relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-center", className)}>
        <div className="px-6">
          <Film className="mx-auto h-6 w-6 text-muted-foreground" />
          <div className="mt-2 text-sm font-medium">{title ?? "Video"}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Media not attached yet, this slot plays automatically once the video is added to the mystery library.
          </p>
        </div>
        {overlayTopRight && <div className="absolute right-3 top-3">{overlayTopRight}</div>}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={cn("group relative overflow-hidden rounded-2xl bg-black shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]", className)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        className="aspect-video w-full bg-black"
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          if (!startedRef.current) { startedRef.current = true; onStarted?.(); }
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setTime(t);
          if (Math.floor(t) % 5 === 0) onPosition?.(t);
        }}
        onEnded={() => { setPlaying(false); onPosition?.(0); onEnded?.(); }}
      >
        {captions && <track kind="captions" src={captions} srcLang="en" label="English" default={false} />}
      </video>

      {/* Title veil */}
      {title && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4 pb-10 opacity-100 transition-opacity">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">{title}</div>
        </div>
      )}
      {overlayTopRight && <div className="absolute right-3 top-3 z-10">{overlayTopRight}</div>}

      {/* Center play */}
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 z-0 grid place-items-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105">
            <Play className="h-7 w-7 translate-x-[2px]" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-8">
        <input
          type="range" min={0} max={100} step={0.1} value={pct}
          aria-label="Seek"
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{ background: `linear-gradient(to right, rgba(255,255,255,0.95) ${pct}%, rgba(255,255,255,0.22) ${pct}%)` }}
        />
        <div className="mt-2 flex items-center gap-1.5 text-white">
          <Ctl onClick={toggle} label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Ctl>
          <Ctl onClick={replay} label="Replay"><RotateCcw className="h-4 w-4" /></Ctl>

          <div className="ml-1 flex items-center gap-1.5">
            <Ctl
              onClick={() => {
                const v = videoRef.current; if (!v) return;
                v.muted = !v.muted; setMuted(v.muted);
              }}
              label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Ctl>
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const val = Number(e.target.value);
                const v = videoRef.current; if (!v) return;
                v.volume = val; v.muted = val === 0;
                setVolume(val); setMuted(val === 0);
              }}
              className="hidden h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/30 sm:block [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <span className="ml-1 font-mono text-[11px] tabular-nums text-white/85">
            {fmt(time)} / {fmt(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            {captions && (
              <Ctl onClick={toggleCaptions} label="Subtitles" active={capsOn}><Captions className="h-4 w-4" /></Ctl>
            )}
            <div className="relative">
              <Ctl onClick={() => setSpeedOpen((v) => !v)} label="Playback speed" active={rate !== 1}>
                <Gauge className="h-4 w-4" />
              </Ctl>
              {speedOpen && (
                <div className="absolute bottom-9 right-0 w-24 overflow-hidden rounded-lg border border-white/15 bg-black/90 py-1 text-xs backdrop-blur">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const v = videoRef.current; if (v) v.playbackRate = s;
                        setRate(s); setSpeedOpen(false);
                      }}
                      className={cn("block w-full px-3 py-1.5 text-left hover:bg-white/10", rate === s && "text-[color:var(--terra)]")}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Ctl onClick={togglePip} label="Picture in picture"><PictureInPicture2 className="h-4 w-4" /></Ctl>
            <Ctl onClick={toggleFullscreen} label="Fullscreen">
              {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Ctl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ctl({
  onClick, label, children, active,
}: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={label} title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-white/90 transition-colors hover:bg-white/15",
        active && "bg-white/20 text-white",
      )}
    >
      {children}
    </button>
  );
}
