import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Crown, Copy, Check, LogOut, Play } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useServerFn } from "@tanstack/react-start";
import { claimRole, joinLobby, leaveLobby, startSession } from "@/lib/multiplayer/api.functions";
import { getClientId, getGuestName } from "@/lib/multiplayer/identity";
import { useLobby } from "@/lib/multiplayer/store";
import { useGame } from "@/lib/game/store";
import { ROLES } from "@/lib/game/data";
import type { RoleId } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lobby/$code")({
  head: () => ({ meta: [{ title: "Waiting Room, Tomorrow Matrix" }] }),
  component: WaitingRoom,
});

function WaitingRoom() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const join = useServerFn(joinLobby);
  const claim = useServerFn(claimRole);
  const start = useServerFn(startSession);
  const leave = useServerFn(leaveLobby);

  const lobby = useLobby();
  const setRole = useGame((s) => s.setRole);
  const setMode = useGame((s) => s.setMode);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [claiming, setClaiming] = useState<RoleId | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  useEffect(() => { setHydrated(true); }, []);

  // Ensure we're joined + subscribed on direct navigation / refresh. The join
  // is an idempotent upsert keyed on (lobby, this tab's client id) and never
  // touches an existing role, so it is always safe to run: it also covers
  // players joining via QR / direct link and tabs that never saw the lobby page.
  useEffect(() => {
    if (!hydrated) return;
    const clientId = getClientId();
    const name = getGuestName();
    let cancelled = false;
    (async () => {
      // Never carry players/status/roles over from a different lobby.
      if (useLobby.getState().code !== code) useLobby.getState().clear();
      let id: string | null = null;
      try {
        const res = await join({ data: { code, clientId, name } });
        if (cancelled) return;
        id = res.lobbyId;
        useLobby.getState().setLobby({ lobbyId: id, code: res.code });
      } catch {
        if (!cancelled) navigate({ to: "/lobby" });
        return;
      }
      if (id && !cancelled) await useLobby.getState().subscribe(id, clientId);
    })();
    return () => { cancelled = true; useLobby.getState().unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, code]);

  // When host starts, route everyone into /play. When facilitator ends, go to endgame.
  // A player is only sent into the game once THEY have picked a role (the role
  // on their own player row). Players who join an already-started session stay
  // on this screen, pick a role, and then continue. There is no default role.
  useEffect(() => {
    if (lobby.status === "active") {
      if (!hydrated) return;
      const me = lobby.players.find((p) => p.client_id === getClientId());
      const myRole = me?.role as RoleId | null | undefined;
      if (!myRole || !ROLES.some((r) => r.id === myRole)) return;
      setMode("multiplayer");
      setRole(myRole);
      navigate({ to: "/play" });
    } else if (lobby.status === "ended") {
      navigate({ to: "/endgame" });
    }
  }, [hydrated, lobby.status, lobby.players, navigate, setMode, setRole]);

  const clientId = hydrated ? getClientId() : "";
  const me = lobby.players.find((p) => p.client_id === clientId);
  const isHost = !!me?.is_host;
  const canStart = isHost && lobby.players.length >= 1 && lobby.players.every((p) => p.role);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  // Every player picks their OWN role. Any role may be chosen, including one
  // another player already holds (duplicates are allowed).
  const onClaim = async (roleId: RoleId) => {
    if (!lobby.lobbyId || !clientId) return;
    setRoleError(null);
    setClaiming(roleId);
    try {
      await claim({ data: { lobbyId: lobby.lobbyId, clientId, role: roleId } });
      // Optimistic local update; realtime will confirm.
      useLobby.setState((st) => ({
        players: st.players.map((p) => (p.client_id === clientId ? { ...p, role: roleId } : p)),
      }));
    } catch (e) {
      setRoleError(e instanceof Error ? e.message : "Could not set your role. Try again.");
    } finally {
      setClaiming(null);
    }
  };

  const onStart = async () => {
    if (!lobby.lobbyId) return;
    await start({ data: { lobbyId: lobby.lobbyId, clientId } });
  };

  const onLeave = async () => {
    if (lobby.lobbyId) await leave({ data: { lobbyId: lobby.lobbyId, clientId } });
    useLobby.getState().clear();
    navigate({ to: "/lobby" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/lobby" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Lobbies
        </Link>
        <button onClick={onLeave} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" /> Leave
        </button>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {lobby.lobbyName && (
              <div className="font-display text-3xl font-semibold tracking-tight">{lobby.lobbyName}</div>
            )}
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">Session Code</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-4xl font-semibold tracking-[0.25em] text-[color:var(--terra-deep)]">{code}</span>
              <button onClick={copy} className="pill chip-terra">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Scan the QR or share the code with teammates.</p>
          </div>
          <div className="flex items-end gap-4">
            {hydrated && (
              <div className="rounded-xl bg-white p-2 shadow-sm">
                <QRCodeSVG value={`${window.location.origin}/lobby/${code}`} size={104} level="M" />
              </div>
            )}
            {isHost && (
              <button
                onClick={onStart}
                disabled={!canStart}
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                <Play className="h-4 w-4" /> Start session
              </button>
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Roster */}
          <aside className="surface-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Players ({lobby.players.length})</div>
            <ul className="mt-3 space-y-2">
              {lobby.players.map((p) => {
                const r = ROLES.find((x) => x.id === p.role);
                return (
                  <li key={p.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--terra-soft)] text-xs font-semibold text-[color:var(--terra-deep)]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <span className="truncate">{p.name}</span>
                        {p.is_host && <Crown className="h-3 w-3 text-[color:var(--warmth)]" />}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{r?.name ?? "Choosing role…"}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Role picker */}
          <div className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pick your stakeholder</div>
            <h2 className="mt-1 font-display text-xl font-semibold">Choose your role</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick any role you like. Other players can choose the same one.
            </p>
            {me && !me.role && (
              <div className="mt-3 rounded-xl border border-[color:var(--terra)]/30 bg-[color:var(--terra-soft)] p-3 text-sm">
                {lobby.status === "active"
                  ? "This session has already started. Choose your role to jump in."
                  : "Choose your role to get ready."}
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((r) => {
                const others = lobby.players.filter((p) => p.role === r.id && p.client_id !== clientId);
                const mine = me?.role === r.id;
                return (
                  <button
                    key={r.id}
                    disabled={!me || claiming !== null}
                    onClick={() => onClaim(r.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      mine ? "border-[color:var(--terra)] ring-2 ring-[color:var(--terra)]" : "border-border hover:border-[color:var(--terra)]",
                      (!me || claiming !== null) && "cursor-wait opacity-70",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("pill",
                        r.accent === "terra" && "chip-terra",
                        r.accent === "warmth" && "chip-warmth",
                        r.accent === "stone" && "chip-stone",
                      )}>{r.focus}</span>
                      {mine && <Check className="h-4 w-4 text-[color:var(--terra)]" />}
                    </div>
                    <div className="mt-2 font-display text-base font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.tagline}</div>
                    {others.length > 0 && (
                      <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Also: {others.map((o) => o.name).join(", ")}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {roleError && <div className="mt-3 rounded-xl border border-[color:var(--warmth)]/30 bg-[color:var(--warmth-soft)] p-3 text-sm">{roleError}</div>}
            {!isHost && lobby.status !== "active" && (
              <p className="mt-4 text-xs text-muted-foreground">Waiting for the host to start the session…</p>
            )}
            {isHost && !canStart && lobby.status !== "active" && (
              <p className="mt-4 text-xs text-muted-foreground">Everyone needs to pick a role before you can start.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
