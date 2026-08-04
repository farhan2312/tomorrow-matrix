export type ServiceContent = {
  slug: string;
  title: string;
  tagline: string;
  overview: string;
  visual: "carbon" | "reporting" | "verify" | "training" | "cert" | "strategy";
  tone: string;
  methodology: { step: string; body: string }[];
  frameworks: string[];
  deliverables: string[];
  timeline: { label: string; body: string }[];
  industries: string[];
  outcomes: { metric: string; label: string }[];
  faq: { q: string; a: string }[];
};

export const services: ServiceContent[] = [
  {
    slug: "climate-carbon",
    title: "Climate & Carbon",
    tagline: "Scope 1–3 inventories, SBTi targets, transition plans, and carbon program design.",
    overview:
      "Build a defensible carbon program end-to-end: measure emissions with GHG Protocol rigor, set science-based targets, and design the transition plan that delivers them.",
    visual: "carbon",
    tone: "#fcb53b",
    methodology: [
      { step: "Boundary", body: "Organizational and operational boundaries, GHG Protocol alignment." },
      { step: "Inventory", body: "Scope 1, 2, and 15 categories of Scope 3 with primary data where material." },
      { step: "Target", body: "SBTi-aligned near-term and net-zero targets with sectoral pathways." },
      { step: "Transition Plan", body: "Levers, capex, timing, governance — auditable and investor-ready." },
    ],
    frameworks: ["GHG Protocol", "SBTi", "ISO 14064", "TCFD", "IFRS S2", "CDP"],
    deliverables: [
      "GHG inventory with quality tiers",
      "SBTi-validated target set",
      "Transition plan document",
      "Carbon accounting playbook",
    ],
    timeline: [
      { label: "Weeks 1–3", body: "Data discovery, boundary, and method design." },
      { label: "Weeks 4–8", body: "Inventory build and quality review." },
      { label: "Weeks 9–12", body: "Target-setting and validation." },
      { label: "Weeks 13–16", body: "Transition plan and governance handover." },
    ],
    industries: ["Financial services", "Manufacturing", "Real estate", "Consumer", "Energy"],
    outcomes: [
      { metric: "40+", label: "Inventories delivered" },
      { metric: "100%", label: "SBTi acceptance rate" },
      { metric: "18mo", label: "Median target validation" },
    ],
    faq: [
      { q: "Do we need primary data for Scope 3?", a: "Where material — we use a tiered approach so effort matches impact." },
      { q: "How do you handle offsets?", a: "Reductions first. Offsets are used sparingly and only against a verified plan." },
    ],
  },
  {
    slug: "reporting-compliance",
    title: "Reporting & Compliance",
    tagline: "GRI, ISSB, TCFD, CSRD, CDP disclosures generated from an audited data spine.",
    overview:
      "One measurement architecture, many disclosures. We build the audited data spine that produces every framework you need without duplicated work.",
    visual: "reporting",
    tone: "#84994f",
    methodology: [
      { step: "Materiality", body: "Double materiality assessment aligned to CSRD and ISSB." },
      { step: "Data Spine", body: "Single source of truth with lineage and controls." },
      { step: "Disclosure", body: "Framework-mapped narrative and metrics." },
      { step: "Assurance-Readiness", body: "Working papers, controls, and evidence packs." },
    ],
    frameworks: ["GRI", "ISSB (IFRS S1/S2)", "TCFD", "CSRD/ESRS", "CDP", "SASB"],
    deliverables: [
      "Double materiality report",
      "Data spine + controls",
      "Framework-mapped disclosures",
      "Assurance readiness pack",
    ],
    timeline: [
      { label: "Weeks 1–2", body: "Materiality workshops and stakeholder engagement." },
      { label: "Weeks 3–8", body: "Data architecture and metric build." },
      { label: "Weeks 9–14", body: "Disclosure drafting and QA." },
      { label: "Weeks 15–18", body: "Assurance walkthrough." },
    ],
    industries: ["Listed corporates", "Financial services", "Real estate", "Consumer", "Industrials"],
    outcomes: [
      { metric: "12+", label: "Frameworks supported" },
      { metric: "100%", label: "Investor-grade" },
      { metric: "0", label: "Adverse assurance findings" },
    ],
    faq: [
      { q: "Do you support CSRD reporting from outside the EU?", a: "Yes — for EU subsidiaries and value-chain partners." },
      { q: "Can we reuse the data spine for CDP?", a: "That's the point. One spine, many disclosures." },
    ],
  },
  {
    slug: "verification-assurance",
    title: "Verification & Assurance",
    tagline: "Independent limited and reasonable assurance across sustainability claims.",
    overview:
      "Assurance you can defend. Independent verification aligned to ISAE 3000/3410 and ISO 14064-3, with working papers built for regulator and investor scrutiny.",
    visual: "verify",
    tone: "#a64b2a",
    methodology: [
      { step: "Scoping", body: "Assertion, criteria, and materiality thresholds." },
      { step: "Risk", body: "Inherent and control-risk assessment." },
      { step: "Evidence", body: "Substantive and analytical procedures with sampling." },
      { step: "Opinion", body: "Limited or reasonable assurance statement." },
    ],
    frameworks: ["ISAE 3000", "ISAE 3410", "ISO 14064-3", "ISO 14065", "AA1000AS"],
    deliverables: [
      "Assurance statement",
      "Working papers file",
      "Findings register",
      "Improvement roadmap",
    ],
    timeline: [
      { label: "Weeks 1–2", body: "Scoping and materiality." },
      { label: "Weeks 3–6", body: "Fieldwork and evidence review." },
      { label: "Weeks 7–8", body: "Reporting and clearance." },
    ],
    industries: ["Listed corporates", "Sovereigns", "Real estate", "Energy", "Financial services"],
    outcomes: [
      { metric: "40+", label: "Verifications delivered" },
      { metric: "9/10", label: "Repeat clients" },
      { metric: "100%", label: "Investor-grade" },
    ],
    faq: [
      { q: "Limited or reasonable?", a: "We help you choose based on stakeholder expectations and regulatory horizon." },
      { q: "Can you verify Scope 3?", a: "Yes — with a materiality-driven sampling strategy." },
    ],
  },
  {
    slug: "training-capacity",
    title: "Training & Capacity",
    tagline: "Executive briefings, teams-level upskilling, and framework-specific certifications.",
    overview:
      "Sustainability is a capability, not a document. We upskill boards, executives, and delivery teams so the practice compounds inside your organization.",
    visual: "training",
    tone: "#e9c891",
    methodology: [
      { step: "Diagnostic", body: "Skills gap assessment by role." },
      { step: "Curriculum", body: "Modular curriculum from board to analyst." },
      { step: "Delivery", body: "Live, on-demand, and applied learning tracks." },
      { step: "Certification", body: "Framework-specific certifications." },
    ],
    frameworks: ["GHG Protocol", "GRI", "ISSB", "TCFD", "CSRD", "SBTi"],
    deliverables: [
      "Learning strategy",
      "Curriculum + materials",
      "Live sessions",
      "Certifications",
    ],
    timeline: [
      { label: "Weeks 1–2", body: "Diagnostic and curriculum design." },
      { label: "Weeks 3–10", body: "Delivery cohorts." },
      { label: "Weeks 11–12", body: "Certifications and evaluation." },
    ],
    industries: ["Financial services", "Consumer", "Public sector", "Manufacturing", "Real estate"],
    outcomes: [
      { metric: "1,200+", label: "Learners" },
      { metric: "96%", label: "Satisfaction" },
      { metric: "3x", label: "Internal capability" },
    ],
    faq: [
      { q: "Can training be tailored?", a: "Every curriculum is built around your material topics and frameworks." },
      { q: "Do you offer executive briefings?", a: "Yes — 90-minute board briefings are our most requested format." },
    ],
  },
  {
    slug: "certifications-ratings",
    title: "Certifications & Ratings",
    tagline: "ISO 14064, ISO 14001, EcoVadis, MSCI, CDP scoring — end-to-end preparation.",
    overview:
      "Every higher score unlocks new business opportunities. We turn certifications and ratings into growth engines — winning supplier approvals, unlocking capital, and building durable competitive advantage.",
    visual: "cert",
    tone: "#d06224",
    methodology: [
      { step: "Gap Analysis", body: "Baseline vs. certification requirements. Controls scored, risks mapped, readiness quantified." },
      { step: "Remediation", body: "Evidence, controls, and process design. Policies drafted, workflows implemented, teams trained." },
      { step: "Submission", body: "Application, submission, and defense. Auditor engagement managed end-to-end." },
      { step: "Uplift", body: "Score uplift roadmap for annual cycles. Continuous improvement built into the operating model." },
    ],
    frameworks: ["ISO 14064", "ISO 14001", "ISO 50001", "EcoVadis", "MSCI ESG", "CDP", "Sustainalytics", "SBTi"],
    deliverables: [
      "Gap Assessment Report",
      "Evidence Register",
      "Policy Library",
      "Internal Audit Checklist",
      "Corrective Action Register",
      "Certification Submission Package",
      "Management Review Templates",
      "Annual Improvement Roadmap",
    ],
    timeline: [
      { label: "Weeks 1–3", body: "Gap analysis and readiness scoring." },
      { label: "Weeks 4–10", body: "Remediation, evidence, controls implementation." },
      { label: "Weeks 11–14", body: "Submission, audit support, and defense." },
      { label: "Ongoing", body: "Annual uplift cycles and continuous improvement." },
    ],
    industries: ["Manufacturing", "Energy", "Financial Services", "Healthcare", "Construction", "Retail", "Technology", "Automotive"],
    outcomes: [
      { metric: "95%", label: "Certification success rate" },
      { metric: "250+", label: "Audits supported" },
      { metric: "40+", label: "Supplier ratings improved" },
      { metric: "100%", label: "Audit readiness" },
      { metric: "A", label: "Average CDP score" },
      { metric: "Gold", label: "Average EcoVadis level" },
    ],
    faq: [
      { q: "How long does EcoVadis take?", a: "First submission typically 12–16 weeks. Bronze→Gold usually spans 2 annual cycles with disciplined uplift." },
      { q: "Can we prepare for CDP in one cycle?", a: "Yes — moving from C to B is realistic in one cycle. A/A- requires a mature data spine we help build." },
      { q: "How much internal effort is required?", a: "Plan for 1 sponsor, 1 SME per material topic, ~4 hours/week during active phases. We handle the heavy lifting." },
      { q: "Can we combine ISO 14001 and ISO 14064?", a: "Absolutely — integrated management systems avoid duplicate evidence, audits, and cost." },
      { q: "How often should ratings be updated?", a: "Annually at minimum. EcoVadis and CDP are yearly cycles; MSCI and Sustainalytics update continuously from public data." },
      { q: "Can you support multi-country certifications?", a: "Yes — we've delivered group-wide programs across 20+ jurisdictions with local audit coordination." },
    ],
  },
  {
    slug: "esg-strategy",
    title: "ESG Strategy & Roadmaps",
    tagline: "Strategy is where sustainability becomes business — materiality, vision, targets, and a fundable transformation plan.",
    overview:
      "The strategic centrepiece of a modern business. We translate material impact into vision, targets, capital, and an operating model your board owns, your investors trust, and your teams can execute.",
    visual: "strategy",
    tone: "#b5c99a",
    methodology: [
      { step: "Materiality", body: "Double materiality with financial and impact lenses — the topics that shape strategy." },
      { step: "Vision", body: "Purpose, ambition, and target architecture crystallised in the boardroom." },
      { step: "Roadmap", body: "Initiatives, capex, dependencies and sequencing — the transformation on one page." },
      { step: "Operating Model", body: "Governance, KPIs, cadence and decision rights that keep strategy alive." },
    ],
    frameworks: ["CSRD / ESRS", "ISSB (IFRS S1/S2)", "SBTi", "TNFD", "GRI"],
    deliverables: [
      "Materiality Assessment", "Strategy Document", "Board Presentation",
      "Transformation Roadmap", "KPI Dashboard", "Target Register",
      "Implementation Tracker", "Operating Model", "Governance Charter", "Business Case",
    ],
    timeline: [
      { label: "Weeks 1–4", body: "Discovery, stakeholder engagement, double materiality." },
      { label: "Weeks 5–8", body: "Vision, targets and pillar design with executives." },
      { label: "Weeks 9–12", body: "Roadmap, capex model and business case." },
      { label: "Weeks 13–16", body: "Operating model, governance and board handover." },
    ],
    industries: ["Financial Institutions", "Infrastructure", "Manufacturing", "Energy", "Technology", "Healthcare", "Consumer Goods", "Public Sector"],
    outcomes: [
      { metric: "20+", label: "Transformation strategies" },
      { metric: "95%", label: "Board approval" },
      { metric: "3x", label: "Funding readiness" },
      { metric: "40%", label: "Implementation acceleration" },
      { metric: "100%", label: "Executive alignment" },
      { metric: "9/10", label: "Board endorsement" },
    ],
    faq: [
      { q: "How is strategy different from reporting?", a: "Strategy sets the destination and how the business changes to get there. Reporting proves the journey." },
      { q: "How long does transformation take?", a: "Strategy design: 12–16 weeks. Meaningful transformation: 3–5 years with an annual cadence." },
      { q: "How do you prioritise initiatives?", a: "Materiality × business value × execution readiness — sequenced against capex, capability and regulatory horizon." },
      { q: "Do you facilitate board workshops?", a: "Yes — executive alignment sessions are typically the first two weeks of any engagement." },
      { q: "How do you build KPIs?", a: "One cascade: 3 pillars → 8–12 board KPIs → 40–60 operational metrics, each with an owner and a data source." },
      { q: "How often is strategy reviewed?", a: "Annual refresh, full re-materiality every 2–3 years or on major regulatory / capital events." },
      { q: "Do you support M&A due diligence?", a: "Yes — ESG DD is a common extension of a strategy engagement." },
    ],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
