import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame } from "@/lib/game/store";
import { ROLES, MYSTERIES, INTERVENTIONS } from "@/lib/game/data";

export const Route = createFileRoute("/play/journal")({
  component: Journal,
});

function Journal() {
  const { role, cap, planetHealth, solvedMysteries, purchasedInterventions, resolvedCrises, feed } = useGame();
  const roleData = ROLES.find((r) => r.id === role);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Journal</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Your Terra Log</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Terra health" value={`${planetHealth}%`} />
        <Stat label="CAP balance"  value={String(cap)} />
        <Stat label="Mysteries"    value={`${solvedMysteries.length} / ${MYSTERIES.length}`} />
        <Stat label="Interventions" value={`${purchasedInterventions.length} / ${INTERVENTIONS.length}`} />
        <Stat label="Crises resolved" value={String(resolvedCrises.length)} />
        <Stat label="Role" value={roleData?.name ?? "-"} />
      </div>

      {roleData && (
        <section className="surface-card p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Personal mission</div>
          <div className="mt-1 font-display text-lg font-semibold">{roleData.mission}</div>
          <div className="mt-1 text-sm text-[color:var(--terra-deep)]">{roleData.rewardLabel}</div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="font-display text-lg font-semibold">Solved mysteries</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {solvedMysteries.length === 0 && <li className="text-muted-foreground">None yet.</li>}
            {solvedMysteries.map((id) => {
              const m = MYSTERIES.find((x) => x.id === id);
              if (!m) return null;
              return (
                <li key={id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <Link to="/play/mysteries/$id" params={{ id: m.id }} className="hover:underline">{m.title}</Link>
                  <span className="pill chip-terra">+{m.reward} CAP</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="font-display text-lg font-semibold">Activity feed</h2>
          <ul className="mt-3 max-h-80 space-y-2 overflow-auto text-sm">
            {feed.map((f) => <li key={f.id} className="text-muted-foreground">• {f.text}</li>)}
          </ul>
        </div>
      </section>

      {planetHealth >= 70 && (
        <Link to="/endgame" className="block surface-lift bg-[image:var(--gradient-terra)] p-5 text-center text-white shadow-sm">
          <div className="font-display text-xl font-semibold">Terra is restored, see your legacy</div>
          <div className="text-sm opacity-90">Open endgame summary →</div>
        </Link>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
