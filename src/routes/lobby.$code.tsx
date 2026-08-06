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
  head: () => ({ meta: [{ title: "Waiting Room — Tomorrow Matrix" }] }),
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
  useEffect(() => { setHydrated(true); }, []);

  // Ensure we're joined + subscribed on direct navigation / refresh.
  useEffect(() => {
    if (!hydrated) return;
    const clientId = getClientId();
    const name = getGuestName();
    let cancelled = false;
    (async () => {
      let id = lobby.lobbyId;
      if (!id || lobby.code !== code) {
        try {
          const res = await join({ data: { code, clientId, name } });
          if (cancelled) return;
          id = res.lobbyId;
          useLobby.getState().setLobby({ lobbyId: id, code: res.code });
        } catch {
          navigate({ to: "/lobby" });
          return;
        }
      }
      if (id) await useLobby.getState().subscribe(id, clientId);
    })();
    return () => { cancelled = true; useLobby.getState().unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, code]);

  // When host starts, route everyone into /play. When facilitator ends, go to endgame.
  useEffect(() => {
    if (lobby.status === "active") {
      const me = lobby.players.find((p) => p.client_id === getClientId());
      const myRole = (me?.role as RoleId | undefined) ?? "scientist";
      setMode("multiplayer");
      setRole(myRole);
      navigate({ to: "/play" });
    } else if (lobby.status === "ended") {
      navigate({ to: "/endgame" });
    }
  }, [lobby.status, lobby.players, navigate, setMode, setRole]);

  const clientId = hydrated ? getClientId() : "";
  const me = lobby.players.find((p) => p.client_id === clientId);
  const isHost = !!me?.is_host;
  const canStart = isHost && lobby.players.length >= 1 && lobby.players.every((p) => p.role);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const onClaim = async (roleId: RoleId) => {
    if (!lobby.lobbyId) return;
    await claim({ data: { lobbyId: lobby.lobbyId, clientId, role: roleId } });
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
            <h2 className="mt-1 font-display text-xl font-semibold">Each player owns a perspective</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((r) => {
                const taken = lobby.players.find((p) => p.role === r.id && p.client_id !== clientId);
                const mine = me?.role === r.id;
                return (
                  <button
                    key={r.id}
                    disabled={!!taken}
                    onClick={() => onClaim(r.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      mine ? "border-[color:var(--terra)] ring-2 ring-[color:var(--terra)]" : "border-border hover:border-[color:var(--terra)]",
                      taken && "cursor-not-allowed opacity-40",
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
                    {taken && <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Taken by {taken.name}</div>}
                  </button>
                );
              })}
            </div>
            {!isHost && <p className="mt-4 text-xs text-muted-foreground">Waiting for the host to start the session…</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
