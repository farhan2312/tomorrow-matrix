import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Check, Sparkles, Target, Trophy, Play as PlayIcon } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ROLES } from "@/lib/game/data";
import {
  ROLE_MISSIONS, ROLE_LEVELS, ROLE_QUESTIONS,
  CHALLENGE_TEMPLATES, levelFor, nextLevel, questionsByRole, buildChallengeQuestionIds,
  type ChallengeKind,
} from "@/lib/game/roles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/role")({
  head: () => ({ meta: [{ title: "Role Dashboard — Tomorrow Matrix" }] }),
  component: RoleDashboard,
});

function RoleDashboard() {
  const role = useGame((s) => s.role);
  const progress = useGame((s) => (role ? s.roleProgress[role] : undefined));
  const queueChallenge = useGame((s) => s.queueChallenge);
  const roleData = ROLES.find((r) => r.id === role);

  if (!role || !roleData) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Pick a role first.</p>
        <Link to="/role-select" className="mt-3 inline-block text-sm text-[color:var(--terra-deep)] hover:underline">Choose role →</Link>
      </main>
    );
  }

  const xp = progress?.xp ?? 0;
  const current = levelFor(role, xp);
  const next = nextLevel(role, xp);
  const ladder = ROLE_LEVELS[role];
  const missions = ROLE_MISSIONS[role];
  const completedIds = new Set(progress?.completedMissions ?? []);
  const attempts = progress?.attempts ?? [];
  const badges = progress?.badges ?? [];
  const answeredIds = attempts.map((a) => a.questionId);

  const allQs = questionsByRole(role);
  const mcq = allQs.filter((q) => q.kind === "mcq");
  const scenario = allQs.filter((q) => q.kind === "scenario");
  const reflection = allQs.filter((q) => q.kind === "reflection");
  const ansMcq = attempts.filter((a) => a.kind === "mcq");
  const ansScen = attempts.filter((a) => a.kind === "scenario");
  const ansRefl = attempts.filter((a) => a.kind === "reflection");
  const correctMcq = ansMcq.filter((a) => a.correct).length;
  const answeredAll = allQs.length > 0 && allQs.every((q) => answeredIds.includes(q.id));

  const toNext = next ? Math.max(0, next.minXp - xp) : 0;
  const pct = next ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)) : 100;

  // Per-kind launchers — only enabled when there are unanswered questions of that template
  const launchers: { kind: ChallengeKind; label: string; ready: boolean }[] = (
    ["orientation", "mission", "reflection", "assessment"] as ChallengeKind[]
  ).map((k) => ({
    kind: k,
    label: CHALLENGE_TEMPLATES[k].title,
    ready: buildChallengeQuestionIds(k, role, answeredIds).length > 0,
  }));

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 md:px-6">
      {/* ---- Header ---- */}
      <header className="surface-lift overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_340px]">
          <div>
            <span className={cn("pill",
              roleData.accent === "terra" && "chip-terra",
              roleData.accent === "warmth" && "chip-warmth",
              roleData.accent === "stone" && "chip-stone",
            )}>{roleData.focus}</span>
            <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{roleData.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{roleData.mission}</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <Tile icon={<Trophy className="h-3 w-3" />} label="Level" value={`${current.level}`} sub={current.title} accent="terra" />
              <Tile icon={<Sparkles className="h-3 w-3" />} label="Role XP" value={String(xp)} />
              <Tile icon={<Award className="h-3 w-3" />} label="CAP earned" value={String(progress?.capFromRole ?? 0)} accent="terra" />
              <Tile icon={<BookOpen className="h-3 w-3" />} label="Questions" value={`${answeredIds.length}/${allQs.length}`} />
            </div>
          </div>
          <aside className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Progression</div>
            <ul className="mt-2 space-y-2">
              {ladder.map((l) => {
                const done = xp >= l.minXp;
                const isCurrent = l.level === current.level;
                return (
                  <li key={l.level} className={cn("flex items-center gap-2 text-sm", !done && "text-muted-foreground")}>
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold",
                      done ? "bg-[color:var(--terra)] text-white" : "bg-muted text-muted-foreground",
                    )}>{l.level}</span>
                    <span className={cn("flex-1 truncate", isCurrent && "font-semibold")}>{l.title}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{l.minXp} XP</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{next ? `Next: ${next.title}` : "Max level reached"}</span>
                <span>{next ? `${toNext} XP to go` : ""}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </aside>
        </div>
      </header>

      {/* ---- Knowledge progress strip ---- */}
      <section className="grid gap-3 md:grid-cols-3">
        <ProgressTile label="Multiple choice" current={ansMcq.length} total={mcq.length} sub={`${correctMcq} correct`} />
        <ProgressTile label="Scenarios" current={ansScen.length} total={scenario.length} sub="Stakeholder decisions" />
        <ProgressTile label="Reflections" current={ansRefl.length} total={reflection.length} sub="Personal commitments" />
      </section>

      {/* ---- Challenge launchers + Missions ---- */}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Launch a Role Challenge */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Role challenges</h2>
                <p className="text-xs text-muted-foreground">Earn Climate Action Points by completing stakeholder challenges.</p>
              </div>
              {answeredAll && <span className="pill chip-terra"><Check className="h-3 w-3" /> All complete</span>}
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {launchers.map((l) => {
                const tmpl = CHALLENGE_TEMPLATES[l.kind];
                return (
                  <li key={l.kind}>
                    <button
                      onClick={() => l.ready && queueChallenge(l.kind)}
                      disabled={!l.ready}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-all",
                        l.ready
                          ? "border-border bg-card hover:border-[color:var(--terra)] hover:bg-[color:var(--terra-soft)]/40"
                          : "border-dashed border-border bg-muted/30 opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{l.label}</span>
                        <span className="pill chip-warmth font-mono">+{tmpl.baseBonus} CAP</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{tmpl.subtitle}</div>
                      {l.ready && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[color:var(--terra-deep)]">
                          <PlayIcon className="h-3 w-3" /> Launch
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Tip: challenges also appear automatically — after role select, every 2 mysteries, after each crisis, and at tier completion.
            </p>
          </div>

          {/* Role missions */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2"><Target className="h-4 w-4" /> Role missions</h2>
                <p className="text-xs text-muted-foreground">Passive objectives — completed by playing.</p>
              </div>
              <span className="pill chip-terra">{completedIds.size}/{missions.length}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {missions.map((m) => {
                const done = completedIds.has(m.id);
                return (
                  <li key={m.id} className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    done ? "border-[color:var(--terra)]/50 bg-[color:var(--terra-soft)]/40" : "border-border bg-card",
                  )}>
                    <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      done ? "bg-[color:var(--terra)] text-white" : "bg-muted text-muted-foreground",
                    )}>
                      {done ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{m.title}</span>
                        <span className="pill chip-warmth font-mono">+{m.reward} CAP</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{m.description}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          {/* Badges */}
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold inline-flex items-center gap-2"><Award className="h-4 w-4" /> Badges</h2>
            {badges.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Complete missions and assessments to earn badges.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {badges.map((b) => (
                  <span key={b} className="pill chip-terra">{prettyBadge(b)}</span>
                ))}
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <BonusChip label="Completion bonus (+20)" earned={!!progress?.completionBonusGranted} />
              <BonusChip label="Perfect score (+30)" earned={!!progress?.perfectBonusGranted} />
            </div>
          </div>

          {/* Recent answers */}
          <div className="surface-card p-5">
            <h2 className="font-display text-sm font-semibold">Recent answers</h2>
            {attempts.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Your stakeholder answers will appear here.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {[...attempts].slice(-6).reverse().map((a) => {
                  const qn = ROLE_QUESTIONS.find((q) => q.id === a.questionId);
                  return (
                    <li key={`${a.questionId}-${a.ts}`} className="rounded-lg border border-border bg-background p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">{qn?.prompt.slice(0, 60) ?? a.questionId}…</span>
                        <span className={cn("font-mono", a.correct ? "text-[color:var(--terra-deep)]" : "text-muted-foreground")}>+{a.cap}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Tile({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: "terra" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className={cn("mt-1 font-display text-sm font-semibold tabular-nums", accent === "terra" && "text-[color:var(--terra-deep)]")}>
        {value}
      </div>
      {sub && <div className="truncate text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ProgressTile({ label, current, total, sub }: { label: string; current: number; total: number; sub: string }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-muted-foreground">{current}/{total}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function BonusChip({ label, earned }: { label: string; earned: boolean }) {
  return (
    <span className={cn(
      "rounded-md border px-2 py-1 text-center",
      earned ? "border-[color:var(--terra)]/40 bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]" : "border-dashed border-border text-muted-foreground",
    )}>
      {earned ? "✓ " : ""}{label}
    </span>
  );
}

function prettyBadge(id: string): string {
  if (id === "questionnaire-complete") return "All 15 answered";
  if (id === "perfect-score") return "Perfect score";
  if (id.startsWith("assessment-")) return "Role badge";
  if (id.startsWith("sci-") || id.startsWith("farm-") || id.startsWith("pol-") || id.startsWith("act-") || id.startsWith("biz-") || id.startsWith("plan-") || id.startsWith("com-") || id.startsWith("stu-")) return "Mission";
  return id;
}
