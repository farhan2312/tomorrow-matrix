import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NetworkBackground, FloatingParticles } from "@/components/site/NetworkBackground";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { COURSES } from "@/lib/courses-data";
import { SOCIAL, externalLink } from "@/lib/site-links";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Sustainability Academy — Course Catalogue | For Tomorrow" },
      {
        name: "description",
        content:
          "Enrol in For Tomorrow's sustainability courses: ESG awareness, carbon accounting, ISO 14064, GRI, IFRS S1 & S2 and reporting frameworks.",
      },
      { property: "og:title", content: "Sustainability Academy — Course Catalogue" },
      {
        property: "og:description",
        content: "Executive education for ESG strategy, carbon accounting, reporting and assurance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NetworkBackground />
      <FloatingParticles />
      <Nav />
      <main className="relative z-10 pt-32">
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Courses" }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.03]"
          >
            The <em className="text-gradient-brand">Sustainability Academy</em>.
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Practitioner-grade programmes taught by the team that builds, reports and verifies real
            sustainability systems. Every course leads to a certificate and a working artefact.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/book"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--ink)" }}
            >
              Talk to us about cohorts
            </Link>
            <a
              href={SOCIAL.youtube}
              {...externalLink}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--ember)]"
            >
              Watch on YouTube →
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 md:grid-cols-2">
            {COURSES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.05 }}
                className={`group flex flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift ${
                  c.flagship
                    ? "md:col-span-2 border-[color-mix(in_oklab,var(--ember)_35%,var(--border))]"
                    : "border-border"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--leaf)_15%,white)] px-2 py-0.5 text-[var(--forest)]">
                    {c.level}
                  </span>
                  <span>· {c.duration}</span>
                  <span>· {c.delivery}</span>
                  {c.flagship && <span className="text-[var(--clay)]">★ Flagship</span>}
                </div>
                <div className="text-display text-2xl leading-tight">{c.title}</div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.outcomes.map((o) => (
                    <span
                      key={o}
                      className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80"
                    >
                      {o}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to="/courses/$courseId"
                    params={{ courseId: c.id }}
                    className="rounded-full px-4 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: "var(--ink)" }}
                  >
                    Enrol now →
                  </Link>
                  <Link
                    to="/courses/$courseId"
                    params={{ courseId: c.id }}
                    hash="curriculum"
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                  >
                    View curriculum
                  </Link>
                  <Link
                    to="/contact"
                    search={{ course: c.id }}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                  >
                    Register interest
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
