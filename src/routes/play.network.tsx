import { createFileRoute } from "@tanstack/react-router";
import { SystemsMap } from "@/components/game/SystemsMap";
import { useGame } from "@/lib/game/store";
import { visibleMysteries, CRISES } from "@/lib/game/data";

export const Route = createFileRoute("/play/network")({
  head: () => ({
    meta: [
      { title: "Butterfly Network, Tomorrow Matrix" },
      { name: "description", content: "See how every climate mystery cascades into another. The systems-thinking engine of Terra." },
    ],
  }),
  component: SystemsPage,
});

function SystemsPage() {
  const role = useGame((s) => s.role);
  const solved = useGame((s) => s.solvedMysteries);
  const resolvedCrises = useGame((s) => s.resolvedCrises);
  const visible = visibleMysteries(role);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Systems thinking</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">The Butterfly Network</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every climate mystery is connected. Solve one and watch the cascade light up other
            mysteries downstream, exactly how the real climate system behaves. Click any node to
            see what influences it, what it influences, and which crisis events it can trigger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill chip-terra">{solved.length} solved</span>
          <span className="pill chip-stone">{visible.length} visible to your role</span>
          <span className="pill chip-warmth">{resolvedCrises.length}/{CRISES.length} crises faced</span>
        </div>
      </header>

      <SystemsMap />
    </main>
  );
}
