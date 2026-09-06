import type { RoleId } from "./types";

/* ------------------------------------------------------------------ */
/*  Role progression, 6-tier CAP-based titles                        */
/*  Thresholds: 0 / 200 / 500 / 900 / 1500 / 2500 CAP                 */
/* ------------------------------------------------------------------ */

export interface RoleLevel { level: number; title: string; minXp: number; }
export interface RoleProgressionMeta { theme: string; bonusOnPromote: number; }

/** CAP thresholds, used as `minXp` to keep call-sites unchanged. */
const CAP = [0, 200, 500, 900, 1500, 2500];

export const ROLE_LEVELS: Record<RoleId, RoleLevel[]> = {
  scientist: [
    { level: 1, title: "Climate Observer",              minXp: CAP[0] },
    { level: 2, title: "Climate Analyst",               minXp: CAP[1] },
    { level: 3, title: "Earth Systems Researcher",      minXp: CAP[2] },
    { level: 4, title: "Climate Scientist",             minXp: CAP[3] },
    { level: 5, title: "Lead Climate Researcher",       minXp: CAP[4] },
    { level: 6, title: "Guardian of Earth's Systems",   minXp: CAP[5] },
  ],
  farmer: [
    { level: 1, title: "Steward of the Land",           minXp: CAP[0] },
    { level: 2, title: "Sustainable Grower",            minXp: CAP[1] },
    { level: 3, title: "Climate-Smart Farmer",          minXp: CAP[2] },
    { level: 4, title: "Regenerative Agriculture Leader", minXp: CAP[3] },
    { level: 5, title: "Food Systems Champion",         minXp: CAP[4] },
    { level: 6, title: "Guardian of Global Food Security", minXp: CAP[5] },
  ],
  policymaker: [
    { level: 1, title: "Policy Associate",              minXp: CAP[0] },
    { level: 2, title: "Public Policy Strategist",      minXp: CAP[1] },
    { level: 3, title: "Climate Governance Advisor",    minXp: CAP[2] },
    { level: 4, title: "Sustainability Commissioner",   minXp: CAP[3] },
    { level: 5, title: "National Climate Leader",       minXp: CAP[4] },
    { level: 6, title: "Global Climate Statesperson",   minXp: CAP[5] },
  ],
  activist: [
    { level: 1, title: "Climate Volunteer",             minXp: CAP[0] },
    { level: 2, title: "Community Mobiliser",           minXp: CAP[1] },
    { level: 3, title: "Environmental Advocate",        minXp: CAP[2] },
    { level: 4, title: "Climate Campaign Leader",       minXp: CAP[3] },
    { level: 5, title: "Global Sustainability Ambassador", minXp: CAP[4] },
    { level: 6, title: "Voice of the Planet",           minXp: CAP[5] },
  ],
  business: [
    { level: 1, title: "Responsible Entrepreneur",      minXp: CAP[0] },
    { level: 2, title: "Sustainability Manager",        minXp: CAP[1] },
    { level: 3, title: "ESG Strategist",                minXp: CAP[2] },
    { level: 4, title: "Chief Sustainability Officer",  minXp: CAP[3] },
    { level: 5, title: "Net Zero Business Leader",      minXp: CAP[4] },
    { level: 6, title: "Architect of Sustainable Enterprise", minXp: CAP[5] },
  ],
  citizen: [
    { level: 1, title: "Community Volunteer",           minXp: CAP[0] },
    { level: 2, title: "Neighbourhood Advocate",        minXp: CAP[1] },
    { level: 3, title: "Community Resilience Coordinator", minXp: CAP[2] },
    { level: 4, title: "Social Impact Leader",          minXp: CAP[3] },
    { level: 5, title: "Regional Community Champion",   minXp: CAP[4] },
    { level: 6, title: "Guardian of Resilient Communities", minXp: CAP[5] },
  ],
  planner: [
    { level: 1, title: "Urban Planner",                 minXp: CAP[0] },
    { level: 2, title: "Green Infrastructure Designer", minXp: CAP[1] },
    { level: 3, title: "Resilient Cities Planner",      minXp: CAP[2] },
    { level: 4, title: "Sustainable Urban Architect",   minXp: CAP[3] },
    { level: 5, title: "Metropolitan Resilience Director", minXp: CAP[4] },
    { level: 6, title: "Visionary of Future Cities",    minXp: CAP[5] },
  ],
  student: [
    { level: 1, title: "Climate Explorer",              minXp: CAP[0] },
    { level: 2, title: "Systems Thinker",               minXp: CAP[1] },
    { level: 3, title: "Climate Investigator",          minXp: CAP[2] },
    { level: 4, title: "Sustainability Scholar",        minXp: CAP[3] },
    { level: 5, title: "Youth Climate Leader",          minXp: CAP[4] },
    { level: 6, title: "Tomorrow's Climate Guardian",   minXp: CAP[5] },
  ],
};

export const ROLE_PROGRESSION_META: Record<RoleId, RoleProgressionMeta> = {
  scientist:   { theme: "Discover · Analyse · Predict · Protect",      bonusOnPromote: 50 },
  farmer:      { theme: "Grow · Restore · Sustain · Nourish",          bonusOnPromote: 50 },
  policymaker: { theme: "Plan · Govern · Influence · Transform",       bonusOnPromote: 50 },
  activist:    { theme: "Inspire · Mobilise · Empower · Protect",      bonusOnPromote: 50 },
  business:    { theme: "Innovate · Transform · Decarbonise · Lead",   bonusOnPromote: 50 },
  citizen:     { theme: "Support · Connect · Strengthen · Empower",    bonusOnPromote: 50 },
  planner:     { theme: "Design · Adapt · Build · Transform",          bonusOnPromote: 50 },
  student:     { theme: "Learn · Discover · Lead · Inspire",           bonusOnPromote: 50 },
};

/**
 * Total CAP earned by the player (legacy XP callers still work, same thresholds).
 */
export function levelFor(role: RoleId, value: number): RoleLevel {
  const ladder = ROLE_LEVELS[role];
  return [...ladder].reverse().find((l) => value >= l.minXp) ?? ladder[0];
}
export function nextLevel(role: RoleId, value: number): RoleLevel | null {
  return ROLE_LEVELS[role].find((l) => value < l.minXp) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Role missions (kept, passive secondary objectives)               */
/* ------------------------------------------------------------------ */

export type MissionTrigger =
  | { kind: "solve_count"; n: number }
  | { kind: "intervention_category"; category: "nature" | "policy" | "energy" | "tech" | "agriculture"; n: number }
  | { kind: "intervention_count"; n: number }
  | { kind: "crisis_positive_count"; n: number }
  | { kind: "quiz_correct_count"; n: number }
  | { kind: "indicator_floor"; key: "food" | "water" | "bio" | "economy" | "climate"; min: number }
  | { kind: "planet_health_floor"; min: number };

export interface RoleMission {
  id: string;
  title: string;
  description: string;
  reward: number;
  trigger: MissionTrigger;
}

export const ROLE_MISSIONS: Record<RoleId, RoleMission[]> = {
  scientist: [
    { id: "sci-1", title: "Pattern Recognition", description: "Solve any 3 mysteries.", reward: 15, trigger: { kind: "solve_count", n: 3 } },
    { id: "sci-2", title: "Evidence-Led", description: "Answer 3 role questions correctly.", reward: 20, trigger: { kind: "quiz_correct_count", n: 3 } },
    { id: "sci-3", title: "Cascade Theorist", description: "Solve 6 mysteries total.", reward: 30, trigger: { kind: "solve_count", n: 6 } },
  ],
  farmer: [
    { id: "farm-1", title: "Soil First", description: "Buy any agriculture or nature intervention.", reward: 15, trigger: { kind: "intervention_category", category: "agriculture", n: 1 } },
    { id: "farm-2", title: "Water Stewardship", description: "Keep the Water indicator at 45+.", reward: 20, trigger: { kind: "indicator_floor", key: "water", min: 45 } },
    { id: "farm-3", title: "Food Security", description: "Keep the Food indicator at 50+.", reward: 25, trigger: { kind: "indicator_floor", key: "food", min: 50 } },
  ],
  policymaker: [
    { id: "pol-1", title: "Set the Frame", description: "Buy any policy intervention.", reward: 15, trigger: { kind: "intervention_category", category: "policy", n: 1 } },
    { id: "pol-2", title: "Calm Hand", description: "Resolve 2 crises with a positive outcome.", reward: 20, trigger: { kind: "crisis_positive_count", n: 2 } },
    { id: "pol-3", title: "Stable Economy", description: "Keep Economy at 45+.", reward: 25, trigger: { kind: "indicator_floor", key: "economy", min: 45 } },
  ],
  activist: [
    { id: "act-1", title: "Raise Awareness", description: "Solve 3 mysteries.", reward: 15, trigger: { kind: "solve_count", n: 3 } },
    { id: "act-2", title: "Protect the Wild", description: "Keep Biodiversity at 50+.", reward: 20, trigger: { kind: "indicator_floor", key: "bio", min: 50 } },
    { id: "act-3", title: "Long-Term Thinking", description: "Buy 3 interventions of any kind.", reward: 25, trigger: { kind: "intervention_count", n: 3 } },
  ],
  business: [
    { id: "biz-1", title: "Clean Tech Bet", description: "Buy any energy or tech intervention.", reward: 15, trigger: { kind: "intervention_category", category: "tech", n: 1 } },
    { id: "biz-2", title: "Stable Markets", description: "Keep Economy at 50+.", reward: 20, trigger: { kind: "indicator_floor", key: "economy", min: 50 } },
    { id: "biz-3", title: "Risk Reduction", description: "Resolve 3 crises positively.", reward: 30, trigger: { kind: "crisis_positive_count", n: 3 } },
  ],
  planner: [
    { id: "plan-1", title: "Cooling the City", description: "Buy any policy or nature intervention.", reward: 15, trigger: { kind: "intervention_category", category: "nature", n: 1 } },
    { id: "plan-2", title: "Urban Resilience", description: "Keep Climate at 50+.", reward: 25, trigger: { kind: "indicator_floor", key: "climate", min: 50 } },
    { id: "plan-3", title: "Built To Last", description: "Restore Terra to 60%.", reward: 30, trigger: { kind: "planet_health_floor", min: 60 } },
  ],
  citizen: [
    { id: "com-1", title: "Voice The Frontline", description: "Resolve 2 crises positively.", reward: 15, trigger: { kind: "crisis_positive_count", n: 2 } },
    { id: "com-2", title: "Community First", description: "Keep Food at 45+ and Water at 45+.", reward: 25, trigger: { kind: "indicator_floor", key: "food", min: 45 } },
    { id: "com-3", title: "Resilience Built", description: "Restore Terra to 55%.", reward: 25, trigger: { kind: "planet_health_floor", min: 55 } },
  ],
  student: [
    { id: "stu-1", title: "First Discovery", description: "Solve your first mystery.", reward: 10, trigger: { kind: "solve_count", n: 1 } },
    { id: "stu-2", title: "Quiz Whiz", description: "Answer 3 questions correctly.", reward: 20, trigger: { kind: "quiz_correct_count", n: 3 } },
    { id: "stu-3", title: "Climate Champion", description: "Solve 5 mysteries.", reward: 30, trigger: { kind: "solve_count", n: 5 } },
  ],
};

/* ------------------------------------------------------------------ */
/*  Role Question Bank, sourced from Tomorrow_Matrix_Role_Questionnaires */
/*  36 questions per role across 3 phases (Foundational/Applied/Advanced) */
/* ------------------------------------------------------------------ */

import questionnaireData from "./questionnaires.data.json";

export type RoleQuestionKind = "mcq" | "scenario" | "reflection";
export type QuestionPhase = 1 | 2 | 3;

export interface RoleQuestion {
  id: string;
  role: RoleId;
  index: number;
  phase: QuestionPhase;
  kind: RoleQuestionKind;
  /** Source type from the questionnaire library (for future advanced UI). */
  sourceType: "tf" | "mcq" | "scenario" | "fill" | "match" | "multi" | "order" | "reflection";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctOrder?: number[];
  pairs?: { term: string; def: string }[];
  accept?: string[];
  explanation?: string;
  placeholder?: string;
}

type RawQ = {
  id: string;
  phase: number;
  num: number;
  kind: string;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctOrder?: number[];
  pairs?: { term: string; def: string }[];
  accept?: string[];
  answerText?: string;
  correct?: boolean;
  explanation?: string;
};

function buildQuestions(): RoleQuestion[] {
  const out: RoleQuestion[] = [];
  const data = questionnaireData as Record<string, { tagline: string; questions: RawQ[] }>;
  for (const roleKey of Object.keys(data) as RoleId[]) {
    const bucket = data[roleKey];
    if (!bucket) continue;
    for (const q of bucket.questions) {
      const phase = Math.max(1, Math.min(3, q.phase)) as QuestionPhase;
      let kind: RoleQuestionKind = "mcq";
      let options = q.options?.slice();
      let correctIndex = q.correctIndex;

      if (q.kind === "tf") {
        kind = "mcq";
        options = ["True", "False"];
        correctIndex = q.correct ? 0 : 1;
      } else if (q.kind === "mcq") {
        kind = "mcq";
      } else if (q.kind === "scenario") {
        kind = "scenario";
      } else if (q.kind === "fill") {
        kind = "mcq";
        const answer = q.answerText ?? (q.accept?.[0] ?? "");
        // Present as MCQ with distractors "Not sure", best-effort presentation
        options = [answer, "Not sure", "None of the above"];
        correctIndex = 0;
      } else if (q.kind === "multi") {
        kind = "mcq";
        options = q.options;
        correctIndex = q.correctIndices?.[0] ?? 0;
      } else if (q.kind === "match" || q.kind === "order") {
        // Present as scenario asking to choose the best-first item
        kind = "scenario";
        if (q.kind === "match") {
          const pairs = q.pairs ?? [];
          if (pairs.length < 2) continue;
          options = pairs.map((p) => `${p.term} → ${p.def}`);
          correctIndex = 0; // all pairs are correct as displayed
        } else {
          const order = q.correctOrder ?? [];
          const opts = q.options ?? [];
          if (order.length < 2 || opts.length < 2) continue;
          options = opts;
          correctIndex = order[0];
        }
      } else {
        continue;
      }

      out.push({
        id: `${roleKey}-${q.num}`,
        role: roleKey,
        index: q.num,
        phase,
        kind,
        sourceType: (q.kind as RoleQuestion["sourceType"]),
        prompt: q.prompt,
        options,
        correctIndex,
        correctIndices: q.correctIndices,
        correctOrder: q.correctOrder,
        pairs: q.pairs,
        accept: q.accept,
        explanation: q.explanation,
      });
    }
    // Append two reflection questions per role, invariant across roles
    out.push({
      id: `${roleKey}-r1`,
      role: roleKey,
      index: 100,
      phase: 3,
      kind: "reflection",
      sourceType: "reflection",
      prompt: "What is the most important thing you have learned in this role so far?",
      placeholder: "Share your thinking…",
    });
    out.push({
      id: `${roleKey}-r2`,
      role: roleKey,
      index: 101,
      phase: 3,
      kind: "reflection",
      sourceType: "reflection",
      prompt: "What is one action you personally commit to taking beyond the game?",
      placeholder: "Your commitment…",
    });
  }
  return out;
}

export const ROLE_QUESTIONS: RoleQuestion[] = buildQuestions();

/** Scoring per phase per new spec: Phase1 = 10 pts, Phase2 = 20, Phase3 = 30. */
export const PHASE_POINTS: Record<QuestionPhase, number> = { 1: 10, 2: 20, 3: 30 };

export function questionsByPhase(role: RoleId, phase: QuestionPhase): RoleQuestion[] {
  return ROLE_QUESTIONS.filter((q) => q.role === role && q.phase === phase).sort((a, b) => a.index - b.index);
}


/* ------------------------------------------------------------------ */
/*  Reward + selection helpers                                        */
/* ------------------------------------------------------------------ */

/** CAP awarded for a single answer. */
export function rewardForAnswer(qn: RoleQuestion, choiceIndex: number | null, reflectionText?: string): { cap: number; correct: boolean } {
  if (qn.kind === "reflection") {
    const ok = !!(reflectionText && reflectionText.trim().length >= 3);
    return { cap: ok ? 5 : 0, correct: ok };
  }
  if (choiceIndex == null) return { cap: 0, correct: false };
  const isCorrect = qn.correctIndex === choiceIndex;
  if (qn.kind === "scenario") {
    return { cap: isCorrect ? 10 : 5, correct: isCorrect };
  }
  // mcq
  return { cap: isCorrect ? 5 : 1, correct: isCorrect };
}

export function questionsByRole(role: RoleId): RoleQuestion[] {
  return ROLE_QUESTIONS.filter((q) => q.role === role).sort((a, b) => a.index - b.index);
}

export function unansweredQuestions(role: RoleId, answeredIds: string[]): RoleQuestion[] {
  const set = new Set(answeredIds);
  return questionsByRole(role).filter((q) => !set.has(q.id));
}

/* ------------------------------------------------------------------ */
/*  Challenge templates, define each of the 4 progression triggers   */
/* ------------------------------------------------------------------ */

export type ChallengeKind = "orientation" | "mission" | "reflection" | "assessment";

export interface ChallengeTemplate {
  kind: ChallengeKind;
  title: string;
  subtitle: string;
  baseBonus: number;   // CAP awarded on completion, on top of per-question CAP
}

export const CHALLENGE_TEMPLATES: Record<ChallengeKind, ChallengeTemplate> = {
  orientation: { kind: "orientation", title: "Role Orientation Challenge", subtitle: "First three core questions for your stakeholder", baseBonus: 15 },
  mission:     { kind: "mission",     title: "Role Mission",                subtitle: "Two short questions tied to your last actions", baseBonus: 15 },
  reflection:  { kind: "reflection",  title: "Stakeholder Reflection",      subtitle: "One scenario from your point of view", baseBonus: 10 },
  assessment:  { kind: "assessment",  title: "Role Assessment",             subtitle: "Complete remaining questions for a Role Badge", baseBonus: 30 },
};

/** Build the set of question ids for a given challenge. */
export function buildChallengeQuestionIds(
  kind: ChallengeKind,
  role: RoleId,
  answeredIds: string[],
): string[] {
  const all = questionsByRole(role);
  const answered = new Set(answeredIds);
  const unanswered = all.filter((q) => !answered.has(q.id));

  if (kind === "orientation") {
    return unanswered.filter((q) => q.kind === "mcq").slice(0, 3).map((q) => q.id);
  }
  if (kind === "mission") {
    // 2–3 mostly-MCQ questions, mixing in a scenario when available
    const mcq = unanswered.filter((q) => q.kind === "mcq").slice(0, 2);
    const scen = unanswered.filter((q) => q.kind === "scenario").slice(0, 1);
    return [...mcq, ...scen].slice(0, 3).map((q) => q.id);
  }
  if (kind === "reflection") {
    const scen = unanswered.filter((q) => q.kind === "scenario");
    return (scen[0] ? [scen[0].id] : []);
  }
  // assessment, everything left
  return unanswered.map((q) => q.id);
}
