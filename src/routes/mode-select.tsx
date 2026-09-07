import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Bot, Users, ClipboardCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { supabase } from "@/integrations/supabase/client";
import type { GameMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mode-select")({
  head: () => ({ meta: [{ title: "Choose Game Mode, Tomorrow Matrix" }] }),
  component: ModeSelect,
});

type ModeOption = {
  id: GameMode | "facilitator";
  icon: typeof User;
  label: string;
  tagline: string;
  description: string;
};

const MODES: ModeOption[] = [
  { id: "solo", icon: User, label: "Solo Mode",
    tagline: "Just you and Terra",
    description: "Play through every mystery, crisis and intervention on your own. Best for first-time players." },
  { id: "ai-team", icon: Bot, label: "Solo with AI Team",
    tagline: "Recruit AI stakeholders",
    description: "Pull in AI scientists, farmers, activists, policymakers and business leaders. Each one offers their perspective as you play." },
  { id: "multiplayer", icon: Users, label: "Multiplayer",
    tagline: "Play with your team",
    description: "Create a session and share a code. 2–6 players solve mysteries together, vote on crises and share Terra's fate." },
  { id: "facilitator", icon: ClipboardCheck, label: "Workshop / Facilitator",
    tagline: "Run a guided session",
    description: "Open a facilitator console: share a join code, pace the room, inject crises on demand, and watch analytics live." },
];

function ModeSelect() {
  const navigate = useNavigate();
  const setMode = useGame((s) => s.setMode);
  const setPlayer = useGame((s) => s.setPlayer);
  const playerName = useGame((s) => s.playerName);

  // Prompt for a name when the player hasn't set one yet (e.g. they came in via
  // the How-to-Play page and skipped the landing name entry).
  const needsName = !playerName;
  const [name, setName] = useState("");
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!needsName) return;
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return;
      const meta = (data.user.user_metadata ?? {}) as { full_name?: string; name?: string };
      const { data: prof } = await supabase
        .from("profiles").select("display_name").eq("id", data.user.id).maybeSingle();
      const dn = prof?.display_name ?? meta.full_name ?? meta.name ?? null;
      if (dn && !cancelled) { setDisplay(dn); setName((n) => n || dn); }
    });
    return () => { cancelled = true; };
  }, [needsName]);

  const choose = (m: ModeOption["id"]) => {
    if (needsName) setPlayer(name.trim() || display || "Guest");
    if (m === "facilitator") {
      navigate({ to: "/lobby", search: { facilitator: true } });
      return;
    }
    setMode(m);
    if (m === "ai-team") navigate({ to: "/recruit" });
    else if (m === "multiplayer") navigate({ to: "/lobby" });
    else navigate({ to: "/role-select" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Step 1 of 8</span>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Choose how you play</h1>
          <p className="mt-3 text-muted-foreground">
            Tomorrow Matrix is built for solo discovery, AI-augmented sessions and team workshops.
          </p>
        </header>

        {needsName && (
          <div className="mt-8 max-w-md">
            <label htmlFor="tm-player-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your player name
            </label>
            <input
              id="tm-player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Choose a player name (optional)"
              className="mt-2 h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none ring-ring/30 transition-all focus:border-[color:var(--terra)] focus:ring-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This is how you'll appear in the game. Pick a mode below to begin.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => choose(m.id)}
                className={cn(
                  "surface-card group relative flex h-full flex-col gap-4 p-6 text-left transition-all card-hover",
                )}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[image:var(--gradient-terra)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{m.label}</h2>
                  <div className="text-xs uppercase tracking-wider text-[color:var(--terra-deep)]">{m.tagline}</div>
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <div className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[color:var(--terra-deep)]">
                  Start <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
