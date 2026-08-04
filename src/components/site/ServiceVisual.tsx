import { motion } from "framer-motion";

export function ServiceVisual({ kind, height = 128 }: { kind: string; height?: number }) {
  if (kind === "carbon") {
    return (
      <div
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[color-mix(in_oklab,var(--forest)_10%,white)] to-[color-mix(in_oklab,var(--ember)_10%,white)]"
        style={{ height }}
      >
        {/* mini earth silhouette */}
        <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="miniEarth" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#3f8fb5" />
              <stop offset="70%" stopColor="#1a4a6e" />
              <stop offset="100%" stopColor="#0b2436" />
            </radialGradient>
          </defs>
          <circle cx="55" cy="60" r="36" fill="url(#miniEarth)" />
          <path
            d="M40 50 q 8 -8 20 -4 q 8 4 4 14 q -6 10 -18 6 q -10 -4 -6 -16 Z"
            fill="#6b8b3c"
            opacity="0.9"
          />
          <ellipse cx="55" cy="60" rx="36" ry="8" fill="white" opacity="0.15" />
          <motion.circle
            cx="55"
            cy="60"
            r="42"
            fill="none"
            stroke="var(--ember)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "55px 60px" }}
          />
          {/* Scope arrows */}
          {[1, 2, 3].map((s, i) => (
            <g key={s}>
              <text x={110} y={40 + i * 22} fontSize="9" fill="var(--clay)" fontFamily="ui-monospace, monospace">
                SCOPE {s}
              </text>
              <motion.rect
                x="110"
                y={45 + i * 22}
                height="3"
                rx="1.5"
                fill={i === 0 ? "var(--forest)" : i === 1 ? "var(--ember)" : "var(--clay)"}
                initial={{ width: 0 }}
                animate={{ width: [0, 50 + i * 10, 50 + i * 10] }}
                transition={{ duration: 3, delay: i * 0.4, repeat: Infinity, repeatDelay: 1 }}
              />
            </g>
          ))}
        </svg>
        {/* Rising carbon particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ y: height, opacity: 0 }}
            animate={{ y: -20, opacity: [0, 0.7, 0] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: `${20 + (i * 6) % 25}%`,
              background: i % 2 === 0 ? "var(--ember)" : "color-mix(in oklab, var(--forest) 60%, white)",
            }}
          />
        ))}
      </div>
    );
  }

  if (kind === "reporting") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-[var(--cream)] p-3" style={{ height }}>
        <div className="grid h-full grid-cols-[1fr_1fr] gap-2">
          {/* left: document composing */}
          <div className="relative overflow-hidden rounded-lg bg-white p-2 shadow-sm">
            {[0, 1, 2, 3].map((r) => (
              <motion.div
                key={r}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: r * 0.25, repeat: Infinity, repeatDelay: 2 }}
                className="mb-1.5 flex items-center gap-1.5"
              >
                <div className="h-3 w-3 rounded-sm bg-[var(--leaf)]/30" />
                <div className="h-1 flex-1 rounded bg-[var(--mist)]" />
              </motion.div>
            ))}
            <div className="mt-1 flex gap-1">
              {["GRI", "ISSB", "CSRD"].map((t) => (
                <span key={t} className="rounded bg-[var(--forest)]/10 px-1 py-0.5 text-[7px] font-mono text-[var(--forest)]">
                  {t}
                </span>
              ))}
            </div>
          </div>
          {/* right: animated bar chart */}
          <div className="relative overflow-hidden rounded-lg bg-white p-2 shadow-sm">
            <div className="mb-1 text-[7px] font-mono uppercase text-muted-foreground">Live KPI</div>
            <div className="flex h-16 items-end gap-1">
              {[0.4, 0.7, 0.55, 0.85, 0.6, 0.95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.15, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
                  className="flex-1 rounded-t"
                  style={{
                    background: `linear-gradient(to top, var(--forest), var(--leaf))`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "verify") {
    return (
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[color-mix(in_oklab,var(--leaf)_15%,white)] to-white"
        style={{ height }}
      >
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <defs>
            <linearGradient id="pipe" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="var(--leaf)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--forest)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Verification pipeline */}
          {[35, 60, 85].map((y, i) => (
            <g key={y}>
              <line x1="20" y1={y} x2="150" y2={y} stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
              <motion.line
                x1="20"
                y1={y}
                x2="150"
                y2={y}
                stroke="url(#pipe)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="8 6"
                animate={{ strokeDashoffset: [0, -28] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "linear" }}
              />
              <circle cx="20" cy={y} r="3" fill="var(--forest)" />
              {/* traveling data */}
              <motion.circle
                r="3"
                fill="var(--ember)"
                initial={{ cx: 20 }}
                animate={{ cx: 150 }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
                style={{ ["--y" as string]: y }}
              >
                <animate attributeName="cy" values={`${y};${y}`} dur="2.5s" repeatCount="indefinite" />
              </motion.circle>
            </g>
          ))}
          {/* Verified stamp */}
          <g transform="translate(168 60)">
            <motion.circle
              r="18"
              fill="none"
              stroke="var(--leaf)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.path
              d="M -6 0 L -2 5 L 8 -6"
              stroke="var(--leaf)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
            />
          </g>
        </svg>
      </div>
    );
  }

  if (kind === "training") {
    return (
      <div
        className="relative overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--leaf)_8%,white)]"
        style={{ height }}
      >
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <defs>
            <radialGradient id="learnGlow">
              <stop offset="0%" stopColor="var(--ember)" />
              <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Central mentor */}
          <circle cx="100" cy="60" r="14" fill="var(--forest)" />
          <circle cx="100" cy="60" r="20" fill="url(#learnGlow)" opacity="0.6">
            <animate attributeName="r" values="16;28;16" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Learner nodes */}
          {[
            [35, 30], [50, 90], [155, 32], [170, 88], [30, 60], [170, 60],
          ].map(([x, y], i) => (
            <g key={i}>
              <motion.line
                x1="100"
                y1="60"
                x2={x}
                y2={y}
                stroke="var(--leaf)"
                strokeWidth="0.6"
                strokeDasharray="3 4"
                animate={{ strokeDashoffset: [0, -14] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                opacity="0.6"
              />
              <motion.circle
                cx={x}
                cy={y}
                r="6"
                fill="var(--clay)"
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
              />
              {/* traveling knowledge dot */}
              <motion.circle r="2" fill="var(--ember)" opacity="0.9">
                <animateMotion
                  dur={`${2.5 + (i % 3) * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                  path={`M 100 60 L ${x} ${y}`}
                />
              </motion.circle>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (kind === "cert") {
    return (
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[color-mix(in_oklab,var(--ember)_10%,white)] to-white"
        style={{ height }}
      >
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <defs>
            <linearGradient id="scoreG" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--forest)" />
              <stop offset="100%" stopColor="var(--ember)" />
            </linearGradient>
          </defs>
          {/* Score arc */}
          <g transform="translate(56 65)">
            <path d="M -34 0 A 34 34 0 0 1 34 0" fill="none" stroke="var(--mist)" strokeWidth="6" strokeLinecap="round" />
            <motion.path
              d="M -34 0 A 34 34 0 0 1 34 0"
              fill="none"
              stroke="url(#scoreG)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="107"
              initial={{ strokeDashoffset: 107 }}
              animate={{ strokeDashoffset: [107, 20, 20, 107] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <text textAnchor="middle" y="-6" fontSize="18" fill="var(--forest)" fontFamily="ui-serif, Georgia, serif" fontStyle="italic">A</text>
            <text textAnchor="middle" y="8" fontSize="7" fill="var(--muted-foreground)" fontFamily="ui-monospace, monospace" letterSpacing="1.5">CDP</text>
          </g>
          {/* Assembling badge */}
          <g transform="translate(150 60)">
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <motion.polygon
                key={deg}
                points="0,-22 6,-8 -6,-8"
                fill={i % 2 ? "var(--ember)" : "var(--forest)"}
                transform={`rotate(${deg})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              />
            ))}
            <circle r="10" fill="var(--cream)" stroke="var(--ember)" strokeWidth="1.5" />
            <text textAnchor="middle" y="3" fontSize="7" fill="var(--clay)" fontFamily="ui-monospace, monospace">ISO</text>
          </g>
        </svg>
      </div>
    );
  }

  // strategy
  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--cream)]" style={{ height }}>
      <svg viewBox="0 0 200 120" className="h-full w-full">
        <defs>
          <linearGradient id="roadG" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--forest)" />
            <stop offset="100%" stopColor="var(--ember)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 10 95 C 40 20, 80 100, 115 40 S 180 70, 195 45"
          stroke="url(#roadG)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {[
          [10, 95, "Today"],
          [70, 62, "2026"],
          [130, 55, "2030"],
          [195, 45, "Net-zero"],
        ].map(([x, y, label], i) => (
          <g key={i as number}>
            <motion.circle
              cx={x as number}
              cy={y as number}
              r="5"
              fill="var(--ember)"
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.4 + (i as number) * 0.35, duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
            />
            <text
              x={x as number}
              y={(y as number) - 10}
              fontSize="7"
              textAnchor="middle"
              fill="var(--clay)"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.5"
            >
              {label as string}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
