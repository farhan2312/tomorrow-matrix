import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { getService, services } from "@/lib/services-data";
import { ServiceVisual } from "@/components/site/ServiceVisual";
import { CarbonDashboard } from "@/components/site/CarbonDashboard";
import { ReportingDashboard } from "@/components/site/ReportingDashboard";
import { DataSpineViz } from "@/components/site/DataSpineViz";
import { AssuranceDashboard, type AssuranceStandard } from "@/components/site/AssuranceDashboard";
import { EvidenceEngine } from "@/components/site/EvidenceEngine";
import { AcademyHero } from "@/components/site/AcademyHero";
import { CourseLibrary } from "@/components/site/CourseLibrary";
import { LearningUniverse } from "@/components/site/LearningUniverse";
import { LearningDashboard, LearningFormats } from "@/components/site/LearningDashboard";
import { CertificationDashboard } from "@/components/site/CertificationDashboard";
import { SustainabilityPassport } from "@/components/site/SustainabilityPassport";
import { CertificationNavigator } from "@/components/site/CertificationNavigator";
import { RatingsJourney } from "@/components/site/RatingsJourney";
import { CertValueChain } from "@/components/site/CertValueChain";
import { LearnBeforeCertify } from "@/components/site/LearnBeforeCertify";
import { StrategyEngine } from "@/components/site/StrategyEngine";
import { TransformationTimeline } from "@/components/site/TransformationTimeline";
import { StrategyFlywheel } from "@/components/site/StrategyFlywheel";
import { StrategySimulator } from "@/components/site/StrategySimulator";
import { StrategyOS } from "@/components/site/StrategyOS";
import { MethodologyWorkspaces } from "@/components/site/MethodologyWorkspaces";
import { FrameworkCards } from "@/components/site/FrameworkCards";
import { ExecutiveCTA } from "@/components/site/ExecutiveCTA";
import { BuildInternalCapability } from "@/components/site/BuildInternalCapability";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Nav } from "@/components/site/Nav";
import { NetworkBackground, FloatingParticles } from "@/components/site/NetworkBackground";
import { Counter } from "@/components/site/Counter";
import { useRef, useState } from "react";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const svc = getService(params.slug);
    if (!svc) throw notFound();
    return { svc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Service not found — For Tomorrow" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { svc } = loaderData;
    return {
      meta: [
        { title: `${svc.title} — For Tomorrow` },
        { name: "description", content: svc.tagline },
        { property: "og:title", content: `${svc.title} — For Tomorrow` },
        { property: "og:description", content: svc.tagline },
      ],
    };
  },
  component: ServicePage,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Something went wrong: {error.message}
    </div>
  ),
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-10 text-center">
      <div>
        <div className="text-display text-3xl">Service not found</div>
        <Link to="/" className="mt-4 inline-block text-sm text-[var(--clay)] underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}

const PRINCIPLES: Record<string, string[]> = {
  "climate-carbon": [
    "Audit-ready GHG methodology",
    "Science-based target design",
    "Investor-grade transition plans",
  ],
  "reporting-compliance": [
    "One audited data spine, many frameworks",
    "Double materiality by design",
    "Assurance-ready working papers",
  ],
  "verification-assurance": [
    "Independent, standards-aligned assurance",
    "Regulator-defensible working papers",
    "Findings that improve, not embarrass",
  ],
  "training-capacity": [
    "Board-to-analyst curriculum",
    "Framework-certified graduates",
    "Capability that compounds",
  ],
  "certifications-ratings": [
    "Baseline, remediate, submit, defend",
    "Score uplift by design",
    "Investor-relevant outcomes",
  ],
  "esg-strategy": [
    "Materiality-anchored ambition",
    "Fundable transformation roadmaps",
    "Operating model that sticks",
  ],
};

const JOURNEY_DEFAULT = ["Discover", "Measure", "Validate", "Transform"];
const JOURNEY_MAP: Record<string, string[]> = {
  "certifications-ratings": ["Gap Assessment", "Readiness", "Implementation", "Audit Support", "Certification", "Continuous Improvement"],
  "esg-strategy": ["Discover", "Materiality", "Vision", "Targets", "Roadmap", "Execution", "Governance", "Measure", "Improve"],
};

function ServicePage() {
  const { slug } = Route.useParams();
  const svc = getService(slug)!;
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [hoveredFw, setHoveredFw] = useState<string | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const methodologyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: methScroll } = useScroll({
    target: methodologyRef,
    offset: ["start end", "end start"],
  });
  const journeyHeight = useTransform(methScroll, [0.1, 0.6], ["0%", "100%"]);
  const activeStep = useTransform(methScroll, [0.15, 0.7], [0, (JOURNEY_MAP[slug] ?? JOURNEY_DEFAULT).length - 1]);
  const [journeyStep, setJourneyStep] = useState(0);
  activeStep.on("change", (v) => setJourneyStep(Math.round(v)));

  const isCarbon = slug === "climate-carbon";
  const isReporting = slug === "reporting-compliance";
  const isVerification = slug === "verification-assurance";
  const isTraining = slug === "training-capacity";
  const isCert = slug === "certifications-ratings";
  const isStrategy = slug === "esg-strategy";
  const journey = JOURNEY_MAP[slug] ?? JOURNEY_DEFAULT;
  const [hoveredStd, setHoveredStd] = useState<AssuranceStandard | null>(null);
  const principles = PRINCIPLES[slug] ?? PRINCIPLES["climate-carbon"];

  const smoothScroll = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NetworkBackground />
      <FloatingParticles />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(1000px 700px at 10% 10%, color-mix(in oklab, ${svc.tone} 18%, transparent), transparent 60%), radial-gradient(900px 600px at 90% 40%, color-mix(in oklab, var(--forest) 12%, transparent), transparent 60%)`,
        }}
      />
      <Nav />
      <main className="relative z-10 pt-32">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Services" }, { label: svc.title }]} />
          <Link to="/" className="mt-4 inline-block text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground">
            ← All services
          </Link>
          <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-foreground/70"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse-soft"
                  style={{ background: svc.tone, boxShadow: `0 0 8px ${svc.tone}` }}
                />
                For Tomorrow · Service
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-display text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] text-foreground"
              >
                {svc.title}
              </motion.h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {svc.tagline}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  search={{ service: svc.slug } as any}
                  className="group relative overflow-hidden rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Book a consultation
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </Link>
                <a
                  href="#methodology"
                  onClick={smoothScroll("methodology")}
                  className="rounded-full border border-border bg-card/60 px-7 py-3.5 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-[var(--leaf)] hover:bg-card"
                >
                  See methodology
                </a>
              </div>

              {/* Mini trust readout / cert metrics */}
              {isCert ? (
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <CertMetric value={40} suffix="+" label="Ratings Improved" tone={svc.tone} />
                  <CertMetric value={95} suffix="%" label="Certifications Delivered" tone={svc.tone} />
                  <CertMetric value={250} suffix="+" label="Supplier Approvals" tone={svc.tone} />
                  <CertMetric value={100} suffix="%" label="Investor Requirements Met" tone={svc.tone} />
                </div>
              ) : (
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <TrustChip label="GHG Protocol" color="var(--leaf)" hoverable={isVerification} onHover={() => setHoveredStd("GHG Protocol")} onLeave={() => setHoveredStd(null)} />
                  <TrustChip label="ISAE 3000" color="var(--ember)" hoverable={isVerification} onHover={() => setHoveredStd("ISAE 3000")} onLeave={() => setHoveredStd(null)} />
                  <TrustChip label="ISAE 3410" color="var(--clay)" hoverable={isVerification} onHover={() => setHoveredStd("ISAE 3410")} onLeave={() => setHoveredStd(null)} />
                </div>
              )}
            </div>

            {/* Flagship visual */}
            <div className="relative lg:-mr-8 xl:-mr-16">
              <div
                className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-white/70 to-white/30 p-2 shadow-lift backdrop-blur-xl"
                style={{
                  boxShadow:
                    "0 30px 80px -30px color-mix(in oklab, var(--forest) 30%, transparent), 0 0 0 1px rgba(255,255,255,0.5) inset",
                }}
              >
                {isCarbon ? (
                  <CarbonDashboard height={520} />
                ) : isReporting ? (
                  <ReportingDashboard height={540} />
                ) : isVerification ? (
                  <AssuranceDashboard height={540} activeStandard={hoveredStd} />
                ) : isTraining ? (
                  <AcademyHero height={540} tone={svc.tone} />
                ) : isCert ? (
                  <CertificationDashboard height={540} tone={svc.tone} />
                ) : isStrategy ? (
                  <StrategyEngine height={540} tone={svc.tone} />
                ) : (
                  <ServiceVisual kind={svc.visual} height={420} />
                )}
              </div>
              {/* under-glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 -bottom-10 h-16 rounded-full opacity-40 blur-3xl"
                style={{ background: svc.tone }}
              />
            </div>
          </div>
        </section>

        {/* OVERVIEW — split with principles */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Overview
              </div>
              <p className="text-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-tight text-foreground/90">
                {svc.overview}
              </p>
            </div>
            <div className="space-y-3">
              {principles.map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.2, type: "spring", stiffness: 220 }}
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `color-mix(in oklab, ${svc.tone} 20%, white)`, color: svc.tone }}
                  >
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                      <path d="M4 10l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <div className="text-sm font-medium leading-snug text-foreground">{p}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SIGNATURE: One data → many frameworks (reporting-compliance only) */}
        {isReporting && <DataSpineViz tone={svc.tone} />}
        {isVerification && <EvidenceEngine tone={svc.tone} />}
        {isTraining && <LearningUniverse tone={svc.tone} />}
        {isCert && <CertValueChain tone={svc.tone} />}
        {isCert && <SustainabilityPassport tone={svc.tone} />}
        {isCert && <CertificationNavigator tone={svc.tone} />}
        {isCert && <RatingsJourney tone={svc.tone} />}
        {isCert && <LearnBeforeCertify tone={svc.tone} />}
        {isStrategy && <StrategyFlywheel tone={svc.tone} />}
        {isStrategy && <StrategyOS tone={svc.tone} />}
        {isStrategy && <TransformationTimeline tone={svc.tone} />}
        {isStrategy && <MethodologyWorkspaces tone={svc.tone} />}
        {isStrategy && <FrameworkCards tone={svc.tone} />}
        {isStrategy && <StrategySimulator tone={svc.tone} />}
        {isStrategy && <BuildInternalCapability tone={svc.tone} />}
        {isStrategy && <ExecutiveCTA tone={svc.tone} />}


        {/* PROGRESS + METHODOLOGY */}
        <section id="methodology" ref={methodologyRef} className="mx-auto max-w-7xl px-6 py-20">
          {/* Journey indicator */}
          <div className="mb-16">
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              The journey
            </div>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
              <motion.div
                className="absolute left-0 top-1/2 h-px -translate-y-1/2"
                style={{
                  width: useTransform(methScroll, [0.1, 0.6], ["0%", "100%"]),
                  background: `linear-gradient(90deg, ${svc.tone}, color-mix(in oklab, ${svc.tone} 40%, var(--forest)))`,
                }}
              />
              {journey.map((label: string, i: number) => {
                const on = journeyStep >= i;
                return (
                  <div key={label} className="relative z-10 flex flex-col items-center gap-2 bg-background px-3">
                    <motion.div
                      animate={{
                        scale: on ? 1 : 0.85,
                        boxShadow: on
                          ? `0 0 20px ${svc.tone}, 0 0 0 4px color-mix(in oklab, ${svc.tone} 20%, transparent)`
                          : "0 0 0 0 transparent",
                      }}
                      className="flex h-4 w-4 items-center justify-center rounded-full transition-colors"
                      style={{ background: on ? svc.tone : "var(--mist)" }}
                    />
                    <div
                      className={`text-[11px] uppercase tracking-[0.22em] transition-colors ${
                        on ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Methodology
              </div>
              <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
                An interactive, <em className="text-gradient-brand">auditable</em> path.
              </h2>
            </div>
          </div>

          {/* Connected journey cards */}
          <div className="relative">
            {/* vertical connector on mobile, horizontal on desktop */}
            <div className="pointer-events-none absolute left-6 top-8 bottom-8 w-px bg-border md:hidden" />
            <motion.div
              className="pointer-events-none absolute left-6 top-8 w-px md:hidden"
              style={{
                height: journeyHeight,
                background: `linear-gradient(180deg, ${svc.tone}, transparent)`,
              }}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {svc.methodology.map((m, i) => {
                const expanded = hoveredStage === i;
                return (
                  <motion.div
                    key={m.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onMouseEnter={() => setHoveredStage(i)}
                    onMouseLeave={() => setHoveredStage(null)}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                  >
                    {/* connector arrow to next card (desktop only) */}
                    {i < svc.methodology.length - 1 && (
                      <div className="pointer-events-none absolute right-[-14px] top-1/2 z-10 hidden -translate-y-1/2 md:block">
                        <motion.svg
                          width="28"
                          height="12"
                          viewBox="0 0 28 12"
                          initial={{ opacity: 0, x: -6 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 + 0.4 }}
                        >
                          <path
                            d="M0 6 H22 M18 2 L22 6 L18 10"
                            stroke={svc.tone}
                            strokeWidth="1.2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </div>
                    )}
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-mono text-white transition-transform group-hover:scale-110"
                        style={{ background: svc.tone, boxShadow: `0 6px 16px -6px ${svc.tone}` }}
                      >
                        0{i + 1}
                      </div>
                      <StageMini index={i} color={svc.tone} />
                    </div>
                    <div className="text-display text-xl">{m.step}</div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-2 border-t border-border pt-4 text-[11px]">
                            <MiniRow label="Inputs" value="Data, boundaries, systems" />
                            <MiniRow label="Outputs" value={svc.deliverables[i] ?? "Documented artifact"} />
                            <MiniRow label="Framework" value={svc.frameworks[i] ?? svc.frameworks[0]} />
                            <MiniRow label="Duration" value={svc.timeline[i]?.label ?? "2–4 weeks"} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FRAMEWORKS — interactive credibility showcase */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Frameworks covered
            </div>
            <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
              Standards we speak <em className="text-gradient-brand">fluently</em>.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {svc.frameworks.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHoveredFw(f)}
                onMouseLeave={() => setHoveredFw(null)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-mono font-semibold"
                    style={{
                      background: `color-mix(in oklab, ${svc.tone} 12%, white)`,
                      color: svc.tone,
                    }}
                  >
                    {f.split(" ")[0].slice(0, 3).toUpperCase()}
                  </div>
                  <div className="text-sm font-medium">{f}</div>
                </div>
                <AnimatePresence>
                  {hoveredFw === f && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-xs leading-relaxed text-muted-foreground"
                    >
                      {frameworkBlurb(f)}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(120deg, transparent, color-mix(in oklab, ${svc.tone} 25%, transparent), transparent)`,
                    padding: "1px",
                    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* TRAINING — Course library, formats, dashboard */}
        {isTraining && (
          <>
            <section id="academy" className="mx-auto max-w-7xl px-6 py-24">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Explore our Sustainability Academy
                  </div>
                  <h2 className="text-display text-[clamp(2rem,3.8vw,3.2rem)]">
                    A complete <em className="text-gradient-brand">course library</em>.
                  </h2>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  Structured programs from ESG awareness to advanced practitioner certification.
                  Every course ships with live sessions, workshops, assignments, and a portable
                  certificate.
                </p>
              </div>
              <CourseLibrary tone={svc.tone} />
            </section>

            <LearningFormats tone={svc.tone} />
            <LearningDashboard tone={svc.tone} />
          </>
        )}

        {/* DELIVERABLES */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Deliverables
            </div>
            <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
              What you actually receive.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {svc.deliverables.map((d, i) => (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
              >
                <DocPreview color={svc.tone} label={d} />
                <div className="mt-4 text-sm font-medium leading-snug">{d}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  PDF · Working file
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TIMELINE — engagement roadmap */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Engagement roadmap
            </div>
            <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
              How the work unfolds.
            </h2>
          </div>
          <div className="relative overflow-x-auto pb-4">
            <div className="relative min-w-[720px]">
              <div className="absolute left-0 right-0 top-8 h-px bg-border" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute left-0 right-0 top-8 h-px origin-left"
                style={{
                  background: `linear-gradient(90deg, ${svc.tone}, transparent)`,
                }}
              />
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${svc.timeline.length}, minmax(0,1fr))` }}>
                {svc.timeline.map((t, i) => {
                  const on = hoveredTime === i;
                  return (
                    <motion.div
                      key={t.label}
                      onMouseEnter={() => setHoveredTime(i)}
                      onMouseLeave={() => setHoveredTime(null)}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          scale: on ? 1.25 : 1,
                          boxShadow: on
                            ? `0 0 24px ${svc.tone}, 0 0 0 6px color-mix(in oklab, ${svc.tone} 15%, transparent)`
                            : `0 0 12px ${svc.tone}`,
                        }}
                        className="mb-4 h-4 w-4 rounded-full ring-4 ring-background"
                        style={{ background: svc.tone }}
                      />
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {t.label}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{t.body}</p>
                      <AnimatePresence>
                        {on && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                              {["Workshops", "Fieldwork", "Deliverable review"].map((x) => (
                                <li key={x} className="flex items-center gap-2">
                                  <span
                                    className="h-1 w-1 rounded-full"
                                    style={{ background: svc.tone }}
                                  />
                                  {x}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* OUTCOMES — animated counters + INDUSTRIES ecosystem */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Client outcomes
            </div>
            <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
              Signals of the work.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {svc.outcomes.map((o) => {
              const parsed = parseMetric(o.metric);
              return (
                <motion.div
                  key={o.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${svc.tone}, transparent)` }}
                  />
                  <div className="text-display text-5xl leading-none" style={{ color: svc.tone }}>
                    {parsed.number != null ? (
                      <Counter to={parsed.number} prefix={parsed.prefix} suffix={parsed.suffix} />
                    ) : (
                      o.metric
                    )}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                    {o.label}
                  </div>
                  <div className="mt-4">
                    <OutcomeSpark color={svc.tone} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Industries served
            </div>
            <h3 className="text-display text-2xl">Where we work</h3>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {svc.industries.map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-shadow hover:shadow-lift"
                >
                  <IndustryIcon name={n} color={svc.tone} />
                  <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/80">{n}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="mb-8">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              FAQ
            </div>
            <h2 className="text-display text-[clamp(2rem,3.4vw,2.5rem)]">
              Common questions.
            </h2>
          </div>
          <div className="space-y-3">
            {svc.faq.map((f, i) => {
              const open = faqOpen === i;
              return (
                <motion.div
                  key={f.q}
                  layout
                  className={`rounded-2xl border border-border bg-card/80 backdrop-blur transition-shadow ${
                    open ? "shadow-lift" : "shadow-soft"
                  }`}
                >
                  <button
                    onClick={() => setFaqOpen(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <div className="text-sm font-medium">{f.q}</div>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      className="text-lg leading-none"
                      style={{ color: svc.tone }}
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                              Related
                            </span>
                            <a
                              href="#methodology"
                              onClick={smoothScroll("methodology")}
                              className="rounded-full border border-border px-3 py-1 text-[11px] hover:border-[var(--leaf)]"
                            >
                              Methodology
                            </a>
                            <Link
                              to="/"
                              hash="assessment"
                              className="rounded-full border border-border px-3 py-1 text-[11px] hover:border-[var(--leaf)]"
                            >
                              Readiness assessment
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA — animated sunrise */}
        <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-16"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, ${svc.tone} 30%, var(--ink)) 0%, var(--ink) 100%)`,
            }}
          >
            {/* sunrise animation */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              animate={{
                background: [
                  `radial-gradient(600px 400px at 20% 120%, color-mix(in oklab, ${svc.tone} 40%, transparent), transparent 60%)`,
                  `radial-gradient(700px 500px at 80% 120%, color-mix(in oklab, ${svc.tone} 50%, transparent), transparent 60%)`,
                  `radial-gradient(600px 400px at 20% 120%, color-mix(in oklab, ${svc.tone} 40%, transparent), transparent 60%)`,
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* rotating mini earth */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-40">
              <motion.svg
                viewBox="0 0 200 200"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <radialGradient id="ctaE" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#7ec4e6" />
                    <stop offset="80%" stopColor="#0e2f4a" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#ctaE)" />
                <path d="M60 80 Q80 70 100 80 T140 90" stroke="#6b8b3c" strokeWidth="8" fill="none" opacity="0.6" />
                <path d="M70 120 Q100 115 130 125" stroke="#7a9a44" strokeWidth="6" fill="none" opacity="0.6" />
              </motion.svg>
            </div>

            <div className="relative z-10 max-w-2xl text-primary-foreground">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-primary-foreground/70">
                Ready to move?
              </div>
              <h2 className="text-display text-[clamp(2rem,4vw,3.25rem)]">
                Let's design your {svc.title.toLowerCase()} program.
              </h2>
              <p className="mt-4 max-w-lg text-sm text-primary-foreground/80">
                A 45-minute working session to understand your context and shape the fastest
                credible path forward.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  search={{ service: svc.slug } as any}
                  className="group relative overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Book a consultation
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </Link>
                <Link
                  to="/"
                  hash="assessment"
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-primary-foreground hover:border-white"
                >
                  Take the readiness assessment
                </Link>
              </div>
            </div>
          </div>

          {/* Continue exploring — connected ecosystem */}
          <div className="mt-16">
            <div className="mb-6 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Continue exploring
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {services
                .filter((o) => o.slug !== svc.slug)
                .slice(0, 3)
                .map((o, i) => (
                  <Link
                    key={o.slug}
                    to="/services/$slug"
                    params={{ slug: o.slug }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                  >
                    {/* connecting arc to previous */}
                    {i > 0 && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -left-4 top-1/2 hidden h-px w-8 -translate-y-1/2 md:block"
                        style={{ background: `linear-gradient(90deg, transparent, ${svc.tone})` }}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2 w-2 rounded-full transition-transform group-hover:scale-150"
                        style={{ background: o.tone, boxShadow: `0 0 8px ${o.tone}` }}
                      />
                      <div className="text-display text-lg">{o.title}</div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{o.tagline}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-foreground/70 transition-colors group-hover:text-[var(--clay)]">
                      Explore
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ============= helpers ============= */

function TrustChip({
  label,
  color,
  hoverable,
  onHover,
  onLeave,
}: {
  label: string;
  color: string;
  hoverable?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  return (
    <span
      onMouseEnter={hoverable ? onHover : undefined}
      onMouseLeave={hoverable ? onLeave : undefined}
      className={`inline-flex items-center gap-1.5 ${hoverable ? "cursor-pointer transition-colors hover:text-foreground" : ""}`}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right text-foreground/85">{value}</span>
    </div>
  );
}

function StageMini({ index, color }: { index: number; color: string }) {
  // tiny animated glyph per stage
  const gs = [
    // Boundary — expanding circle
    <motion.svg key="b" viewBox="0 0 24 24" className="h-6 w-6">
      <circle cx="12" cy="12" r="3" fill={color} />
      <motion.circle
        cx="12"
        cy="12"
        r="6"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        animate={{ r: [4, 10, 4], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
    </motion.svg>,
    // Inventory — particles flowing
    <svg key="i" viewBox="0 0 24 24" className="h-6 w-6">
      {[0, 1, 2].map((n) => (
        <motion.circle
          key={n}
          cy="12"
          r="1.5"
          fill={color}
          initial={{ cx: 2, opacity: 0 }}
          animate={{ cx: 22, opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay: n * 0.4, repeat: Infinity }}
        />
      ))}
    </svg>,
    // Target — trajectory
    <svg key="t" viewBox="0 0 24 24" className="h-6 w-6">
      <motion.path
        d="M2 20 Q10 20 12 12 T22 4"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.4 }}
      />
      <circle cx="22" cy="4" r="1.8" fill={color} />
    </svg>,
    // Transition — roadmap dots
    <svg key="tr" viewBox="0 0 24 24" className="h-6 w-6">
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      {[4, 12, 20].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="12"
          r="2"
          fill={color}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.4, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </svg>,
  ];
  return gs[index] ?? gs[0];
}

function DocPreview({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-white to-[var(--cream)] p-3"
      title={label}
    >
      {/* corner fold */}
      <div className="absolute right-0 top-0 h-4 w-4 bg-border" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
      <div className="mb-2 h-1 w-8 rounded" style={{ background: color }} />
      <div className="space-y-1">
        <div className="h-1 w-full rounded bg-[var(--mist)]" />
        <div className="h-1 w-4/5 rounded bg-[var(--mist)]" />
        <div className="h-1 w-3/5 rounded bg-[var(--mist)]" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1">
        {[0.5, 0.9, 0.7].map((h, i) => (
          <motion.div
            key={i}
            className="rounded-t"
            style={{ background: color, height: `${h * 20}px`, opacity: 0.7 }}
            animate={{ height: [`${h * 12}px`, `${h * 22}px`, `${h * 12}px`] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function OutcomeSpark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 24" className="h-6 w-full">
      <motion.path
        d="M0 20 L15 14 L30 16 L45 8 L60 10 L75 4 L100 6"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8 }}
      />
      <motion.circle
        cx="100"
        cy="6"
        r="2"
        fill={color}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6 }}
      />
    </svg>
  );
}

function IndustryIcon({ name, color }: { name: string; color: string }) {
  const kind = classifyIndustry(name);
  const stroke = color;
  const common = { fill: "none", stroke, strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9">
      {kind === "manufacturing" && (
        <g {...common}>
          <path d="M6 32 V18 L14 22 V18 L22 22 V16 L32 22 V32 Z" />
          <rect x="10" y="26" width="3" height="3" />
          <rect x="18" y="26" width="3" height="3" />
          <rect x="26" y="26" width="3" height="3" />
        </g>
      )}
      {kind === "financial" && (
        <g {...common}>
          <path d="M8 30 H32" />
          <path d="M10 30 V16 M15 30 V18 M20 30 V14 M25 30 V17 M30 30 V12" />
          <path d="M6 10 L20 6 L34 10" />
        </g>
      )}
      {kind === "energy" && (
        <g {...common}>
          <line x1="20" y1="14" x2="20" y2="34" />
          <path d="M20 14 L28 6 M20 14 L12 6 M20 14 L20 4" />
          <circle cx="20" cy="14" r="1.4" fill={stroke} />
        </g>
      )}
      {kind === "realestate" && (
        <g {...common}>
          <path d="M6 32 V18 L14 12 L22 18 V32 Z" />
          <path d="M22 32 V22 L30 16 L34 20 V32 Z" />
          <rect x="10" y="22" width="3" height="4" />
          <rect x="16" y="22" width="3" height="4" />
        </g>
      )}
      {kind === "consumer" && (
        <g {...common}>
          <path d="M10 14 H30 L28 32 H12 Z" />
          <path d="M14 14 V10 A6 6 0 0 1 26 10 V14" />
        </g>
      )}
      {kind === "public" && (
        <g {...common}>
          <path d="M8 32 H32" />
          <path d="M10 32 V18 M16 32 V18 M22 32 V18 M28 32 V18" />
          <path d="M6 18 H34 L20 8 Z" />
        </g>
      )}
      {kind === "corporate" && (
        <g {...common}>
          <rect x="8" y="12" width="24" height="20" />
          <path d="M12 16 h4 M20 16 h4 M12 22 h4 M20 22 h4 M12 28 h4 M20 28 h4" />
        </g>
      )}
      {kind === "supply" && (
        <g {...common}>
          <circle cx="10" cy="30" r="3" />
          <circle cx="30" cy="30" r="3" />
          <rect x="14" y="18" width="14" height="10" />
          <path d="M6 24 H14 M28 24 H34" />
        </g>
      )}
      {kind === "board" && (
        <g {...common}>
          <circle cx="20" cy="14" r="4" />
          <path d="M10 32 c0 -6 4 -10 10 -10 s10 4 10 10" />
        </g>
      )}
    </svg>
  );
}

function classifyIndustry(name: string) {
  const n = name.toLowerCase();
  if (n.includes("manufactur") || n.includes("industrial")) return "manufacturing";
  if (n.includes("financ")) return "financial";
  if (n.includes("energy")) return "energy";
  if (n.includes("real estate")) return "realestate";
  if (n.includes("consumer") || n.includes("retail")) return "consumer";
  if (n.includes("public") || n.includes("sovereign")) return "public";
  if (n.includes("supply")) return "supply";
  if (n.includes("board") || n.includes("pe") || n.includes("portfolio")) return "board";
  return "corporate";
}

function parseMetric(s: string): { number: number | null; prefix: string; suffix: string } {
  const m = s.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { number: null, prefix: "", suffix: "" };
  return { prefix: m[1] ?? "", number: Number(m[2]), suffix: m[3] ?? "" };
}

function frameworkBlurb(f: string): string {
  const map: Record<string, string> = {
    "GHG Protocol": "Global standard for corporate emissions accounting. Baseline for every inventory we build.",
    "SBTi": "Science-Based Targets initiative. Validates near-term and net-zero targets against 1.5°C pathways.",
    "ISO 14064": "International standard for GHG quantification and verification.",
    "TCFD": "Climate risk disclosure framework, now folded into IFRS S2.",
    "IFRS S2": "ISSB climate standard for investor-grade climate disclosures.",
    "CDP": "Disclosure platform used by investors and buyers to score climate action.",
    "GRI": "Multi-stakeholder sustainability reporting standard.",
    "ISSB (IFRS S1/S2)": "Global baseline for sustainability and climate disclosures.",
    "CSRD/ESRS": "EU mandatory sustainability reporting under double materiality.",
    "SASB": "Industry-specific financially material sustainability metrics.",
    "ISAE 3000": "Assurance standard for non-financial information.",
    "ISAE 3410": "Assurance standard specific to greenhouse gas statements.",
    "ISO 14064-3": "Standard for validation and verification of GHG assertions.",
    "ISO 14065": "Requirements for bodies validating and verifying environmental information.",
    "AA1000AS": "Sustainability assurance standard emphasizing inclusivity and materiality.",
    "ISO 14001": "Environmental management systems standard.",
    "ISO 50001": "Energy management systems standard.",
    "EcoVadis": "Business sustainability ratings widely used across supply chains.",
    "MSCI ESG": "Investor-facing ESG ratings and analytics.",
    "Sustainalytics": "Morningstar ESG risk ratings used by asset managers.",
    "TNFD": "Nature-related financial disclosures framework.",
  };
  return map[f] ?? "Framework we apply in engagements. Ask us how we use it in your context.";
}

function CertMetric({ value, suffix, label, tone }: { value: number; suffix?: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
      <div className="flex items-baseline gap-1">
        <span className="text-display text-3xl leading-none" style={{ color: tone }}>
          <Counter to={value} suffix={suffix ?? ""} />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke={tone} strokeWidth="2">
          <path d="M2 6 L5 9 L10 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </div>
    </div>
  );
}
