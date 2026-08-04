import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — For Tomorrow" },
      {
        name: "description",
        content:
          "How For Tomorrow collects, uses and protects personal data submitted through enquiry, booking and course registration forms.",
      },
      { property: "og:title", content: "Privacy Policy — For Tomorrow" },
      { property: "og:description", content: "Our data protection and privacy commitments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Nav />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy policy" }]} />
        <LegalPage
          title="Privacy policy"
          intro="We collect only what we need to respond to you, deliver our services and meet our professional obligations."
          sections={[
            {
              h: "What we collect",
              p: "Contact details, organisation information and the content of the messages you send through our enquiry, booking and course registration forms.",
            },
            {
              h: "How we use it",
              p: "To respond to enquiries, arrange consultations, deliver training programmes and issue certificates. We do not sell personal data.",
            },
            {
              h: "Confidentiality",
              p: "Client information and documents shared during an engagement are treated as confidential and handled under NDA by default.",
            },
            {
              h: "Retention",
              p: "Enquiry records are retained for as long as needed to serve you and to comply with legal and professional record-keeping requirements.",
            },
            {
              h: "Your rights",
              p: "You may request access to, correction of, or deletion of your personal data at any time by writing to hello@fortomorrow.co.",
            },
          ]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
