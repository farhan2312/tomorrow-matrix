import { useMemo } from "react";

/** Filled leaf glyph (lucide "Leaf" silhouette) used for the floating leaves. */
function LeafShape({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="currentColor" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

type Leaf = { top: string; left: string; size: number; color: string; dur: number; delay: number; kind: "float" | "fall" };

const LEAVES: Leaf[] = [
  // gently bobbing in place
  { top: "14%", left: "9%",  size: 26, color: "var(--terra)",      dur: 9,   delay: 0,   kind: "float" },
  { top: "24%", left: "34%", size: 18, color: "var(--terra-deep)", dur: 11,  delay: 1.5, kind: "float" },
  { top: "66%", left: "13%", size: 22, color: "var(--terra)",      dur: 10,  delay: 0.8, kind: "float" },
  { top: "72%", left: "44%", size: 16, color: "var(--warmth)",     dur: 12,  delay: 2.2, kind: "float" },
  { top: "44%", left: "55%", size: 20, color: "var(--terra-deep)", dur: 9.5, delay: 0.4, kind: "float" },
  { top: "34%", left: "6%",  size: 15, color: "var(--terra-deep)", dur: 10.5,delay: 3.1, kind: "float" },
  { top: "84%", left: "28%", size: 19, color: "var(--terra)",      dur: 11.5,delay: 1.1, kind: "float" },
  { top: "54%", left: "40%", size: 13, color: "var(--warmth)",     dur: 8.5, delay: 2.7, kind: "float" },
  { top: "8%",  left: "48%", size: 17, color: "var(--terra)",      dur: 12.5,delay: 0.6, kind: "float" },
  // drifting down
  { top: "0%",  left: "14%", size: 20, color: "var(--terra)",      dur: 17,  delay: 0,   kind: "fall"  },
  { top: "0%",  left: "26%", size: 14, color: "var(--terra-deep)", dur: 22,  delay: 8,   kind: "fall"  },
  { top: "0%",  left: "38%", size: 18, color: "var(--terra)",      dur: 19,  delay: 4,   kind: "fall"  },
  { top: "0%",  left: "52%", size: 15, color: "var(--terra-deep)", dur: 21,  delay: 11,  kind: "fall"  },
  { top: "0%",  left: "63%", size: 22, color: "var(--terra)",      dur: 18,  delay: 2,   kind: "fall"  },
  { top: "0%",  left: "72%", size: 14, color: "var(--warmth)",     dur: 23,  delay: 7,   kind: "fall"  },
  { top: "0%",  left: "82%", size: 24, color: "var(--terra)",      dur: 20,  delay: 13,  kind: "fall"  },
  { top: "0%",  left: "90%", size: 16, color: "var(--terra-deep)", dur: 24,  delay: 5,   kind: "fall"  },
  { top: "0%",  left: "45%", size: 12, color: "var(--warmth)",     dur: 26,  delay: 16,  kind: "fall"  },
];

/** Deterministic (seeded) network so SSR and client render identically. */
function useNetwork() {
  return useMemo(() => {
    let s = 7;
    const rnd = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const nodes = Array.from({ length: 14 }, () => ({
      x: +(rnd() * 100).toFixed(2),
      y: +(rnd() * 100).toFixed(2),
      r: +(1.3 + rnd() * 2.3).toFixed(2),
    }));
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 30) edges.push([i, j]);
      }
    return { nodes, edges };
  }, []);
}

/** Decorative landing background: green tinge, soft blobs, network motif, floating leaves. */
export function LandingBackdrop() {
  const { nodes, edges } = useNetwork();
  const mask = "radial-gradient(ellipse 85% 78% at 72% 40%, black 18%, transparent 84%)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* whole-page light green tinge */}
      <div className="absolute inset-0 bg-[color:var(--terra-soft)] opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--terra)_14%,transparent),transparent_45%,color-mix(in_oklab,var(--warmth)_8%,transparent))]" />

      {/* soft color blobs */}
      <div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-[color:var(--terra-soft)] opacity-80 blur-3xl" />
      <div className="absolute right-[-8rem] top-16 h-[32rem] w-[32rem] rounded-full bg-[color:var(--warmth-soft)] opacity-60 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[color:var(--terra-soft)] opacity-60 blur-3xl" />

      {/* network constellation */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <g stroke="color-mix(in oklab, var(--terra) 55%, transparent)" strokeWidth="0.16">
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
          ))}
        </g>
        <g>
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r * 0.36}
              fill={i % 5 === 0 ? "color-mix(in oklab, var(--warmth) 85%, transparent)" : "color-mix(in oklab, var(--terra) 80%, transparent)"}
              className={i % 3 === 0 ? "animate-node-pulse" : undefined}
              style={i % 3 === 0 ? { animationDelay: `${(i % 6) * 0.5}s` } : undefined}
            />
          ))}
        </g>
      </svg>

      {/* floating leaves */}
      {LEAVES.map((l, i) => (
        <LeafShape
          key={i}
          className={`absolute ${l.kind === "fall" ? "animate-leaf-fall" : "animate-leaf-float"}`}
          style={{
            top: l.top,
            left: l.left,
            width: l.size,
            height: l.size,
            color: l.color,
            opacity: 0.7,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
