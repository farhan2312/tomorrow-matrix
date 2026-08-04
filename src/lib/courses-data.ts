export type Course = {
  id: string;
  title: string;
  duration: string;
  level: "Foundational" | "Intermediate" | "Advanced" | "Flagship";
  delivery: string;
  certificate: string;
  outcomes: string[];
  modules: string[];
  flagship?: boolean;
  instructor: string;
  summary: string;
  audience: string[];
  prerequisites: string;
  price: string;
  schedule: { batch: string; dates: string; mode: string }[];
};

const INSTRUCTOR = "Dr. Farida — Founder & Principal";

export const COURSES: Course[] = [
  {
    id: "esg-awareness",
    title: "ESG Awareness",
    duration: "4 weeks",
    level: "Foundational",
    delivery: "Live virtual + self-paced",
    certificate: "ESG Fundamentals Certificate",
    instructor: INSTRUCTOR,
    summary:
      "A grounded introduction to environmental, social and governance practice — what it means, what regulators expect, and how to spot substance versus theater.",
    audience: ["Managers new to ESG", "Communications & HR teams", "Board and exec assistants"],
    prerequisites: "None. Open to all professionals.",
    price: "Pricing on request",
    outcomes: ["Speak the ESG language", "Spot greenwashing", "Frame material issues"],
    modules: [
      "Introduction to ESG",
      "Environmental",
      "Social",
      "Governance",
      "ESG Strategy",
      "Materiality",
      "Stakeholder Engagement",
      "Greenwashing",
      "Emerging Trends",
    ],
    schedule: [
      { batch: "Spring cohort", dates: "Starts 14 Sep", mode: "Live virtual" },
      { batch: "Autumn cohort", dates: "Starts 09 Nov", mode: "Live virtual" },
    ],
  },
  {
    id: "carbon-fundamentals",
    title: "Fundamentals of Carbon Accounting",
    duration: "4 weeks",
    level: "Foundational",
    delivery: "Live virtual + workshops",
    certificate: "GHG Foundations Certificate",
    instructor: INSTRUCTOR,
    summary:
      "Build your first greenhouse gas inventory with confidence — boundaries, activity data, emission factors and the arithmetic that survives review.",
    audience: ["Sustainability analysts", "Operations & facilities teams", "Finance business partners"],
    prerequisites: "Comfort with spreadsheets is helpful.",
    price: "Pricing on request",
    outcomes: ["Build a Scope 1&2 inventory", "Apply emission factors", "Set boundaries"],
    modules: [
      "GHG Basics",
      "Scope 1",
      "Scope 2",
      "Scope 3",
      "Emission Factors",
      "Calculation Methods",
      "Boundary Setting",
      "Global Frameworks",
    ],
    schedule: [
      { batch: "Cohort 07", dates: "Starts 21 Sep", mode: "Live virtual" },
      { batch: "Cohort 08", dates: "Starts 16 Nov", mode: "Hybrid — Dubai" },
    ],
  },
  {
    id: "carbon-comprehensive",
    title: "Comprehensive Carbon Accounting",
    duration: "10 weeks",
    level: "Flagship",
    flagship: true,
    delivery: "Cohort + capstone",
    certificate: "GHG Practitioner (Advanced)",
    instructor: INSTRUCTOR,
    summary:
      "Our flagship practitioner programme: audit-ready inventories across Scope 1–3, science-based target design, and the evidence trail verifiers actually test.",
    audience: ["Sustainability leads", "Carbon accountants", "Assurance and audit teams"],
    prerequisites: "Foundational carbon knowledge or the Fundamentals course.",
    price: "Pricing on request",
    outcomes: ["Audit-ready inventories", "SBTi target design", "Verification-ready evidence"],
    modules: [
      "Climate Fundamentals",
      "GHG Protocol",
      "Boundary Setting",
      "Scope 1–3",
      "Emission Factors",
      "Reporting",
      "Target Setting",
      "Verification",
      "Advanced Topics",
      "Real-world Exercises",
      "Hands-on Workshops",
    ],
    schedule: [
      { batch: "Flagship cohort 04", dates: "Starts 05 Oct", mode: "Cohort + capstone" },
      { batch: "Flagship cohort 05", dates: "Starts 18 Jan", mode: "Cohort + capstone" },
    ],
  },
  {
    id: "iso-14064",
    title: "ISO 14064 Comprehensive Training",
    duration: "6 weeks",
    level: "Advanced",
    delivery: "Live virtual + assessment",
    certificate: "ISO 14064 Practitioner",
    instructor: INSTRUCTOR,
    summary:
      "Work Parts 1–3 of ISO 14064 end to end: quantification, project accounting, and the validation and verification discipline behind them.",
    audience: ["Verification teams", "QHSE managers", "Consultants and auditors"],
    prerequisites: "Working knowledge of GHG accounting.",
    price: "Pricing on request",
    outcomes: ["Apply Parts 1–3", "Design QA/QC systems", "Lead verification"],
    modules: [
      "Foundations",
      "ISO 14064-1",
      "ISO 14064-2",
      "ISO 14064-3",
      "Verification",
      "QA/QC",
      "Projects",
      "Implementation Roadmap",
      "Case Studies",
    ],
    schedule: [
      { batch: "Cohort 03", dates: "Starts 28 Sep", mode: "Live virtual" },
      { batch: "Cohort 04", dates: "Starts 01 Feb", mode: "Live virtual" },
    ],
  },
  {
    id: "gri",
    title: "GRI Reporting",
    duration: "5 weeks",
    level: "Intermediate",
    delivery: "Live virtual + peer review",
    certificate: "GRI Reporter Certificate",
    instructor: INSTRUCTOR,
    summary:
      "From materiality to a disclosure set an assurance provider can test — the GRI universal standards applied to your own reporting cycle.",
    audience: ["Report owners", "Corporate communications", "ESG data teams"],
    prerequisites: "Basic ESG literacy.",
    price: "Pricing on request",
    outcomes: ["Write investor-grade GRI reports", "Run materiality", "Prepare for assurance"],
    modules: [
      "GRI Architecture",
      "Materiality",
      "Universal Standards",
      "Environmental",
      "Social",
      "Stakeholder Engagement",
      "Writing Reports",
      "Verification",
      "Sector Standards",
      "Framework Integration",
    ],
    schedule: [
      { batch: "Cohort 06", dates: "Starts 12 Oct", mode: "Live virtual" },
      { batch: "Cohort 07", dates: "Starts 08 Feb", mode: "Live virtual" },
    ],
  },
  {
    id: "ifrs-s1-s2",
    title: "IFRS S1 & IFRS S2",
    duration: "6 weeks",
    level: "Advanced",
    delivery: "Executive cohort",
    certificate: "ISSB S1 & S2 Practitioner",
    instructor: INSTRUCTOR,
    summary:
      "Design ISSB-aligned disclosures that connect to the financial statements — governance, strategy, risk management, metrics and scenario analysis.",
    audience: ["Finance and IR leaders", "Risk managers", "Group reporting teams"],
    prerequisites: "Familiarity with corporate reporting cycles.",
    price: "Pricing on request",
    outcomes: [
      "Design ISSB-aligned disclosures",
      "Run scenario analysis",
      "Integrate with financials",
    ],
    modules: [
      "ISSB Overview",
      "Governance",
      "Strategy",
      "Risk Management",
      "Metrics",
      "Climate Disclosures",
      "Scenario Analysis",
      "Financial Reporting Integration",
      "Implementation",
      "Certification",
    ],
    schedule: [
      { batch: "Executive cohort 02", dates: "Starts 19 Oct", mode: "Executive cohort" },
      { batch: "Executive cohort 03", dates: "Starts 22 Feb", mode: "Executive cohort" },
    ],
  },
  {
    id: "reporting-frameworks",
    title: "Sustainability Reporting Frameworks",
    duration: "8 weeks",
    level: "Flagship",
    flagship: true,
    delivery: "Cohort + capstone project",
    certificate: "Sustainability Reporting Specialist",
    instructor: INSTRUCTOR,
    summary:
      "One data spine, many frameworks. Master GRI, SASB, TCFD, ISSB, CDP and ESRS as a single governed reporting system, ending in a capstone report.",
    audience: ["Reporting managers", "ESG programme leads", "Consultants"],
    prerequisites: "Some reporting experience recommended.",
    price: "Pricing on request",
    outcomes: ["Master GRI/ISSB/CSRD", "Design one data spine", "Deliver a capstone report"],
    modules: [
      "GRI",
      "SASB",
      "TCFD",
      "ISSB",
      "CDP",
      "ESRS",
      "Materiality",
      "Data Governance",
      "Reporting",
      "Regulatory Trends",
      "Capstone Project",
    ],
    schedule: [
      { batch: "Flagship cohort 03", dates: "Starts 02 Nov", mode: "Cohort + capstone" },
      { batch: "Flagship cohort 04", dates: "Starts 15 Mar", mode: "Cohort + capstone" },
    ],
  },
];

export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}
