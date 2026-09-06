import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Bot, Check } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ROLES } from "@/lib/game/data";
import { AI_ROSTER } from "@/lib/game/ai-team";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recruit")({
  head: () => ({ meta: [{ title: "Recruit Your AI Team, Tomorrow Matrix" }] }),
  component: Recruit,
});

function Recruit() {
  const navigate = useNavigate();
  const setAiTeam = useGame((s) => s.setAiTeam);
  const [picked, setPicked] = useState<string[]>(AI_ROSTER.slice(0, 3).map((t) => t.id));

  const toggle = (id: string) => {
    setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length >= 5 ? p : [...p, id]);
  };

  const confirm = () => {
    setAiTeam(AI_ROSTER.filter((t) => picked.includes(t.id)));
    navigate({ to: "/role-select" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/mode-select" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recruit · {picked.length}/5 selected</span>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <header className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-[color:var(--terra-deep)]"><Bot className="h-3.5 w-3.5" /> AI Team Mode</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Build your stakeholder cabinet</h1>
          <p className="mt-3 text-muted-foreground">
            Each AI teammate brings a perspective rooted in their role. Pick 3–5 voices to join your sessions.
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_ROSTER.map((t) => {
            const r = ROLES.find((x) => x.id === t.role)!;
            const isSel = picked.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggle(t.id)}
                className={cn("surface-card flex items-start gap-3 p-4 text-left transition-all",
                  isSel ? "ring-2 ring-[color:var(--terra)]" : "card-hover")}>
                <div className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold uppercase",
                  r.accent === "terra"  && "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]",
                  r.accent === "warmth" && "bg-[color:var(--warmth-soft)] text-[oklch(0.45_0.12_50)]",
                  r.accent === "stone"  && "bg-muted text-muted-foreground",
                )}>{t.name.split(" ").map(p => p[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-base font-semibold truncate">{t.name}</div>
                    {isSel && <Check className="h-4 w-4 text-[color:var(--terra-deep)]" />}
                  </div>
                  <div className="text-xs text-muted-foreground">AI {r.name}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{r.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-end">
          <button onClick={confirm} disabled={picked.length < 1}
            className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
            Confirm team <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
