import { useEffect, useRef, useState } from "react";
import { Users, ChevronRight, Crown, Copy, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useLobby } from "@/lib/multiplayer/store";
import { useGame } from "@/lib/game/store";
import { ROLES, MYSTERIES, isMysteryVisibleForRole } from "@/lib/game/data";
import { levelFor } from "@/lib/game/roles";
import { pushEvent } from "@/lib/multiplayer/api.functions";
import { getClientId } from "@/lib/multiplayer/identity";
import { cn } from "@/lib/utils";

export function RosterRail() {
  const mode = useGame((s) => s.mode);
  const lobbyId = useLobby((s) => s.lobbyId);
  const players = useLobby((s) => s.players);
  const code = useLobby((s) => s.code);
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (mode !== "multiplayer" || !lobbyId) return null;

  const copy = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <aside
      className={cn(
        "fixed left-4 top-20 z-30 hidden w-60 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur transition-all md:block",
        !open && "w-12",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs uppercase tracking-wider"
      >
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {open && `Team (${players.length})`}
        </span>
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="p-3">
          <button onClick={copy} className="mb-3 flex w-full items-center justify-between rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-sm tracking-[0.2em] hover:border-[color:var(--terra)]">
            {code}
            {copied ? <Check className="h-3 w-3 text-[color:var(--terra)]" /> : <Copy className="h-3 w-3" />}
          </button>
          <ul className="space-y-1.5">
            {players.map((p) => {
              const r = ROLES.find((x) => x.id === p.role);
              return (
                <li key={p.id} className="flex items-center gap-2 rounded-lg bg-background p-1.5">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--terra-soft)] text-[10px] font-semibold text-[color:var(--terra-deep)]">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-xs font-medium">
                      {p.name}
                      {p.is_host && <Crown className="h-3 w-3 text-[color:var(--warmth)]" />}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground">{r?.name ?? "—"}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}

export function MultiplayerBridge() {
  const mode = useGame((s) => s.mode);
  const lobbyId = useLobby((s) => s.lobbyId);
  const onEvent = useLobby((s) => s.onEvent);

  // ---- inbound events → local game state ----
  useEffect(() => {
    if (mode !== "multiplayer" || !lobbyId) return;
    const off = onEvent((e) => {
      const game = useGame.getState();
      if (e.kind === "mystery_solved") {
        const id = (e.payload as { mysteryId?: string }).mysteryId;
        if (id && !game.solvedMysteries.includes(id)) {
          const attempts = ((e.payload as { attempts?: number }).attempts) ?? 1;
          const hintsUsed = ((e.payload as { hintsUsed?: number }).hintsUsed) ?? 0;
          game.solveMystery(id, attempts, hintsUsed);
        }
      }
      if (e.kind === "intervention_bought") {
        const id = (e.payload as { interventionId?: string }).interventionId;
        if (id && !game.purchasedInterventions.includes(id)) game.buyIntervention(id);
      }
      if (e.kind === "crisis_injected") {
        const id = (e.payload as { crisisId?: string }).crisisId;
        if (id && !game.pendingCrisisId) game.triggerCrisis(id);
      }
    });
    return off;
  }, [mode, lobbyId, onEvent]);

  // ---- outbound: broadcast per-player snapshot so facilitators see live stats ----
  const broadcast = useServerFn(pushEvent);
  const role = useGame((s) => s.role);
  const cap = useGame((s) => s.cap);
  const planetHealth = useGame((s) => s.planetHealth);
  const solvedCount = useGame((s) => s.solvedMysteries.length);
  const resolvedCount = useGame((s) => s.resolvedCrises.length);
  const roleProgress = useGame((s) => (s.role ? s.roleProgress[s.role] : null));
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (mode !== "multiplayer" || !lobbyId || !role) return;
    const assigned = MYSTERIES.filter((m) => isMysteryVisibleForRole(role, m)).length;
    const solvedTiers = useGame.getState().solvedMysteries
      .map((id) => MYSTERIES.find((m) => m.id === id)?.tier ?? 0);
    const tier = solvedTiers.length ? Math.max(...solvedTiers, 1) : 1;
    const xp = roleProgress?.xp ?? cap;
    const roleLevel = levelFor(role, xp);
    const payload = {
      role, roleTitle: roleLevel.title, roleLevel: roleLevel.level,
      cap, planetHealth, solvedCount, resolvedCount, tier, mysteriesAssigned: assigned,
    };
    const key = JSON.stringify(payload);
    if (key === lastSentRef.current) return;
    lastSentRef.current = key;
    const timer = window.setTimeout(() => {
      broadcast({ data: {
        lobbyId, clientId: getClientId(),
        kind: "player_snapshot",
        payload,
      } }).catch(() => {});
    }, 400);
    return () => window.clearTimeout(timer);
  }, [mode, lobbyId, role, cap, planetHealth, solvedCount, resolvedCount, roleProgress, broadcast]);

  return null;
}
