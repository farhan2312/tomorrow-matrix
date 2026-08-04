import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { NetworkBackground, FloatingParticles } from "@/components/site/NetworkBackground";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { services } from "@/lib/services-data";

const searchSchema = z.object({ service: z.string().optional().catch("") });

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Book a consultation — For Tomorrow" },
      { name: "description", content: "Schedule a sustainability consultation with For Tomorrow — strategy, carbon, reporting, verification, ratings, training." },
      { property: "og:title", content: "Book a consultation — For Tomorrow" },
      { property: "og:description", content: "A frictionless, premium booking flow for your first sustainability conversation." },
    ],
  }),
  component: BookPage,
});

const TYPES = ["Online", "In-person", "Phone"];
const DURATIONS = ["30 min", "45 min", "60 min"];
const SIZES = ["<50", "50–250", "250–1,000", "1,000–10,000", "10,000+"];
const MATURITY = ["Just starting", "Building foundations", "Multi-framework", "Assured / listed"];

function makeSlots() {
  const now = new Date();
  const days: { date: string; slots: string[] }[] = [];
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    days.push({
      date: d.toDateString(),
      slots: ["09:00", "10:30", "13:00", "14:30", "16:00"].filter(() => Math.random() > 0.2),
    });
  }
  return days;
}

function BookPage() {
  const { service } = Route.useSearch();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({
    service: service || "General consultation",
    type: "Online",
    duration: "45 min",
    date: "", time: "",
    name: "", org: "", role: "", email: "", phone: "", country: "",
    size: "", industry: "",
    maturity: "", challenge: "", frameworks: "", timeline: "", message: "",
  });
  const [days] = useState(makeSlots);
  const [done, setDone] = useState(false);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const canNext = () => {
    if (step === 0) return !!form.service;
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.duration;
    if (step === 3) return !!form.date && !!form.time;
    if (step === 4) {
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
      return form.name.trim() && form.org.trim() && emailOk;
    }
    if (step === 5) return true;
    return true;
  };
  const next = () => {
    if (!canNext()) { toast.error("Please complete the required fields."); return; }
    if (step === 5) {
      setDone(true);
      toast.success("Consultation request received — we'll confirm within one business day.");
    }
    setStep(step + 1);
  };
  const back = () => setStep(Math.max(0, step - 1));

  const downloadIcs = () => {
    const dt = new Date(`${form.date} ${form.time}`);
    const end = new Date(dt.getTime() + 45 * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:For Tomorrow — ${form.service}\nDTSTART:${fmt(dt)}\nDTEND:${fmt(end)}\nDESCRIPTION:Consultation with For Tomorrow\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "for-tomorrow.ics"; a.click();
    URL.revokeObjectURL(url);
  };

  const steps = ["Service", "Type", "Duration", "Date", "You", "Project", "Confirm"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NetworkBackground />
      <FloatingParticles />
      <Nav />
      <main className="relative z-10 pt-32">
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Book consultation" }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]">
            Schedule your <em className="text-gradient-brand">sustainability consultation</em>.
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A working session with Dr. Farida to understand your context and shape the
            fastest credible path forward.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          {/* Progress */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {steps.map((s, i) => {
              const on = i <= (done ? 6 : step);
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-mono ${on ? "text-white" : "text-muted-foreground"}`}
                    style={{ background: on ? "var(--leaf)" : "var(--mist)" }}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest ${on ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-lift backdrop-blur md:p-10">
            {done ? (
              <div className="py-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white"
                  style={{ background: "var(--leaf)" }}>
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.div>
                <h2 className="text-display text-3xl">You're on the calendar</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  We've received your request for a <strong>{form.duration}</strong> {form.type.toLowerCase()} session on <strong>{form.date}</strong> at <strong>{form.time}</strong>. A confirmation with the meeting link will land in your inbox within one business day.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button onClick={downloadIcs} className="rounded-full px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--ink)" }}>Add to calendar</button>
                  <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Back to home</Link>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  {step === 0 && (
                    <Step title="Which service is this about?">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {["General consultation", ...services.map((s) => s.title)].map((s) => (
                          <ChoiceCard key={s} label={s} active={form.service === s} onClick={() => set("service", s)} />
                        ))}
                      </div>
                    </Step>
                  )}
                  {step === 1 && (
                    <Step title="How would you like to meet?">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {TYPES.map((t) => <ChoiceCard key={t} label={t} active={form.type === t} onClick={() => set("type", t)} />)}
                      </div>
                    </Step>
                  )}
                  {step === 2 && (
                    <Step title="How long should we hold?">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {DURATIONS.map((d) => <ChoiceCard key={d} label={d} active={form.duration === d} onClick={() => set("duration", d)} />)}
                      </div>
                    </Step>
                  )}
                  {step === 3 && (
                    <Step title="Pick a date and time">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="max-h-80 overflow-y-auto rounded-2xl border border-border p-3">
                          {days.map((d) => (
                            <button key={d.date} onClick={() => set("date", d.date)}
                              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${form.date === d.date ? "bg-[var(--mist)] font-medium" : "hover:bg-[var(--mist)]"}`}>
                              {d.date}
                              <span className="text-[10px] text-muted-foreground">{d.slots.length} slots</span>
                            </button>
                          ))}
                        </div>
                        <div className="rounded-2xl border border-border p-3">
                          {form.date ? (
                            <div className="grid grid-cols-3 gap-2">
                              {(days.find((d) => d.date === form.date)?.slots ?? []).map((t) => (
                                <button key={t} onClick={() => set("time", t)}
                                  className={`rounded-lg border px-3 py-2 text-sm ${form.time === t ? "border-transparent text-white" : "border-border hover:border-[var(--leaf)]"}`}
                                  style={form.time === t ? { background: "var(--leaf)" } : undefined}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          ) : <div className="text-sm text-muted-foreground">Select a date to see times.</div>}
                        </div>
                      </div>
                    </Step>
                  )}
                  {step === 4 && (
                    <Step title="A little about you">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Full name *" value={form.name} onChange={(v: string) => set("name", v)} />
                        <Field label="Organisation *" value={form.org} onChange={(v: string) => set("org", v)} />
                        <Field label="Role" value={form.role} onChange={(v: string) => set("role", v)} />
                        <Field label="Email *" value={form.email} onChange={(v: string) => set("email", v)} type="email" />
                        <Field label="Phone" value={form.phone} onChange={(v: string) => set("phone", v)} />
                        <Field label="Country" value={form.country} onChange={(v: string) => set("country", v)} />
                        <Select label="Company size" value={form.size} onChange={(v: string) => set("size", v)} options={SIZES} />
                        <Field label="Industry" value={form.industry} onChange={(v: string) => set("industry", v)} />
                      </div>
                    </Step>
                  )}
                  {step === 5 && (
                    <Step title="Project details">
                      <div className="grid gap-3">
                        <Select label="Current ESG maturity" value={form.maturity} onChange={(v: string) => set("maturity", v)} options={MATURITY} />
                        <Field label="Primary challenge" value={form.challenge} onChange={(v: string) => set("challenge", v)} />
                        <Field label="Frameworks involved (comma separated)" value={form.frameworks} onChange={(v: string) => set("frameworks", v)} />
                        <Field label="Timeline" value={form.timeline} onChange={(v: string) => set("timeline", v)} />
                        <div>
                          <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Message</label>
                          <textarea rows={4} value={form.message} onChange={(e) => set("message", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]" />
                        </div>
                      </div>
                    </Step>
                  )}
                  {step === 6 && (
                    <Step title="Confirm your session">
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <Sum k="Service" v={form.service} />
                        <Sum k="Type" v={form.type} />
                        <Sum k="Duration" v={form.duration} />
                        <Sum k="When" v={`${form.date} · ${form.time}`} />
                        <Sum k="Name" v={form.name} />
                        <Sum k="Email" v={form.email} />
                        <Sum k="Organisation" v={form.org} />
                        <Sum k="Country" v={form.country} />
                      </div>
                    </Step>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {!done && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
                <button onClick={back} disabled={step === 0}
                  className="rounded-full border border-border px-5 py-2 text-sm disabled:opacity-40">← Back</button>
                <button onClick={next}
                  className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
                  style={{ background: "var(--ink)" }}>
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {step === 6 ? "Confirm booking" : "Continue"}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">This step</div>
      <div className="mt-1 mb-5 text-display text-2xl">{title}</div>
      {children}
    </div>
  );
}
function ChoiceCard({ label, active, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`rounded-xl border p-4 text-left text-sm transition ${active ? "border-transparent text-white shadow-lift" : "border-border hover:border-[var(--leaf)]"}`}
      style={active ? { background: "var(--leaf)" } : undefined}>
      {label}
    </button>
  );
}
function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]" />
    </div>
  );
}
function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[var(--leaf)]">
        <option value="">—</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Sum({ k, v }: any) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-foreground/85">{v || "—"}</div>
    </div>
  );
}
