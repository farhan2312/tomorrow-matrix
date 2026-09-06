import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Star } from "lucide-react";
import { MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole, roleRelationship, ROLES } from "@/lib/game/data";
import { MysteryCard } from "@/components/game/MysteryCard";
import { useGame } from "@/lib/game/store";
import type { MysteryDomain } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/mysteries/")({
  component: MysteriesIndex,
});

const DOMAIN_LABEL: Record<MysteryDomain, string> = {
  climate: "Climate Systems", water: "Water Systems", food: "Food Systems",
  bio: "Ecosystems", oceans: "Oceans", cities: "Cities & Infrastructure",
  society: "Communities", governance: "Policy & Governance", economy: "Economy",
  energy: "Energy", health: "Public Health", pollution: "Pollution",
};

const TIER_LABEL = { 1: "Foundation", 2: "Regional Impact", 3: "Systemic Impact", 4: "Global Transformation" } as const;

function MysteriesIndex() {
  const solved = useGame((s) => s.solvedMysteries);
  const role = useGame((s) => s.role);
  const [domain, setDomain] = useState<MysteryDomain | "all">("all");
  const [tier, setTier] = useState<0 | 1 | 2 | 3 | 4>(0);

  const visible = useMemo(() => MYSTERIES.filter((m) => isMysteryVisibleForRole(role, m)), [role]);
  const filtered = visible.filter((m) =>
    (domain === "all" || m.domain === domain) && (tier === 0 || m.tier === tier),
  );
  const domains = [...new Set(visible.map((m) => m.domain))];
  const roleName = ROLES.find((r) => r.id === role)?.name;

  // Group by tier for display
  const byTier: Record<number, typeof MYSTERIES> = { 1: [], 2: [], 3: [], 4: [] };
  for (const m of filtered) byTier[m.tier].push(m);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mystery library</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Climate Mysteries</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {role
              ? <>Your stakeholder lens, <strong>{roleName}</strong>, surfaces {visible.length} of {MYSTERIES.length} mysteries. ★ = bonus territory.</>
              : <>Each mystery is a system puzzle. Solve them to unlock cascades across Terra.</>}
          </p>
        </div>
        <div className="hidden text-right md:block">
          <div className="font-display text-2xl font-semibold">{solved.length}<span className="text-base text-muted-foreground">/{MYSTERIES.length}</span></div>
          <div className="text-xs text-muted-foreground">Solved across all tiers</div>
        </div>
      </header>

      {/* Filters */}
      <div className="surface-card flex flex-wrap items-center gap-2 p-3">
        <Filter className="ml-1 h-4 w-4 text-muted-foreground" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Tier</span>
        {([0, 1, 2, 3, 4] as const).map((t) => (
          <button key={t} onClick={() => setTier(t)}
            className={cn("pill text-xs", tier === t ? "bg-[color:var(--ink)] text-white border-transparent" : "chip-stone")}>
            {t === 0 ? "All" : `T${t}`}
          </button>
        ))}
        <span className="ml-3 text-xs uppercase tracking-wider text-muted-foreground">Category</span>
        <button onClick={() => setDomain("all")}
          className={cn("pill text-xs", domain === "all" ? "bg-[color:var(--ink)] text-white border-transparent" : "chip-stone")}>
          All
        </button>
        {domains.map((d) => (
          <button key={d} onClick={() => setDomain(d)}
            className={cn("pill text-xs", domain === d ? "bg-[color:var(--ink)] text-white border-transparent" : "chip-stone")}>
            {DOMAIN_LABEL[d]}
          </button>
        ))}
      </div>

      {([1, 2, 3, 4] as const).map((t) => {
        const list = byTier[t];
        if (!list.length) return null;
        return (
          <section key={t} className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-xl font-semibold">
                Tier {t} <span className="text-muted-foreground">· {TIER_LABEL[t]}</span>
              </h2>
              <span className="text-xs text-muted-foreground">{list.length} mysteries</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => {
                const rel = roleRelationship(role, m);
                return (
                  <div key={m.id} className="relative">
                    {rel === "primary" && (
                      <span className="pill absolute -top-2 left-3 z-10 bg-[color:var(--warmth)] text-white border-transparent shadow">
                        <Star className="h-3 w-3" /> {m.tier === 1 ? "Role Priority" : "Primary · bonus CAP"}
                      </span>
                    )}
                    <MysteryCard
                      mystery={m}
                      solved={solved.includes(m.id)}
                      locked={!isMysteryUnlocked(m.id, solved)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="surface-card grid place-items-center gap-2 p-10 text-center text-sm text-muted-foreground">
          No mysteries match the current filters{role ? ` for your stakeholder role` : ""}.
        </div>
      )}
    </main>
  );
}
