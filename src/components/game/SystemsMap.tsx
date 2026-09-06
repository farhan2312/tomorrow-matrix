import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lock, AlertTriangle, X, Sparkles } from "lucide-react";
import {
  MYSTERIES, isMysteryUnlocked, isMysteryVisibleForRole, influencesOf, influencedBy,
  ROLES, CRISES,
} from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import type { Mystery, RoleId } from "@/lib/game/types";
import { RelationshipExplorer } from "./RelationshipExplorer";
import { outgoingCodes } from "@/lib/game/linkages";

const DOMAIN_COLOR: Record<string, string> = {
  climate: "var(--ind-climate)",
  water:   "var(--ind-water)",
  food:    "var(--ind-food)",
  bio:     "var(--ind-bio)",
  economy: "var(--ind-economy)",
  oceans:  "var(--ind-water)",
  cities:  "var(--ind-climate)",
  society: "var(--ind-economy)",
  governance: "var(--ind-economy)",
  energy:  "var(--ind-economy)",
  health:  "var(--ind-food)",
  pollution: "var(--ind-climate)",
};

interface Props {
  role?: RoleId | null;          // override; defaults to current player role
  forceShowAll?: boolean;        // facilitator view
  height?: number;
  showRoleFilter?: boolean;      // render the in-component role dropdown
  showTerraOverlay?: boolean;    // render the live indicator strip
}

export function SystemsMap({
  role: roleOverride, forceShowAll, height = 620, showRoleFilter = true, showTerraOverlay = true,
}: Props) {
  const playerRole = useGame((s) => s.role);
  const solved = useGame((s) => s.solvedMysteries);
  const indicators = useGame((s) => s.indicators);
  const planetHealth = useGame((s) => s.planetHealth);

  // Filter override (lets player explore other stakeholder lenses)
  const [filterRole, setFilterRole] = useState<RoleId | "all" | null>(null);
  const effectiveRole: RoleId | null | undefined =
    roleOverride !== undefined ? roleOverride
    : filterRole === "all" ? null
    : filterRole ?? playerRole;
  const effectiveShowAll = forceShowAll || filterRole === "all";

  const [selected, setSelected] = useState<Mystery | null>(null);
  const [explorer, setExplorer] = useState<{ from: string; to: string } | null>(null);

  const openExplorerFor = (m: Mystery) => {
    const outs = outgoingCodes(m.code);
    if (outs.length > 0) setExplorer({ from: m.code, to: outs[0] });
    else setSelected(m);
  };





  const mysteries = useMemo(
    () => effectiveShowAll
      ? MYSTERIES
      : MYSTERIES.filter((m) => isMysteryVisibleForRole(effectiveRole ?? null, m)),
    [effectiveRole, effectiveShowAll],
  );
  const visibleIds = new Set(mysteries.map((m) => m.id));

  const W = 1100;
  const H = height;
  const COL_X = { 1: W * 0.12, 2: W * 0.38, 3: W * 0.64, 4: W * 0.88 } as const;
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; m: Mystery }>();
    ([1, 2, 3, 4] as const).forEach((tier) => {
      const arr = mysteries.filter((m) => m.tier === tier);
      const pad = 40;
      const step = arr.length > 1 ? (H - pad * 2) / (arr.length - 1) : 0;
      arr.forEach((m, i) => {
        map.set(m.id, { x: COL_X[tier], y: pad + step * i, m });
      });
    });
    return map;
  }, [mysteries, H]);

  const edges = useMemo(() => {
    const out: { from: string; to: string; live: boolean }[] = [];
    for (const m of mysteries) {
      for (const next of influencesOf(m)) {
        if (!visibleIds.has(next.id)) continue;
        out.push({ from: m.id, to: next.id, live: solved.includes(m.id) });
      }
    }
    return out;
  }, [mysteries, visibleIds, solved]);

  // Crises linked to selected mystery (match by domain or explicit code)
  const linkedCrises = useMemo(() => {
    if (!selected) return [];
    return CRISES.filter((c) =>
      (c.linkedMysteryCodes ?? []).includes(selected.code) ||
      (c.category && selected.category === c.category as never),
    );
  }, [selected]);

  return (
    <div className="surface-card overflow-hidden bg-grid">
      {showRoleFilter && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">Stakeholder lens:</span>
          <button
            onClick={() => setFilterRole(null)}
            className={`rounded-full border px-2.5 py-1 transition-colors ${
              filterRole === null
                ? "border-[color:var(--terra)] bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]"
                : "border-border hover:bg-muted/50"
            }`}
          >
            {playerRole ? `Your role (${ROLES.find((r) => r.id === playerRole)?.name})` : "All roles"}
          </button>
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id)}
              className={`rounded-full border px-2.5 py-1 transition-colors ${
                filterRole === r.id
                  ? "border-[color:var(--terra)] bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              {r.name}
            </button>
          ))}
          <button
            onClick={() => setFilterRole("all")}
            className={`rounded-full border px-2.5 py-1 transition-colors ${
              filterRole === "all"
                ? "border-[color:var(--warmth)] bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]"
                : "border-border hover:bg-muted/50"
            }`}
          >
            Show all
          </button>
        </div>
      )}

      {showTerraOverlay && (
        <div className="grid grid-cols-2 gap-2 border-b border-border px-4 py-2 sm:grid-cols-6">
          <Bar label="Terra"        value={planetHealth} tint="var(--terra)" />
          <Bar label="Climate"      value={indicators.climate} tint="var(--ind-climate)" />
          <Bar label="Water"        value={indicators.water}   tint="var(--ind-water)" />
          <Bar label="Food"         value={indicators.food}    tint="var(--ind-food)" />
          <Bar label="Biodiversity" value={indicators.bio}     tint="var(--ind-bio)" />
          <Bar label="Economy"      value={indicators.economy} tint="var(--ind-economy)" />
        </div>
      )}

      <div className="relative">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ minWidth: 720, height }}>
            {([1, 2, 3, 4] as const).map((t) => (
              <g key={t}>
                <text x={COL_X[t]} y={20} textAnchor="middle"
                  style={{ fontSize: 11, fontFamily: "var(--font-sans)", letterSpacing: 2, textTransform: "uppercase" }}
                  className="fill-muted-foreground">Tier {t}</text>
              </g>
            ))}

            {edges.map((e, i) => {
              const a = positions.get(e.from); const b = positions.get(e.to);
              if (!a || !b) return null;
              const fromM = a.m; const toM = b.m;
              return (
                <path key={i}
                  d={`M ${a.x + 14} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x - 14} ${b.y}`}
                  fill="none"
                  stroke={e.live ? "var(--terra)" : "oklch(0.85 0.01 150)"}
                  strokeWidth={e.live ? 2.4 : 1.3}
                  strokeDasharray={e.live ? "0" : "4 4"}
                  opacity={e.live ? 0.9 : 0.55}
                  style={{ cursor: "pointer" }}
                  onClick={() => setExplorer({ from: fromM.code, to: toM.code })}
                />
              );
            })}

            {[...positions.values()].map(({ x, y, m }) => {
              const isSolved = solved.includes(m.id);
              const unlocked = isMysteryUnlocked(m.id, solved);
              const color = DOMAIN_COLOR[m.domain] ?? "var(--terra)";
              const hasCrisisLink = CRISES.some((c) => (c.linkedMysteryCodes ?? []).includes(m.code));
              return (
                <g key={m.id} onClick={() => openExplorerFor(m)} onDoubleClick={() => setSelected(m)} style={{ cursor: "pointer" }}>
                  {isSolved && <circle cx={x} cy={y} r={18} fill={color} opacity={0.18} />}
                  <circle cx={x} cy={y} r={11} fill="white" stroke={color} strokeWidth={2.5} />
                  <circle cx={x} cy={y} r={4} fill={color} />
                  {isSolved && (
                    <foreignObject x={x - 7} y={y - 7} width={14} height={14}>
                      <Check className="h-3.5 w-3.5 text-[color:var(--terra)]" strokeWidth={3} />
                    </foreignObject>
                  )}
                  {!unlocked && !isSolved && (
                    <foreignObject x={x - 7} y={y - 7} width={14} height={14}>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </foreignObject>
                  )}
                  {hasCrisisLink && (
                    <circle cx={x + 9} cy={y - 9} r={4} fill="var(--warmth)">
                      <title>Generates crisis risk</title>
                    </circle>
                  )}
                  <text x={x + 18} y={y + 4}
                    className="fill-foreground"
                    style={{ fontSize: 10.5, fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                    {m.code} · {m.title.length > 26 ? m.title.slice(0, 24) + "…" : m.title}
                  </text>
                  <title>{m.title}, {m.brief}</title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* DETAIL DRAWER */}
        {selected && (
          <aside className="absolute right-0 top-0 z-10 h-full w-full max-w-sm overflow-y-auto border-l border-border bg-background/95 backdrop-blur-md">
            <NodeDetail mystery={selected} onClose={() => setSelected(null)} linkedCrises={linkedCrises} />
          </aside>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--terra)]" /> Live (solved → effect)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Latent</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--warmth)]" /> Crisis risk</span>
        <span className="ml-auto">
          {mysteries.length} mysteries · {edges.length} cause-effect links
          {effectiveRole && !effectiveShowAll ? ` · filtered by ${ROLES.find((r) => r.id === effectiveRole)?.name ?? effectiveRole}` : ""}
        </span>
      </div>

      <RelationshipExplorer
        fromCode={explorer?.from ?? null}
        toCode={explorer?.to ?? null}
        onClose={() => setExplorer(null)}
        onNavigate={(from, to) => setExplorer({ from, to })}
      />
    </div>
  );
}

function Bar({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between text-[10px]">
        <span className="uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tint }} />
      </div>
    </div>
  );
}

function NodeDetail({
  mystery, onClose, linkedCrises,
}: { mystery: Mystery; onClose: () => void; linkedCrises: typeof CRISES }) {
  const solved = useGame((s) => s.solvedMysteries);
  const ups = influencedBy(mystery);
  const downs = influencesOf(mystery);
  const isSolved = solved.includes(mystery.id);
  const unlocked = isMysteryUnlocked(mystery.id, solved);
  const primaryRoleNames = mystery.primaryRoles.map((r) => ROLES.find((x) => x.id === r)?.name ?? r);
  const secondaryRoleNames = mystery.secondaryRoles.map((r) => ROLES.find((x) => x.id === r)?.name ?? r);

  return (
    <div className="space-y-4 p-5">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {mystery.code} · Tier {mystery.tier} · {mystery.domain}
          </div>
          <h3 className="mt-0.5 font-display text-lg font-semibold leading-tight">{mystery.title}</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">{mystery.region}</div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {isSolved ? <span className="pill chip-terra">Solved</span>
         : unlocked ? <span className="pill chip-warmth">Available</span>
         : <span className="pill chip-stone">Locked</span>}
        <span className="pill chip-stone capitalize">{mystery.rarity}</span>
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">{mystery.brief}</p>

      {mystery.aiConnection && (
        <div className="rounded-lg border border-[color:var(--terra)]/30 bg-[color:var(--terra-soft)]/40 p-3 text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--terra-deep)]">
            <Sparkles className="h-3 w-3" /> Why this matters · AI connection
          </div>
          <p className="mt-1.5 text-foreground/90">{mystery.aiConnection}</p>
        </div>
      )}

      {mystery.butterfly && mystery.butterfly.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cascade chain</div>
          <ol className="mt-1.5 space-y-1 text-xs">
            {mystery.butterfly.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color:var(--terra-soft)] text-[9px] font-mono text-[color:var(--terra-deep)]">{i + 1}</span>
                <span className="text-foreground/85">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-3 text-xs">
        <div className="uppercase tracking-wider text-muted-foreground">Stakeholder ownership</div>
        <div className="mt-1.5"><strong>Primary:</strong> {primaryRoleNames.join(", ") || "-"}</div>
        <div className="mt-0.5"><strong>Also see:</strong> {secondaryRoleNames.join(", ") || "-"}</div>
      </div>


      {ups.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Influenced by</div>
          <ul className="mt-1 space-y-1 text-xs">
            {ups.map((u) => (
              <li key={u.id}>
                <Link to="/play/mysteries/$id" params={{ id: u.id }}
                  className="text-[color:var(--terra-deep)] hover:underline">{u.code} · {u.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {downs.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">This influences</div>
          <ul className="mt-1 space-y-1 text-xs">
            {downs.map((d) => (
              <li key={d.id}>
                <Link to="/play/mysteries/$id" params={{ id: d.id }}
                  className="text-[color:var(--terra-deep)] hover:underline">{d.code} · {d.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {linkedCrises.length > 0 && (
        <div className="rounded-lg border border-[color:var(--warmth)]/30 bg-[color:var(--warmth-soft)]/40 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--warmth)]">
            <AlertTriangle className="h-3 w-3" /> Related crisis events
          </div>
          <ul className="mt-1.5 space-y-1 text-xs">
            {linkedCrises.map((c) => (
              <li key={c.id}>
                <span className="mr-1">{c.emoji}</span>
                <strong>{c.title}</strong>
                <span className="ml-1 text-muted-foreground">· {c.severity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {unlocked && (
        <Link to="/play/mysteries/$id" params={{ id: mystery.id }}
          className="block w-full rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-center text-sm font-medium text-white">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Open mystery
        </Link>
      )}
    </div>
  );
}
