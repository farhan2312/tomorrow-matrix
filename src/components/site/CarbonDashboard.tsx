import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Premium climate intelligence dashboard.
 * Miniature Earth center + Scope 1/2/3 orbital rings with contextual iconography.
 * Hovering a scope illuminates its emission sources.
 */
export function CarbonDashboard({ height = 460 }: { height?: number }) {
  const [scope, setScope] = useState<0 | 1 | 2 | 3>(0);

  const ring = (r: number, label: string, n: 1 | 2 | 3, color: string) => {
    const active = scope === n;
    return (
      <g>
        <circle
          cx="250"
          cy="250"
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity={active ? 0.55 : 0.18}
          strokeWidth={active ? 1.2 : 0.6}
          strokeDasharray="2 6"
          style={{ transition: "all 400ms ease" }}
        />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60 + n * 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "250px 250px" }}
        >
          {/* label chip */}
          <g
            transform={`translate(${250 + r} 250)`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setScope(n)}
            onMouseLeave={() => setScope(0)}
          >
            <rect
              x="-22"
              y="-9"
              width="44"
              height="18"
              rx="9"
              fill="white"
              stroke={color}
              strokeOpacity={active ? 1 : 0.5}
              strokeWidth={active ? 1.2 : 0.7}
              style={{ transition: "all 300ms" }}
              filter={active ? `drop-shadow(0 0 6px ${color})` : undefined}
            />
            <text
              textAnchor="middle"
              y="3"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1"
              fill={color}
            >
              {label}
            </text>
          </g>
        </motion.g>
      </g>
    );
  };

  // scope icons — positioned around each ring
  const scopeIcons: Record<
    1 | 2 | 3,
    { r: number; a: number; icon: "factory" | "vehicle" | "solar" | "wind" | "grid" | "ship" | "building" | "sat" }[]
  > = {
    1: [
      { r: 130, a: 25, icon: "factory" },
      { r: 130, a: 155, icon: "factory" },
      { r: 130, a: 235, icon: "vehicle" },
    ],
    2: [
      { r: 175, a: 60, icon: "solar" },
      { r: 175, a: 140, icon: "wind" },
      { r: 175, a: 220, icon: "grid" },
      { r: 175, a: 310, icon: "wind" },
    ],
    3: [
      { r: 220, a: 20, icon: "ship" },
      { r: 220, a: 90, icon: "building" },
      { r: 220, a: 160, icon: "sat" },
      { r: 220, a: 230, icon: "ship" },
      { r: 220, a: 300, icon: "building" },
    ],
  };

  return (
    <div
      className="relative select-none"
      style={{ height }}
      onMouseLeave={() => setScope(0)}
    >
      {/* ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--leaf) 12%, transparent), transparent 70%)",
        }}
      />
      {/* glass panel reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 100%)",
          mixBlendMode: "overlay",
        }}
      />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-full w-full"
      >
        <svg viewBox="0 0 500 500" className="h-full w-full">
          <defs>
            <radialGradient id="cdEarth" cx="38%" cy="32%">
              <stop offset="0%" stopColor="#7ec4e6" />
              <stop offset="45%" stopColor="#2b6a94" />
              <stop offset="85%" stopColor="#0e2f4a" />
              <stop offset="100%" stopColor="#04182a" />
            </radialGradient>
            <radialGradient id="cdAtm" cx="50%" cy="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="85%" stopColor="rgba(126,196,230,0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="cdSpec" cx="30%" cy="25%">
              <stop offset="0%" stopColor="white" stopOpacity="0.55" />
              <stop offset="45%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cdFlow1" x1="0" x2="1">
              <stop offset="0%" stopColor="#fcb53b" stopOpacity="0" />
              <stop offset="50%" stopColor="#fcb53b" stopOpacity="1" />
              <stop offset="100%" stopColor="#fcb53b" stopOpacity="0" />
            </linearGradient>
            <clipPath id="cdEarthClip">
              <circle cx="250" cy="250" r="90" />
            </clipPath>
          </defs>

          {/* atmosphere glow */}
          <circle cx="250" cy="250" r="110" fill="url(#cdAtm)" />

          {/* orbital rings */}
          {ring(130, "SCOPE 1", 1, "#fcb53b")}
          {ring(175, "SCOPE 2", 2, "#84994f")}
          {ring(220, "SCOPE 3", 3, "#a64b2a")}

          {/* Earth body */}
          <circle cx="250" cy="250" r="90" fill="url(#cdEarth)" />

          {/* continents (stylized recognizable shapes) */}
          <g clipPath="url(#cdEarthClip)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "250px 250px" }}
            >
              {/* N America */}
              <path
                d="M 190 205 Q 200 195 215 200 Q 225 205 220 220 Q 210 232 200 228 Q 188 222 190 205 Z"
                fill="#6b8b3c"
              />
              {/* S America */}
              <path
                d="M 218 240 Q 226 244 224 258 Q 220 272 214 268 Q 210 258 218 240 Z"
                fill="#7a9a44"
              />
              {/* Europe */}
              <path
                d="M 250 208 Q 258 204 264 210 Q 262 218 254 218 Q 248 216 250 208 Z"
                fill="#6b8b3c"
              />
              {/* Africa */}
              <path
                d="M 258 224 Q 272 224 276 240 Q 274 258 262 264 Q 252 258 254 240 Q 254 228 258 224 Z"
                fill="#7a9a44"
              />
              {/* Asia */}
              <path
                d="M 272 202 Q 300 200 308 218 Q 306 232 290 234 Q 276 230 272 218 Z"
                fill="#6b8b3c"
              />
              {/* Australia */}
              <path
                d="M 296 258 Q 310 256 312 266 Q 306 274 296 272 Q 292 266 296 258 Z"
                fill="#7a9a44"
              />
            </motion.g>

            {/* clouds */}
            <motion.g
              animate={{ x: [-30, 30, -30] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              opacity="0.5"
            >
              <ellipse cx="220" cy="220" rx="26" ry="6" fill="white" />
              <ellipse cx="280" cy="250" rx="30" ry="5" fill="white" />
              <ellipse cx="240" cy="285" rx="22" ry="5" fill="white" />
            </motion.g>

            {/* specular highlight */}
            <circle cx="250" cy="250" r="90" fill="url(#cdSpec)" />

            {/* terminator (day/night) */}
            <ellipse cx="285" cy="250" rx="60" ry="90" fill="rgba(0,10,24,0.35)" />
          </g>

          {/* atmosphere ring */}
          <circle
            cx="250"
            cy="250"
            r="92"
            fill="none"
            stroke="rgba(126,196,230,0.5)"
            strokeWidth="1"
          />

          {/* CO2 particles rising from Earth */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const sx = 250 + Math.cos(angle) * 88;
            const sy = 250 + Math.sin(angle) * 88;
            const ex = 250 + Math.cos(angle) * 118;
            const ey = 250 + Math.sin(angle) * 118;
            return (
              <motion.circle
                key={i}
                r="1.5"
                fill="#fcb53b"
                initial={{ cx: sx, cy: sy, opacity: 0 }}
                animate={{ cx: ex, cy: ey, opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Icons around scope rings */}
          {(Object.keys(scopeIcons) as unknown as (1 | 2 | 3)[]).map((n) => {
            const items = scopeIcons[n];
            const active = scope === n || scope === 0;
            const color = n === 1 ? "#fcb53b" : n === 2 ? "#84994f" : "#a64b2a";
            return (
              <motion.g
                key={n}
                animate={{ rotate: n === 2 ? -360 : 360 }}
                transition={{
                  duration: 80 + n * 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "250px 250px" }}
              >
                {items.map((it, idx) => {
                  const rad = (it.a * Math.PI) / 180;
                  const x = 250 + Math.cos(rad) * it.r;
                  const y = 250 + Math.sin(rad) * it.r;
                  return (
                    <g
                      key={idx}
                      transform={`translate(${x} ${y})`}
                      opacity={active ? 1 : 0.25}
                      style={{ transition: "opacity 400ms" }}
                      filter={scope === n ? `drop-shadow(0 0 6px ${color})` : undefined}
                    >
                      <ScopeIcon kind={it.icon} color={color} />
                    </g>
                  );
                })}
              </motion.g>
            );
          })}

          {/* Data readout — top-left */}
          <g transform="translate(30 40)">
            <text fontSize="8" fontFamily="ui-monospace, monospace" fill="#4a5a6a" letterSpacing="1.5">
              CLIMATE INTELLIGENCE
            </text>
            <text
              y="14"
              fontSize="7"
              fontFamily="ui-monospace, monospace"
              fill="#8a9aa0"
              letterSpacing="1"
            >
              tCO₂e · LIVE · GHG PROTOCOL
            </text>
          </g>
          {/* readout bars */}
          <g transform="translate(30 68)">
            {(["Scope 1", "Scope 2", "Scope 3"] as const).map((s, i) => {
              const w = [30, 55, 100][i];
              const c = ["#fcb53b", "#84994f", "#a64b2a"][i];
              const active = scope === (i + 1);
              return (
                <g key={s} transform={`translate(0 ${i * 14})`}>
                  <text fontSize="6.5" fontFamily="ui-monospace, monospace" fill="#6a7a80" y="4">
                    {s.toUpperCase()}
                  </text>
                  <rect x="52" y="0" width="110" height="4" rx="2" fill="#e6ebee" />
                  <motion.rect
                    x="52"
                    y="0"
                    height="4"
                    rx="2"
                    fill={c}
                    initial={{ width: 0 }}
                    animate={{ width: w }}
                    transition={{ duration: 1.2, delay: i * 0.2 }}
                    opacity={active ? 1 : 0.75}
                  />
                </g>
              );
            })}
          </g>

          {/* target line — bottom right */}
          <g transform="translate(320 420)">
            <text fontSize="7" fontFamily="ui-monospace, monospace" fill="#6a7a80" letterSpacing="1.2">
              NET-ZERO TRAJECTORY
            </text>
            <path
              d="M 0 30 Q 40 20 80 10 T 150 -20"
              stroke="#84994f"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="3 3"
            />
            <circle cx="0" cy="30" r="2" fill="#a64b2a" />
            <circle cx="150" cy="-20" r="2.5" fill="#84994f">
              <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Rotating satellite orbiting outside */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "250px 250px" }}
          >
            <g transform="translate(485 250)">
              <rect x="-4" y="-2" width="8" height="4" fill="#c8ccd0" />
              <rect x="-10" y="-1" width="4" height="2" fill="#7c9ac2" />
              <rect x="6" y="-1" width="4" height="2" fill="#7c9ac2" />
              <line x1="0" y1="2" x2="-30" y2="20" stroke="#fcb53b" strokeWidth="0.4" strokeDasharray="1 2" />
            </g>
          </motion.g>

          {/* Flowing supply-chain arcs (Scope 3 illumination) */}
          {scope === 3 &&
            [0, 60, 120, 180, 240, 300].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const x = 250 + Math.cos(a) * 220;
              const y = 250 + Math.sin(a) * 220;
              return (
                <motion.path
                  key={deg}
                  d={`M 250 250 Q ${(250 + x) / 2 + 30} ${(250 + y) / 2 - 30} ${x} ${y}`}
                  stroke="url(#cdFlow1)"
                  strokeWidth="1"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.8 }}
                />
              );
            })}
        </svg>
      </motion.div>

      {/* Scope hint pill */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-foreground/70">
        {scope === 0
          ? "Hover a scope ring"
          : scope === 1
            ? "Direct — owned facilities & vehicles"
            : scope === 2
              ? "Indirect — purchased electricity"
              : "Value chain — supply, use, disposal"}
      </div>
    </div>
  );
}

function ScopeIcon({ kind, color }: { kind: string; color: string }) {
  const c = color;
  switch (kind) {
    case "factory":
      return (
        <g>
          <rect x="-8" y="-2" width="16" height="10" rx="1" fill="white" stroke={c} strokeWidth="1" />
          <polygon points="-8,-2 -4,-6 -4,-2" fill="white" stroke={c} strokeWidth="1" />
          <polygon points="-4,-2 0,-6 0,-2" fill="white" stroke={c} strokeWidth="1" />
          <rect x="4" y="-9" width="2" height="6" fill={c} />
          <motion.circle
            cx="5"
            cy="-12"
            r="1.5"
            fill={c}
            animate={{ cy: [-12, -18], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      );
    case "vehicle":
      return (
        <g>
          <rect x="-8" y="-3" width="16" height="6" rx="2" fill="white" stroke={c} strokeWidth="1" />
          <circle cx="-4" cy="4" r="1.5" fill={c} />
          <circle cx="4" cy="4" r="1.5" fill={c} />
          <rect x="-6" y="-2" width="4" height="3" fill={c} opacity="0.3" />
        </g>
      );
    case "solar":
      return (
        <g>
          <rect x="-8" y="-4" width="16" height="8" rx="0.5" fill="white" stroke={c} strokeWidth="1" transform="skewX(-15)" />
          <line x1="-4" y1="-4" x2="-4" y2="4" stroke={c} strokeWidth="0.4" transform="skewX(-15)" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke={c} strokeWidth="0.4" transform="skewX(-15)" />
          <line x1="4" y1="-4" x2="4" y2="4" stroke={c} strokeWidth="0.4" transform="skewX(-15)" />
          <circle cx="0" cy="-9" r="2" fill={c} />
        </g>
      );
    case "wind":
      return (
        <g>
          <rect x="-0.7" y="-2" width="1.4" height="10" fill={c} />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "0 -2px" }}
          >
            <path d="M 0 -2 L 6 -8 L 2 -3 Z" fill={c} />
            <path d="M 0 -2 L -6 -8 L -2 -3 Z" fill={c} />
            <path d="M 0 -2 L 0 -12 L -1 -6 Z" fill={c} />
          </motion.g>
        </g>
      );
    case "grid":
      return (
        <g>
          <path d="M -8 6 L 0 -6 L 8 6" stroke={c} strokeWidth="1" fill="none" />
          <path d="M -5 6 L -5 2 M 0 6 L 0 -2 M 5 6 L 5 2" stroke={c} strokeWidth="0.6" />
          <motion.path
            d="M 0 -6 L 3 0 L -2 0 L 1 6"
            stroke="#fcd93b"
            strokeWidth="1"
            fill="none"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </g>
      );
    case "ship":
      return (
        <g>
          <path d="M -8 2 L 8 2 L 6 6 L -6 6 Z" fill="white" stroke={c} strokeWidth="1" />
          <rect x="-4" y="-4" width="8" height="6" fill="white" stroke={c} strokeWidth="1" />
          <rect x="-3" y="-3" width="1.5" height="1.5" fill={c} />
          <rect x="0" y="-3" width="1.5" height="1.5" fill={c} />
        </g>
      );
    case "building":
      return (
        <g>
          <rect x="-5" y="-8" width="10" height="14" fill="white" stroke={c} strokeWidth="1" />
          {[-3, 0, 3].map((x) =>
            [-6, -3, 0, 3].map((y) => (
              <rect key={`${x}-${y}`} x={x - 0.7} y={y - 0.7} width="1.4" height="1.4" fill={c} opacity="0.6" />
            )),
          )}
        </g>
      );
    case "sat":
      return (
        <g>
          <rect x="-2" y="-2" width="4" height="4" fill="white" stroke={c} strokeWidth="1" />
          <rect x="-8" y="-1" width="5" height="2" fill={c} opacity="0.6" />
          <rect x="3" y="-1" width="5" height="2" fill={c} opacity="0.6" />
          <circle cx="0" cy="0" r="0.8" fill={c} />
        </g>
      );
    default:
      return null;
  }
}
