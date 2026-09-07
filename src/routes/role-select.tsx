import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { ROLES } from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import type { RoleId } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { logEvent } from "@/lib/analytics";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "Choose Your Role, Tomorrow Matrix" },
      { name: "description", content: "Pick a stakeholder. Each role sees a unique piece of the climate puzzle." },
    ],
  }),
  component: RoleSelect,
});

function RoleSelect() {
  const navigate = useNavigate();
  const setRole = useGame((s) => s.setRole);
  const [selected, setSelected] = useState<RoleId | null>(null);
  const current = ROLES.find((r) => r.id === selected) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Step 2 of 8</span>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Choose your role</h1>
          <p className="mt-3 text-muted-foreground">
            Each stakeholder sees the world differently. Your role shapes the data you can access, the missions you receive, and the way you change Terra's future.
          </p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_360px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => {
              const isSel = selected === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={cn(
                    "surface-card group relative overflow-hidden p-4 text-left transition-all",
                    isSel ? "ring-2 ring-[color:var(--terra)] glow-terra" : "card-hover",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "pill",
                      r.accent === "terra" && "chip-terra",
                      r.accent === "warmth" && "chip-warmth",
                      r.accent === "stone" && "chip-stone",
                    )}>{r.focus}</span>
                    {isSel && (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--terra)] text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{r.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
                  <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Reward</div>
                  <div className="text-sm font-medium text-[color:var(--terra-deep)]">{r.rewardLabel}</div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <aside className="surface-lift sticky top-6 h-fit p-5">
            {current ? (
              <>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Selected role</div>
                <h2 className="mt-1 font-display text-2xl font-semibold">{current.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{current.focus}</p>

                <div className="mt-4 rounded-xl bg-[color:var(--terra-soft)] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">Personal mission</div>
                  <div className="mt-1 text-sm text-foreground">{current.mission}</div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Information access</div>
                  <ul className="mt-2 space-y-1.5">
                    {current.access.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--terra)]" />{a}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => { setRole(current.id); logEvent("game_start", { role: current.id }); navigate({ to: "/play" }); }}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Confirm role <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-muted" />
                  Select a role to see their mission, data access, and reward.
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
