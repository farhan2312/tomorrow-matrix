import { useMemo } from "react";
import { Users, Activity, Coins, Trophy, ShieldCheck, Crown, Target } from "lucide-react";
import { useLobby } from "@/lib/multiplayer/store";
import { ROLES } from "@/lib/game/data";
import { getClientId } from "@/lib/multiplayer/identity";
import { cn } from "@/lib/utils";

/** Latest per-player stats, broadcast by MultiplayerBridge as player_snapshot. */
interface Snapshot {
  role?: string;
  roleTitle?: string;
  roleLevel?: number;
  cap?: number;
  planetHealth?: number;
  solvedCount?: number;
  resolvedCount?: number;
  mysteriesAssigned?: number;
}

/**
 * The shared, everyone-sees-the-same multiplayer dashboard: the team's Terra
 * health and collective progress, plus a per-player leaderboard. Distinct from
 * the solo dashboard (which is one player's indicators + crisis analytics).
 * Reads the realtime lobby state every player already subscribes to.
 */
export function MultiplayerDashboard() {
  const players = useLobby((s) => s.players);
  const events = useLobby((s) => s.events);
  const lobbyName = useLobby((s) => s.lobbyName);
  const code = useLobby((s) => s.code);
  const me = getClientId();

  // Fold the event log into the latest snapshot per player and each player's
  // own solve count (events are newest-first, so replay oldest→newest).
  const { snapshots, solvesByPlayer } = useMemo(() => {
    const snaps: Record<string, Snapshot> = {};
    const solved: Record<string, Set<string>> = {};
    const chrono = [...events].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    for (const e of chrono) {
      const cid = e.client_id;
      if (e.kind === "player_snapshot") {
        snaps[cid] = { ...(snaps[cid] ?? {}), ...(e.payload as Snapshot) };
      } else if (e.kind === "mystery_solved") {
        const mid = (e.payload as { mysteryId?: string }).mysteryId;
        if (mid) (solved[cid] ??= new Set()).add(mid);
      }
    }
    const byPlayer: Record<string, number> = {};
    for (const [cid, set] of Object.entries(solved)) byPlayer[cid] = set.size;
    return { snapshots: snaps, solvesByPlayer: byPlayer };
  }, [events]);

  const snapList = players.map((p) => snapshots[p.client_id] ?? {});
  // The board (Terra health, total solved, crises) is shared, so take the
  // freshest reported value across players.
  const terraHealth = Math.round(Math.max(0, ...snapList.map((s) => s.planetHealth ?? 40), 40));
  const boardSolved = Math.max(0, ...snapList.map((s) => s.solvedCount ?? 0), 0);
  const crisesResolved = Math.max(0, ...snapList.map((s) => s.resolvedCount ?? 0), 0);
  const teamCap = snapList.reduce((sum, s) => sum + (s.cap ?? 0), 0);

  // Terra goal: 40% → 70%. Clamp 0–100 for the bar.
  const goalPct = Math.max(0, Math.min(100, Math.round(((terraHealth - 40) / 30) * 100)));

  // Leaderboard: by individual CAP, then by their own solves.
  const ranked = [...players].sort((a, b) => {
    const sa = snapshots[a.client_id] ?? {}, sb = snapshots[b.client_id] ?? {};
    return (sb.cap ?? 0) - (sa.cap ?? 0) || (solvesByPlayer[b.client_id] ?? 0) - (solvesByPlayer[a.client_id] ?? 0);
  });

  return (
    <main className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Multiplayer · {lobbyName || `Session ${code ?? ""}`}
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Team dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Everyone's progress toward restoring Terra, live. The board is shared — individual CAP and rank are your own.
          </p>
        </div>
        <span className="pill chip-terra"><Users className="h-3 w-3" /> {players.length} player{players.length === 1 ? "" : "s"}</span>
      </header>

      {/* Team Terra goal */}
      <div className="surface-lift p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-[color:var(--terra-deep)]" /> Restore Terra to 70%
          </div>
          <div className="font-mono text-sm tabular-nums">
            <span className="text-[color:var(--terra-deep)]">{terraHealth}%</span>
            <span className="text-muted-foreground"> / 70%</span>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[image:var(--gradient-terra)] transition-all duration-700"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{goalPct}% of the way to the goal</div>
      </div>

      {/* Team totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TeamTile icon={Activity} label="Terra health" value={`${terraHealth}%`} tone="terra" />
        <TeamTile icon={Trophy} label="Mysteries solved" value={String(boardSolved)} tone="terra" />
        <TeamTile icon={Coins} label="Team CAP" value={String(teamCap)} tone="warmth" />
        <TeamTile icon={ShieldCheck} label="Crises resolved" value={String(crisesResolved)} tone="terra" />
      </div>

      {/* Leaderboard */}
      <div className="surface-card p-5">
        <h2 className="font-display text-lg font-semibold">Players</h2>
        <ul className="mt-3 space-y-2">
          {ranked.map((p, i) => {
            const s = snapshots[p.client_id] ?? {};
            const role = ROLES.find((r) => r.id === p.role);
            const mine = solvesByPlayer[p.client_id] ?? 0;
            const assigned = s.mysteriesAssigned ?? 0;
            const pct = assigned ? Math.round((mine / assigned) * 100) : 0;
            const isMe = p.client_id === me;
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  isMe ? "border-[color:var(--terra)]/40 bg-[color:var(--terra-soft)]/40" : "border-border bg-background",
                )}
              >
                <div className="w-6 text-center font-mono text-sm font-semibold text-muted-foreground">{i + 1}</div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--terra-soft)] text-xs font-semibold text-[color:var(--terra-deep)]">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {p.name}
                    {isMe && <span className="text-[10px] font-semibold text-[color:var(--terra-deep)]">(you)</span>}
                    {p.is_host && <Crown className="h-3 w-3 text-[color:var(--warmth)]" />}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {role?.name ?? "Choosing a role…"}{s.roleTitle ? ` · ${s.roleTitle}` : ""}
                  </div>
                  {assigned > 0 && (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-[color:var(--terra)]" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-sm font-semibold tabular-nums text-[color:var(--terra-deep)]">{s.cap ?? 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CAP</div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-mono text-sm tabular-nums">{mine}{assigned ? `/${assigned}` : ""}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Solved</div>
                </div>
              </li>
            );
          })}
          {ranked.length === 0 && (
            <li className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Waiting for players to join and start…
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}

function TeamTile({ icon: Icon, label, value, tone }: {
  icon: typeof Activity; label: string; value: string; tone: "terra" | "warmth";
}) {
  return (
    <div className="surface-card p-4">
      <div className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg",
        tone === "terra" ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]" : "bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]",
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
