import type { Role, Intervention, Crisis, CrisisChoice, IndicatorKey } from "./types";

export {
  MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole,
  visibleMysteries, roleRelationship, bonusForRole,
  influencesOf, influencedBy, buildRegions,
  isTier1RolePriority, TIER1_ROLE_MYSTERIES,
} from "./mysteries";

import { buildRegions as _buildRegions } from "./mysteries";
export const REGIONS = _buildRegions();

export const ROLES: Role[] = [
  { id: "scientist", name: "Scientist", focus: "Climate & Tipping Points",
    tagline: "Read the signals before they cascade.",
    mission: "Identify and prevent tipping points across Terra.",
    rewardLabel: "+20 Action Points",
    access: ["Climate data", "Emissions models", "Extreme weather", "Scientific reports"],
    accent: "terra" },
  { id: "farmer", name: "Farmer", focus: "Food & Water Security",
    tagline: "Feed the world without breaking it.",
    mission: "Prevent crop failure and ensure food security.",
    rewardLabel: "+5 Food Indicator",
    access: ["Crop & soil", "Water for agriculture", "Yield risk", "Local food markets"],
    accent: "warmth" },
  { id: "policymaker", name: "Policymaker", focus: "Policy & Governance",
    tagline: "Turn evidence into action.",
    mission: "Implement effective policies with public support.",
    rewardLabel: "+10% Policy Impact",
    access: ["Policy options", "Public opinion", "Budgets", "Regulation"],
    accent: "stone" },
  { id: "activist", name: "Activist", focus: "People & Public Support",
    tagline: "Move the public, move the world.",
    mission: "Raise awareness and rally grassroots support.",
    rewardLabel: "+15% Awareness",
    access: ["Sentiment", "Campaign reach", "Community stories", "Movements"],
    accent: "warmth" },
  { id: "business", name: "Business Leader", focus: "Economy & Innovation",
    tagline: "Make doing good profitable.",
    mission: "Invest in clean tech and decarbonize supply chains.",
    rewardLabel: "+10% Intervention Effect",
    access: ["Markets", "Supply chains", "ROI", "Tech adoption"],
    accent: "terra" },
  { id: "planner", name: "City Planner", focus: "Infrastructure & Resilience",
    tagline: "Design cities that breathe.",
    mission: "Build resilience into urban systems.",
    rewardLabel: "+1 Infrastructure",
    access: ["Land use", "Transport", "Heat & flood maps", "Air quality"],
    accent: "stone" },
  { id: "citizen", name: "Community Representative", focus: "People & Well-being",
    tagline: "The future lives in everyday lives.",
    mission: "Protect vulnerable communities and amplify lived experience.",
    rewardLabel: "+1 Community Voice",
    access: ["Local conditions", "Equity data", "Services", "Personal footprint"],
    accent: "warmth" },
  { id: "student", name: "Student", focus: "Learning & Discovery",
    tagline: "Curiosity is a climate skill.",
    mission: "Explore climate connections and grow into a Climate Champion.",
    rewardLabel: "+Learning Badges",
    access: ["Mystery hints", "Quiz packs", "Concept glossary", "Mentor notes"],
    accent: "terra" },
];


export { INTERVENTIONS, INTERVENTION_CATEGORIES } from "./interventions";


/**
 * Crisis Event Library v1.0, verbatim from the uploaded source-of-truth doc.
 * Each option's `planetHealth` is the negative of the library's Health Impact pts
 * (Option A always mitigates damage; Option D is full damage).
 */
export const CRISES: Crisis[] = [
  {
    id: "coastal-flood",
    emoji: "🌊",
    title: "Coastal Flooding Emergency",
    location: "Terra · Northern Coastal Belt",
    severity: "extreme",
    category: "climate",
    triggerHint: "After mysteries involving sea-level rise or deforestation are solved.",
    brief:
      "Terra's northern coastal belt is facing catastrophic flooding after storm surge and long-term sea-level rise overwhelmed outdated flood barriers. 400,000 people need an immediate response. Emergency services are overwhelmed, farmland is submerged, freshwater is contaminated, and the regional economy is at a standstill.",
    linkedMysteryCodes: ["M01", "M03", "M11", "M17"],
    bestChoiceId: "seawall",
    choices: [
      { id: "seawall",  label: "Build emergency seawalls and flood barriers immediately",
        description: "Slows future flooding but displaces coastal communities and disrupts marine ecosystems. High short-term economic cost.",
        effects: { water: -2, bio: -3, economy: -2 }, planetHealth: -6, healthImpactPts: 6, cost: 30 },
      { id: "wetlands", label: "Restore coastal wetlands and mangroves as natural buffers",
        description: "Slower protection but long-term biodiversity gain and carbon sequestration. Communities at risk for 2–3 seasons.",
        effects: { bio: 4, water: 1, climate: 1 }, planetHealth: -9, healthImpactPts: 9, cost: 25 },
      { id: "relocate", label: "Relocate affected communities inland",
        description: "Protects lives but abandons coastal infrastructure worth billions and displaces communities permanently.",
        effects: { economy: -4, food: -2 }, planetHealth: -11, healthImpactPts: 11, cost: 20 },
      { id: "monitor",  label: "Continue normal operations and monitor the situation",
        description: "Flooding worsens. Crop land and freshwater permanently contaminated. Economy and Food crash.",
        effects: { water: -5, food: -4, economy: -4 }, planetHealth: -18, healthImpactPts: 18 },
    ],
    roleInfo: {
      scientist: "Sea level here has risen 22 cm since 1990. Storm-surge frequency has doubled in 15 years. Wetland restoration takes 3–5 years to become effective.",
      farmer: "Saltwater intrusion will render 40% of coastal farmland unusable for at least 5 years. Food security impact severe.",
      policymaker: "Emergency infrastructure funding unlocks within 48 hours. Managed retreat policy requires 18-month legislative process.",
      activist: "Public sentiment strongly favours immediate action. Communities feel abandoned by prior inaction. Protest risk if no visible response.",
      planner: "Existing barriers were designed for 1-in-50-year events. This is now a 1-in-7-year event. Seawalls would need to be 3 m higher than current plans.",
      business: "Port infrastructure loss is costing $2.3M per day. Seawall construction creates 4,200 local jobs but costs $800M upfront.",
      citizen: "Community groups are already organising informal evacuation networks. Local knowledge of safe routes is critical information emergency services lack.",
      student: "Combine the Scientist's surge timeline with the Planner's barrier-height gap to see why fast infrastructure beats wait-and-see here.",
    },
    indicatorNarrative:
      "Climate: long-term coastal lock-in. Food & Water: sharp drops from contamination. Biodiversity: wetlands gain / seawalls hurt marine systems. Economy: short-term hit; seawall + wetland combo best for recovery.",
    bestReasoning:
      "Under time pressure with 400,000 people at risk, immediate infrastructure is the highest-impact short-term choice. The trade-off is ecosystem disruption, which is why the Scientist & Planner data matter. Follow seawalls with a wetland restoration Marketplace investment.",
    debrief: [
      "Which role's private information would have most changed your vote if you had seen it before voting?",
      "The best answer was fast infrastructure, but it damages biodiversity. How do we think about short- vs long-term trade-offs in real policy?",
      "What does this tell us about why coastal cities keep building in flood-prone areas?",
      "What one Marketplace intervention should the group buy immediately after this crisis to address the ecosystem damage?",
    ],
  },
  {
    id: "drought-wildfire",
    emoji: "🔥",
    title: "Prolonged Drought & Wildfire Season",
    location: "Terra · Three Inland Regions",
    severity: "extreme",
    category: "climate",
    triggerHint: "After mysteries involving fossil-fuel emissions or land degradation are solved.",
    brief:
      "Third consecutive drought year. Rivers at 40% normal flow. Wildfires have consumed 2M hectares this season, burned forests are releasing stored carbon. Farmers across three regions report total crop failure. The question is which action the group takes under pressure.",
    linkedMysteryCodes: ["M02", "M04", "M07", "M15"],
    bestChoiceId: "rationing",
    choices: [
      { id: "rationing", label: "Declare national water rationing and emergency irrigation controls",
        description: "Slows agricultural decline. Industry/farming pushback. Public compliance uncertain.",
        effects: { water: 4, food: 2, economy: -2 }, planetHealth: -5, healthImpactPts: 5, cost: 25 },
      { id: "cloud-seed", label: "Deploy cloud seeding and emergency water transfer from northern reserves",
        description: "Buys time but depletes northern reserves. Unproven at scale. Treats symptoms not cause.",
        effects: { water: 1, bio: -2 }, planetHealth: -9, healthImpactPts: 9, cost: 40 },
      { id: "voluntary", label: "Issue public awareness and voluntary water-reduction targets",
        description: "Minimal uptake under crisis. Insufficient to prevent further crop failure. Seen as inaction.",
        effects: { food: -3, water: -2 }, planetHealth: -13, healthImpactPts: 13, cost: 10 },
      { id: "market", label: "Let market forces determine water allocation",
        description: "Water becomes unaffordable for small farmers and low-income households. River biodiversity collapse. Political instability.",
        effects: { food: -4, water: -3, bio: -3, economy: -3 }, planetHealth: -16, healthImpactPts: 16 },
    ],
    roleInfo: {
      scientist: "Soil moisture at 200-year low in two regions. Cloud seeding has a 30% success rate in these conditions. Drought projected to last 2 more years without structural action.",
      farmer: "This season's crops already lost. The vote is about next season. Rationing must exempt small subsistence farms to prevent food-system collapse.",
      policymaker: "Emergency water rationing can be enacted within 24 hours under existing powers. Public compliance historically 60–80% when rationale is clear.",
      activist: "Climate protests doubled in the past month. Anger is at fossil-fuel companies and inaction, a visible policy response channels this constructively.",
      planner: "Urban water demand = 35% of total use, Industrial = 48%, Agriculture = 17%. Targeting industrial use first has the highest immediate impact.",
      business: "Industrial rationing reduces output 18% short-term. Insurance premiums already rising 40% annually due to water insecurity.",
      citizen: "Household consumption already down 22% voluntarily. Communities accept formal rationing if industrial and agricultural users are also constrained.",
      student: "Notice how the Farmer's 'crops already lost' info reframes the whole vote, it's about next year, not this one.",
    },
    indicatorNarrative:
      "Climate worsens (burned forests release carbon). Food critical, rationing best preserves next season. Water critical, rationing stabilises. Biodiversity: river ecosystems collapsing.",
    bestReasoning:
      "Rationing addresses the underlying scarcity rather than symptoms. It is the only option that protects next season's planting. Economic pushback is real but manageable. Farmer's private data is the unlock.",
    debrief: [
      "The Farmer knew this season's crops were already lost. Did anyone share that? How did/would it change the vote?",
      "Water rationing creates winners and losers. Who benefits and who is harmed?",
      "Third drought year. At what point does emergency response stop being the right frame and long-term adaptation start?",
      "Which Marketplace interventions could have prevented this severity if purchased earlier?",
    ],
  },
  {
    id: "grid-collapse",
    emoji: "⚡",
    title: "Energy Grid Collapse",
    location: "Terra · National Grid",
    severity: "high",
    category: "infrastructure",
    triggerHint: "After mysteries involving fossil-fuel dependence or energy-transition failure are solved.",
    brief:
      "An extreme heatwave pushed electricity demand 40% beyond capacity. Fossil grid is failing, renewable capacity insufficient. Rolling blackouts have begun. Three hospitals run on backup generators. The choice shapes the energy system for the next decade.",
    linkedMysteryCodes: ["M05", "M08", "M12", "M19"],
    bestChoiceId: "mobile-solar",
    choices: [
      { id: "mobile-solar", label: "Emergency deployment of mobile solar + battery storage to critical infrastructure",
        description: "Protects hospitals and essential services. Accelerates renewable transition. High short-term cost. Doesn't fully resolve residential blackouts.",
        effects: { climate: 3, economy: -1 }, planetHealth: -5, healthImpactPts: 5, cost: 45 },
      { id: "coal-restart", label: "Restart mothballed coal plants for emergency capacity",
        description: "Ends blackouts in 6 hours. Carbon spike sets back targets 3 years. Locks in fossil dependence for a decade.",
        effects: { climate: -5, economy: -3, bio: -1 }, planetHealth: -10, healthImpactPts: 10, cost: 20 },
      { id: "demand-cut", label: "Mandatory demand reduction, shut non-essential commercial power",
        description: "Reduces demand gap 25%. Economic disruption. Partial compliance. Hospitals remain at risk 48 more hours.",
        effects: { economy: -3 }, planetHealth: -8, healthImpactPts: 8, cost: 10 },
      { id: "import-power", label: "Emergency import of electricity from neighbouring regions",
        description: "Those regions face the same heatwave. Import capacity is 60% of need. Temporary relief, root cause unaddressed.",
        effects: { economy: -2, climate: -2 }, planetHealth: -13, healthImpactPts: 13, cost: 30 },
    ],
    roleInfo: {
      scientist: "Heatwaves this intense are now 4× more likely than in 1990. Grid demand during extreme heat is structurally unpredictable, this will happen again.",
      farmer: "Irrigation is grid-dependent. A 48-hour blackout in peak growing season = permanent crop loss. Rural areas are last in line for restoration.",
      policymaker: "Coal restart needs emergency ministerial order, 10-year operational commitment is non-negotiable. Mobile solar deployable in 4 hours.",
      activist: "Public anger at energy companies is at a decade high. Any coal restart triggers major protests. Solar deployment has strong public support.",
      planner: "Three hospitals, two water-treatment plants, one comms hub on backup. Battery backup runs out in 18 hours at current load.",
      business: "Every hour of commercial blackout costs $340M. But coal restart triggers carbon-penalty clauses in 14 trade agreements, $2.1B annually.",
      citizen: "Vulnerable elderly and those without AC are at medical risk. Community cooling centres can hold 8,000, transport is the limit.",
      student: "The 'expensive' option is actually the cheapest once the Business Leader's trade-penalty data is in the room.",
    },
    indicatorNarrative:
      "Climate: coal = major spike; solar = neutral now, better long-term. Food: irrigation failure if blackout extends. Water: treatment at risk. Economy: coal restart triggers $2.1B trade penalties.",
    bestReasoning:
      "Coal looks fast but the Business Leader's trade-penalty data makes it economically catastrophic. Solar is the only option that protects hospitals, avoids carbon lock-in, and doesn't trigger trade penalties.",
    debrief: [
      "The coal option feels like the fastest fix. What information changed the calculus, and who held it?",
      "Which earlier Marketplace intervention, purchased at the start, would have reduced the severity?",
      "The grid collapsed during a heatwave, itself made worse by fossil-fuel use. What does this feedback loop tell us about systemic risk?",
      "How do we make good long-term energy decisions under short-term political pressure?",
    ],
  },
  {
    id: "migration-wave",
    emoji: "🏃",
    title: "Climate Migration Wave",
    location: "Terra · Coastal & Arid Zones → Interior Cities",
    severity: "extreme",
    category: "social",
    triggerHint: "After 2+ crises resolved, or when Biodiversity and Food both drop below 40.",
    brief:
      "Cumulative flooding, drought, and temperature rise have made two regions effectively uninhabitable year-round. Two million people are in transit toward interior cities. Host cities were not designed for this. Healthcare, schools, and housing are at capacity. Social tension is rising.",
    linkedMysteryCodes: ["M09", "M13", "M22", "M28"],
    bestChoiceId: "managed-resettle",
    choices: [
      { id: "managed-resettle", label: "Launch a managed climate resettlement program with new inland cities",
        description: "Long-term solution. Expensive and slow (5–10 years). Reduces pressure on existing cities. Creates new economic zones.",
        effects: { economy: 2, food: 1 }, planetHealth: -5, healthImpactPts: 5, cost: 60 },
      { id: "emergency-housing", label: "Emergency housing and services with rapid infrastructure expansion in existing cities",
        description: "Faster absorption but strains city systems. Pressure on water, energy, food. Social tension risk.",
        effects: { water: -2, economy: -1 }, planetHealth: -9, healthImpactPts: 9, cost: 35 },
      { id: "border-caps", label: "Border controls and managed migration caps to absorptive capacity",
        description: "Reduces short-term pressure. Leaves millions in uninhabitable zones. Human-rights implications. Origin-region instability.",
        effects: { food: -3, economy: -2 }, planetHealth: -13, healthImpactPts: 13, cost: 15 },
      { id: "no-policy", label: "No formal policy, informal settlement and market forces manage movement",
        description: "Massive informal settlements without services. Disease risk. Political instability. Long-term cost far exceeds planned resettlement.",
        effects: { food: -4, water: -3, economy: -4, bio: -2 }, planetHealth: -17, healthImpactPts: 17 },
    ],
    roleInfo: {
      scientist: "Climate projections show 14 more regions cross habitability thresholds by 2040. Any solution must scale. Managed resettlement has a 40-year track record.",
      farmer: "Displaced farmers hold irreplaceable local growing knowledge. Resettlement with land allocation produces 60% better outcomes than urban-only.",
      policymaker: "Managed resettlement has constitutional backing. Migration caps would face legal challenge under existing treaties. Emergency housing can be fast-tracked.",
      activist: "Displaced communities request three things: dignity, agency in resettlement decisions, recognition that displacement is climate injustice not personal failure.",
      planner: "Host cities can absorb 600,000 over 3 years with investment. Beyond that, service quality drops below acceptable thresholds. New cities take 5–7 years.",
      business: "Managed resettlement creates $4.2B in construction and services opportunity. Informal settlement costs $1.1B annually in lost productivity and emergency services.",
      citizen: "Host-community surveys: 64% support welcoming displaced people if government provides infrastructure. Opposition rises to 71% if it doesn't.",
      student: "Notice this crisis is a consequence of earlier session decisions, what choices led here?",
    },
    indicatorNarrative:
      "Climate: no direct impact, this is a social consequence of prior climate choices. Food: resettlement with farming allocation improves long-term. Water: new cities need new water planning. Biodiversity: greenfield risk. Economy: resettlement has highest long-term return.",
    bestReasoning:
      "This crisis is a consequence of earlier choices. Managed resettlement is the only option that scales. The Scientist's '14 more regions by 2040' is the decisive insight, this will happen again, and informal settlement creates permanent dysfunction.",
    debrief: [
      "Which earlier puzzle chains or crisis votes led here?",
      "Activist info: displaced communities want agency. How do we design policies that give dignity rather than just logistics?",
      "Which real-world countries or regions does this scenario remind you of?",
      "If we had purchased different Marketplace interventions earlier, could this have been avoided, or only made less severe?",
    ],
  },
  {
    id: "heatwave-health",
    emoji: "🌡",
    title: "Extreme Heatwave, Public Health Emergency",
    location: "Terra · Urban Centres (47°C)",
    severity: "high",
    category: "health",
    triggerHint: "If Climate indicator drops below 35, or third puzzle round with no Nature-based Marketplace purchase.",
    brief:
      "Prolonged 47°C heatwave. Urban heat-island effect makes cities 6°C hotter than rural areas. Hospitals overwhelmed. Outdoor workers in immediate danger. Elderly and young children face highest mortality risk. Schools closed but people have nowhere cooler to go.",
    linkedMysteryCodes: ["M06", "M10", "M14", "M20"],
    bestChoiceId: "cooling-surge",
    choices: [
      { id: "cooling-surge", label: "Open public cooling centres, issue outdoor work ban, and emergency healthcare surge",
        description: "Saves the most lives. Reduces outdoor worker fatalities. Significant economic cost of work stoppage. High public support.",
        effects: { economy: -2, food: -1 }, planetHealth: -5, healthImpactPts: 5, cost: 30 },
      { id: "heat-plan", label: "Mandatory heat action plan: businesses must provide cooling for workers and customers",
        description: "Patchy compliance. Some workers protected. Doesn't reach informal workers, elderly, or homeless.",
        effects: { economy: -1 }, planetHealth: -9, healthImpactPts: 9, cost: 15 },
      { id: "fans-water", label: "Emergency distribution of fans and water to vulnerable households",
        description: "Addresses immediate comfort but fans are ineffective above 40°C. Delays systemic response. Seen as tokenistic.",
        effects: {}, planetHealth: -11, healthImpactPts: 11, cost: 10 },
      { id: "advisory", label: "Issue public health advisory and let individuals self-manage",
        description: "Those with resources manage; those without don't. Disproportionate mortality among low-income, elderly, and informal workers.",
        effects: { economy: -3 }, planetHealth: -14, healthImpactPts: 14 },
    ],
    roleInfo: {
      scientist: "Above 40°C, evaporative cooling (sweating) fails in high humidity. At 47°C and 60% humidity, a healthy adult survives outdoors under 2 hours. Fans provide no meaningful cooling above 40°C.",
      farmer: "Outdoor agricultural workers have zero heat protection. Harvest can't be postponed, crops die within 72 hours. Work ban during harvest = total crop loss.",
      policymaker: "Mandatory outdoor work ban is legally possible under emergency powers, politically hard with the agricultural lobby. Cooling-centre network activates in 4 hours.",
      activist: "Informal and migrant workers are most exposed and least protected. Any response that doesn't include them will be called out as discriminatory.",
      planner: "City has 340 public buildings suitable as cooling centres. Urban tree canopy is only 8%, cities with 30%+ see 4°C lower temperatures. Long-term: green infrastructure is the structural solution.",
      business: "Each day of enforced work stoppage costs $180M. But heat-related worker illness costs $420M per week in lost productivity and medical claims when no protection exists.",
      citizen: "Community groups already self-organising, sharing AC homes, distributing water. But self-organisation reaches only 30% of vulnerable people.",
      student: "The Scientist's biology and the Business Leader's economics agree, the 'expensive' option saves money in the long run.",
    },
    indicatorNarrative:
      "Climate IS the driver, response doesn't change root cause. Food: work ban during harvest = crop loss, but worker deaths are worse long-term. Water demand spikes. Biodiversity: heat killing pollinators.",
    bestReasoning:
      "Scientist's data is decisive: fans don't work above 40°C, individual self-management fails at 47°C. Business Leader shows unprotected illness costs more than the ban. Best outcome: work ban with exemption for supervised early-morning harvesting and mandatory cooling breaks.",
    debrief: [
      "The Farmer faced a genuine dilemma: work ban means crop loss, working means worker deaths. How do we make decisions when there's no good option?",
      "The Scientist's data showed fans don't work above 40°C. Did anyone know this before the vote?",
      "This heatwave is a direct consequence of the Climate indicator. Which earlier decisions contributed?",
      "Cities with 30% tree canopy are significantly cooler. What does this tell us about the value of long-term Marketplace investments?",
    ],
  },
  {
    id: "ocean-collapse",
    emoji: "🐟",
    title: "Ocean Ecosystem Collapse",
    location: "Terra · Coral Reefs & Coastal Fisheries",
    severity: "extreme",
    category: "biodiversity",
    triggerHint: "After 2+ Nature-based Marketplace purchases skipped, or Biodiversity drops below 30.",
    brief:
      "Oceans have absorbed so much CO₂ that pH has dropped to the point where coral reefs, the foundation of 25% of marine biodiversity, are bleaching at scale. Fish populations billions depend on for protein are collapsing. Ocean warming pushes species poleward, disrupting food chains. Fishing communities face economic ruin.",
    linkedMysteryCodes: ["M16", "M21", "M25", "M30"],
    bestChoiceId: "marine-zones",
    choices: [
      { id: "marine-zones", label: "Declare protected marine zones and halt all industrial fishing immediately",
        description: "Best chance of partial ecosystem recovery. Devastating for fishing industry and coastal food security short-term. Long-term food security improves if ecosystems recover.",
        effects: { bio: 4, food: -3, economy: -3 }, planetHealth: -6, healthImpactPts: 6, cost: 40 },
      { id: "coral-restore", label: "Fund large-scale coral restoration and ocean seeding programs",
        description: "Addresses root ecological cause but takes 10–20 years. Doesn't protect fish populations immediately. Expensive and scientifically complex.",
        effects: { bio: 2 }, planetHealth: -10, healthImpactPts: 10, cost: 55 },
      { id: "aquaculture", label: "Shift fishing quotas and invest in aquaculture to protect food supply",
        description: "Protects food security short-term. Doesn't address ecosystem collapse. Aquaculture can damage remaining marine ecosystems if poorly managed.",
        effects: { food: 2, bio: -3 }, planetHealth: -12, healthImpactPts: 12, cost: 25 },
      { id: "status-quo", label: "Continue current fishing practices and monitor",
        description: "Ecosystem keeps collapsing. Fish populations crash within 5 years. Industry collapses anyway, later and with no recovery path.",
        effects: { bio: -5, food: -4, economy: -4 }, planetHealth: -16, healthImpactPts: 16 },
    ],
    roleInfo: {
      scientist: "Ocean pH dropped from 8.2 to 8.05 since industrialisation, 26% increase in acidity. Aragonite saturation falls below coral survival threshold in 15 years. Marine protected zones have 70% recovery success if implemented early.",
      farmer: "Marine protein = 35% of dietary protein for coastal populations. A fishing ban needs alternative protein sources within 6 months. Inland aquaculture takes 2 years to reach capacity.",
      policymaker: "Marine protected zones can be declared under existing environmental law within 7 days. Fishing-moratorium compensation needs a separate funding mechanism.",
      activist: "Fishing communities feel scapegoated for a problem caused by industrial emissions. Any policy must include compensation and transition support.",
      planner: "Coral reefs reduce wave energy by 97%. Coastal cities depend on healthy oceans for tourism, fishing, and storm protection. Urban planning must account for loss of this natural infrastructure.",
      business: "Global fishing industry: $400B/yr. Collapse = $2.1T in lost ecosystem services over 20 years. Short-term moratorium: $40B/yr. Inaction: uncalculable.",
      citizen: "Coastal communities have reported fish decline for 30 years. Their traditional ecological knowledge has been systematically ignored. Any solution should include them in management.",
      student: "Compare $40B/yr vs $2.1T/20yr, the 'expensive' moratorium is the cheap option.",
    },
    indicatorNarrative:
      "Climate: ocean absorbs 30% of CO₂, healthier ocean = marginally better climate regulation. Food: ban hurts short-term, collapse hurts permanently. Biodiversity: critical, protected zones are the only recovery path.",
    bestReasoning:
      "This is the hardest crisis because the best answer causes real short-term pain for fishing communities. The Business Leader's $40B vs $2.1T frame is decisive. The Activist's compensation point is not optional, without it the policy collapses politically. Best: combine protected zones with a Marketplace investment in community transition.",
    debrief: [
      "Fishing communities didn't cause ocean acidification, industrial emissions did. Is it fair to ask them to bear the cost? How do we think about climate justice here?",
      "This crisis built up over 30 years. At what point did it become a crisis? Were there earlier moments where a different choice could have prevented it?",
      "Scientist said marine protected zones work 70% of the time, if implemented early. Are we past that threshold in this session?",
      "What does this crisis tell us about the relationship between what we eat and climate outcomes?",
    ],
  },
];

/**
 * Map a mystery code prefix or domain to crises whose probability rises when that mystery solves.
 * Used by the trigger engine in store.ts.
 */
export const CRISIS_TRIGGER_DOMAINS: Record<string, string[]> = {
  // domain → crisis ids whose probability rises
  oceans: ["coastal-flood", "ocean-collapse"],
  water:  ["drought-wildfire", "coastal-flood"],
  food:   ["drought-wildfire", "migration-wave"],
  climate:["heatwave-health", "grid-collapse", "coastal-flood"],
  energy: ["grid-collapse", "heatwave-health"],
  bio:    ["ocean-collapse", "migration-wave"],
  cities: ["grid-collapse", "heatwave-health"],
  society:["migration-wave"],
  pollution: ["heatwave-health"],
  health: ["heatwave-health"],
  governance: ["migration-wave"],
  economy: ["grid-collapse"],
};

import type { Mystery } from "./types";
// (Mystery import kept local to the picker for clarity.)

/**
 * Probability-weighted picker. Considers:
 *  - butterfly: each solved mystery's domain raises probability of linked crises
 *  - indicator floors: low indicators → matching crises
 *  - marketplace skip count (handed in via opts) → ocean / heat crises
 */
export function pickCrisisForState(opts: {
  resolved: string[];
  solvedMysteries: string[];
  mysteryById?: (id: string) => Mystery | undefined;
  indicators: Record<IndicatorKey, number>;
  natureMarketplaceMisses?: number;
  forceId?: string;
}): string | null {
  if (opts.forceId && CRISES.some((c) => c.id === opts.forceId)) return opts.forceId;
  const pool = CRISES.filter((c) => !opts.resolved.includes(c.id));
  if (pool.length === 0) return null;

  const weight = new Map<string, number>(pool.map((c) => [c.id, 1]));

  // Domain weighting from butterfly state
  if (opts.mysteryById) {
    for (const id of opts.solvedMysteries) {
      const m = opts.mysteryById(id);
      if (!m) continue;
      const targets = CRISIS_TRIGGER_DOMAINS[m.domain] ?? [];
      for (const cid of targets) if (weight.has(cid)) weight.set(cid, (weight.get(cid) ?? 1) + 1.5);
    }
  }

  // Indicator-floor weighting (per library trigger rules)
  if (opts.indicators.climate <= 35) weight.set("heatwave-health", (weight.get("heatwave-health") ?? 1) + 3);
  if (opts.indicators.bio    <= 30) weight.set("ocean-collapse",  (weight.get("ocean-collapse")  ?? 1) + 3);
  if (opts.indicators.bio    <= 40 && opts.indicators.food <= 40)
    weight.set("migration-wave", (weight.get("migration-wave") ?? 1) + 3);
  if (opts.indicators.water  <= 35) weight.set("drought-wildfire",(weight.get("drought-wildfire")?? 1) + 2);

  if ((opts.natureMarketplaceMisses ?? 0) >= 2)
    weight.set("ocean-collapse", (weight.get("ocean-collapse") ?? 1) + 2.5);

  // Weighted random
  const entries = [...weight.entries()];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of entries) {
    r -= w;
    if (r <= 0) return id;
  }
  return entries[0][0];
}

/** Default-consequence choice when the 90s timer expires with no vote: pick the worst (D). */
export function defaultChoiceFor(crisis: Crisis): CrisisChoice {
  return crisis.choices[crisis.choices.length - 1];
}




// Scoring formula, Phase A
export const ATTEMPT_REWARDS = [100, 80, 60, 40, 20]; // 1st..5th+ attempt
export const HINT_PENALTY = 10;

export function computePayout(attempts: number, hintsUsed: number): { base: number; penalty: number; total: number } {
  const idx = Math.min(Math.max(attempts, 1), ATTEMPT_REWARDS.length) - 1;
  const base = ATTEMPT_REWARDS[idx];
  const penalty = hintsUsed * HINT_PENALTY;
  const total = Math.max(10, base - penalty);
  return { base, penalty, total };
}
