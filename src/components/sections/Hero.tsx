import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useTerra } from "../site/TerraHealth";
import { Counter } from "../site/Counter";

const indicators = [
  { label: "Carbon", tone: "#fcb53b" },
  { label: "Climate", tone: "#84994f" },
  { label: "People", tone: "#e9c891" },
  { label: "Energy", tone: "#d06224" },
  { label: "Water", tone: "#7ac0d8" },
  { label: "Governance", tone: "#b5c99a" },
  { label: "Supply Chain", tone: "#a64b2a" },
];

// Stylized continents — recognizable silhouettes on a 240 viewBox.
// Ordered so wrap-around always shows land.
const CONTINENTS: { d: string; name: string }[] = [
  // North America
  { name: "na", d: "M18 60 C 26 48, 44 44, 60 50 C 74 55, 78 68, 74 78 C 78 84, 84 92, 80 102 C 74 112, 62 118, 54 128 C 46 138, 42 128, 40 118 C 34 118, 26 110, 24 100 C 18 92, 14 80, 14 72 C 14 68, 15 63, 18 60 Z" },
  // Central + South America
  { name: "sa", d: "M62 128 C 72 130, 78 140, 76 152 C 74 166, 66 180, 58 194 C 52 204, 44 210, 40 202 C 36 192, 40 178, 46 164 C 50 152, 52 140, 62 128 Z" },
  // Greenland
  { name: "gr", d: "M78 44 C 88 40, 96 44, 94 52 C 92 58, 84 60, 78 56 C 74 52, 74 46, 78 44 Z" },
  // Europe
  { name: "eu", d: "M110 60 C 122 56, 138 58, 146 64 C 152 70, 148 78, 140 80 C 128 82, 116 78, 108 72 C 104 68, 104 62, 110 60 Z" },
  // Africa
  { name: "af", d: "M118 84 C 130 80, 146 84, 152 96 C 158 112, 156 138, 146 158 C 140 172, 128 182, 120 180 C 110 178, 104 164, 106 146 C 108 126, 110 100, 118 84 Z" },
  // Middle East + Asia
  { name: "as", d: "M148 62 C 172 54, 210 54, 224 62 C 232 66, 230 78, 218 82 C 200 88, 178 86, 160 88 C 152 90, 148 88, 146 82 C 144 74, 144 66, 148 62 Z M170 90 C 190 88, 210 92, 214 100 C 216 108, 208 116, 196 116 C 180 116, 168 108, 166 100 C 165 94, 166 90, 170 90 Z" },
  // India
  { name: "in", d: "M170 92 C 180 92, 186 100, 184 110 C 182 120, 176 126, 172 120 C 168 114, 166 100, 170 92 Z" },
  // SE Asia archipelago
  { name: "se", d: "M198 118 C 208 116, 216 122, 214 130 C 212 138, 204 138, 200 132 C 196 128, 194 120, 198 118 Z M214 130 C 220 128, 226 132, 224 138 C 222 142, 216 142, 214 138 C 212 134, 212 130, 214 130 Z" },
  // Australia
  { name: "au", d: "M192 150 C 208 146, 224 154, 224 168 C 224 180, 204 186, 190 182 C 178 178, 178 156, 192 150 Z" },
  // NZ
  { name: "nz", d: "M228 178 C 234 178, 236 184, 232 188 C 228 190, 224 186, 228 178 Z" },
  // Antarctica strip
  { name: "an", d: "M8 214 C 60 210, 180 210, 232 214 L 230 224 C 180 220, 60 220, 10 224 Z" },
];

// Renewable/nature features scattered on land — coordinates roughly land-aligned.
const FEATURES = [
  { x: 40, y: 82, type: "tree" },
  { x: 52, y: 100, type: "tree" },
  { x: 60, y: 118, type: "turbine" },
  { x: 54, y: 168, type: "tree" },
  { x: 48, y: 184, type: "tree" },
  { x: 120, y: 96, type: "solar" },
  { x: 128, y: 110, type: "tree" },
  { x: 132, y: 130, type: "turbine" },
  { x: 140, y: 148, type: "tree" },
  { x: 148, y: 166, type: "tree" },
  { x: 124, y: 66, type: "turbine" },
  { x: 168, y: 68, type: "tree" },
  { x: 180, y: 72, type: "solar" },
  { x: 200, y: 74, type: "tree" },
  { x: 210, y: 100, type: "tree" },
  { x: 176, y: 108, type: "turbine" },
  { x: 200, y: 164, type: "solar" },
  { x: 208, y: 172, type: "tree" },
];

function Feature({ x, y, type, v }: { x: number; y: number; type: string; v: number }) {
  const scale = Math.max(0, v - 0.45) / 0.55; // appears after 45% vibrance
  if (scale <= 0) return null;
  const opacity = Math.min(1, scale * 1.4);
  if (type === "tree") {
    return (
      <g transform={`translate(${x} ${y}) scale(${0.5 + scale * 0.7})`} opacity={opacity}>
        <ellipse cx="0" cy="-1.2" rx="1.6" ry="1.8" fill="#3d6b2b" />
        <rect x="-0.25" y="0.4" width="0.5" height="1.2" fill="#5a3820" />
      </g>
    );
  }
  if (type === "turbine") {
    return (
      <g transform={`translate(${x} ${y}) scale(${0.5 + scale * 0.6})`} opacity={opacity}>
        <line x1="0" y1="0" x2="0" y2="2.6" stroke="#e8ecef" strokeWidth="0.35" />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }}
        >
          <line x1="0" y1="0" x2="0" y2="-1.6" stroke="#e8ecef" strokeWidth="0.35" />
          <line x1="0" y1="0" x2="1.4" y2="0.8" stroke="#e8ecef" strokeWidth="0.35" />
          <line x1="0" y1="0" x2="-1.4" y2="0.8" stroke="#e8ecef" strokeWidth="0.35" />
        </motion.g>
      </g>
    );
  }
  // solar
  return (
    <g transform={`translate(${x} ${y}) scale(${0.5 + scale * 0.7})`} opacity={opacity}>
      <rect x="-1.6" y="-0.8" width="3.2" height="1.6" fill="#2a5c8a" stroke="#0f2a44" strokeWidth="0.15" />
      <line x1="-1.6" y1="0" x2="1.6" y2="0" stroke="#0f2a44" strokeWidth="0.15" />
      <line x1="0" y1="-0.8" x2="0" y2="0.8" stroke="#0f2a44" strokeWidth="0.15" />
    </g>
  );
}

function Earth() {
  const { health, bump } = useTerra();
  const v = 0.35 + (health / 100) * 0.65; // vibrance 0.35→1
  const desat = 1 - v;
  const ocean = `color-mix(in oklab, #1a4a6e ${55 + v * 40}%, #55606b ${desat * 60}%)`;
  const oceanDeep = `color-mix(in oklab, #062037 ${70 + v * 20}%, #3a3f45 ${desat * 40}%)`;
  const land = `color-mix(in oklab, #6b8b3c ${55 + v * 45}%, #7f7d63 ${desat * 55}%)`;
  const landHi = `color-mix(in oklab, #a6c26b ${45 + v * 55}%, #8a8635 ${desat * 45}%)`;
  const atmoOp = 0.35 + v * 0.55;

  const box = 520;
  const cx = box / 2;
  const cy = box / 2;
  const R = 148;
  const ringR = 235;

  return (
    <div
      className="relative flex h-[520px] w-[520px] items-center justify-center max-md:h-[400px] max-md:w-[400px]"
      style={{ perspective: 1400 }}
    >
      {/* Atmosphere outer glow */}
      <div
        className="absolute rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          height: R * 2.7,
          width: R * 2.7,
          opacity: atmoOp,
          background: `radial-gradient(circle, color-mix(in oklab, #7ac0d8 ${v * 45}%, transparent) 0%, color-mix(in oklab, ${landHi} ${v * 30}%, transparent) 40%, transparent 72%)`,
        }}
      />

      {/* Orbit rings + indicator streams */}
      <svg
        viewBox={`0 0 ${box} ${box}`}
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        <defs>
          <radialGradient id="streamGlow">
            <stop offset="0%" stopColor="#fff9d8" stopOpacity="1" />
            <stop offset="100%" stopColor="#fcb53b" stopOpacity="0" />
          </radialGradient>
          <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          {indicators.map((ind, i) => (
            <linearGradient
              key={"lg" + i}
              id={`lg${i}`}
              gradientUnits="userSpaceOnUse"
              x1={cx}
              y1={cy}
              x2={cx + Math.cos((i / indicators.length) * Math.PI * 2 - Math.PI / 2) * ringR}
              y2={cy + Math.sin((i / indicators.length) * Math.PI * 2 - Math.PI / 2) * ringR}
            >
              <stop offset="0%" stopColor={ind.tone} stopOpacity={0.7 * v} />
              <stop offset="100%" stopColor={ind.tone} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {[ringR - 8, ringR, ringR + 10].map((r, k) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="color-mix(in oklab, var(--forest) 22%, transparent)"
            strokeDasharray={k === 1 ? "3 6" : "1 8"}
            strokeWidth={k === 1 ? "1" : "0.6"}
            opacity={k === 1 ? 1 : 0.5}
          />
        ))}

        {indicators.map((ind, i) => {
          const N = indicators.length;
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const ox = cx + Math.cos(a) * ringR;
          const oy = cy + Math.sin(a) * ringR;
          const sx = cx + Math.cos(a) * (R + 4);
          const sy = cy + Math.sin(a) * (R + 4);
          const path = `M${ox},${oy} Q${(ox + cx) / 2 + Math.cos(a + 1.4) * 20},${(oy + cy) / 2 + Math.sin(a + 1.4) * 20} ${sx},${sy}`;
          return (
            <g key={ind.label}>
              <path d={path} stroke={`url(#lg${i})`} strokeWidth="1.1" fill="none" />
              {[0, 0.33, 0.66].map((off) => (
                <circle key={off} r="2.6" fill={ind.tone} opacity={0.9} filter="url(#pglow)">
                  <animateMotion
                    dur={`${3.6 + i * 0.25}s`}
                    repeatCount="indefinite"
                    begin={`${off * (3.6 + i * 0.25)}s`}
                    path={path}
                  />
                </circle>
              ))}
              <circle cx={sx} cy={sy} r="4" fill="url(#streamGlow)" opacity={v}>
                <animate attributeName="r" values="2;6;2" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* GLOBE */}
      <motion.div
        animate={{ scale: [1, 1.018, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ width: R * 2, height: R * 2 }}
      >
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 h-full w-full drop-shadow-[0_40px_70px_rgba(10,25,40,0.45)]"
        >
          <defs>
            {/* Deep ocean — layered for depth */}
            <radialGradient id="oceanDeep" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={ocean} />
              <stop offset="65%" stopColor={ocean} />
              <stop offset="100%" stopColor={oceanDeep} />
            </radialGradient>
            <radialGradient id="oceanLight" cx="32%" cy="26%" r="42%">
              <stop offset="0%" stopColor={`color-mix(in oklab, ${ocean} 40%, #d6ecf2)`} stopOpacity="0.85" />
              <stop offset="70%" stopColor={ocean} stopOpacity="0" />
            </radialGradient>
            {/* Ocean caustic shimmer */}
            <pattern id="caustic" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 12 Q 6 8 12 12 T 24 12" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" fill="none" />
              <path d="M0 20 Q 6 16 12 20 T 24 20" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" fill="none" />
            </pattern>
            {/* Terminator */}
            <radialGradient id="term" cx="72%" cy="70%" r="72%">
              <stop offset="42%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(2,8,16,0.88)" />
            </radialGradient>
            {/* Fresnel */}
            <radialGradient id="fres" cx="50%" cy="50%" r="52%">
              <stop offset="86%" stopColor="rgba(140,210,240,0)" />
              <stop offset="95%" stopColor={`rgba(140,210,240,${0.4 + v * 0.4})`} />
              <stop offset="100%" stopColor="rgba(140,210,240,0)" />
            </radialGradient>
            {/* Warm sunrise edge on the light side */}
            <radialGradient id="sunrise" cx="22%" cy="28%" r="60%">
              <stop offset="70%" stopColor="rgba(255,220,150,0)" />
              <stop offset="92%" stopColor={`rgba(255,196,120,${0.3 + v * 0.35})`} />
              <stop offset="100%" stopColor="rgba(255,196,120,0)" />
            </radialGradient>
            {/* Aurora shimmer near poles */}
            <linearGradient id="aurora" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(132,204,120,0)" />
              <stop offset="50%" stopColor={`rgba(132,220,150,${0.4 + v * 0.4})`} />
              <stop offset="100%" stopColor="rgba(90,160,220,0)" />
            </linearGradient>
            {/* Specular */}
            <radialGradient id="spec" cx="28%" cy="22%" r="28%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <clipPath id="sphere">
              <circle cx="120" cy="120" r="118" />
            </clipPath>
            <radialGradient id="landgrad" cx="45%" cy="35%">
              <stop offset="0%" stopColor={landHi} />
              <stop offset="70%" stopColor={land} />
              <stop offset="100%" stopColor={`color-mix(in oklab, ${land} 60%, black)`} />
            </radialGradient>
            <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>

          {/* Ocean sphere */}
          <circle cx="120" cy="120" r="118" fill="url(#oceanDeep)" />
          <circle cx="120" cy="120" r="118" fill="url(#oceanLight)" />

          <g clipPath="url(#sphere)">
            {/* Caustics + latitude */}
            <circle cx="120" cy="120" r="118" fill="url(#caustic)" opacity={0.5 + v * 0.3} />
            <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" fill="none">
              {[40, 70, 100, 120, 140, 170, 200].map((y) => (
                <ellipse
                  key={y}
                  cx="120"
                  cy={y}
                  rx="118"
                  ry={Math.max(3, 118 - Math.abs(120 - y) * 0.92)}
                />
              ))}
              {[-60, -30, 0, 30, 60].map((deg) => (
                <ellipse
                  key={deg}
                  cx="120"
                  cy="120"
                  rx={Math.abs(118 * Math.cos((deg * Math.PI) / 180))}
                  ry="118"
                />
              ))}
            </g>

            {/* Whale silhouette drifting through the deep ocean */}
            <motion.g
              initial={{ x: 20, y: 0, opacity: 0 }}
              animate={{ x: 200, y: 6, opacity: [0, 0.5, 0.5, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 4 }}
              style={{ transformOrigin: "0 0" }}
            >
              <g transform="translate(0 165)" fill="rgba(6,20,36,0.55)">
                <path d="M0 0 q 8 -3 16 0 q -2 2 -6 2 q -6 0 -10 -2 z" />
                <path d="M14 -1 l 3 -2 l 2 2 l -3 1 z" />
              </g>
            </motion.g>


            {/* CONTINENTS + FEATURES rotate together */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 260, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "120px 120px" }}
            >
              {[0, 240].map((offset) => (
                <g key={offset} transform={`translate(${offset - 120} 5)`}>
                  {CONTINENTS.map((c) => (
                    <g key={c.name}>
                      {/* subtle drop shadow */}
                      <path
                        d={c.d}
                        fill={`color-mix(in oklab, ${land} 50%, black)`}
                        opacity="0.35"
                        transform="translate(0.6 0.8)"
                        filter="url(#landShadow)"
                      />
                      <path
                        d={c.d}
                        fill="url(#landgrad)"
                        stroke={`color-mix(in oklab, ${land} 55%, black)`}
                        strokeWidth="0.25"
                      />
                    </g>
                  ))}
                  {/* Rivers — appear with health */}
                  <g stroke="#7ac0d8" strokeWidth="0.35" fill="none" opacity={Math.max(0, v - 0.5) * 1.6}>
                    <path d="M124 96 Q 128 108 132 118 T 138 138" />
                    <path d="M48 78 Q 54 92 52 108 T 58 132" />
                    <path d="M186 76 Q 192 88 190 100" />
                  </g>
                  {/* Mountain ranges — tiny chevrons */}
                  <g stroke={`color-mix(in oklab, ${land} 40%, white)`} strokeWidth="0.3" fill="none" opacity={0.55 + v * 0.35}>
                    <path d="M28 90 l2 -3 l2 3 M32 90 l2 -3 l2 3 M36 90 l2 -3 l2 3" />
                    <path d="M50 132 l1.6 -2.4 l1.6 2.4 M53 132 l1.6 -2.4 l1.6 2.4" />
                    <path d="M118 108 l1.6 -2.4 l1.6 2.4 M122 108 l1.6 -2.4 l1.6 2.4 M126 108 l1.6 -2.4 l1.6 2.4" />
                    <path d="M158 96 l1.6 -2.4 l1.6 2.4 M162 96 l1.6 -2.4 l1.6 2.4" />
                    <path d="M196 156 l1.6 -2.4 l1.6 2.4" />
                  </g>
                  {FEATURES.map((f, i) => (
                    <Feature key={i} {...f} v={v} />
                  ))}
                </g>
              ))}
            </motion.g>

            {/* City lights on night side */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 260, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "120px 120px", opacity: 0.7 + v * 0.3 }}
            >
              {[0, 240].map((offset) => (
                <g key={offset} transform={`translate(${offset - 120} 5)`}>
                  {[
                    [50, 78], [58, 74], [64, 82], [85, 68], [92, 76], [110, 70],
                    [130, 74], [140, 80], [158, 72], [170, 78], [188, 82],
                    [130, 120], [138, 132], [148, 128], [46, 128], [56, 140],
                    [124, 92], [102, 96], [192, 158], [200, 170],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="0.7" fill="#ffe797">
                      <animate
                        attributeName="opacity"
                        values="0.4;1;0.4"
                        dur={`${2 + (i % 4) * 0.8}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>
              ))}
            </motion.g>

            {/* Cloud layer 1 */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "120px 120px" }}
            >
              {[0, 240].map((offset) => (
                <g
                  key={offset}
                  transform={`translate(${offset - 120} 0)`}
                  opacity={0.55 + v * 0.3}
                >
                  <ellipse cx="60" cy="60" rx="24" ry="7" fill="white" opacity="0.7" />
                  <ellipse cx="105" cy="45" rx="30" ry="8" fill="white" opacity="0.55" />
                  <ellipse cx="150" cy="72" rx="22" ry="6" fill="white" opacity="0.65" />
                  <ellipse cx="180" cy="105" rx="28" ry="7" fill="white" opacity="0.55" />
                  <ellipse cx="75" cy="140" rx="26" ry="7" fill="white" opacity="0.6" />
                  <ellipse cx="140" cy="170" rx="34" ry="8" fill="white" opacity="0.5" />
                  {/* Weather swirl */}
                  <g transform="translate(200 90)" opacity="0.6">
                    <ellipse cx="0" cy="0" rx="14" ry="4" fill="white" transform="rotate(20)" />
                    <ellipse cx="2" cy="1" rx="10" ry="3" fill="white" transform="rotate(60)" />
                    <ellipse cx="-1" cy="-1" rx="6" ry="2" fill="white" transform="rotate(100)" />
                  </g>
                </g>
              ))}
            </motion.g>

            {/* Cloud layer 2 — faster, lighter */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "120px 120px" }}
            >
              {[0, 240].map((offset) => (
                <g
                  key={offset}
                  transform={`translate(${offset - 120} 0)`}
                  opacity={0.35 + v * 0.25}
                >
                  <ellipse cx="40" cy="95" rx="18" ry="4" fill="white" />
                  <ellipse cx="125" cy="55" rx="20" ry="5" fill="white" />
                  <ellipse cx="170" cy="130" rx="22" ry="5" fill="white" />
                  <ellipse cx="90" cy="180" rx="20" ry="5" fill="white" />
                </g>
              ))}
            </motion.g>

            {/* Terminator night-side shading */}
            <circle cx="120" cy="120" r="118" fill="url(#term)" />
            {/* Aurora ribbon near north pole */}
            <motion.g
              style={{ transformOrigin: "120px 120px" }}
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M40 40 Q 120 18 200 42 Q 190 60 120 52 Q 60 60 40 40 Z"
                fill="url(#aurora)"
                opacity={0.55 + v * 0.35}
              />
              <path
                d="M55 200 Q 120 218 190 198 Q 180 210 120 208 Q 70 214 55 200 Z"
                fill="url(#aurora)"
                opacity={0.4 + v * 0.3}
              />
            </motion.g>
            {/* Airplane contrail crossing */}
            <motion.g
              initial={{ x: -30, y: 90, opacity: 0 }}
              animate={{ x: 270, y: 60, opacity: [0, 0.9, 0.9, 0] }}
              transition={{ duration: 14, repeat: Infinity, delay: 3, ease: "linear" }}
            >
              <path d="M0 0 l -12 0.4 M0 0 l -8 -1.6" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" strokeLinecap="round" />
              <path d="M0 0 l 2 -1 l 4 0 l -1 1 l 1 1 l -4 0 z" fill="#f4f4f5" stroke="#1a1a1a" strokeWidth="0.15" />
            </motion.g>
            {/* Specular highlight + sunrise edge */}
            <circle cx="120" cy="120" r="118" fill="url(#sunrise)" />
            <circle cx="120" cy="120" r="118" fill="url(#spec)" />
          </g>

          {/* Fresnel rim */}
          <circle cx="120" cy="120" r="118" fill="url(#fres)" />

          {/* Birds — always visible, more of them at high health */}
          {[0, 1, 2, 3, 4].map((i) => {
            if (i > 1 && v < 0.6) return null;
            if (i > 2 && v < 0.85) return null;
            const startY = 50 + i * 32;
            return (
              <motion.g
                key={i}
                initial={{ x: -20, y: startY, opacity: 0 }}
                animate={{ x: 260, y: startY - 12, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 9 + i, repeat: Infinity, delay: i * 1.7, ease: "linear" }}
              >
                <motion.path
                  d="M0 0 q 3 -2 6 0 q 3 2 6 0"
                  stroke="#2b1e12"
                  strokeWidth="0.9"
                  fill="none"
                  strokeLinecap="round"
                  animate={{ d: ["M0 0 q 3 -2 6 0 q 3 2 6 0", "M0 0 q 3 -1 6 0 q 3 1 6 0", "M0 0 q 3 -2 6 0 q 3 2 6 0"] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      {/* Orbiting indicator chips */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      >
        {indicators.map((ind, i) => {
          const N = indicators.length;
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * ringR;
          const y = Math.sin(a) * ringR;
          return (
            <div
              key={ind.label}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
                onMouseEnter={() => bump(1)}
                className="group flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-foreground/85 shadow-soft whitespace-nowrap cursor-default transition-all hover:scale-110 hover:shadow-lift hover:border-[var(--ember)]"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-soft"
                  style={{ background: ind.tone, boxShadow: `0 0 8px ${ind.tone}` }}
                />
                {ind.label}
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function Hero() {
  const { bump } = useTerra();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) bump(0.5);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [bump]);

  return (
    <section ref={heroRef} id="top" className="relative z-10 min-h-screen pt-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-foreground/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--leaf)] animate-pulse-soft" />
            Integrated sustainability, engineered for tomorrow
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
            className="text-display text-[clamp(2.75rem,6.5vw,5.75rem)] text-foreground"
          >
            Building{" "}
            <span className="italic text-gradient-brand">credible sustainability</span>
            <br />
            for tomorrow's businesses.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            We partner with organizations to design, implement, and verify sustainability and ESG
            solutions that are measurable, compliant, and future-ready — a living framework, not a
            paper exercise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/book"
              onClick={() => bump(3)}
              className="group relative overflow-hidden rounded-full bg-[var(--ink)] px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Book a consultation
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[var(--leaf)] via-[var(--ember)] to-[var(--clay)] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
            <a
              href="#assessment"
              onClick={() => bump(2)}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-[var(--leaf)] hover:bg-card"
            >
              Start ESG Readiness Assessment
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6"
          >
            {[
              { k: 12, s: "+", v: "Frameworks" },
              { k: 40, s: "+", v: "Verifications" },
              { k: 100, s: "%", v: "Investor-grade" },
            ].map((s) => (
              <div key={s.v}>
                <Counter to={s.k} suffix={s.s} className="text-display text-3xl text-foreground" />
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative flex items-center justify-center">
          <Earth />
        </div>
      </div>

      <div className="mt-14 flex justify-center pb-10">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
        >
          Explore the ecosystem
          <span className="h-8 w-px bg-gradient-to-b from-foreground/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
