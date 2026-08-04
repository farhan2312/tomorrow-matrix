import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NetworkBackground, FloatingParticles } from "@/components/site/NetworkBackground";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { getCourse, COURSES, type Course } from "@/lib/courses-data";
import { SOCIAL, externalLink } from "@/lib/site-links";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }): { course: Course } => {
    const course = getCourse(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Course unavailable — For Tomorrow" }, { name: "robots", content: "noindex" }],
      };
    }
    const c = loaderData.course;
    const title = `${c.title} — Sustainability Academy | For Tomorrow`;
    return {
      meta: [
        { title },
        { name: "description", content: c.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: c.summary.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CourseRegistrationPage,
});

const FIELDS = [
  ["name", "Full name *"],
  ["email", "Email *"],
  ["phone", "Phone"],
  ["org", "Organisation"],
  ["country", "Country"],
  ["role", "Job title"],
] as const;

function CourseRegistrationPage() {
  const { course } = Route.useLoaderData() as { course: Course };
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
    country: "",
    role: "",
    experience: "",
    batch: course.schedule[0]?.batch ?? "",
    questions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errs.email = "Enter a valid email.";
    if (form.phone && form.phone.trim().length < 6) errs.phone = "Enter a valid phone number.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSent(true);
    toast.success("Registration received — we'll confirm your seat within one business day.");
  };

  const related = COURSES.filter((c) => c.id !== course.id).slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NetworkBackground />
      <FloatingParticles />
      <Nav />
      <main className="relative z-10 pt-32">
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <Breadcrumbs
            items={[{ label: "Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: course.title }]}
          />
          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="rounded-full bg-[color-mix(in_oklab,var(--leaf)_15%,white)] px-2 py-0.5 text-[var(--forest)]">
              {course.level}
            </span>
            <span>· {course.duration}</span>
            <span>· {course.delivery}</span>
            {course.flagship && <span className="text-[var(--clay)]">★ Flagship</span>}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.03]"
          >
            {course.title}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{course.summary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact k="Instructor" v={course.instructor} />
            <Fact k="Duration" v={course.duration} />
            <Fact k="Delivery mode" v={course.delivery} />
            <Fact k="Certificate" v={course.certificate} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="#register"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--ink)" }}
            >
              Enrol now →
            </a>
            <a
              href="#curriculum"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--leaf)]"
            >
              View curriculum
            </a>
            <a
              href={SOCIAL.youtube}
              {...externalLink}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--ember)]"
            >
              Watch on YouTube
            </a>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-3">
          <Panel title="Learning outcomes">
            <ul className="space-y-2 text-sm text-foreground/85">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="text-[var(--leaf)]">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Who it's for">
            <ul className="space-y-2 text-sm text-foreground/85">
              {course.audience.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="text-[var(--clay)]">→</span>
                  {a}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Prerequisites & certificate">
            <p className="text-sm text-foreground/85">{course.prerequisites}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              On completion you receive the <strong className="text-foreground">{course.certificate}</strong>,
              issued by For Tomorrow.
            </p>
          </Panel>
        </section>

        <section id="curriculum" className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Curriculum · {course.modules.length} modules
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {course.modules.map((m, i) => (
              <motion.div
                key={m}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {m}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Upcoming schedule
              </div>
              <div className="space-y-2">
                {course.schedule.map((s) => (
                  <div
                    key={s.batch}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div>
                      <div className="text-sm font-medium">{s.batch}</div>
                      <div className="text-xs text-muted-foreground">{s.mode}</div>
                    </div>
                    <div className="font-mono text-xs text-[var(--forest)]">{s.dates}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Investment
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="text-display text-3xl">{course.price}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Group, in-house and multi-cohort rates available. Fees include materials, live
                  sessions, assessment and certification.
                </p>
                <Link
                  to="/contact"
                  search={{ course: course.id }}
                  className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-[var(--leaf)]"
                >
                  Request a quote →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="register" className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-lift backdrop-blur md:p-8">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Registration
            </div>
            <div className="mt-1 mb-6 text-display text-3xl">Reserve your seat</div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-[var(--leaf)] bg-[color-mix(in_oklab,var(--leaf)_10%,white)] p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
                    style={{ background: "var(--forest)" }}
                  >
                    ✓
                  </motion.div>
                  <div className="text-display text-2xl">
                    You're registered, {form.name.split(" ")[0]}.
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your place on <strong className="text-foreground">{course.title}</strong> (
                    {form.batch}) is reserved. A confirmation email with joining details and
                    pre-reading is on its way to {form.email}.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link
                      to="/courses"
                      className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
                      style={{ background: "var(--ink)" }}
                    >
                      Browse more courses
                    </Link>
                    <Link
                      to="/book"
                      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--leaf)]"
                    >
                      Book a consultation
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                  {FIELDS.map(([k, label]) => (
                    <Field
                      key={k}
                      label={label}
                      value={form[k]}
                      error={errors[k]}
                      onChange={(v) => set(k, v)}
                      type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                    />
                  ))}
                  <div>
                    <Label>Previous experience</Label>
                    <select
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]"
                    >
                      {["", "None", "Under 2 years", "2–5 years", "5+ years"].map((o) => (
                        <option key={o} value={o}>
                          {o || "Select…"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Preferred batch</Label>
                    <select
                      value={form.batch}
                      onChange={(e) => set("batch", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]"
                    >
                      {course.schedule.map((s) => (
                        <option key={s.batch}>{s.batch}</option>
                      ))}
                      <option>Flexible / future cohort</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Questions for the instructor</Label>
                    <textarea
                      rows={4}
                      value={form.questions}
                      onChange={(e) => set("questions", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                      style={{ background: "var(--ink)" }}
                    >
                      Complete registration →
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Related courses
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {related.map((c) => (
              <Link
                key={c.id}
                to="/courses/$courseId"
                params={{ courseId: c.id }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.level} · {c.duration}
                </div>
                <div className="mt-1 text-display text-xl leading-tight">{c.title}</div>
                <div className="mt-3 text-xs text-[var(--clay)] transition-transform group-hover:translate-x-1">
                  View course →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-1 text-sm font-medium">{v}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{title}</div>
      {children}
    </div>
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
