import { motion } from "framer-motion";

export function LearningDashboard({ tone = "#e9c891" }: { tone?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Your learning dashboard
          </div>
          <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
            A premium LMS, built into every engagement.
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Learners get a real-time view of progress, certificates, quiz scores, live
          sessions, and assignments — no spreadsheets, no chasing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* main panel */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Current course
              </div>
              <div className="text-display text-2xl">Comprehensive Carbon Accounting</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Cohort
              </div>
              <div className="text-sm font-medium">Autumn 2026 · Week 6 / 10</div>
            </div>
          </div>

          {/* progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Overall progress</span>
              <span className="font-mono text-foreground">62%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--mist)]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "62%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${tone}, var(--forest))` }}
              />
            </div>
          </div>

          {/* modules */}
          <div className="mb-6">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Modules
            </div>
            <div className="space-y-1.5">
              {[
                { name: "Climate Fundamentals", state: "done", score: "94%" },
                { name: "GHG Protocol", state: "done", score: "91%" },
                { name: "Boundary Setting", state: "done", score: "88%" },
                { name: "Scope 1–3", state: "done", score: "92%" },
                { name: "Emission Factors", state: "done", score: "89%" },
                { name: "Reporting", state: "current", score: "In progress" },
                { name: "Target Setting", state: "locked", score: "—" },
                { name: "Verification", state: "locked", score: "—" },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-background/40 px-3 py-2 text-[12px]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                      style={{
                        background:
                          m.state === "done" ? tone : m.state === "current" ? "var(--ink)" : "var(--mist)",
                        color: m.state === "locked" ? "var(--muted-foreground)" : "white",
                      }}
                    >
                      {m.state === "done" ? "✓" : m.state === "current" ? "▶" : "○"}
                    </span>
                    <span className={m.state === "locked" ? "text-muted-foreground" : "text-foreground"}>
                      {m.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{m.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* upcoming */}
          <div className="rounded-xl border border-border bg-[color-mix(in_oklab,var(--leaf-soft)_20%,white)] p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: tone }} />
              Upcoming live session
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Scope 3 Workshop · Cat. 1 & 11</div>
                <div className="text-[11px] text-muted-foreground">Thu · 15:00 GMT · Dr. Farida</div>
              </div>
              <button className="rounded-full bg-[var(--ink)] px-4 py-1.5 text-[11px] font-medium text-white">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* side stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Certificates", value: "3", sub: "Earned" },
              { label: "Hours logged", value: "42", sub: "This cohort" },
              { label: "Quiz avg.", value: "91%", sub: "Top decile" },
              { label: "Assignments", value: "8/12", sub: "Submitted" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 text-display text-3xl leading-none" style={{ color: tone }}>
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{s.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Achievement badges
            </div>
            <div className="grid grid-cols-4 gap-3">
              {["GHG Foundations", "Scope Sprint", "Peer Reviewer", "Cohort MVP"].map((b, i) => (
                <div key={b} className="flex flex-col items-center gap-1.5 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg"
                    style={{
                      background:
                        i < 3
                          ? `linear-gradient(135deg, ${tone}, var(--forest))`
                          : "var(--mist)",
                      color: i < 3 ? "white" : "var(--muted-foreground)",
                      boxShadow: i < 3 ? `0 6px 16px -6px ${tone}` : "none",
                    }}
                  >
                    {i < 3 ? "★" : "○"}
                  </motion.div>
                  <div className="text-[9px] uppercase tracking-wider text-foreground/70 leading-tight">
                    {b}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Learning hours (last 8 wks)
            </div>
            <svg viewBox="0 0 200 60" className="h-16 w-full">
              {[3, 5, 4, 6, 8, 7, 9, 8].map((h, i, arr) => {
                const x = (i / (arr.length - 1)) * 190 + 5;
                const y = 55 - (h / 10) * 45;
                return <motion.circle key={i} cx={x} cy={y} r="2.5" fill={tone} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} />;
              })}
              <motion.path
                d={`M ${[3, 5, 4, 6, 8, 7, 9, 8].map((h, i, arr) => {
                  const x = (i / (arr.length - 1)) * 190 + 5;
                  const y = 55 - (h / 10) * 45;
                  return `${x} ${y}`;
                }).join(" L ")}`}
                stroke={tone}
                strokeWidth="1.6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4 }}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

const FORMATS = [
  { title: "Executive Briefings", desc: "90-minute board sessions grounded in your material topics.", icon: "◆" },
  { title: "Board Workshops", desc: "Half-day facilitated deep dives with governance frameworks.", icon: "▲" },
  { title: "Leadership Masterclasses", desc: "Cohort programs for CSOs, CFOs, and heads of sustainability.", icon: "★" },
  { title: "Corporate Cohorts", desc: "12-week programs tailored to a functional team.", icon: "●" },
  { title: "Live Virtual Classes", desc: "Instructor-led sessions with breakout labs.", icon: "◐" },
  { title: "Self-paced Learning", desc: "On-demand modules with quizzes and reflections.", icon: "◇" },
  { title: "On-site Training", desc: "In-person delivery at your offices or sites.", icon: "■" },
  { title: "Certification Bootcamps", desc: "Intensive prep for GHG, GRI, ISSB, and ISO exams.", icon: "✦" },
];

export function LearningFormats({ tone = "#e9c891" }: { tone?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Learning formats
        </div>
        <h2 className="text-display text-[clamp(2rem,3.6vw,3rem)]">
          Every format. Every audience.
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FORMATS.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg transition-transform group-hover:scale-110"
              style={{
                background: `color-mix(in oklab, ${tone} 20%, white)`,
                color: tone,
              }}
            >
              {f.icon}
            </div>
            <div className="text-display text-lg leading-tight">{f.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
