import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STANDARDS = ["GHG Protocol", "ISAE 3000", "ISAE 3410"] as const;
type Standard = (typeof STANDARDS)[number];

const STANDARD_META: Record<Standard, { color: string; controls: string[]; focus: string }> = {
  "GHG Protocol": {
    color: "#84994f",
    controls: ["Boundary check", "Scope 1/2/3 completeness", "Emission factor lineage"],
    focus: "emissions",
  },
  "ISAE 3000": {
    color: "#3a7ca5",
    controls: ["Evidence sufficiency", "Sampling design", "Reviewer independence"],
    focus: "evidence",
  },
  "ISAE 3410": {
    color: "#d06224",
    controls: ["GHG assertion testing", "Activity data recalculation", "Uncertainty review"],
    focus: "ghg",
  },
};

const STAGES = ["Intake", "Evidence", "Controls", "Review", "Assured"] as const;

type EvidenceItem = {
  id: number;
  label: string;
  kind: "doc" | "data" | "meter" | "policy";
  stage: number; // 0..4
  status: "pending" | "passed" | "flagged";
};

const SEED: EvidenceItem[] = [
  { id: 1, label: "Utility bills · Q3", kind: "doc", stage: 0, status: "pending" },
  { id: 2, label: "ERP · fuel logs", kind: "data", stage: 1, status: "pending" },
  { id: 3, label: "Meter · Site A", kind: "meter", stage: 2, status: "pending" },
  { id: 4, label: "Supplier attestations", kind: "doc", stage: 3, status: "passed" },
  { id: 5, label: "Travel policy v4", kind: "policy", stage: 4, status: "passed" },
];

export function AssuranceDashboard({
  height = 540,
  activeStandard,
}: {
  height?: number;
  activeStandard?: Standard | null;
}) {
  const [autoStd, setAutoStd] = useState(0);
  const [items, setItems] = useState<EvidenceItem[]>(SEED);

  useEffect(() => {
    const t = setInterval(() => setAutoStd((i) => (i + 1) % STANDARDS.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          const nextStage = (it.stage + 1) % 5;
          const status: EvidenceItem["status"] =
            nextStage === 4
              ? "passed"
              : nextStage === 2 && Math.random() < 0.18
                ? "flagged"
                : "pending";
          return { ...it, stage: nextStage, status };
        }),
      );
    }, 1600);
    return () => clearInterval(t);
  }, []);

  const std: Standard = activeStandard ?? STANDARDS[autoStd];
  const meta = STANDARD_META[std];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        height,
        background: "linear-gradient(140deg, #fbfbf7 0%, #f2f4ec 100%)",
      }}
    >
      {/* soft grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="ad-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M26 0 H0 V26" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ad-grid)" />
      </svg>

      {/* Ambient glows */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `color-mix(in oklab, ${meta.color} 32%, transparent)` }}
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--leaf) 25%, transparent)" }}
        animate={{ opacity: [0.2, 0.42, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      {/* Chrome */}
      <div className="relative z-10 flex items-center justify-between border-b border-black/5 bg-white/50 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--ember)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--sand)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--leaf)]" />
          <div className="ml-3 font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/60">
            assurance.os · engagement #A-2841
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: meta.color }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/70">
            {std}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 grid h-[calc(100%-40px)] grid-cols-[1.15fr_1fr] gap-3 p-3">
        {/* LEFT — pipeline */}
        <div className="relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/60">
              Verification pipeline
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/50">
              {items.filter((i) => i.status === "passed").length}/{items.length} verified
            </div>
          </div>

          {/* Stage headers */}
          <div className="mb-2 grid grid-cols-5 gap-1">
            {STAGES.map((s, i) => (
              <div key={s} className="text-center">
                <div className="mx-auto mb-1 h-1 w-8 rounded-full bg-black/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 1.6, delay: i * 0.25, repeat: Infinity, repeatDelay: 6 }}
                  />
                </div>
                <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-foreground/60">
                  {s}
                </div>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="relative flex-1 space-y-1.5">
            {items.map((it) => (
              <div
                key={it.id}
                className="relative grid h-8 grid-cols-5 items-center rounded-md bg-white/70 px-1 text-[10px]"
              >
                {STAGES.map((_, si) => (
                  <div key={si} className="relative h-full">
                    <AnimatePresence>
                      {it.stage === si && (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-0 flex items-center gap-1.5 rounded px-1.5"
                          style={{
                            background:
                              it.status === "flagged"
                                ? "color-mix(in oklab, var(--ember) 18%, white)"
                                : it.status === "passed"
                                  ? "color-mix(in oklab, var(--leaf) 20%, white)"
                                  : "color-mix(in oklab, var(--forest) 8%, white)",
                          }}
                        >
                          <KindIcon kind={it.kind} />
                          <span className="truncate font-mono text-[8.5px] text-foreground/80">
                            {it.label}
                          </span>
                          {it.status === "passed" && (
                            <svg viewBox="0 0 12 12" className="ml-auto h-3 w-3 shrink-0 text-[var(--leaf)]">
                              <path
                                d="M2 6.5l2.5 2.5L10 3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                          {it.status === "flagged" && (
                            <span className="ml-auto font-mono text-[8px] uppercase tracking-wider text-[var(--ember)]">
                              !
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Assurance opinion */}
          <motion.div
            className="mt-2 flex items-center justify-between rounded-lg border border-black/5 bg-gradient-to-r from-white to-[color-mix(in_oklab,var(--leaf)_10%,white)] px-3 py-2"
            animate={{ boxShadow: [`0 0 0 0 ${meta.color}00`, `0 0 14px 0 ${meta.color}55`, `0 0 0 0 ${meta.color}00`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-foreground/60">
                Independent opinion
              </div>
              <div className="text-[11px] font-medium text-foreground/90">
                Reasonable assurance · unqualified
              </div>
            </div>
            <SealMini color={meta.color} />
          </motion.div>
        </div>

        {/* RIGHT — controls + signature */}
        <div className="flex flex-col gap-3">
          {/* Controls */}
          <div className="flex-1 overflow-hidden rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/60">
                Controls · {std}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: meta.color }}>
                LIVE
              </div>
            </div>
            <div className="space-y-2">
              {meta.controls.map((c, i) => (
                <motion.div
                  key={c + std}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-2 rounded-md bg-white/80 px-2 py-1.5"
                >
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.color }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
                  />
                  <span className="text-[10.5px] text-foreground/85">{c}</span>
                  <span className="ml-auto font-mono text-[8.5px] uppercase tracking-wider text-foreground/50">
                    tested
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Sampling gauge */}
            <div className="mt-3">
              <div className="mb-1 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.22em] text-foreground/55">
                <span>Sample coverage</span>
                <span>92%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${meta.color}, var(--leaf))` }}
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </div>

          {/* Reviewer + signature */}
          <div className="overflow-hidden rounded-xl border border-black/5 bg-white/60 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/60">
                Reviewer sign-off
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--leaf)]">
                Approved
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[9px] text-white"
                style={{ background: meta.color }}
              >
                FZ
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-foreground/90">Dr Farida Zaman</div>
                <div className="font-mono text-[8.5px] uppercase tracking-wider text-foreground/55">
                  Lead assurance partner
                </div>
              </div>
              <SignatureLine color={meta.color} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: EvidenceItem["kind"] }) {
  const stroke = "currentColor";
  return (
    <span className="text-foreground/60">
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke={stroke} strokeWidth="1.2">
        {kind === "doc" && <path d="M3 1h4l2 2v8H3z" strokeLinejoin="round" />}
        {kind === "data" && (
          <>
            <rect x="2" y="7" width="2" height="4" />
            <rect x="5" y="4" width="2" height="7" />
            <rect x="8" y="1.5" width="2" height="9.5" />
          </>
        )}
        {kind === "meter" && (
          <>
            <circle cx="6" cy="6" r="4" />
            <path d="M6 6l2.5-2" strokeLinecap="round" />
          </>
        )}
        {kind === "policy" && <path d="M3 2h6v8l-3-1.5L3 10z" strokeLinejoin="round" />}
      </svg>
    </span>
  );
}

function SealMini({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9">
      <motion.circle
        cx="20"
        cy="20"
        r="14"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "20px 20px" }}
      />
      <circle cx="20" cy="20" r="9" fill={`color-mix(in oklab, ${color} 15%, white)`} stroke={color} strokeWidth="1" />
      <path
        d="M15 20.5l3.2 3 6.3-7"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignatureLine({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20">
      <motion.path
        d="M4 20 C 14 4, 22 26, 32 14 S 52 6, 62 18 S 74 12, 78 16"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export { STANDARDS as ASSURANCE_STANDARDS };
export type { Standard as AssuranceStandard };
