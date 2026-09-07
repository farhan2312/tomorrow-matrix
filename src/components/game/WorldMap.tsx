import { Link } from "@tanstack/react-router";
import { Lock, Check, AlertTriangle, Sparkles, Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import worldMap from "@/assets/world-map.jpg";
import {
  REGIONS, MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole,
} from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import type { MysteryDomain } from "@/lib/game/types";

type HotspotState = "completed" | "available" | "locked" | "crisis";

const STATE_STYLE: Record<HotspotState, { color: string; label: string; ring: string }> = {
  completed: { color: "var(--terra)",       label: "Restored",  ring: "ring-[color:var(--terra)]/40" },
  available: { color: "var(--warmth)",      label: "Available", ring: "ring-[color:var(--warmth)]/50" },
  locked:    { color: "oklch(0.55 0.01 150)", label: "Locked",  ring: "ring-muted-foreground/30" },
  crisis:    { color: "var(--destructive)",  label: "Crisis",   ring: "ring-destructive/50" },
};

/** Per-domain "restoration" theming: gradient tint + celebratory emoji swarm. */
const RESTORE_THEME: Record<MysteryDomain, { glow: string; emojis: string[]; label: string }> = {
  climate:    { glow: "16 185 129",  emojis: ["🌿", "☀️", "🌤️"],  label: "Atmosphere healing" },
  oceans:     { glow: "34 211 238",  emojis: ["🐟", "🪸", "🐢"],  label: "Reef thriving" },
  water:      { glow: "56 189 248",  emojis: ["💧", "🌊", "🐸"],  label: "Rivers flowing" },
  food:       { glow: "245 158 11",  emojis: ["🌾", "🐝", "🍎"],  label: "Farmland restored" },
  cities:     { glow: "20 184 166",  emojis: ["🌳", "🏙️", "🚲"],  label: "City breathing" },
  bio:        { glow: "22 163 74",   emojis: ["🦋", "🌿", "🐦"],  label: "Wildlife returning" },
  society:    { glow: "244 114 182", emojis: ["🤝", "💚", "🎉"],  label: "Community thriving" },
  governance: { glow: "139 92 246",  emojis: ["⚖️", "📜", "🕊️"],  label: "Policy protecting" },
  economy:    { glow: "16 185 129",  emojis: ["💚", "🌱", "🔄"],  label: "Green economy" },
  energy:     { glow: "234 179 8",   emojis: ["☀️", "⚡", "🌬️"],  label: "Clean power" },
  health:     { glow: "236 72 153",  emojis: ["💊", "🫁", "💚"],  label: "Health recovering" },
  pollution:  { glow: "148 163 184", emojis: ["🌬️", "✨", "🌤️"],  label: "Air clearing" },
};

export function WorldMap() {
  const solved = useGame((s) => s.solvedMysteries);
  const pendingCrisisId = useGame((s) => s.pendingCrisisId);
  const role = useGame((s) => s.role);
  const planetHealth = useGame((s) => s.planetHealth);

  // Track newly-solved mysteries for celebration burst
  const prevSolvedRef = useRef<string[]>(solved);
  const [celebrating, setCelebrating] = useState<Set<string>>(new Set());
  useEffect(() => {
    const prev = new Set(prevSolvedRef.current);
    const fresh = solved.filter((id) => !prev.has(id));
    if (fresh.length > 0) {
      setCelebrating((c) => {
        const next = new Set(c);
        fresh.forEach((id) => next.add(id));
        return next;
      });
      const t = window.setTimeout(() => {
        setCelebrating((c) => {
          const next = new Set(c);
          fresh.forEach((id) => next.delete(id));
          return next;
        });
      }, 3200);
      prevSolvedRef.current = solved;
      return () => window.clearTimeout(t);
    }
    prevSolvedRef.current = solved;
  }, [solved]);

  const visibleRegions = REGIONS.filter((r) => {
    const m = r.mysteryId ? MYSTERIES.find((x) => x.id === r.mysteryId) : null;
    return m && isMysteryVisibleForRole(role, m);
  });
  const restoredCount = visibleRegions.filter((r) => solved.includes(r.mysteryId!)).length;
  const restorationPct = visibleRegions.length
    ? Math.round((restoredCount / visibleRegions.length) * 100)
    : 0;

  // --- Living map: reveal vibrant colour exactly where mysteries are solved ---
  const solvedRegions = visibleRegions.filter((r) => solved.includes(r.mysteryId!));
  // Gentle GLOBAL recovery as Terra heals (kept subtle so solved spots dominate).
  const healthReveal = Math.max(0, Math.min(0.36, ((planetHealth - 40) / 32) * 0.32 + restoredCount * 0.006));
  // Ashy (barren) at the start, alive (blue-green) as Terra comes back.
  const aliveT = Math.max(0, Math.min(1, (planetHealth - 40) / 32 + restoredCount * 0.02));
  const revealLayers = [
    `linear-gradient(rgba(0,0,0,${healthReveal.toFixed(3)}), rgba(0,0,0,${healthReveal.toFixed(3)}))`,
    ...solvedRegions.map(
      (r) => `radial-gradient(circle at ${r.x}% ${r.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,0.8) 13%, rgba(0,0,0,0) 26%)`,
    ),
  ];
  const revealMask = revealLayers.join(", ");
  const revealRepeat = revealLayers.map(() => "no-repeat").join(", ");

  return (
    <div className="surface-lift relative overflow-hidden">
      <div className="relative aspect-[16/9] w-full">
        {/* Base layer: barren, ashy Terra (desaturated) — the planet at rest */}
        <img
          src={worldMap}
          alt="Terra world map showing active climate mysteries"
          loading="lazy"
          width={1920} height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(1) sepia(0.28) brightness(0.82) contrast(1.03)" }}
        />
        {/* Reveal layer: full colour, masked to show only where mysteries are solved
            (plus a gentle global lift as Terra Health recovers) */}
        <div
          className="pointer-events-none absolute inset-0 transition-[mask-image] duration-700"
          style={{
            WebkitMaskImage: revealMask,
            maskImage: revealMask,
            WebkitMaskRepeat: revealRepeat,
            maskRepeat: revealRepeat,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          <img
            src={worldMap}
            alt=""
            aria-hidden
            width={1920} height={1080}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "saturate(1.35) brightness(1.05)" }}
          />
        </div>
        {/* Ashy vignette that lifts as Terra recovers */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: 1 - aliveT,
            background: "radial-gradient(130% 100% at 50% 42%, rgba(70,64,56,0.10), rgba(38,35,32,0.42))",
            mixBlendMode: "multiply",
          }}
        />
        {/* Healthy blue-green atmosphere that grows as Terra recovers */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: aliveT,
            background: "linear-gradient(160deg, rgba(56,189,248,0.16), rgba(16,185,129,0.10) 55%, rgba(255,255,255,0.05))",
          }}
        />

        {/* Restoration heal layers, drawn under hotspots so pins stay clickable */}
        <div className="pointer-events-none absolute inset-0">
          {REGIONS.map((r) => {
            const mystery = r.mysteryId ? MYSTERIES.find((m) => m.id === r.mysteryId) : null;
            if (!mystery) return null;
            if (!isMysteryVisibleForRole(role, mystery)) return null;
            const isSolved = solved.includes(mystery.id);
            if (!isSolved) return null;
            const theme = RESTORE_THEME[mystery.domain] ?? RESTORE_THEME.climate;
            const isFresh = celebrating.has(mystery.id);
            return (
              <div
                key={`heal-${r.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
              >
                {/* Healing radial glow */}
                <div
                  className={cn(
                    "h-32 w-32 rounded-full opacity-70 mix-blend-screen transition-all duration-700",
                    isFresh && "animate-pulse",
                  )}
                  style={{
                    background: `radial-gradient(circle, rgba(${theme.glow}, 0.55) 0%, rgba(${theme.glow}, 0.25) 40%, rgba(${theme.glow}, 0) 70%)`,
                  }}
                />
                {/* Ambient emoji drift (persistent) */}
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="relative h-24 w-24">
                    {theme.emojis.map((e, i) => (
                      <span
                        key={i}
                        className="absolute text-lg drop-shadow-md"
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${15 + (i % 2) * 45}%`,
                          animation: `float-drift ${4 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
                          opacity: 0.85,
                        }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Celebration burst for newly solved */}
                {isFresh && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    {theme.emojis.concat(theme.emojis).map((e, i) => {
                      const angle = (i / 6) * Math.PI * 2;
                      const dx = Math.cos(angle) * 60;
                      const dy = Math.sin(angle) * 60;
                      return (
                        <span
                          key={`burst-${i}`}
                          className="absolute text-xl"
                          style={{
                            animation: `burst-out 1.6s ease-out forwards`,
                            ["--dx" as string]: `${dx}px`,
                            ["--dy" as string]: `${dy}px`,
                          }}
                        >
                          {e}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {REGIONS.map((r) => {
          const mystery = r.mysteryId ? MYSTERIES.find((m) => m.id === r.mysteryId) : null;
          if (!mystery) return null;
          if (!isMysteryVisibleForRole(role, mystery)) return null;
          const isSolved = solved.includes(mystery.id);
          const unlocked = isMysteryUnlocked(mystery.id, solved);
          const isCrisis = !!pendingCrisisId;
          const theme = RESTORE_THEME[mystery.domain] ?? RESTORE_THEME.climate;
          let state: HotspotState = "locked";
          if (isSolved) state = "completed";
          else if (unlocked) state = "available";
          if (!isSolved && isCrisis && unlocked && Math.random() < 0) state = "crisis";

          const style = STATE_STYLE[state];
          const Wrapper: React.ElementType = unlocked ? Link : "div";
          const wrapperProps = unlocked
            ? { to: "/play/mysteries/$id", params: { id: mystery.id } }
            : {};

          return (
            <Wrapper
              key={r.id}
              {...wrapperProps}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 group", !unlocked && "cursor-not-allowed")}
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              {state === "available" && (
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full animate-ping"
                  style={{ background: style.color, opacity: 0.25 }}
                />
              )}
              <span
                className={cn(
                  "relative grid h-7 w-7 place-items-center rounded-full border-2 border-white shadow-md ring-4",
                  style.ring,
                )}
                style={{ background: style.color }}
              >
                {state === "completed" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                {state === "locked"    && <Lock  className="h-3 w-3 text-white/85" />}
                {state === "available" && <Sparkles className="h-3.5 w-3.5 text-white" />}
                {state === "crisis"    && <AlertTriangle className="h-3.5 w-3.5 text-white" />}
              </span>

              <div
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-white/95 p-3 text-left shadow-xl backdrop-blur-md",
                  "opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="pill text-[9px]" style={{ background: style.color, color: "white", borderColor: "transparent" }}>
                    {style.label}
                  </span>
                  <span className="pill chip-stone text-[9px]">T{mystery.tier}</span>
                </div>
                <div className="mt-1.5 font-display text-sm font-semibold leading-tight">{mystery.title}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.name}</div>
                <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{mystery.brief}</div>
                {isSolved ? (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="pill chip-terra text-[10px]">
                      <Leaf className="h-2.5 w-2.5" /> {theme.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">+{mystery.reward} CAP</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="pill chip-terra text-[10px]"><Sparkles className="h-2.5 w-2.5" />up to {mystery.reward} CAP</span>
                    {!unlocked && <span className="text-[10px] text-muted-foreground">Solve prereqs</span>}
                  </div>
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Terra Restoration progress */}
      <div className="border-t border-border bg-background/70 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-1.5 font-medium text-[color:var(--terra-deep)]">
            <Leaf className="h-3.5 w-3.5" />
            Terra restoration
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-muted-foreground/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-700"
              style={{ width: `${restorationPct}%` }}
            />
          </div>
          <div className="font-mono text-[color:var(--terra-deep)]">
            {restoredCount}/{visibleRegions.length} · {restorationPct}%
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {(["available", "completed", "locked", "crisis"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full border border-white shadow-sm" style={{ background: STATE_STYLE[k].color }} />
              {STATE_STYLE[k].label}
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">Solve mysteries to watch Terra come back to life</span>
        </div>
      </div>

      {/* Keyframes: keep inline so tailwind config stays untouched */}
      <style>{`
        @keyframes float-drift {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-6px) rotate(4deg); }
        }
        @keyframes burst-out {
          0%   { transform: translate(0,0) scale(0.6); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
