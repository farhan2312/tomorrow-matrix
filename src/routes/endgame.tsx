import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame } from "@/lib/game/store";
import { HealthGauge } from "@/components/game/HealthGauge";
import terraGlobe from "@/assets/terra-globe.jpg";

export const Route = createFileRoute("/endgame")({
  head: () => ({ meta: [{ title: "Endgame — Tomorrow Matrix" }] }),
  component: Endgame,
});

function Endgame() {
  const { planetHealth, year, solvedMysteries, purchasedInterventions, reset } = useGame();
  const won = planetHealth >= 70;
  const partial = planetHealth >= 50 && planetHealth < 70;

  const headline = won
    ? "Terra is restored."
    : partial
      ? "A fragile recovery."
      : "The choices weren't enough — yet.";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,var(--terra-soft),transparent_65%)]" />
          <img src={terraGlobe} alt="" width={1024} height={1024} className="w-full animate-float" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Year {year}</div>
          <h1 className="mt-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight">{headline}</h1>
          <p className="mt-4 text-muted-foreground">
            {won
              ? "Through investigation, investment and timely crisis response, you brought Terra back from the brink. Future generations will study how this turned around."
              : partial
                ? "Terra is healing, but the recovery is fragile. Another session — different choices — could push it further."
                : "Terra needs more decisive action. Replay with a different role to see how the system responds to a new perspective."}
          </p>
          <div className="mt-6 flex items-center gap-6">
            <HealthGauge value={planetHealth} size={140} />
            <div className="space-y-1.5 text-sm">
              <Row k="Mysteries solved" v={String(solvedMysteries.length)} />
              <Row k="Interventions" v={String(purchasedInterventions.length)} />
              <Row k="Final year" v={String(year)} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/play" className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              Back to game
            </Link>
            <button
              onClick={() => { reset(); window.location.href = "/"; }}
              className="inline-flex items-center rounded-xl bg-[image:var(--gradient-terra)] px-5 py-2 text-sm font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
            >
              Start a new session
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border pb-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-display text-base font-semibold tabular-nums">{v}</span>
    </div>
  );
}
