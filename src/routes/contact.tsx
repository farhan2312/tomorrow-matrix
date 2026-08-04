import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NetworkBackground, FloatingParticles } from "@/components/site/NetworkBackground";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SOCIAL, CONTACT, externalLink } from "@/lib/site-links";
import { COURSES } from "@/lib/courses-data";
import { services } from "@/lib/services-data";
import faridaImg from "@/assets/farida.jpg.asset.json";

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): { course?: string } => ({
    course: typeof s.course === "string" ? s.course : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Let's Build Tomorrow Together | For Tomorrow" },
      {
        name: "description",
        content:
          "Contact For Tomorrow for sustainability consulting, corporate training, partnerships or general enquiries. Offices in Dubai and Bengaluru.",
      },
      { property: "og:title", content: "Let's Build Tomorrow Together — Contact For Tomorrow" },
      {
        property: "og:description",
        content: "Consulting, training, partnerships and general enquiries — reach the team directly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const METRICS = [
  { v: "20+", l: "Years experience" },
  { v: "12+", l: "Sustainability frameworks" },
  { v: "End-to-end", l: "ESG services" },
  { v: "Strategy → Assurance", l: "Full lifecycle" },
  { v: "Academy", l: "Corporate training programmes" },
  { v: "Global", l: "Consulting experience" },
];

const EXPERTISE = [
  "ESG Strategy",
  "Carbon Accounting",
  "Sustainability Reporting",
  "Verification & Assurance",
  "Training",
];

const REGIONS = [
  { x: 262, y: 98, l: "UAE — Dubai" },
  { x: 300, y: 118, l: "India — Bengaluru" },
  { x: 112, y: 82, l: "Europe" },
  { x: 60, y: 108, l: "Americas" },
  { x: 330, y: 150, l: "APAC" },
];

const INDUSTRIES = [
  "Manufacturing",
  "Energy & Utilities",
  "Financial Services",
  "Real Estate",
  "Logistics",
  "Retail & FMCG",
  "Public Sector",
  "Other",
];

const SIZES = ["1–50", "51–250", "251–1,000", "1,001–5,000", "5,000+"];

function ContactPage() {
  const { course } = Route.useSearch();
  const preset = course ? COURSES.find((c) => c.id === course) : undefined;

  const [form, setForm] = useState({
    name: "",
    org: "",
    role: "",
    email: "",
    phone: "",
    country: "",
    industry: "",
    size: "",
    service: preset ? `Training — ${preset.title}` : "",
    contact: "Email",
    message: preset ? `I'd like to know more about the ${preset.title} programme.` : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errs.email = "Enter a valid email address.";
    if (form.phone && form.phone.trim().length < 6) errs.phone = "Enter a valid phone number.";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more (10+ characters).";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSent(true);
    toast.success("Message sent — we respond within one business day.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NetworkBackground />
      <FloatingParticles />
      <Nav />
      <main className="relative z-10 pt-32">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-display text-[clamp(2.75rem,6vw,5rem)] leading-[1.02]"
          >
            Let's build <em className="text-gradient-brand">tomorrow together</em>.
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Whether you're preparing a first disclosure, building internal capability, exploring a
            partnership, or simply have a question — this is where the conversation begins. We work
            with organisations on consulting, training and assurance across every stage of the
            sustainability journey.
          </p>
        </section>

        {/* Contact options */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <OptionCard
              label="Book a consultation"
              value="45-minute working session"
              to="/book"
              accent="var(--leaf)"
            />
            <OptionCard
              label="Email us"
              value={CONTACT.email}
              href={CONTACT.emailHref}
              accent="var(--forest)"
            />
            <OptionCard label="Call us" value={CONTACT.phone} href={CONTACT.phoneHref} accent="var(--clay)" />
            <OptionCard
              label="LinkedIn"
              value="For Tomorrow — company page"
              href={SOCIAL.linkedin}
              external
              accent="#0a66c2"
            />
            <OptionCard
              label="YouTube"
              value="@ForTomorrow26"
              href={SOCIAL.youtube}
              external
              accent="var(--ember)"
            />
            <OptionCard label="Office locations" value={CONTACT.offices} href="#map" accent="var(--ink)" />
          </div>
        </section>

        {/* Form + map */}
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-lift backdrop-blur md:p-8">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Write to us
            </div>
            <div className="mt-1 mb-6 text-display text-3xl">Send an enquiry</div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-[var(--leaf)] bg-[color-mix(in_oklab,var(--leaf)_10%,white)] p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
                    style={{ background: "var(--forest)" }}
                  >
                    ✓
                  </motion.div>
                  <div className="text-display text-2xl">
                    Thank you, {form.name.split(" ")[0]}.
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your enquiry has reached us. We reply within one business day, usually with a
                    short discovery call proposal. A copy has been noted against {form.email}.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link
                      to="/book"
                      className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
                      style={{ background: "var(--ink)" }}
                    >
                      Book a consultation
                    </Link>
                    <button
                      onClick={() => setSent(false)}
                      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--leaf)]"
                    >
                      Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
                  <Field label="Full name *" value={form.name} error={errors.name} onChange={(v) => set("name", v)} />
                  <Field label="Organisation" value={form.org} onChange={(v) => set("org", v)} />
                  <Field label="Job title" value={form.role} onChange={(v) => set("role", v)} />
                  <Field
                    label="Email address *"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    onChange={(v) => set("email", v)}
                  />
                  <Field
                    label="Phone number"
                    type="tel"
                    value={form.phone}
                    error={errors.phone}
                    onChange={(v) => set("phone", v)}
                  />
                  <Field label="Country" value={form.country} onChange={(v) => set("country", v)} />
                  <Select
                    label="Industry"
                    value={form.industry}
                    options={INDUSTRIES}
                    onChange={(v) => set("industry", v)}
                  />
                  <Select
                    label="Company size"
                    value={form.size}
                    options={SIZES}
                    onChange={(v) => set("size", v)}
                  />
                  <Select
                    label="Service interested in"
                    value={form.service}
                    options={[
                      ...services.map((s) => s.title),
                      ...COURSES.map((c) => `Training — ${c.title}`),
                      "Partnership",
                      "General enquiry",
                    ]}
                    onChange={(v) => set("service", v)}
                  />
                  <Select
                    label="Preferred contact method"
                    value={form.contact}
                    options={["Email", "Phone", "LinkedIn", "Video call"]}
                    onChange={(v) => set("contact", v)}
                    required
                  />
                  <div className="sm:col-span-2">
                    <Label>Message *</Label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      className={`w-full rounded-xl border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)] ${
                        errors.message ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.message && (
                      <div className="mt-1 text-[11px] text-destructive">{errors.message}</div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                      style={{ background: "var(--ink)" }}
                    >
                      Send message →
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Office presence map */}
          <div id="map" className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Office presence
              </div>
              <div className="text-display text-2xl">Where we work</div>
              <svg viewBox="0 0 400 200" className="mt-4 h-56 w-full">
                <defs>
                  <linearGradient id="landfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="color-mix(in oklab, var(--leaf) 30%, white)" />
                    <stop offset="100%" stopColor="var(--mist)" />
                  </linearGradient>
                </defs>
                <path
                  d="M20,100 Q100,40 200,80 T380,90 L380,180 L20,180 Z"
                  fill="url(#landfill)"
                  stroke="var(--border)"
                />
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={110 + i * 18}
                    x2="380"
                    y2={104 + i * 18}
                    stroke="var(--border)"
                    strokeDasharray="2 6"
                  />
                ))}
                {REGIONS.map((m, i) => (
                  <g key={m.l}>
                    <motion.circle
                      cx={m.x}
                      cy={m.y}
                      r="10"
                      fill="var(--leaf)"
                      opacity={0.25}
                      animate={{ scale: [1, 2, 1], opacity: [0.25, 0, 0.25] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                      style={{ transformOrigin: `${m.x}px ${m.y}px` }}
                    />
                    <motion.circle
                      cx={m.x}
                      cy={m.y}
                      r="5"
                      fill="var(--forest)"
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
                      style={{ transformOrigin: `${m.x}px ${m.y}px` }}
                    />
                    <text x={m.x + 10} y={m.y + 3} style={{ fontSize: 8, fill: "var(--ink)" }}>
                      {m.l}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="mt-2 text-xs text-muted-foreground">
                Headquartered in Dubai with a delivery hub in Bengaluru, working with clients across
                EMEA, APAC and the Americas.
              </div>
            </div>
          </div>
        </section>

        {/* Why work with us */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-6 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Why work with us
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.l}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="text-display text-2xl" style={{ color: "var(--forest)" }}>
                  {m.v}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.l}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-6 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Meet the team
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
            >
              <img
                src={faridaImg.url}
                alt="Dr. Farida, Founder and Principal of For Tomorrow"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-80 w-full object-cover"
              />
              <div className="p-6">
                <div className="text-display text-2xl">Dr. Farida</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Founder & Principal
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {EXPERTISE.map((e) => (
                    <span
                      key={e}
                      className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80"
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={SOCIAL.linkedin}
                    {...externalLink}
                    className="rounded-full px-4 py-2 text-xs font-medium text-white"
                    style={{ background: "#0a66c2" }}
                  >
                    Connect on LinkedIn →
                  </a>
                  <Link
                    to="/book"
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                  >
                    Book a consultation
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  h: "Consulting enquiries",
                  p: "Strategy, carbon, reporting, verification and certification programmes for organisations of any size.",
                  cta: "Explore services",
                  to: "/" as const,
                  hash: "services",
                },
                {
                  h: "Training enquiries",
                  p: "Executive briefings, technical cohorts and in-house academies through the Sustainability Academy.",
                  cta: "Browse courses",
                  to: "/courses" as const,
                },
                {
                  h: "Partnerships",
                  p: "Standards bodies, assurance networks, universities and technology partners.",
                  cta: "Write to us",
                  to: "/contact" as const,
                },
                {
                  h: "Media & speaking",
                  p: "Panels, keynotes, podcasts and contributed thought leadership.",
                  cta: "Watch on YouTube",
                  external: SOCIAL.youtube,
                },
              ].map((c) => (
                <div
                  key={c.h}
                  className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="text-display text-xl">{c.h}</div>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.p}</p>
                  {c.external ? (
                    <a
                      href={c.external}
                      {...externalLink}
                      className="mt-4 text-xs font-medium text-[var(--clay)]"
                    >
                      {c.cta} →
                    </a>
                  ) : (
                    <Link
                      to={c.to}
                      hash={c.hash}
                      className="mt-4 text-xs font-medium text-[var(--clay)]"
                    >
                      {c.cta} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-14">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">FAQ</div>
          <div className="space-y-2 text-sm">
            {[
              ["How quickly will you respond?", "Within one business day, always."],
              [
                "What happens after I submit?",
                "A short discovery call to understand your context, followed by a tailored proposal.",
              ],
              ["Is my information confidential?", "Yes — every conversation and document is treated under NDA."],
              [
                "Can we start with a workshop?",
                "Executive briefings and materiality workshops are common first engagements.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-border bg-card/80 p-4 open:shadow-lift">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-border bg-card/70 p-10 text-center shadow-lift backdrop-blur">
            <div className="text-display text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Ready when you are.
            </div>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Start with a conversation, or take the company profile to your team.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                to="/book"
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--ink)" }}
              >
                Book a consultation →
              </Link>
              <a
                href="/for-tomorrow-company-profile.pdf"
                download
                className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-[var(--leaf)]"
              >
                Download company profile
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function OptionCard({
  label,
  value,
  to,
  href,
  external,
  accent,
}: {
  label: string;
  value: string;
  to?: "/book";
  href?: string;
  external?: boolean;
  accent: string;
}) {
  const inner = (
    <>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      <div
        className="mt-4 inline-block text-xs transition-transform group-hover:translate-x-1"
        style={{ color: accent }}
      >
        →
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: accent }}
      />
    </>
  );
  const cls =
    "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift";
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...(external ? externalLink : {})}>
      {inner}
    </a>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)] ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <div className="mt-1 text-[11px] text-destructive">{error}</div>}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]"
      >
        {!required && <option value="">Select…</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
