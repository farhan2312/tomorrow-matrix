import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Crown, Pause, Play, Power, Zap, Copy, Check, Users, Activity,
  Gauge, Timer, Target, ChevronDown, ChevronRight, Heart, Coins, TrendingUp,
} from "lucide-react";
import {
  endSession, injectCrisis, setFacilitatorNotes, setPaused, startSession,
} from "@/lib/multiplayer/api.functions";
import { getClientId } from "@/lib/multiplayer/identity";
import { useLobby, type LobbyEvent } from "@/lib/multiplayer/store";
import { supabase } from "@/integrations/supabase/client";
import { CRISES, ROLES, MYSTERIES, INTERVENTIONS, isMysteryVisibleForRole } from "@/lib/game/data";
import { levelFor } from "@/lib/game/roles";
import type { RoleId } from "@/lib/game/types";
import { SystemsMap } from "@/components/game/SystemsMap";
const FacilitatorSystemsMap = () => <SystemsMap forceShowAll height={520} />;
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facilitator/$code")({
  head: () => ({ meta: [{ title: "Facilitator Console — Tomorrow Matrix" }] }),
  component: FacilitatorConsole,
});

interface PlayerSnapshot {
  role?: string;
  roleTitle?: string;
  roleLevel?: number;
  cap?: number;
  planetHealth?: number;
  solvedCount?: number;
  resolvedCount?: number;
  tier?: number;
  mysteriesAssigned?: number;
}

interface AttemptRecord {
  attempt: number;
  correct: boolean;
  wrongCount: number;
  order: string[];
  hintsUsed: number;
  timeMs: number;
  ts: number;
}

interface MysterySolveDetail {
  mysteryId: string;
  clientId: string;
  attempts: number;
  hintsUsed: number;
  totalTimeMs: number;
  solvedAt: number;
  attemptLog: AttemptRecord[];
}

function FacilitatorConsole() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const lobby = useLobby();
  const start = useServerFn(startSession);
  const end = useServerFn(endSession);
  const pause = useServerFn(setPaused);
  const inject = useServerFn(injectCrisis);
  const saveNotes = useServerFn(setFacilitatorNotes);

  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [workshopCode, setWorkshopCode] = useState<string | null>(null);
  const [pickCrisis, setPickCrisis] = useState(CRISES[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      let id = lobby.lobbyId;
      if (!id || lobby.code !== code) {
        const { data } = await supabase.from("lobbies").select("id, code, mode, name, workshop_id").eq("code", code).maybeSingle();
        if (!data) { if (!cancelled) navigate({ to: "/lobby", search: { facilitator: true } }); return; }
        id = data.id;
        useLobby.getState().setLobby({ lobbyId: id, code: data.code, mode: data.mode as "play" | "workshop", lobbyName: data.name, workshopId: data.workshop_id });
      }
      if (id) await useLobby.getState().subscribe(id, getClientId());
      const wsId = useLobby.getState().workshopId;
      if (wsId) {
        const { data: ws } = await supabase.from("workshops").select("code").eq("id", wsId).maybeSingle();
        if (ws && !cancelled) setWorkshopCode(ws.code);
      }
    })();
    return () => { cancelled = true; useLobby.getState().unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, code]);

  useEffect(() => {
    if (!notesDirty) setNotes((lobby.sharedState.notes as string) ?? "");
  }, [lobby.sharedState.notes, notesDirty]);

  const clientId = hydrated ? getClientId() : "";
  const isFacilitator = lobby.hostClient === clientId;
  const paused = !!lobby.sharedState.paused;

  // ---------------------------- Analytics ----------------------------
  const analytics = useMemo(() => buildAnalytics(lobby.events, lobby.players), [lobby.events, lobby.players]);

  const onStart = async () => { if (lobby.lobbyId) await start({ data: { lobbyId: lobby.lobbyId, clientId } }); };
  const onEnd = async () => { if (lobby.lobbyId) await end({ data: { lobbyId: lobby.lobbyId, clientId } }); };
  const onPauseToggle = async () => { if (lobby.lobbyId) await pause({ data: { lobbyId: lobby.lobbyId, clientId, paused: !paused } }); };
  const onInject = async () => { if (lobby.lobbyId && pickCrisis) await inject({ data: { lobbyId: lobby.lobbyId, clientId, crisisId: pickCrisis } }); };
  const onSaveNotes = async () => {
    if (!lobby.lobbyId) return;
    await saveNotes({ data: { lobbyId: lobby.lobbyId, clientId, notes } });
    setNotesDirty(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const now = Date.now();
  const active = lobby.players.filter((p) => now - new Date(p.last_seen).getTime() < 60_000).length;

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {workshopCode ? (
          <Link to="/facilitator/workshop/$code" params={{ code: workshopCode }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Workshop
          </Link>
        ) : (
          <Link to="/lobby" search={{ facilitator: true }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Sessions
          </Link>
        )}
        <div className="flex items-center gap-2">
          {lobby.status === "active" && (
            <span className={cn("pill", paused ? "chip-warmth" : "chip-terra")}>
              <Activity className="h-3 w-3" /> {paused ? "Paused" : "Live"}
            </span>
          )}
          {lobby.status === "waiting" && <span className="pill chip-stone">Waiting</span>}
          {lobby.status === "ended" && <span className="pill chip-stone">Ended</span>}
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 pill chip-warmth"><Crown className="h-3 w-3" /> Facilitator Console</div>
            {lobby.lobbyName && (
              <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{lobby.lobbyName}</div>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-4xl font-semibold tracking-[0.25em] text-[color:var(--terra-deep)]">{code}</span>
              <button onClick={copy} className="pill chip-terra">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Share this code with participants. They join at <span className="font-mono">/lobby</span>.</p>
          </div>
          {hydrated && (
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <QRCodeSVG value={`${window.location.origin}/lobby/${code}`} size={104} level="M" />
            </div>
          )}

          {!isFacilitator && hydrated && (
            <div className="rounded-xl border border-[color:var(--warmth)]/30 bg-[color:var(--warmth-soft)] px-3 py-2 text-sm">
              You are not the facilitator of this session — controls are read-only.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {lobby.status === "waiting" && (
              <button onClick={onStart} disabled={!isFacilitator || lobby.players.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-60">
                <Play className="h-4 w-4" /> Start workshop
              </button>
            )}
            {lobby.status === "active" && (
              <>
                <button onClick={onPauseToggle} disabled={!isFacilitator}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:border-[color:var(--terra)] disabled:opacity-60">
                  {paused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause</>}
                </button>
                <button onClick={onEnd} disabled={!isFacilitator}
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--warmth)]/40 bg-[color:var(--warmth-soft)] px-4 py-2 text-sm font-medium text-[color:var(--warmth)] hover:border-[color:var(--warmth)] disabled:opacity-60">
                  <Power className="h-4 w-4" /> End session
                </button>
              </>
            )}
          </div>
        </header>

        {/* Live workshop stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users className="h-4 w-4" />} label="Players" value={`${active}/${lobby.players.length} active`} accent="terra" />
          <StatCard icon={<Gauge className="h-4 w-4" />} label="Mysteries solved" value={`${analytics.uniqueMysteriesSolved}`} sub={`${analytics.totalSolveActions} total solves`} accent="terra" />
          <StatCard icon={<Zap className="h-4 w-4" />} label="Crises" value={`${analytics.crisesResolved}/${analytics.crisesFaced}`} sub={`${analytics.successRate}% success`} accent="warmth" />
          <StatCard icon={<Timer className="h-4 w-4" />} label="Avg crisis response" value={analytics.avgResponseMs ? `${(analytics.avgResponseMs / 1000).toFixed(1)}s` : "—"} accent="stone" />
          <StatCard icon={<Timer className="h-4 w-4" />} label="Avg completion" value={analytics.avgCompletionMs ? `${(analytics.avgCompletionMs / 1000).toFixed(0)}s` : "—"} accent="stone" />
          <StatCard icon={<Target className="h-4 w-4" />} label="Avg attempts / mystery" value={analytics.avgAttempts ? analytics.avgAttempts.toFixed(1) : "—"} accent="stone" />
          <StatCard icon={<Heart className="h-4 w-4" />} label="Avg Terra health" value={analytics.avgTerraHealth ? `${analytics.avgTerraHealth.toFixed(0)}%` : "—"} accent="terra" />
          <StatCard icon={<Coins className="h-4 w-4" />} label="Total CAP" value={`${analytics.totalCap}`} accent="warmth" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">

            {/* Inject crisis */}
            <div className="surface-card p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold">Inject a crisis</h2>
                  <p className="text-xs text-muted-foreground">Push a full-screen crisis to every connected player.</p>
                </div>
                <Zap className="h-4 w-4 text-[color:var(--warmth)]" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select value={pickCrisis} onChange={(e) => setPickCrisis(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm" disabled={!isFacilitator}>
                  {CRISES.map((c) => <option key={c.id} value={c.id}>{c.title} · {c.severity}</option>)}
                </select>
                <button onClick={onInject} disabled={!isFacilitator || lobby.status !== "active"}
                  className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-warmth)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  <Zap className="h-4 w-4" /> Trigger now
                </button>
              </div>
            </div>

            {/* Participants */}
            <ParticipantsPanel players={lobby.players} analytics={analytics} />

            {/* Mystery analytics */}
            <MysteryAnalyticsPanel analytics={analytics} players={lobby.players} />

            {/* Systems map (facilitator lens: all roles) */}
            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Full butterfly network</h2>
                  <p className="text-xs text-muted-foreground">All 60 mysteries across every stakeholder lens.</p>
                </div>
              </div>
              <div className="mt-3"><FacilitatorSystemsMap /></div>
            </div>

            {analytics.topInterventionId && (
              <div className="surface-card p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Most selected intervention</div>
                <div className="mt-1 font-display text-lg font-semibold">
                  {INTERVENTIONS.find((i) => i.id === analytics.topInterventionId)?.name ?? analytics.topInterventionId}
                </div>
              </div>
            )}

            <RoleAnalyticsPanel players={lobby.players} />
          </div>

          {/* Side rail */}
          <aside className="space-y-5">
            <div className="surface-card p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Facilitator notes</div>
              <textarea value={notes} disabled={!isFacilitator}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Workshop prompts, observations, talking points…" rows={6}
                className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-[color:var(--terra)]" />
              <button onClick={onSaveNotes} disabled={!isFacilitator || !notesDirty}
                className="mt-2 w-full rounded-lg bg-card px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--terra-soft)] disabled:opacity-50">
                {notesDirty ? "Save notes" : "Saved"}
              </button>
            </div>

            <div className="surface-card p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Live activity</div>
              <ul className="mt-2 max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                {lobby.events.filter((e) => e.kind !== "player_snapshot" && e.kind !== "mystery_attempt" && e.kind !== "mystery_started").slice(0, 40).map((e) => {
                  const p = lobby.players.find((x) => x.client_id === e.client_id);
                  return (
                    <li key={e.id} className="rounded-lg border border-border bg-background p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p?.name ?? "Player"}</span>
                        <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="mt-0.5 text-muted-foreground">{describeEvent(e.kind, e.payload)}</div>
                    </li>
                  );
                })}
                {lobby.events.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">No activity yet</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// ---------------------------------- Analytics helpers ----------------------------------

interface Analytics {
  snapshots: Record<string, PlayerSnapshot>;
  solves: MysterySolveDetail[];
  solvesByPlayer: Record<string, MysterySolveDetail[]>;
  currentMystery: Record<string, { mysteryId: string; startedAt: number; attempts: number }>;
  uniqueMysteriesSolved: number;
  totalSolveActions: number;
  crisesFaced: number;
  crisesResolved: number;
  successRate: number;
  avgResponseMs: number;
  avgCompletionMs: number;
  avgAttempts: number;
  avgTerraHealth: number;
  totalCap: number;
  topInterventionId?: string;
  interventionsBoughtByPlayer: Record<string, number>;
}

function buildAnalytics(events: LobbyEvent[], players: { client_id: string }[]): Analytics {
  // Events arrive newest-first; iterate chronologically to accumulate attempt chains.
  const chronological = [...events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const snapshots: Record<string, PlayerSnapshot> = {};
  const startedMap: Record<string, Record<string, number>> = {}; // clientId -> mysteryId -> ts
  const attemptsMap: Record<string, Record<string, AttemptRecord[]>> = {}; // clientId -> mysteryId -> attempts
  const solves: MysterySolveDetail[] = [];
  const solvedKeys = new Set<string>();
  const interventionCounts: Record<string, number> = {};
  const interventionsBoughtByPlayer: Record<string, number> = {};
  let crisesFaced = 0, crisesResolved = 0;
  const crisisResponseMs: number[] = [];

  for (const e of chronological) {
    const cid = e.client_id;
    const p = e.payload as Record<string, unknown>;
    switch (e.kind) {
      case "player_snapshot": {
        snapshots[cid] = { ...(snapshots[cid] ?? {}), ...(p as PlayerSnapshot) };
        break;
      }
      case "mystery_started": {
        const mid = p.mysteryId as string | undefined;
        if (!mid) break;
        startedMap[cid] = startedMap[cid] ?? {};
        startedMap[cid][mid] = new Date(e.created_at).getTime();
        break;
      }
      case "mystery_attempt": {
        const mid = p.mysteryId as string | undefined;
        if (!mid) break;
        attemptsMap[cid] = attemptsMap[cid] ?? {};
        attemptsMap[cid][mid] = attemptsMap[cid][mid] ?? [];
        attemptsMap[cid][mid].push({
          attempt: (p.attempt as number) ?? attemptsMap[cid][mid].length + 1,
          correct: !!p.correct,
          wrongCount: (p.wrongCount as number) ?? 0,
          order: (p.order as string[]) ?? [],
          hintsUsed: (p.hintsUsed as number) ?? 0,
          timeMs: (p.timeMs as number) ?? 0,
          ts: new Date(e.created_at).getTime(),
        });
        break;
      }
      case "mystery_solved": {
        const mid = p.mysteryId as string | undefined;
        if (!mid) break;
        const solvedAt = new Date(e.created_at).getTime();
        const startedAt = startedMap[cid]?.[mid] ?? solvedAt;
        const attemptLog = (attemptsMap[cid]?.[mid] ?? []).slice();
        const key = `${cid}:${mid}`;
        if (solvedKeys.has(key)) break;
        solvedKeys.add(key);
        solves.push({
          mysteryId: mid,
          clientId: cid,
          attempts: (p.attempts as number) ?? attemptLog.length ?? 1,
          hintsUsed: (p.hintsUsed as number) ?? 0,
          totalTimeMs: (p.totalTimeMs as number) ?? Math.max(0, solvedAt - startedAt),
          solvedAt,
          attemptLog,
        });
        if (startedMap[cid]) delete startedMap[cid][mid];
        break;
      }
      case "intervention_bought": {
        const iid = p.interventionId as string | undefined;
        if (iid) interventionCounts[iid] = (interventionCounts[iid] ?? 0) + 1;
        interventionsBoughtByPlayer[cid] = (interventionsBoughtByPlayer[cid] ?? 0) + 1;
        break;
      }
      case "crisis_injected":
      case "crisis_triggered":
        crisesFaced += 1;
        break;
      case "crisis_resolved": {
        crisesResolved += 1;
        const ms = p.responseMs;
        if (typeof ms === "number") crisisResponseMs.push(ms);
        break;
      }
    }
  }

  // Current in-progress mystery per player = most recent still-open started entry
  const currentMystery: Record<string, { mysteryId: string; startedAt: number; attempts: number }> = {};
  for (const [cid, byM] of Object.entries(startedMap)) {
    let best: { mid: string; ts: number } | null = null;
    for (const [mid, ts] of Object.entries(byM)) {
      if (!best || ts > best.ts) best = { mid, ts };
    }
    if (best) {
      currentMystery[cid] = {
        mysteryId: best.mid,
        startedAt: best.ts,
        attempts: attemptsMap[cid]?.[best.mid]?.length ?? 0,
      };
    }
  }

  const solvesByPlayer: Record<string, MysterySolveDetail[]> = {};
  for (const p of players) solvesByPlayer[p.client_id] = [];
  for (const s of solves) {
    solvesByPlayer[s.clientId] = solvesByPlayer[s.clientId] ?? [];
    solvesByPlayer[s.clientId].push(s);
  }

  const uniqueMysteriesSolved = new Set(solves.map((s) => s.mysteryId)).size;
  const totalSolveActions = solves.length;
  const successRate = crisesFaced ? Math.round((crisesResolved / crisesFaced) * 100) : 0;
  const avgResponseMs = crisisResponseMs.length ? crisisResponseMs.reduce((a, b) => a + b, 0) / crisisResponseMs.length : 0;
  const completionTimes = solves.map((s) => s.totalTimeMs).filter((n) => n > 0);
  const avgCompletionMs = completionTimes.length ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;
  const attemptCounts = solves.map((s) => s.attempts).filter((n) => n > 0);
  const avgAttempts = attemptCounts.length ? attemptCounts.reduce((a, b) => a + b, 0) / attemptCounts.length : 0;

  const healths = Object.values(snapshots).map((s) => s.planetHealth).filter((v): v is number => typeof v === "number");
  const avgTerraHealth = healths.length ? healths.reduce((a, b) => a + b, 0) / healths.length : 0;
  const totalCap = Object.values(snapshots).reduce((sum, s) => sum + (s.cap ?? 0), 0);

  const top = Object.entries(interventionCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    snapshots, solves, solvesByPlayer, currentMystery,
    uniqueMysteriesSolved, totalSolveActions,
    crisesFaced, crisesResolved, successRate,
    avgResponseMs: Math.round(avgResponseMs),
    avgCompletionMs: Math.round(avgCompletionMs),
    avgAttempts,
    avgTerraHealth,
    totalCap,
    topInterventionId: top?.[0],
    interventionsBoughtByPlayer,
  };
}

// ---------------------------------- Participants ----------------------------------

interface PlayerLite { id: string; client_id: string; name: string; role: string | null; last_seen: string; is_host: boolean; }

function ParticipantsPanel({ players, analytics }: { players: PlayerLite[]; analytics: Analytics }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2">
          <Users className="h-4 w-4" /> Participants ({players.length})
        </h2>
        <span className="text-xs text-muted-foreground">Role · Tier · CAP · Progress</span>
      </div>
      {players.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Waiting for participants to join with the code above…</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Role · title</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">CAP</th>
                <th className="py-2 pr-3">Assigned</th>
                <th className="py-2 pr-3">Solved</th>
                <th className="py-2 pr-3">Crises</th>
                <th className="py-2 pr-3">Current</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const snap = analytics.snapshots[p.client_id] ?? {};
                const r = ROLES.find((x) => x.id === (snap.role ?? p.role));
                const roleTitle = snap.roleTitle
                  ?? (p.role ? levelFor(p.role as RoleId, snap.cap ?? 0).title : "—");
                const assigned = snap.mysteriesAssigned
                  ?? (p.role ? MYSTERIES.filter((m) => isMysteryVisibleForRole(p.role as RoleId, m)).length : MYSTERIES.length);
                const solvedCount = analytics.solvesByPlayer[p.client_id]?.length ?? snap.solvedCount ?? 0;
                const cur = analytics.currentMystery[p.client_id];
                const curM = cur ? MYSTERIES.find((m) => m.id === cur.mysteryId) : null;
                const pct = Math.round((solvedCount / Math.max(1, assigned)) * 100);
                const stale = Date.now() - new Date(p.last_seen).getTime() > 60_000;
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", stale ? "bg-muted-foreground/40" : "bg-[color:var(--terra)]")} />
                        <span className="font-medium">{p.name}</span>
                        {p.is_host && <Crown className="h-3 w-3 text-[color:var(--warmth)]" />}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-xs">{r?.name ?? "—"}</div>
                      <div className="text-[10px] text-muted-foreground">{roleTitle}</div>
                    </td>
                    <td className="py-2 pr-3 font-mono">T{snap.tier ?? 1}</td>
                    <td className="py-2 pr-3 font-mono">{snap.cap ?? 0}</td>
                    <td className="py-2 pr-3 font-mono">{assigned}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{solvedCount}</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-[image:var(--gradient-terra)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3 font-mono">{snap.resolvedCount ?? 0}</td>
                    <td className="py-2 pr-3 text-xs">
                      {curM ? (
                        <div>
                          <div className="truncate max-w-[180px]">{curM.code} · {curM.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            attempt {cur!.attempts} · {Math.round((Date.now() - cur!.startedAt) / 1000)}s
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Idle</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------- Mystery analytics ----------------------------------

function MysteryAnalyticsPanel({ analytics, players }: { analytics: Analytics; players: PlayerLite[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const rows = analytics.solves.slice().sort((a, b) => b.solvedAt - a.solvedAt);

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Mystery analytics
        </h2>
        <span className="text-xs text-muted-foreground">Every solve · expand for attempt-by-attempt trace</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No mysteries solved yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {rows.map((s) => {
            const m = MYSTERIES.find((x) => x.id === s.mysteryId);
            const player = players.find((p) => p.client_id === s.clientId);
            const key = `${s.clientId}:${s.mysteryId}:${s.solvedAt}`;
            const open = expanded === key;
            const finalScore = scoreForSolve(s.attempts, s.hintsUsed, m?.reward ?? 100);
            return (
              <li key={key} className="py-2.5">
                <button onClick={() => setExpanded(open ? null : key)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1 text-left hover:bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <span className="truncate">{m?.code ?? "?"} · {m?.title ?? s.mysteryId}</span>
                    </div>
                    <div className="ml-5 text-[11px] text-muted-foreground">{player?.name ?? "Player"} · solved {new Date(s.solvedAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right text-xs">
                    <div><div className="font-mono">{fmtDuration(s.totalTimeMs)}</div><div className="text-[10px] text-muted-foreground">time</div></div>
                    <div><div className="font-mono">{s.attempts}</div><div className="text-[10px] text-muted-foreground">attempts</div></div>
                    <div><div className="font-mono text-[color:var(--terra-deep)]">{finalScore}</div><div className="text-[10px] text-muted-foreground">CAP</div></div>
                  </div>
                </button>
                {open && (
                  <div className="ml-5 mt-2 space-y-2">
                    {s.attemptLog.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        No attempt trace captured. (Solved before instrumentation, or joined mid-workshop.)
                      </div>
                    ) : (
                      s.attemptLog.map((a, i) => {
                        const isFinal = i === s.attemptLog.length - 1;
                        const canonical = m?.sequence.map((step) => step.id) ?? [];
                        return (
                          <div key={i} className={cn("rounded-lg border p-3 text-xs",
                            a.correct ? "border-[color:var(--terra)]/40 bg-[color:var(--terra-soft)]/40" : "border-border bg-background")}>
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {isFinal && a.correct ? "Final attempt · ✓" : `Attempt ${a.attempt}`}
                                {!a.correct && ` · ${a.wrongCount} out of place`}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">{fmtDuration(a.timeMs)}</div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {a.order.map((cardId, idx) => {
                                const step = m?.sequence.find((st) => st.id === cardId);
                                const rightHere = canonical[idx] === cardId;
                                return (
                                  <span key={`${idx}-${cardId}`} className={cn(
                                    "rounded-md border px-2 py-1 text-[10px]",
                                    rightHere ? "border-[color:var(--terra)]/50 bg-[color:var(--terra-soft)]/60 text-[color:var(--terra-deep)]"
                                      : "border-[color:var(--warmth)]/40 bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]"
                                  )}>
                                    {idx + 1}. {step?.label ?? cardId} {rightHere ? "✓" : "✗"}
                                  </span>
                                );
                              })}
                            </div>
                            {a.hintsUsed > 0 && (
                              <div className="mt-2 text-[10px] text-[color:var(--warmth)]">Hints used: {a.hintsUsed}</div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      Total attempts: {s.attempts} · Hints: {s.hintsUsed} · Time: {fmtDuration(s.totalTimeMs)}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------- Small components ----------------------------------

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent: "terra" | "warmth" | "stone" }) {
  return (
    <div className="surface-card p-4">
      <div className={cn("inline-flex items-center gap-1.5 pill",
        accent === "terra" && "chip-terra",
        accent === "warmth" && "chip-warmth",
        accent === "stone" && "chip-stone",
      )}>{icon}{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function RoleAnalyticsPanel({ players }: { players: { client_id: string; role: string | null; name: string }[] }) {
  const counts: Record<string, number> = {};
  for (const p of players) {
    const key = p.role ?? "unassigned";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Stakeholder distribution</h2>
        <span className="text-xs text-muted-foreground">Roles selected by participants</span>
      </div>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No participants yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map(([role, n]) => {
            const r = ROLES.find((x) => x.id === role);
            const pct = Math.round((n / players.length) * 100);
            return (
              <li key={role}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{r?.name ?? "Unassigned"}</span>
                  <span className="font-mono text-muted-foreground">{n} · {pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[image:var(--gradient-terra)]" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function describeEvent(kind: string, payload: Record<string, unknown>): string {
  switch (kind) {
    case "mystery_solved": {
      const id = payload.mysteryId as string | undefined;
      const m = MYSTERIES.find((x) => x.id === id);
      return `Solved ${m?.title ?? id ?? "a mystery"}`;
    }
    case "intervention_bought": {
      const id = payload.interventionId as string | undefined;
      const i = INTERVENTIONS.find((x) => x.id === id);
      return `Bought ${i?.name ?? id ?? "an intervention"}`;
    }
    case "crisis_injected":
    case "crisis_triggered": {
      const id = payload.crisisId as string | undefined;
      const c = CRISES.find((x) => x.id === id);
      return `Crisis triggered: ${c?.title ?? id ?? ""}`;
    }
    case "crisis_resolved": {
      const id = payload.crisisId as string | undefined;
      const c = CRISES.find((x) => x.id === id);
      return `Crisis resolved: ${c?.title ?? id ?? ""}`;
    }
    default: return kind;
  }
}

function fmtDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function scoreForSolve(attempts: number, hintsUsed: number, reward: number): number {
  const ladder = [100, 80, 60, 40, 20];
  const base = ladder[Math.min(attempts - 1, ladder.length - 1)] ?? 20;
  const scaled = Math.round((base / 100) * reward);
  return Math.max(0, scaled - hintsUsed * 10);
}
