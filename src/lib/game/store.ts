import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IndicatorKey, RoleId, NetworkNode, NetworkEdge, GameMode, AiTeammate } from "./types";
import { INTERVENTIONS, MYSTERIES, CRISES, computePayout, bonusForRole, roleRelationship, pickCrisisForState, defaultChoiceFor } from "./data";
import {
  ROLE_MISSIONS, type RoleMission, type MissionTrigger,
  ROLE_QUESTIONS, type RoleQuestion, type ChallengeKind,
  CHALLENGE_TEMPLATES, buildChallengeQuestionIds, rewardForAnswer, questionsByRole,
  ROLE_LEVELS, ROLE_PROGRESSION_META, levelFor, type RoleLevel,
} from "./roles";

export interface SolveRecord {
  mysteryId: string;
  attempts: number;
  hintsUsed: number;
  payout: number;
  basePayout: number;
  ts: number;
}

export interface CrisisStats {
  faced: number;
  resolved: number;
  totalResponseMs: number;
  /** Per-crisis chosen option id ({ [crisisId]: choiceId }) */
  choices: Record<string, string>;
  /** Crises where the canonical best answer was selected */
  bestPicks: number;
  /** Crises where the timer ran out and default consequence applied */
  timeouts: number;
}

export type CrisisOutcomeStatus = "excellent" | "good" | "neutral" | "poor" | "critical";

export interface CrisisOutcome {
  id: string;                   // unique log id
  crisisId: string;
  title: string;
  emoji?: string;
  choiceId: string;
  choiceLabel: string;
  status: CrisisOutcomeStatus;
  isBest: boolean;
  timedOut: boolean;
  capDelta: number;             // net CAP change (can be negative)
  capPositive: number;          // sum of positive parts
  capNegative: number;          // sum of negative parts (cost) as positive number
  capBreakdown: { label: string; value: number }[];
  planetHealthBefore: number;
  planetHealthAfter: number;
  indicatorsBefore: Record<IndicatorKey, number>;
  indicatorsAfter: Record<IndicatorKey, number>;
  benefitedRoles: RoleId[];
  harmedRoles: RoleId[];
  futureConsequences: string[];
  butterflyEffects: { label: string; direction: "up" | "down" }[];
  insight: string;
  responseMs: number;
  ts: number;
}

export type IndicatorChangeSource = "mystery" | "crisis" | "intervention";
export interface IndicatorChange {
  id: string;
  key: IndicatorKey | "planet";
  before: number;
  after: number;
  delta: number;
  reason: string;
  source: IndicatorChangeSource;
  ts: number;
}

export interface MysteryDelta {
  mysteryId: string;
  mysteryTitle: string;
  capDelta: number;
  planetBefore: number;
  planetAfter: number;
  indicatorsBefore: Record<IndicatorKey, number>;
  indicatorsAfter: Record<IndicatorKey, number>;
  reasonByKey: Partial<Record<IndicatorKey | "planet", string>>;
}

export interface PendingPromotion {
  role: RoleId;
  from: RoleLevel;
  to: RoleLevel;
  bonus: number;
  theme: string;
  ts: number;
}

export interface QuestionAttempt {
  questionId: string;
  role: RoleId;
  kind: "mcq" | "scenario" | "reflection";
  correct: boolean;
  cap: number;
  choiceIndex?: number;
  reflection?: string;
  ts: number;
}

export interface RoleProgress {
  xp: number;
  capFromRole: number;
  completedMissions: string[];
  attempts: QuestionAttempt[];
  badges: string[];
  completionBonusGranted: boolean;
  perfectBonusGranted: boolean;
}

export interface PendingChallenge {
  kind: ChallengeKind;
  title: string;
  subtitle: string;
  baseBonus: number;
  questionIds: string[];
  cursor: number;                // 0-based index into questionIds
  earnedCap: number;             // CAP earned across this challenge so far
  correctMcq: number;
  totalMcq: number;
}

/** How a mystery's explanatory video became available. */
export type ExplainerUnlockSource = "solve" | "cap";

export interface MysteryMediaState {
  introWatched: boolean;
  introSkipped: boolean;
  introViews: number;
  explainerUnlock: ExplainerUnlockSource | null;
  explainerWatched: boolean;
  /** Resume positions in seconds, keyed by media slot ("intro" | "explainer" | extra key). */
  positions: Record<string, number>;
}

const emptyMedia = (): MysteryMediaState => ({
  introWatched: false,
  introSkipped: false,
  introViews: 0,
  explainerUnlock: null,
  explainerWatched: false,
  positions: {},
});


export interface GameState {
  playerName: string;
  role: RoleId | null;
  mode: GameMode | null;
  aiTeam: AiTeammate[];

  year: number;
  planetHealth: number;
  indicators: Record<IndicatorKey, number>;
  cap: number;

  solvedMysteries: string[];
  solveRecords: SolveRecord[];
  purchasedInterventions: string[];
  resolvedCrises: string[];

  pendingCrisisId: string | null;
  crisisStats: CrisisStats;
  positiveCrisisCount: number;
  crisisProbability: number;

  /** Full per-crisis outcome history (newest first). */
  crisisLog: CrisisOutcome[];
  /** Pending promotion banner — set when a role level threshold is crossed. */
  pendingPromotion: PendingPromotion | null;

  /** History of every indicator/Terra change with a human reason (newest first). */
  indicatorLog: IndicatorChange[];
  /** Snapshot of the most recently solved mystery's deltas (for the post-solve panel). */
  lastMysteryDelta: MysteryDelta | null;

  roleProgress: Partial<Record<RoleId, RoleProgress>>;
  pendingChallenge: PendingChallenge | null;
  challengeQueue: { kind: ChallengeKind }[];
  mysteriesSinceLastMission: number;

  /** Per-mystery video / media progress (keyed by mystery id). */
  mediaState: Record<string, MysteryMediaState>;
  /** Play the intro video automatically when entering a mystery. */
  autoplayIntro: boolean;


  nodes: NetworkNode[];
  edges: NetworkEdge[];
  feed: { id: string; text: string; tone: "info" | "good" | "warn"; ts: number }[];

  setPlayer: (name: string) => void;
  setRole: (role: RoleId) => void;
  setMode: (mode: GameMode) => void;
  setAiTeam: (team: AiTeammate[]) => void;
  solveMystery: (id: string, attempts?: number, hintsUsed?: number) => SolveRecord | null;
  buyIntervention: (id: string) => void;
  triggerCrisis: (id?: string) => void;
  dismissCrisis: () => void;
  resolveCrisis: (id: string, choiceId: string, responseMs?: number) => void;
  advanceYear: (n?: number) => void;
  reset: () => void;
  clearLastMysteryDelta: () => void;

  // Mystery media (intro / explanatory videos)
  markIntroWatched: (mysteryId: string) => void;
  markIntroSkipped: (mysteryId: string) => void;
  markExplainerUnlocked: (mysteryId: string, source: ExplainerUnlockSource) => void;
  unlockExplainerWithCap: (mysteryId: string, cost: number) => boolean;
  markExplainerWatched: (mysteryId: string) => void;
  saveMediaPosition: (mysteryId: string, mediaKey: string, seconds: number) => void;
  setAutoplayIntro: (on: boolean) => void;


  // Role challenge system
  queueChallenge: (kind: ChallengeKind) => void;
  startNextChallenge: () => void;
  answerChallengeQuestion: (choiceIndex: number | null, reflection?: string) => { cap: number; correct: boolean };
  skipCurrentQuestion: () => void;
  finishChallenge: () => void;
  dismissChallenge: () => void;

  /** Promotion banner */
  dismissPromotion: () => void;
}

const initial = {
  playerName: "Guest",
  role: null as RoleId | null,
  mode: null as GameMode | null,
  aiTeam: [] as AiTeammate[],
  year: 2025,
  planetHealth: 40,
  indicators: { climate: 42, food: 38, water: 35, bio: 44, economy: 41 } as Record<IndicatorKey, number>,
  cap: 80,
  solvedMysteries: [] as string[],
  solveRecords: [] as SolveRecord[],
  purchasedInterventions: [] as string[],
  resolvedCrises: [] as string[],
  pendingCrisisId: null as string | null,
  crisisStats: { faced: 0, resolved: 0, totalResponseMs: 0, choices: {}, bestPicks: 0, timeouts: 0 } as CrisisStats,
  positiveCrisisCount: 0,
  crisisProbability: 1,
  crisisLog: [] as CrisisOutcome[],
  pendingPromotion: null as PendingPromotion | null,
  indicatorLog: [] as IndicatorChange[],
  lastMysteryDelta: null as MysteryDelta | null,
  roleProgress: {} as Partial<Record<RoleId, RoleProgress>>,
  pendingChallenge: null as PendingChallenge | null,
  challengeQueue: [] as { kind: ChallengeKind }[],
  mysteriesSinceLastMission: 0,
  mediaState: {} as Record<string, MysteryMediaState>,
  autoplayIntro: true,

  nodes: [
    { id: "co2", label: "CO₂ Rising", group: "climate" as IndicatorKey },
    { id: "ocean", label: "Ocean Heat", group: "water" as IndicatorKey },
    { id: "ice", label: "Ice Melt", group: "climate" as IndicatorKey },
  ],
  edges: [
    { from: "co2", to: "ocean", label: "absorbs" },
    { from: "ocean", to: "ice", label: "melts" },
  ],
  feed: [
    { id: "f0", text: "Terra Initiative session started — Year 2025", tone: "info" as const, ts: Date.now() },
  ],
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function pickCrisis(state: GameState): string | null {
  const natureMisses = Math.max(
    0,
    Math.floor(state.solvedMysteries.length / 3) -
      state.purchasedInterventions.filter((id) => {
        const i = INTERVENTIONS.find((x) => x.id === id);
        return i?.category === "nature";
      }).length,
  );
  return pickCrisisForState({
    resolved: state.resolvedCrises,
    solvedMysteries: state.solvedMysteries,
    mysteryById: (id) => MYSTERIES.find((m) => m.id === id),
    indicators: state.indicators,
    natureMarketplaceMisses: natureMisses,
  });
}

function emptyProgress(): RoleProgress {
  return {
    xp: 0, capFromRole: 0, completedMissions: [],
    attempts: [], badges: [],
    completionBonusGranted: false, perfectBonusGranted: false,
  };
}

interface MissionCounters {
  solvedCount: number;
  interventionCount: number;
  interventionsByCategory: Record<string, number>;
  positiveCrises: number;
  correctQuizzes: number;
  indicators: Record<IndicatorKey, number>;
  planetHealth: number;
}

function triggerSatisfied(t: MissionTrigger, c: MissionCounters): boolean {
  switch (t.kind) {
    case "solve_count": return c.solvedCount >= t.n;
    case "intervention_count": return c.interventionCount >= t.n;
    case "intervention_category": return (c.interventionsByCategory[t.category] ?? 0) >= t.n;
    case "crisis_positive_count": return c.positiveCrises >= t.n;
    case "quiz_correct_count": return c.correctQuizzes >= t.n;
    case "indicator_floor": return c.indicators[t.key] >= t.min;
    case "planet_health_floor": return c.planetHealth >= t.min;
  }
}

function newlyCompletedMissions(role: RoleId | null, progress: RoleProgress, c: MissionCounters): RoleMission[] {
  if (!role) return [];
  const out: RoleMission[] = [];
  for (const m of ROLE_MISSIONS[role] ?? []) {
    if (progress.completedMissions.includes(m.id)) continue;
    if (triggerSatisfied(m.trigger, c)) out.push(m);
  }
  return out;
}

function applyMissionProgress(get: () => GameState, set: (p: Partial<GameState>) => void) {
  const s = get();
  if (!s.role) return;
  const progress = s.roleProgress[s.role] ?? emptyProgress();
  const counters: MissionCounters = {
    solvedCount: s.solvedMysteries.length,
    interventionCount: s.purchasedInterventions.length,
    interventionsByCategory: s.purchasedInterventions.reduce((acc, id) => {
      const i = INTERVENTIONS.find((x) => x.id === id);
      if (i) acc[i.category] = (acc[i.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    positiveCrises: s.positiveCrisisCount,
    correctQuizzes: progress.attempts.filter((a) => a.correct).length,
    indicators: s.indicators,
    planetHealth: s.planetHealth,
  };
  const completed = newlyCompletedMissions(s.role, progress, counters);
  if (completed.length === 0) return;

  const totalCap = completed.reduce((a, m) => a + m.reward, 0);
  const totalXp = completed.reduce((a, m) => a + m.reward, 0);
  const nextProgress: RoleProgress = {
    ...progress,
    xp: progress.xp + totalXp,
    capFromRole: progress.capFromRole + totalCap,
    completedMissions: [...progress.completedMissions, ...completed.map((m) => m.id)],
    badges: [...progress.badges, ...completed.map((m) => m.id)],
  };
  set({
    cap: s.cap + totalCap,
    roleProgress: { ...s.roleProgress, [s.role]: nextProgress },
    feed: [
      ...completed.map((m) => ({
        id: `f${Date.now()}-${m.id}`,
        text: `Role mission complete — ${m.title} (+${m.reward} CAP)`,
        tone: "good" as const,
        ts: Date.now(),
      })),
      ...s.feed,
    ].slice(0, 30),
  });
}

/* ----------------------- Promotion detection ---------------------- */

function checkPromotion(get: () => GameState, set: (p: Partial<GameState>) => void, prevCap: number) {
  const s = get();
  if (!s.role) return;
  const role = s.role;
  const before = levelFor(role, prevCap);
  const after = levelFor(role, s.cap);
  if (after.level <= before.level) return;
  if (s.pendingPromotion) return; // don't overwrite an unseen banner
  const meta = ROLE_PROGRESSION_META[role];
  const bonus = meta?.bonusOnPromote ?? 50;
  // Award promotion bonus directly (skip recursive promotion check to avoid loops).
  set({
    cap: s.cap + bonus,
    pendingPromotion: {
      role, from: before, to: after, bonus,
      theme: meta?.theme ?? "", ts: Date.now(),
    },
    feed: [
      { id: `f${Date.now()}-promo`, text: `Promotion — ${after.title} (+${bonus} CAP)`, tone: "good" as const, ts: Date.now() },
      ...s.feed,
    ].slice(0, 30),
  });
}

/* ----------------------- Crisis outcome helpers -------------------- */

const INDICATOR_LABEL: Record<IndicatorKey, string> = {
  climate: "Climate Stability", food: "Food Security",
  water: "Water Resources", bio: "Biodiversity", economy: "Economy",
};

const INDICATOR_TO_ROLES: Record<IndicatorKey, RoleId[]> = {
  climate:  ["scientist", "policymaker", "activist"],
  food:     ["farmer", "citizen"],
  water:    ["farmer", "citizen", "planner"],
  bio:      ["scientist", "activist"],
  economy:  ["business", "policymaker"],
};

function classifyOutcome(planetDelta: number, isBest: boolean, timedOut: boolean): CrisisOutcomeStatus {
  if (timedOut) return "critical";
  if (isBest) return "excellent";
  if (planetDelta >= 0) return "good";
  if (planetDelta >= -6) return "neutral";
  if (planetDelta >= -12) return "poor";
  return "critical";
}

function statusLabel(s: CrisisOutcomeStatus): string {
  return s === "excellent" ? "Excellent Decision"
    : s === "good" ? "Good Decision"
    : s === "neutral" ? "Neutral Outcome"
    : s === "poor" ? "Poor Decision"
    : "Critical Failure";
}

/** Process the queue → start the next challenge if none is active. */
function maybeActivateNextChallenge(get: () => GameState, set: (p: Partial<GameState>) => void) {
  const s = get();
  if (s.pendingChallenge || !s.role || s.challengeQueue.length === 0) return;
  const [next, ...rest] = s.challengeQueue;
  const progress = s.roleProgress[s.role] ?? emptyProgress();
  const answeredIds = progress.attempts.map((a) => a.questionId);
  const ids = buildChallengeQuestionIds(next.kind, s.role, answeredIds);
  if (ids.length === 0) {
    // Nothing left to ask — skip silently
    set({ challengeQueue: rest });
    maybeActivateNextChallenge(get, set);
    return;
  }
  const tmpl = CHALLENGE_TEMPLATES[next.kind];
  const totalMcq = ids.reduce((n, id) => {
    const q = ROLE_QUESTIONS.find((x) => x.id === id);
    return n + (q?.kind === "mcq" ? 1 : 0);
  }, 0);
  set({
    pendingChallenge: {
      kind: next.kind,
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      baseBonus: tmpl.baseBonus,
      questionIds: ids,
      cursor: 0,
      earnedCap: 0,
      correctMcq: 0,
      totalMcq,
    },
    challengeQueue: rest,
  });
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial,
      setPlayer: (name) => set({ playerName: name || "Guest" }),
      setRole: (role) => {
        const s = get();
        const rp = s.roleProgress[role] ?? emptyProgress();
        set({ role, roleProgress: { ...s.roleProgress, [role]: rp } });
        // Orientation challenge if no MCQ has been answered yet for this role
        const anyMcqAnswered = rp.attempts.some((a) => a.kind === "mcq");
        if (!anyMcqAnswered) {
          get().queueChallenge("orientation");
        }
      },
      setMode: (mode) => set({ mode }),
      setAiTeam: (aiTeam) => set({ aiTeam }),

      solveMystery: (id, attempts = 1, hintsUsed = 0) => {
        const m = MYSTERIES.find((x) => x.id === id);
        if (!m || get().solvedMysteries.includes(id)) return null;
        const s = get();
        const prevCap = s.cap;
        const { base, total } = computePayout(attempts, hintsUsed);
        const roleBonus = bonusForRole(s.role, m);
        const grand = total + roleBonus;
        const record: SolveRecord = {
          mysteryId: id, attempts, hintsUsed,
          payout: grand, basePayout: base, ts: Date.now(),
        };
        const newNode: NetworkNode = { id: `m-${id}`, label: m.title, group: m.category };
        const linkTarget = s.nodes[0]?.id ?? "co2";
        const nextSolved = [...s.solvedMysteries, id];

        // Library trigger: every 4 solves evaluate; library-aware picker handles weighting.
        const shouldTriggerCrisis = nextSolved.length % 4 === 0 && !s.pendingCrisisId;
        const newCrisisId = shouldTriggerCrisis
          ? pickCrisis({ ...s, solvedMysteries: nextSolved } as GameState)
          : s.pendingCrisisId;

        // Capture before/after for the post-solve panel + indicator history.
        const indicatorsBefore = { ...s.indicators };
        const planetBefore = s.planetHealth;
        const indicatorsAfter = { ...s.indicators, [m.category]: clamp(s.indicators[m.category] + 2) };
        const planetAfter = clamp(s.planetHealth + 2);
        const reason = `${m.title} solved`;
        const changes: IndicatorChange[] = [
          {
            id: `il-${Date.now()}-p`, key: "planet",
            before: planetBefore, after: planetAfter,
            delta: planetAfter - planetBefore, reason,
            source: "mystery", ts: Date.now(),
          },
          {
            id: `il-${Date.now()}-${m.category}`, key: m.category,
            before: indicatorsBefore[m.category], after: indicatorsAfter[m.category],
            delta: indicatorsAfter[m.category] - indicatorsBefore[m.category], reason,
            source: "mystery", ts: Date.now(),
          },
        ];

        const roleLabel = roleRelationship(s.role, m) === "primary" ? " ★ Primary role bonus" : "";
        set({
          solvedMysteries: nextSolved,
          solveRecords: [...s.solveRecords, record],
          cap: s.cap + grand,
          indicators: indicatorsAfter,
          planetHealth: planetAfter,
          nodes: [...s.nodes, newNode],
          edges: [...s.edges, { from: newNode.id, to: linkTarget, label: "reveals" }],
          pendingCrisisId: newCrisisId,
          crisisStats: shouldTriggerCrisis && newCrisisId
            ? { ...s.crisisStats, faced: s.crisisStats.faced + 1 }
            : s.crisisStats,
          mysteriesSinceLastMission: s.mysteriesSinceLastMission + 1,
          indicatorLog: [...changes, ...s.indicatorLog].slice(0, 200),
          lastMysteryDelta: {
            mysteryId: id, mysteryTitle: m.title,
            capDelta: grand,
            planetBefore, planetAfter,
            indicatorsBefore, indicatorsAfter,
            reasonByKey: { planet: reason, [m.category]: reason } as MysteryDelta["reasonByKey"],
          },
          feed: [
            { id: `f${Date.now()}`, text: `Mystery solved: ${m.title} (+${grand} CAP${roleLabel})`, tone: "good" as const, ts: Date.now() },
            ...s.feed,
          ].slice(0, 30),
        });

        // Solving the puzzle permanently unlocks the explanatory video.
        get().markExplainerUnlocked(id, "solve");

        // Small role XP for any solve

        const role = get().role;
        if (role) {
          const rp = get().roleProgress[role] ?? emptyProgress();
          set({ roleProgress: { ...get().roleProgress, [role]: { ...rp, xp: rp.xp + 15 } } });
        }
        applyMissionProgress(get, set);

        // Trigger 2 — Role Mission after every 2 mysteries
        if (get().mysteriesSinceLastMission >= 2) {
          set({ mysteriesSinceLastMission: 0 });
          get().queueChallenge("mission");
        }

        // Trigger 4 — Tier completion → Role Assessment
        if (role) {
          const tier = m.tier;
          const allTier = MYSTERIES.filter((x) => x.tier === tier);
          const allDone = allTier.every((x) => get().solvedMysteries.includes(x.id));
          if (allDone) get().queueChallenge("assessment");
        }
        checkPromotion(get, set, prevCap);
        return record;
      },

      clearLastMysteryDelta: () => set({ lastMysteryDelta: null }),

      // ---------------------- Mystery media ----------------------
      markIntroWatched: (mysteryId) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        set({
          mediaState: {
            ...s.mediaState,
            [mysteryId]: { ...cur, introWatched: true, introViews: cur.introViews + 1 },
          },
        });
      },

      markIntroSkipped: (mysteryId) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        set({
          mediaState: { ...s.mediaState, [mysteryId]: { ...cur, introSkipped: true } },
        });
      },

      markExplainerUnlocked: (mysteryId, source) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        if (cur.explainerUnlock) return;   // never downgrade / re-charge
        set({
          mediaState: { ...s.mediaState, [mysteryId]: { ...cur, explainerUnlock: source } },
        });
      },

      unlockExplainerWithCap: (mysteryId, cost) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        if (cur.explainerUnlock) return true;
        if (s.cap < cost) return false;
        const m = MYSTERIES.find((x) => x.id === mysteryId);
        set({
          cap: s.cap - cost,
          mediaState: { ...s.mediaState, [mysteryId]: { ...cur, explainerUnlock: "cap" } },
          feed: [
            {
              id: `f${Date.now()}-vid`,
              text: `Explanation unlocked early: ${m?.title ?? mysteryId} (−${cost} CAP)`,
              tone: "warn" as const,
              ts: Date.now(),
            },
            ...s.feed,
          ].slice(0, 30),
        });
        return true;
      },

      markExplainerWatched: (mysteryId) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        set({
          mediaState: { ...s.mediaState, [mysteryId]: { ...cur, explainerWatched: true } },
        });
      },

      saveMediaPosition: (mysteryId, mediaKey, seconds) => {
        const s = get();
        const cur = s.mediaState[mysteryId] ?? emptyMedia();
        set({
          mediaState: {
            ...s.mediaState,
            [mysteryId]: { ...cur, positions: { ...cur.positions, [mediaKey]: Math.max(0, seconds) } },
          },
        });
      },

      setAutoplayIntro: (on) => set({ autoplayIntro: on }),


      buyIntervention: (id) => {
        const i = INTERVENTIONS.find((x) => x.id === id);
        const s = get();
        const prevCap = s.cap;
        if (!i || s.cap < i.cost || s.purchasedInterventions.includes(id)) return;
        const before = { ...s.indicators };
        const ind = { ...s.indicators };
        (Object.keys(i.effects) as IndicatorKey[]).forEach((k) => {
          ind[k] = clamp(ind[k] + (i.effects[k] ?? 0));
        });
        const planetAfter = clamp(s.planetHealth + i.planetHealth);
        const reason = `${i.name} invested`;
        const now = Date.now();
        const changes: IndicatorChange[] = [];
        if (planetAfter !== s.planetHealth) {
          changes.push({
            id: `il-${now}-p`, key: "planet",
            before: s.planetHealth, after: planetAfter,
            delta: planetAfter - s.planetHealth, reason,
            source: "intervention", ts: now,
          });
        }
        (Object.keys(ind) as IndicatorKey[]).forEach((k) => {
          if (ind[k] !== before[k]) {
            changes.push({
              id: `il-${now}-${k}`, key: k,
              before: before[k], after: ind[k],
              delta: ind[k] - before[k], reason,
              source: "intervention", ts: now,
            });
          }
        });
        const newNode: NetworkNode = { id: `i-${id}`, label: i.name, group: "economy" };
        set({
          cap: s.cap - i.cost,
          indicators: ind,
          planetHealth: planetAfter,
          purchasedInterventions: [...s.purchasedInterventions, id],
          nodes: [...s.nodes, newNode],
          edges: [...s.edges, { from: newNode.id, to: "co2", label: "reduces" }],
          indicatorLog: [...changes, ...s.indicatorLog].slice(0, 200),
          feed: [
            { id: `f${now}`, text: `Invested in ${i.name} — ripple in motion`, tone: "good" as const, ts: now },
            ...s.feed,
          ].slice(0, 30),
        });
        applyMissionProgress(get, set);
        checkPromotion(get, set, prevCap);
      },

      triggerCrisis: (id) => {
        const s = get();
        if (s.pendingCrisisId) return;
        const cid = id ?? pickCrisis(s);
        if (!cid) return;
        set({
          pendingCrisisId: cid,
          crisisStats: { ...s.crisisStats, faced: s.crisisStats.faced + 1 },
        });
      },

      dismissCrisis: () => set({ pendingCrisisId: null }),

      resolveCrisis: (id, choiceId, responseMs = 0) => {
        const c = CRISES.find((x) => x.id === id);
        const s = get();
        if (!c) return;
        // Empty choiceId = library "no vote" default consequence (worst option D).
        const timedOut = !choiceId;
        const choice = timedOut ? defaultChoiceFor(c) : c.choices.find((x) => x.id === choiceId);
        if (!choice) return;

        const indicatorsBefore = { ...s.indicators };
        const planetHealthBefore = s.planetHealth;
        const ind = { ...s.indicators };
        (Object.keys(choice.effects) as IndicatorKey[]).forEach((k) => {
          ind[k] = clamp(ind[k] + (choice.effects[k] ?? 0));
        });
        const planetHealthAfter = clamp(planetHealthBefore + choice.planetHealth);
        const isPositive = choice.planetHealth >= 0;
        const isBest = choice.id === c.bestChoiceId;

        // CAP breakdown — every reason a player gains or loses CAP from this crisis.
        const breakdown: { label: string; value: number }[] = [];
        if (choice.cost) breakdown.push({ label: "Intervention cost", value: -choice.cost });
        if (isPositive) breakdown.push({ label: "Positive outcome bonus", value: 25 });
        if (isBest) breakdown.push({ label: "Best decision bonus", value: 15 });
        if (timedOut) breakdown.push({ label: "Timeout penalty", value: -10 });

        // Role bonus — player's role is a primary stakeholder of a linked mystery.
        const role = s.role;
        if (role && c.linkedMysteryCodes?.length) {
          const matched = MYSTERIES.some(
            (m) => c.linkedMysteryCodes!.includes(m.code) && m.primaryRoles.includes(role),
          );
          if (matched && (isPositive || isBest)) breakdown.push({ label: "Role expertise bonus", value: 10 });
        }
        const capDelta = breakdown.reduce((a, b) => a + b.value, 0);
        const capPositive = breakdown.filter((b) => b.value > 0).reduce((a, b) => a + b.value, 0);
        const capNegative = -breakdown.filter((b) => b.value < 0).reduce((a, b) => a + b.value, 0);

        // Stakeholder impact — derived from per-indicator deltas.
        const benefited = new Set<RoleId>();
        const harmed = new Set<RoleId>();
        (Object.keys(ind) as IndicatorKey[]).forEach((k) => {
          const d = ind[k] - indicatorsBefore[k];
          if (d > 0) INDICATOR_TO_ROLES[k].forEach((r) => benefited.add(r));
          else if (d < 0) INDICATOR_TO_ROLES[k].forEach((r) => harmed.add(r));
        });
        // Roles in both → treat net by total delta sign per role
        const harmedFinal = [...harmed].filter((r) => !benefited.has(r));

        // Butterfly effects — per indicator with significant change.
        const butterflyEffects = (Object.keys(ind) as IndicatorKey[])
          .map((k) => {
            const d = ind[k] - indicatorsBefore[k];
            if (d === 0) return null;
            return { label: INDICATOR_LABEL[k], direction: (d > 0 ? "up" : "down") as "up" | "down" };
          })
          .filter((x): x is { label: string; direction: "up" | "down" } => x !== null);

        // Future consequences — based on outcome quality and butterfly effects.
        const futureConsequences: string[] = [];
        if (isBest || isPositive) {
          if (butterflyEffects.some((b) => b.direction === "up"))
            futureConsequences.push("Future similar crisis probability reduced.");
          futureConsequences.push("Community resilience and trust strengthened for next round.");
        } else {
          futureConsequences.push("Future crisis probability increased.");
          if (butterflyEffects.some((b) => b.direction === "down"))
            futureConsequences.push("Indicator damage will worsen the next event in this chain.");
        }
        if (timedOut) futureConsequences.push("Delayed decision locked in the worst-case default response.");

        const status = classifyOutcome(choice.planetHealth, isBest, timedOut);
        const insight = c.bestReasoning ?? c.indicatorNarrative
          ?? "Every crisis you face is connected — fast root-cause action beats waiting for symptoms.";

        const outcome: CrisisOutcome = {
          id: `co-${Date.now()}-${id}`,
          crisisId: id,
          title: c.title,
          emoji: c.emoji,
          choiceId: choice.id,
          choiceLabel: choice.label,
          status,
          isBest,
          timedOut,
          capDelta,
          capPositive,
          capNegative,
          capBreakdown: breakdown,
          planetHealthBefore,
          planetHealthAfter,
          indicatorsBefore,
          indicatorsAfter: ind,
          benefitedRoles: [...benefited],
          harmedRoles: harmedFinal,
          futureConsequences,
          butterflyEffects,
          insight,
          responseMs,
          ts: Date.now(),
        };

        const prevCap = s.cap;

        // Record indicator history for this crisis
        const crisisReason = `${c.title} → ${choice.label}${timedOut ? " (timed out)" : ""}`;
        const nowTs = Date.now();
        const crisisChanges: IndicatorChange[] = [];
        if (planetHealthAfter !== planetHealthBefore) {
          crisisChanges.push({
            id: `il-${nowTs}-p`, key: "planet",
            before: planetHealthBefore, after: planetHealthAfter,
            delta: planetHealthAfter - planetHealthBefore,
            reason: crisisReason, source: "crisis", ts: nowTs,
          });
        }
        (Object.keys(ind) as IndicatorKey[]).forEach((k) => {
          if (ind[k] !== indicatorsBefore[k]) {
            crisisChanges.push({
              id: `il-${nowTs}-${k}`, key: k,
              before: indicatorsBefore[k], after: ind[k],
              delta: ind[k] - indicatorsBefore[k],
              reason: crisisReason, source: "crisis", ts: nowTs,
            });
          }
        });

        set({
          resolvedCrises: s.resolvedCrises.includes(id) ? s.resolvedCrises : [...s.resolvedCrises, id],
          pendingCrisisId: null,
          cap: Math.max(0, prevCap + capDelta),
          indicators: ind,
          planetHealth: planetHealthAfter,
          crisisStats: {
            ...s.crisisStats,
            resolved: s.crisisStats.resolved + 1,
            totalResponseMs: s.crisisStats.totalResponseMs + responseMs,
            choices: { ...s.crisisStats.choices, [id]: choice.id },
            bestPicks: s.crisisStats.bestPicks + (isBest ? 1 : 0),
            timeouts: s.crisisStats.timeouts + (timedOut ? 1 : 0),
          },
          positiveCrisisCount: s.positiveCrisisCount + (isPositive ? 1 : 0),
          crisisProbability: isPositive ? s.crisisProbability : Math.min(2.5, s.crisisProbability + 0.2),
          crisisLog: [outcome, ...s.crisisLog].slice(0, 50),
          indicatorLog: [...crisisChanges, ...s.indicatorLog].slice(0, 200),
          feed: [
            {
              id: `f${Date.now()}`,
              text: timedOut
                ? `Crisis timeout: ${c.title} → default consequence (${choice.label})`
                : `Crisis resolved: ${c.title} → ${choice.label}${isBest ? " ★ best answer" : ""}`,
              tone: (isPositive ? "good" : "warn") as "good" | "warn",
              ts: Date.now(),
            },
            ...s.feed,
          ].slice(0, 30),
        });
        applyMissionProgress(get, set);
        checkPromotion(get, set, prevCap);

        // Trigger 3 — Stakeholder Reflection after every crisis
        if (get().role) get().queueChallenge("reflection");
      },

      advanceYear: (n = 1) => set({ year: Math.min(2050, get().year + n) }),
      reset: () => set({ ...initial }),

      /* ------------------ Role challenge system ------------------ */

      queueChallenge: (kind) => {
        const s = get();
        if (!s.role) return;
        // Avoid duplicating an already-queued or currently-active challenge of same kind
        if (s.pendingChallenge?.kind === kind) return;
        if (s.challengeQueue.some((c) => c.kind === kind)) return;
        // Skip if no eligible questions remain
        const progress = s.roleProgress[s.role] ?? emptyProgress();
        const answeredIds = progress.attempts.map((a) => a.questionId);
        const ids = buildChallengeQuestionIds(kind, s.role, answeredIds);
        if (ids.length === 0) return;
        set({ challengeQueue: [...s.challengeQueue, { kind }] });
        maybeActivateNextChallenge(get, set);
      },

      startNextChallenge: () => maybeActivateNextChallenge(get, set),

      answerChallengeQuestion: (choiceIndex, reflection) => {
        const s = get();
        const ch = s.pendingChallenge;
        if (!ch || !s.role) return { cap: 0, correct: false };
        const qid = ch.questionIds[ch.cursor];
        const qn = ROLE_QUESTIONS.find((x) => x.id === qid);
        if (!qn) return { cap: 0, correct: false };

        const { cap, correct } = rewardForAnswer(qn, choiceIndex, reflection);

        const progress = s.roleProgress[s.role] ?? emptyProgress();
        const attempt: QuestionAttempt = {
          questionId: qid, role: s.role, kind: qn.kind,
          correct, cap,
          choiceIndex: choiceIndex ?? undefined,
          reflection,
          ts: Date.now(),
        };
        const nextProgress: RoleProgress = {
          ...progress,
          attempts: [...progress.attempts, attempt],
          capFromRole: progress.capFromRole + cap,
          xp: progress.xp + Math.max(1, Math.floor(cap / 2)),
        };
        const nextCh: PendingChallenge = {
          ...ch,
          cursor: ch.cursor + 1,
          earnedCap: ch.earnedCap + cap,
          correctMcq: ch.correctMcq + (qn.kind === "mcq" && correct ? 1 : 0),
        };
        set({
          cap: s.cap + cap,
          pendingChallenge: nextCh,
          roleProgress: { ...s.roleProgress, [s.role]: nextProgress },
        });

        // Auto-finish when last question answered
        if (nextCh.cursor >= nextCh.questionIds.length) {
          get().finishChallenge();
        } else {
          applyMissionProgress(get, set);
        }
        return { cap, correct };
      },

      skipCurrentQuestion: () => {
        const s = get();
        const ch = s.pendingChallenge;
        if (!ch) return;
        const next = { ...ch, cursor: ch.cursor + 1 };
        set({ pendingChallenge: next });
        if (next.cursor >= next.questionIds.length) get().finishChallenge();
      },

      finishChallenge: () => {
        const s = get();
        const ch = s.pendingChallenge;
        if (!ch || !s.role) return;
        const progress = s.roleProgress[s.role] ?? emptyProgress();
        const allQs = questionsByRole(s.role);
        const answeredIds = new Set(progress.attempts.map((a) => a.questionId));
        const allAnswered = allQs.every((q) => answeredIds.has(q.id));

        let bonus = ch.baseBonus;
        const feedLines: string[] = [`${ch.title} complete (+${ch.baseBonus} CAP bonus)`];
        let xpBonus = ch.baseBonus;

        const newBadges: string[] = [];
        if (ch.kind === "assessment") {
          newBadges.push(`assessment-${Date.now()}`);
        }

        let completionBonusGranted = progress.completionBonusGranted;
        let perfectBonusGranted = progress.perfectBonusGranted;

        if (allAnswered && !progress.completionBonusGranted) {
          bonus += 20;
          xpBonus += 20;
          completionBonusGranted = true;
          newBadges.push("questionnaire-complete");
          feedLines.push("Full questionnaire bonus — +20 CAP");
        }

        // Perfect MCQ score = every MCQ answered correctly
        const mcqQs = allQs.filter((q) => q.kind === "mcq");
        const correctMcqIds = new Set(progress.attempts.filter((a) => a.kind === "mcq" && a.correct).map((a) => a.questionId));
        const isPerfect = mcqQs.length > 0 && mcqQs.every((q) => correctMcqIds.has(q.id));
        if (isPerfect && !progress.perfectBonusGranted && allAnswered) {
          bonus += 30;
          xpBonus += 30;
          perfectBonusGranted = true;
          newBadges.push("perfect-score");
          feedLines.push("Perfect score — +30 CAP");
        }

        const nextProgress: RoleProgress = {
          ...progress,
          xp: progress.xp + xpBonus,
          capFromRole: progress.capFromRole + bonus,
          badges: [...progress.badges, ...newBadges],
          completionBonusGranted,
          perfectBonusGranted,
        };

        set({
          cap: s.cap + bonus,
          pendingChallenge: null,
          roleProgress: { ...s.roleProgress, [s.role]: nextProgress },
          feed: [
            ...feedLines.map((text, i) => ({
              id: `f${Date.now()}-ch-${i}`,
              text,
              tone: "good" as const,
              ts: Date.now(),
            })),
            ...s.feed,
          ].slice(0, 30),
        });
        applyMissionProgress(get, set);
        // Process the next queued challenge if any
        setTimeout(() => maybeActivateNextChallenge(get, set), 250);
      },

      dismissChallenge: () => {
        // Forfeit per-question CAP is kept (already credited), just clear pending challenge.
        set({ pendingChallenge: null });
        setTimeout(() => maybeActivateNextChallenge(get, set), 100);
      },

      dismissPromotion: () => set({ pendingPromotion: null }),
    }),
    { name: "tomorrow-matrix-game" },
  ),
);

/* Re-exports so callers can find the question banks via the store module too. */
export { ROLE_QUESTIONS };
export type { RoleQuestion };
