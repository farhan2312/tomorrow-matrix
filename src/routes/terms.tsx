import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — For Tomorrow" },
      {
        name: "description",
        content:
          "Terms governing use of the For Tomorrow website, consulting engagements, and enrolment in Sustainability Academy training programmes.",
      },
      { property: "og:title", content: "Terms & Conditions — For Tomorrow" },
      { property: "og:description", content: "Website, engagement and training programme terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Nav />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms & conditions" }]} />
        <LegalPage
          title="Terms & conditions"
          intro="These terms cover use of this website, consulting engagements and enrolment in our training programmes."
          sections={[
            {
              h: "Website content",
              p: "Material published here is provided for general information. It is not advice for a specific organisation and should not be relied on as such without an engagement.",
            },
            {
              h: "Engagements",
              p: "Consulting work is governed by a signed proposal or statement of work defining scope, deliverables, fees and timelines.",
            },
            {
              h: "Training enrolment",
              p: "Course places are confirmed in writing. Transfers between cohorts are accommodated where seats allow; cancellation terms are stated in the confirmation email.",
            },
            {
              h: "Independence",
              p: "Where we provide verification or assurance, independence and ethical requirements take precedence over any other commercial arrangement.",
            },
            {
              h: "Intellectual property",
              p: "Course materials, templates and frameworks remain the intellectual property of For Tomorrow and are licensed to participants for internal use.",
            },
          ]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
