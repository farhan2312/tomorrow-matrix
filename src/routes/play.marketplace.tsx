import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { INTERVENTIONS, INTERVENTION_CATEGORIES } from "@/lib/game/data";
import { InterventionCard } from "@/components/game/InterventionCard";
import { InterventionDetail } from "@/components/game/InterventionDetail";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import type { Intervention } from "@/lib/game/types";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/play/marketplace")({
  component: Marketplace,
});

type SortKey = "recommended" | "cost-asc" | "cost-desc" | "name";

function Marketplace() {
  const { cap, purchasedInterventions, buyIntervention } = useGame();
  const [cat, setCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [showOwned, setShowOwned] = useState(true);
  const [selected, setSelected] = useState<Intervention | null>(null);

  const list = useMemo(() => {
    let items = INTERVENTIONS.slice();
    if (cat !== "all") items = items.filter((i) => i.categoryId === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
      );
    }
    if (!showOwned) items = items.filter((i) => !purchasedInterventions.includes(i.id));
    switch (sort) {
      case "cost-asc": items.sort((a, b) => a.cost - b.cost); break;
      case "cost-desc": items.sort((a, b) => b.cost - a.cost); break;
      case "name": items.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:
        items.sort((a, b) => {
          const aff = (cap >= a.cost ? 0 : 1) - (cap >= b.cost ? 0 : 1);
          if (aff !== 0) return aff;
          return (b.planetHealth ?? 0) - (a.planetHealth ?? 0);
        });
    }
    return items;
  }, [cat, query, sort, showOwned, purchasedInterventions, cap]);

  const spent = useMemo(() => {
    return purchasedInterventions.reduce((sum, id) => {
      const i = INTERVENTIONS.find((x) => x.id === id);
      return sum + (i?.cost ?? 0);
    }, 0);
  }, [purchasedInterventions]);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Strategy · Command Centre
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Intervention Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {INTERVENTIONS.length} science-backed interventions across {INTERVENTION_CATEGORIES.length} domains.
            Each ripples through the Butterfly Network and shifts your planetary indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="surface-card px-4 py-2 text-right">
            <div className="font-display text-xl font-semibold tabular-nums">{purchasedInterventions.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Owned</div>
          </div>
          <div className="surface-card px-4 py-2 text-right">
            <div className="font-display text-xl font-semibold tabular-nums">{spent}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CAP spent</div>
          </div>
          <div className="surface-card flex items-center gap-3 px-4 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-terra)] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tabular-nums">{cap}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Available CAP</div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="surface-card flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search interventions…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-[color:var(--terra)]"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="recommended">Recommended</option>
          <option value="cost-asc">CAP: low to high</option>
          <option value="cost-desc">CAP: high to low</option>
          <option value="name">Name</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showOwned}
            onChange={(e) => setShowOwned(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Show invested
        </label>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <CatChip active={cat === "all"} onClick={() => setCat("all")}>
          All · {INTERVENTIONS.length}
        </CatChip>
        {INTERVENTION_CATEGORIES.map((c) => {
          const count = INTERVENTIONS.filter((i) => i.categoryId === c.id).length;
          return (
            <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              <span>{c.emoji}</span>
              <span>{c.label}</span>
              <span className="opacity-60">· {count}</span>
            </CatChip>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="surface-card grid place-items-center p-16 text-sm text-muted-foreground">
          No interventions match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((i) => (
            <InterventionCard
              key={i.id}
              intervention={i}
              cap={cap}
              owned={purchasedInterventions.includes(i.id)}
              onOpen={() => setSelected(i)}
            />
          ))}
        </div>
      )}

      <InterventionDetail
        intervention={selected}
        cap={cap}
        owned={selected ? purchasedInterventions.includes(selected.id) : false}
        onClose={() => setSelected(null)}
        onConfirm={(id) => buyIntervention(id)}
      />
    </main>
  );
}

function CatChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-transparent bg-[color:var(--ink)] text-white"
          : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
