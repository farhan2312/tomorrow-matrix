import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.asset.json";
import { SOCIAL, CONTACT, externalLink } from "@/lib/site-links";

const services = [
  { label: "ESG Strategy & Roadmaps", slug: "esg-strategy" },
  { label: "Climate & Carbon", slug: "climate-carbon" },
  { label: "Reporting & Compliance", slug: "reporting-compliance" },
  { label: "Verification & Assurance", slug: "verification-assurance" },
  { label: "Certifications & Ratings", slug: "certifications-ratings" },
  { label: "Training & Capacity", slug: "training-capacity" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-card/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logo.url} alt="For Tomorrow" className="h-8 w-8 object-contain" />
              <div>
                <div className="text-sm font-semibold">For Tomorrow</div>
                <div className="text-[10px] italic text-muted-foreground">from today</div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Credible sustainability, engineered for tomorrow's businesses. Strategy, measurement,
              reporting, verification, training.
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <a href={CONTACT.emailHref} className="block text-foreground/75 hover:text-foreground">
                {CONTACT.email}
              </a>
              <a href={CONTACT.phoneHref} className="block text-foreground/75 hover:text-foreground">
                {CONTACT.phone}
              </a>
              <div className="text-muted-foreground">{CONTACT.offices}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={SOCIAL.linkedin}
                {...externalLink}
                aria-label="For Tomorrow on LinkedIn"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-[var(--leaf)]"
              >
                LinkedIn
              </a>
              <a
                href={SOCIAL.youtube}
                {...externalLink}
                aria-label="For Tomorrow on YouTube"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-[var(--ember)]"
              >
                YouTube
              </a>
            </div>
          </div>

          <FooterCol title="Services">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-foreground/75 hover:text-foreground"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Learning">
            <li>
              <Link to="/courses" className="text-foreground/75 hover:text-foreground">
                Sustainability Academy
              </Link>
            </li>
            <li>
              <Link to="/courses" className="text-foreground/75 hover:text-foreground">
                Course catalogue
              </Link>
            </li>
            <li>
              <Link
                to="/services/$slug"
                params={{ slug: "certifications-ratings" }}
                className="text-foreground/75 hover:text-foreground"
              >
                Certifications
              </Link>
            </li>
            <li>
              <a href={SOCIAL.youtube} {...externalLink} className="text-foreground/75 hover:text-foreground">
                Webinars
              </a>
            </li>
            <li>
              <a href={SOCIAL.youtube} {...externalLink} className="text-foreground/75 hover:text-foreground">
                YouTube
              </a>
            </li>
          </FooterCol>

          <FooterCol title="Resources">
            {["Articles", "Whitepapers", "Templates", "Toolkits", "Case studies"].map((r) => (
              <li key={r}>
                <Link
                  to="/"
                  hash="knowledge"
                  className="text-foreground/75 hover:text-foreground"
                >
                  {r}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Company">
            <li>
              <Link to="/" hash="approach" className="text-foreground/75 hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-foreground/75 hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-foreground/75 hover:text-foreground">
                Book consultation
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-foreground/75 hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-foreground/75 hover:text-foreground">
                Terms & conditions
              </Link>
            </li>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground">
          <div>© {new Date().getFullYear()} For Tomorrow. All rights reserved.</div>
          <div className="font-mono">Built as a living sustainability ecosystem.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}
