import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Crown, Plus, Power, Users, Trophy, Copy, Check, ExternalLink,
  Activity, Gauge, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createLobby, endWorkshop } from "@/lib/multiplayer/api.functions";
import { getClientId } from "@/lib/multiplayer/identity";
import { MYSTERIES, ROLES } from "@/lib/game/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facilitator/workshop/$code")({
  head: () => ({ meta: [{ title: "Workshop Console, Tomorrow Matrix" }] }),
  component: WorkshopConsole,
});

interface WorkshopRow {
  id: string;
  code: string;
  name: string;
  host_client: string;
  status: string;
}
interface LobbyRow {
  id: string;
  code: string;
  name: string | null;
  status: "waiting" | "active" | "ended";
  workshop_id: string | null;
}
interface PlayerRow {
  id: string; lobby_id: string; client_id: string; name: string; role: string | null;
}
interface EventRow {
  id: string; lobby_id: string; client_id: string; kind: string;
  payload: Record<string, unknown>; created_at: string;
}

function WorkshopConsole() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const createLobbyFn = useServerFn(createLobby);
  const endWs = useServerFn(endWorkshop);

  const [hydrated, setHydrated] = useState(false);
  const [workshop, setWorkshop] = useState<WorkshopRow | null>(null);
  const [lobbies, setLobbies] = useState<LobbyRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [newLobbyName, setNewLobbyName] = useState("Team Alpha");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const refresh = async (wsId: string) => {
      const [{ data: L }, { data: P }, { data: E }] = await Promise.all([
        supabase.from("lobbies").select("id, code, name, status, workshop_id").eq("workshop_id", wsId).order("created_at"),
        supabase.from("lobby_players").select("id, lobby_id, client_id, name, role").in("lobby_id", (await supabase.from("lobbies").select("id").eq("workshop_id", wsId)).data?.map((x) => x.id) ?? ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("lobby_events").select("id, lobby_id, client_id, kind, payload, created_at").in("lobby_id", (await supabase.from("lobbies").select("id").eq("workshop_id", wsId)).data?.map((x) => x.id) ?? ["00000000-0000-0000-0000-000000000000"]).order("created_at", { ascending: false }).limit(500),
      ]);
      if (cancelled) return;
      setLobbies((L ?? []) as LobbyRow[]);
      setPlayers((P ?? []) as PlayerRow[]);
      setEvents((E ?? []) as EventRow[]);
    };

    (async () => {
      const { data: ws } = await supabase.from("workshops").select("id, code, name, host_client, status").eq("code", code).maybeSingle();
      if (!ws) { if (!cancelled) navigate({ to: "/lobby", search: { facilitator: true } }); return; }
      if (cancelled) return;
      setWorkshop(ws as WorkshopRow);
      await refresh(ws.id);

      const channel = supabase.channel(`workshop:${ws.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "lobbies", filter: `workshop_id=eq.${ws.id}` }, () => refresh(ws.id))
        .on("postgres_changes", { event: "*", schema: "public", table: "lobby_players" }, () => refresh(ws.id))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "lobby_events" }, () => refresh(ws.id))
        .on("postgres_changes", { event: "*", schema: "public", table: "workshops", filter: `id=eq.${ws.id}` }, async () => {
          const { data } = await supabase.from("workshops").select("id, code, name, host_client, status").eq("id", ws.id).maybeSingle();
          if (data && !cancelled) setWorkshop(data as WorkshopRow);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    })();
    return () => { cancelled = true; };
  }, [hydrated, code, navigate]);

  const clientId = hydrated ? getClientId() : "";
  const isHost = workshop?.host_client === clientId;

  const perLobbyStats = useMemo(() => {
    const map: Record<string, { players: number; solved: Set<string>; interventions: number; crisesResolved: number; crisesFaced: number }> = {};
    for (const l of lobbies) map[l.id] = { players: 0, solved: new Set(), interventions: 0, crisesResolved: 0, crisesFaced: 0 };
    for (const p of players) if (map[p.lobby_id]) map[p.lobby_id].players += 1;
    for (const e of events) {
      const s = map[e.lobby_id]; if (!s) continue;
      if (e.kind === "mystery_solved") { const id = (e.payload as { mysteryId?: string }).mysteryId; if (id) s.solved.add(id); }
      else if (e.kind === "intervention_bought") s.interventions += 1;
      else if (e.kind === "crisis_injected" || e.kind === "crisis_triggered") s.crisesFaced += 1;
      else if (e.kind === "crisis_resolved") s.crisesResolved += 1;
    }
    return map;
  }, [lobbies, players, events]);

  const leaderboard = useMemo(() => {
    return lobbies
      .map((l) => ({ lobby: l, stats: perLobbyStats[l.id] ?? { players: 0, solved: new Set<string>(), interventions: 0, crisesResolved: 0, crisesFaced: 0 } }))
      .map((x) => ({ ...x, score: x.stats.solved.size * 10 + x.stats.crisesResolved * 5 + x.stats.interventions * 2 }))
      .sort((a, b) => b.score - a.score);
  }, [lobbies, perLobbyStats]);

  const totals = useMemo(() => {
    let players = 0, solved = 0, interventions = 0, crisesResolved = 0;
    for (const l of lobbies) {
      const s = perLobbyStats[l.id]; if (!s) continue;
      players += s.players; solved += s.solved.size; interventions += s.interventions; crisesResolved += s.crisesResolved;
    }
    return { players, solved, interventions, crisesResolved };
  }, [lobbies, perLobbyStats]);

  const onAddLobby = async () => {
    if (!workshop || !isHost) return;
    setBusy(true);
    try {
      await createLobbyFn({ data: { clientId, name: workshop.name, mode: "workshop", workshopId: workshop.id, lobbyName: newLobbyName.trim() || `Team ${lobbies.length + 1}` } });
      setNewLobbyName(`Team ${String.fromCharCode(65 + lobbies.length + 1)}`);
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  const onEndWorkshop = async () => {
    if (!workshop || !isHost) return;
    if (!confirm("End the workshop? All lobbies will be closed.")) return;
    await endWs({ data: { workshopId: workshop.id, clientId } });
  };

  const copyText = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  if (!workshop) {
    return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading workshop…</main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/lobby" search={{ facilitator: true }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Workshops
        </Link>
        <span className={cn("pill", workshop.status === "active" ? "chip-terra" : "chip-stone")}>
          <Activity className="h-3 w-3" /> {workshop.status === "active" ? "Active" : "Ended"}
        </span>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 pill chip-warmth"><Crown className="h-3 w-3" /> Workshop Console</div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{workshop.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workshop code</span>
              <span className="font-mono text-lg font-semibold tracking-[0.25em] text-[color:var(--warmth)]">{workshop.code}</span>
              <button onClick={() => copyText(workshop.code, "ws")} className="pill chip-warmth">
                {copied === "ws" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied === "ws" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          {isHost && workshop.status === "active" && (
            <button onClick={onEndWorkshop} className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--warmth)]/40 bg-[color:var(--warmth-soft)] px-4 py-2 text-sm font-medium text-[color:var(--warmth)] hover:border-[color:var(--warmth)]">
              <Power className="h-4 w-4" /> End workshop
            </button>
          )}
        </header>

        {/* Totals */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <TotalCard icon={<Users className="h-4 w-4" />} label="Participants" value={String(totals.players)} />
          <TotalCard icon={<Gauge className="h-4 w-4" />} label="Mysteries solved" value={`${totals.solved}`} />
          <TotalCard icon={<Zap className="h-4 w-4" />} label="Crises resolved" value={String(totals.crisesResolved)} />
          <TotalCard icon={<Trophy className="h-4 w-4" />} label="Lobbies" value={String(lobbies.length)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {/* Add lobby */}
            {isHost && workshop.status === "active" && (
              <div className="surface-card flex flex-wrap items-end gap-3 p-5">
                <div className="min-w-[220px] flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">New lobby name</div>
                  <input
                    value={newLobbyName}
                    onChange={(e) => setNewLobbyName(e.target.value.slice(0, 60))}
                    placeholder="Team Ocean"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--terra)]"
                  />
                </div>
                <button
                  onClick={onAddLobby}
                  disabled={busy || !newLobbyName.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" /> Add lobby
                </button>
              </div>
            )}

            {/* Lobby cards */}
            {lobbies.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                No lobbies yet. Add one to start assigning participants.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {lobbies.map((l) => {
                  const s = perLobbyStats[l.id] ?? { players: 0, solved: new Set<string>(), interventions: 0, crisesResolved: 0, crisesFaced: 0 };
                  const lobbyPlayers = players.filter((p) => p.lobby_id === l.id);
                  const joinUrl = origin ? `${origin}/lobby/${l.code}` : `/lobby/${l.code}`;
                  return (
                    <div key={l.id} className="surface-card overflow-hidden p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-display text-lg font-semibold">{l.name ?? `Lobby ${l.code}`}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-sm tracking-[0.2em] text-[color:var(--terra-deep)]">{l.code}</span>
                            <button onClick={() => copyText(l.code, `code-${l.id}`)} className="pill chip-terra">
                              {copied === `code-${l.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white p-1.5">
                          <QRCodeSVG value={joinUrl} size={72} level="M" />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <MiniStat label="Players" value={String(s.players)} />
                        <MiniStat label="Solved" value={`${s.solved.size}/${MYSTERIES.length}`} />
                        <MiniStat label="Crises" value={`${s.crisesResolved}/${s.crisesFaced}`} />
                      </div>

                      <div className="mt-3 min-h-[24px]">
                        {lobbyPlayers.length === 0 ? (
                          <div className="text-xs text-muted-foreground">Waiting for participants…</div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {lobbyPlayers.map((p) => {
                              const r = ROLES.find((x) => x.id === p.role);
                              return (
                                <span key={p.id} className="pill chip-stone text-[10px]">
                                  {p.name}{r ? ` · ${r.name.split(" ")[0]}` : ""}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className={cn("pill", l.status === "active" ? "chip-terra" : l.status === "waiting" ? "chip-warmth" : "chip-stone")}>
                          {l.status}
                        </span>
                        <Link to="/facilitator/$code" params={{ code: l.code }} className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--terra-deep)] hover:underline">
                          Open controls <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <aside className="space-y-5">
            <div className="surface-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[color:var(--warmth)]" /> Leaderboard
                </h2>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add lobbies to see rankings.</p>
              ) : (
                <ol className="space-y-2">
                  {leaderboard.map((row, i) => (
                    <li key={row.lobby.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
                      <span className={cn("grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
                        i === 0 ? "bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]" : "bg-muted text-muted-foreground")}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{row.lobby.name ?? row.lobby.code}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {row.stats.solved.size} solved · {row.stats.crisesResolved} crises · {row.stats.interventions} interventions
                        </div>
                      </div>
                      <div className="font-mono text-sm font-semibold">{row.score}</div>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                Score = solved × 10 + crises resolved × 5 + interventions × 2
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">How it works</div>
              <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>1. Add a lobby per team.</li>
                <li>2. Share each lobby's join code / QR with its team.</li>
                <li>3. Open a lobby's controls to pause or inject crises for just that team.</li>
                <li>4. Watch the leaderboard update in real time.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function TotalCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <div className="pill chip-stone">{icon}{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}
