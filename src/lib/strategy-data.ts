export type StrategyNode = {
  id: string;
  label: string;
  angle: number; // 0..360
  related: string[];
};

export const STRATEGY_NODES: StrategyNode[] = [
  { id: "climate", label: "Climate", angle: 0, related: ["carbon", "reporting", "risk", "governance"] },
  { id: "carbon", label: "Carbon", angle: 33, related: ["climate", "reporting", "operations", "supply"] },
  { id: "reporting", label: "Reporting", angle: 66, related: ["climate", "carbon", "capital", "governance"] },
  { id: "risk", label: "Risk", angle: 99, related: ["climate", "governance", "finance", "supply"] },
  { id: "governance", label: "Governance", angle: 132, related: ["risk", "reporting", "stakeholders", "capital"] },
  { id: "finance", label: "Finance", angle: 165, related: ["capital", "reporting", "innovation"] },
  { id: "supply", label: "Supply Chain", angle: 198, related: ["carbon", "risk", "operations", "stakeholders"] },
  { id: "operations", label: "Operations", angle: 231, related: ["carbon", "supply", "innovation"] },
  { id: "innovation", label: "Innovation", angle: 264, related: ["operations", "finance", "stakeholders"] },
  { id: "stakeholders", label: "Stakeholders", angle: 297, related: ["governance", "supply", "innovation", "capital"] },
  { id: "capital", label: "Capital Markets", angle: 330, related: ["finance", "reporting", "governance", "stakeholders"] },
];

export const TRANSFORMATION_STAGES = [
  { key: "current", label: "Current State", horizon: "Baseline", kpi: "Materiality baseline",
    milestones: ["Data & controls scan", "Stakeholder listening", "Peer benchmark"], investment: "$", impact: "Clarity" },
  { key: "materiality", label: "Materiality", horizon: "Q1", kpi: "Top 8–12 topics",
    milestones: ["Double materiality workshops", "Impact & financial mapping", "Board briefing"], investment: "$", impact: "Focus" },
  { key: "vision", label: "Vision", horizon: "Q1–Q2", kpi: "North Star + 3 pillars",
    milestones: ["Executive alignment", "Purpose narrative", "Ambition statement"], investment: "$", impact: "Alignment" },
  { key: "targets", label: "Target Setting", horizon: "Q2", kpi: "SBTi/near-term set",
    milestones: ["Baseline modelling", "Pathway options", "Board approval"], investment: "$$", impact: "Commitment" },
  { key: "strategy", label: "Strategy", horizon: "Q2–Q3", kpi: "Strategy document",
    milestones: ["Initiatives portfolio", "Financial case", "Sequencing"], investment: "$$", impact: "Direction" },
  { key: "roadmap", label: "Roadmap", horizon: "Q3", kpi: "3-year roadmap",
    milestones: ["Capex + opex model", "Dependencies mapped", "Owners assigned"], investment: "$$", impact: "Executability" },
  { key: "execution", label: "Execution", horizon: "Y1–Y3", kpi: "Initiative delivery",
    milestones: ["Program office", "Quarterly cadence", "Change management"], investment: "$$$", impact: "Momentum" },
  { key: "monitoring", label: "Monitoring", horizon: "Ongoing", kpi: "Live KPI dashboard",
    milestones: ["Controls & assurance", "Board pack", "Investor updates"], investment: "$$", impact: "Trust" },
  { key: "improve", label: "Continuous Improvement", horizon: "Annual", kpi: "YoY score uplift",
    milestones: ["Lessons learned", "Re-materiality", "Ambition refresh"], investment: "$$", impact: "Resilience" },
  { key: "netzero", label: "Net Zero", horizon: "2040–2050", kpi: "Verified net zero",
    milestones: ["Residual removals", "Assurance", "Legacy narrative"], investment: "$$$", impact: "Legacy" },
];

export const FLYWHEEL_STAGES = [
  "Business Vision", "Materiality", "Capital Allocation", "Climate Strategy",
  "Operational Changes", "Measurement", "Reporting", "Verification", "Continuous Improvement",
];

export const STRATEGY_JOURNEY = [
  "Discover", "Materiality", "Vision", "Targets", "Roadmap", "Execution", "Governance", "Measure", "Improve",
];

export const STRATEGY_PILLARS = [
  { id: "carbon", label: "Carbon", initiatives: ["Scope 1–3 inventory", "Reduction levers", "Transition plan"] },
  { id: "reporting", label: "Reporting", initiatives: ["Data spine", "CSRD/ISSB narrative", "Assurance pack"] },
  { id: "finance", label: "Finance", initiatives: ["Green capex", "Sustainable finance framework", "Internal carbon price"] },
  { id: "risk", label: "Risk", initiatives: ["Climate scenarios", "Physical & transition risk", "Board risk register"] },
  { id: "supply", label: "Supply Chain", initiatives: ["Supplier engagement", "Category decarbonisation", "Traceability"] },
  { id: "governance", label: "Governance", initiatives: ["Board committee", "Executive KPIs", "Policy library"] },
  { id: "investors", label: "Investors", initiatives: ["Ratings uplift", "Roadshow deck", "AGM narrative"] },
  { id: "employees", label: "Employees", initiatives: ["Upskilling", "Purpose comms", "Talent proposition"] },
  { id: "customers", label: "Customers", initiatives: ["Green offerings", "Product footprint", "Circular services"] },
];

export const SIMULATOR_QUESTIONS = [
  { id: "industry", label: "Industry", options: ["Financial services", "Manufacturing", "Energy", "Technology", "Healthcare", "Consumer goods", "Infrastructure", "Public sector"] },
  { id: "size", label: "Company Size", options: ["<250", "250–1,000", "1,000–10,000", "10,000+"] },
  { id: "region", label: "Region", options: ["EU", "UK", "Middle East", "North America", "APAC", "Global"] },
  { id: "regulation", label: "Regulatory Requirements", options: ["CSRD", "SEC climate", "UK SDR", "Local ESG", "None yet"] },
  { id: "investors", label: "Investor Expectations", options: ["Listed / activist", "Private / PE", "Sovereign", "Family owned"] },
  { id: "carbon", label: "Carbon Maturity", options: ["None", "Scope 1&2", "Full Scope 1–3", "SBTi validated"] },
  { id: "reporting", label: "Reporting Maturity", options: ["None", "Voluntary GRI", "Multi-framework", "Assured"] },
  { id: "supply", label: "Supply Chain Complexity", options: ["Simple", "Regional", "Global", "Deep tier"] },
  { id: "ambition", label: "Net Zero Ambition", options: ["2030", "2040", "2050", "TBD"] },
];

export const FRAMEWORK_CARDS = [
  { id: "csrd", name: "CSRD / ESRS", purpose: "EU-mandated double materiality disclosure across environment, social, governance.",
    users: "Listed and large EU companies + non-EU with EU ops.", value: "Access to EU capital, litigation defence, supplier eligibility.",
    integration: "Anchor of the reporting spine — feeds ISSB and GRI." },
  { id: "issb", name: "ISSB (IFRS S1/S2)", purpose: "Global baseline for investor-focused sustainability & climate disclosure.",
    users: "Listed corporates in ISSB-adopting jurisdictions.", value: "Capital cost, investor comparability, IFRS alignment.",
    integration: "S2 climate module maps to TCFD and CSRD climate." },
  { id: "gri", name: "GRI", purpose: "Impact reporting for multi-stakeholder audiences.",
    users: "Corporates worldwide including private, public sector.", value: "Broad legitimacy, stakeholder trust, materiality frame.",
    integration: "Impact side of double materiality; complements ISSB." },
  { id: "sbti", name: "SBTi", purpose: "Science-based near-term and net-zero target validation.",
    users: "Any organisation setting decarbonisation targets.", value: "Investor / customer credibility, litigation protection.",
    integration: "Targets flow into strategy, reporting, and capex plans." },
  { id: "tnfd", name: "TNFD", purpose: "Nature-related risk, dependency, impact, opportunity disclosure.",
    users: "Land-, water-, biodiversity-exposed sectors.", value: "Future-proofs against nature regulation, unlocks nature finance.",
    integration: "LEAP approach layers onto climate scenario analysis." },
];

export const STRATEGY_INDUSTRIES = [
  { name: "Financial Institutions", priority: "Portfolio decarbonisation, financed emissions, sustainable finance framework" },
  { name: "Infrastructure", priority: "Physical risk, capex sequencing, green bonds, community licence" },
  { name: "Manufacturing", priority: "Process electrification, Scope 3 supplier engagement, circularity" },
  { name: "Energy", priority: "Transition plan, methane, just transition, sanctions & reputation" },
  { name: "Technology", priority: "Scope 3 use-of-sold, data centre PPAs, product footprint" },
  { name: "Healthcare", priority: "Supply chain resilience, waste, patient impact, workforce" },
  { name: "Consumer Goods", priority: "Product footprint, retailer scorecards, brand trust, packaging" },
  { name: "Public Sector", priority: "Procurement, climate resilience, citizen outcomes, transparency" },
];
