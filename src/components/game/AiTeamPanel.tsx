import { useMemo } from "react";
import { Bot } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ROLES, influencesOf } from "@/lib/game/data";
import { teammateLine, teamContext, downstreamTitles } from "@/lib/game/ai-team";
import type { Mystery } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function AiTeamPanel({ mystery }: { mystery: Mystery }) {
  const team = useGame((s) => s.aiTeam);
  const mode = useGame((s) => s.mode);

  // Each teammate's take is specific to this mystery (its own cause → impact
  // chain, resolved from the mystery it influences), and stable per mystery, so
  // the panel changes as you move between mysteries instead of repeating the
  // same generic category line.
  const lines = useMemo(() => {
    const ctx = teamContext(mystery, downstreamTitles(mystery, influencesOf));
    return team.map((t) => ({ ...t, line: teammateLine(t.role, ctx) }));
  }, [mystery, team]);

  if (mode !== "ai-team" || team.length === 0) return null;

  return (
    <aside className="surface-lift space-y-3 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Bot className="h-3.5 w-3.5 text-[color:var(--terra-deep)]" /> AI team perspectives
      </div>
      <ul className="space-y-2.5">
        {lines.map((t) => {
          const r = ROLES.find((x) => x.id === t.role)!;
          return (
            <li key={t.id} className="flex gap-2.5">
              <div className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold uppercase",
                r.accent === "terra"  && "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]",
                r.accent === "warmth" && "bg-[color:var(--warmth-soft)] text-[oklch(0.45_0.12_50)]",
                r.accent === "stone"  && "bg-muted text-muted-foreground",
              )}>{r.name.slice(0,2)}</div>
              <div className="min-w-0">
                <div className="text-xs font-medium">{t.name} <span className="text-muted-foreground">· {r.name}</span></div>
                <p className="mt-0.5 text-sm text-foreground/90 leading-snug">"{t.line}"</p>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
