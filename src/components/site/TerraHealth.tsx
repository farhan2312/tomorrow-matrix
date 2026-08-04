import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

type Ctx = {
  health: number;
  bump: (amount?: number) => void;
  set: (v: number) => void;
};

const TerraCtx = createContext<Ctx>({ health: 40, bump: () => {}, set: () => {} });

export function useTerra() {
  return useContext(TerraCtx);
}

export function TerraProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState(40);
  const lastBump = useRef(0);

  const bump = useCallback((amount = 2) => {
    const now = Date.now();
    if (now - lastBump.current < 250) return;
    lastBump.current = now;
    setHealth((h) => Math.min(100, h + amount));
  }, []);

  // Passive scroll growth — very gentle.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const s = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? s / max : 0;
        setHealth((h) => {
          const target = 40 + pct * 55;
          if (target > h) return Math.min(100, h + (target - h) * 0.08);
          return h;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const value = useMemo(() => ({ health, bump, set: setHealth }), [health, bump]);
  return <TerraCtx.Provider value={value}>{children}</TerraCtx.Provider>;
}

export function TerraIndicator() {
  const { health } = useTerra();
  const spring = useSpring(health, { stiffness: 60, damping: 20 });
  useEffect(() => {
    spring.set(health);
  }, [health, spring]);
  const dash = useTransform(spring, (v) => `${(v / 100) * 138} 138`);
  const label = useTransform(spring, (v) => `${Math.round(v)}%`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full glass px-3 py-2 pr-4 shadow-soft"
    >
      <div className="relative h-11 w-11">
        <svg viewBox="0 0 50 50" className="h-11 w-11 -rotate-90">
          <circle cx="25" cy="25" r="22" fill="none" stroke="var(--mist)" strokeWidth="4" />
          <motion.circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="url(#terraGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ strokeDasharray: dash }}
          />
          <defs>
            <linearGradient id="terraGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--leaf)" />
              <stop offset="100%" stopColor="var(--ember)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-[var(--leaf)] animate-pulse-soft" />
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Terra Health
        </div>
        <motion.div className="text-sm font-medium text-foreground tabular-nums">
          {label}
        </motion.div>
      </div>
    </motion.div>
  );
}
