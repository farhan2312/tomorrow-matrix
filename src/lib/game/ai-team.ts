import type { AiTeammate, IndicatorKey, RoleId } from "./types";

export const AI_ROSTER: AiTeammate[] = [
  { id: "ai-sci",  role: "scientist",   name: "Dr. Vega" },
  { id: "ai-farm", role: "farmer",      name: "Mira Okafor" },
  { id: "ai-act",  role: "activist",    name: "Jonah Reyes" },
  { id: "ai-pol",  role: "policymaker", name: "Sec. Lin" },
  { id: "ai-biz",  role: "business",    name: "Kavi Shah" },
];

const LINES: Record<RoleId, Record<IndicatorKey | "default", string[]>> = {
  scientist: {
    climate: ["Evidence shows feedback loops accelerate beyond 1.5°C.", "The data points to a clear cascade pattern here."],
    water:   ["Hydrological models suggest aquifer recovery takes decades.", "Sensor data confirms shifting precipitation bands."],
    bio:     ["Ecosystem collapse risk crosses threshold in our projections.", "Species loss has compounding downstream effects."],
    food:    ["Yield models break down under sustained heat stress.", "Soil microbiome data is alarming."],
    economy: ["Externalities aren't priced in current models.", "We need to quantify the cost of inaction."],
    default: ["Let me run the numbers on this one.", "I need to verify before we act."],
  },
  farmer: {
    climate: ["This will hit our growing seasons hard.", "My neighbors are already feeling it."],
    water:   ["Without water, nothing else matters.", "Irrigation isn't the long-term answer."],
    bio:     ["Lose the pollinators and you lose the harvest.", "Healthy soil is living soil."],
    food:    ["This is food security — full stop.", "We can adapt crops, but not overnight."],
    economy: ["Small farms will be the first to fold.", "Subsidies need to follow the climate, not the lobby."],
    default: ["Whatever we choose, it lands on the land first.", "I'll tell you what works on the ground."],
  },
  activist: {
    climate: ["We need to mobilize public pressure now.", "Communities deserve to be heard on this."],
    water:   ["Water is a human right, not a commodity.", "Frontline communities feel this first."],
    bio:     ["We must protect what cannot speak for itself.", "Biodiversity is non-negotiable."],
    food:    ["Hunger is a political choice.", "Food sovereignty matters here."],
    economy: ["Don't let polluters dictate the recovery.", "Just transition or no transition."],
    default: ["The people will move first if we lead.", "Let's amplify this in the streets and the feeds."],
  },
  policymaker: {
    climate: ["A coordinated framework is the only path.", "We can write this into binding regulation."],
    water:   ["Cross-border water treaties need rewriting.", "Public infrastructure investment is essential."],
    bio:     ["Protected status will hold legally if we move now.", "Land-use policy is the lever."],
    food:    ["Supply-chain disclosure laws would help.", "We can shift subsidies in the next cycle."],
    economy: ["A market-based instrument balances the books.", "Public-private partnerships scale fastest."],
    default: ["What's politically feasible matters as much as what's right.", "I can draft a position paper."],
  },
  business: {
    climate: ["Decarbonization is the long-term ROI.", "Investors are already pricing climate risk."],
    water:   ["Water-scarcity disclosure is now table stakes.", "We're seeing supply-chain disruption."],
    bio:     ["Nature-positive supply chains differentiate brands.", "Insurance premiums tell the real story."],
    food:    ["Vertical integration buffers shocks.", "Alternative proteins are scaling fast."],
    economy: ["Capital flows where returns are stable.", "Green bonds are oversubscribed."],
    default: ["What's the business case here?", "Let me think about deal structure."],
  },
  planner: { default: ["Cities will need to retrofit fast."], climate: [], water: [], bio: [], food: [], economy: [] },
  citizen: { default: ["Whatever we do, communities live with it."], climate: [], water: [], bio: [], food: [], economy: [] },
  student: { default: ["Wait, can someone walk me through how this connects?"], climate: [], water: [], bio: [], food: [], economy: [] },
};

export function teammateLine(role: RoleId, category: IndicatorKey | "default"): string {
  const bank = LINES[role][category] && LINES[role][category].length > 0
    ? LINES[role][category]
    : LINES[role].default;
  return bank[Math.floor(Math.random() * bank.length)];
}
