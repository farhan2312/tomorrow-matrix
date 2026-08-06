import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import { heartbeat } from "./api.functions";

export interface LobbyPlayer {
  id: string;
  client_id: string;
  name: string;
  role: string | null;
  is_host: boolean;
  last_seen: string;
}

export interface LobbyRow {
  id: string;
  code: string;
  status: "waiting" | "active" | "ended";
  host_client: string;
  started_at: string | null;
  mode: "play" | "workshop";
  shared_state: SharedState;
  name?: string | null;
  workshop_id?: string | null;
}

export interface SharedState {
  paused?: boolean;
  notes?: string;
  [k: string]: unknown;
}

export interface LobbyEvent {
  id: string;
  client_id: string;
  kind: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CrisisVote {
  crisis_id: string;
  client_id: string;
  choice_id: string;
}

type EventListener = (e: LobbyEvent) => void;

interface LobbyState {
  lobbyId: string | null;
  code: string | null;
  status: LobbyRow["status"] | null;
  hostClient: string | null;
  mode: LobbyRow["mode"] | null;
  lobbyName: string | null;
  workshopId: string | null;
  sharedState: SharedState;
  players: LobbyPlayer[];
  votes: CrisisVote[];
  events: LobbyEvent[];
  _channel: ReturnType<typeof supabase.channel> | null;
  _heartbeatTimer: number | null;
  _listeners: Set<EventListener>;

  setLobby: (l: { lobbyId: string; code: string; mode?: LobbyRow["mode"]; lobbyName?: string | null; workshopId?: string | null }) => void;
  subscribe: (lobbyId: string, clientId: string) => Promise<void>;
  unsubscribe: () => void;
  onEvent: (fn: EventListener) => () => void;
  clear: () => void;
}

export const useLobby = create<LobbyState>()(
  persist(
    (set, get) => ({
      lobbyId: null,
      code: null,
      status: null,
      hostClient: null,
      mode: null,
      lobbyName: null,
      workshopId: null,
      sharedState: {},
      players: [],
      votes: [],
      events: [],
      _channel: null,
      _heartbeatTimer: null,
      _listeners: new Set<EventListener>(),

      setLobby: ({ lobbyId, code, mode, lobbyName, workshopId }) => set({
        lobbyId, code,
        mode: mode ?? get().mode,
        lobbyName: lobbyName !== undefined ? lobbyName : get().lobbyName,
        workshopId: workshopId !== undefined ? workshopId : get().workshopId,
      }),

      onEvent: (fn) => {
        get()._listeners.add(fn);
        return () => { get()._listeners.delete(fn); };
      },

      subscribe: async (lobbyId, clientId) => {
        get().unsubscribe();

        const [{ data: lobby }, { data: players }, { data: votes }, { data: events }] = await Promise.all([
          supabase.from("lobbies").select("id, code, status, host_client, started_at, mode, shared_state, name, workshop_id").eq("id", lobbyId).maybeSingle(),
          supabase.from("lobby_players").select("id, client_id, name, role, is_host, last_seen").eq("lobby_id", lobbyId),
          supabase.from("lobby_crisis_votes").select("crisis_id, client_id, choice_id").eq("lobby_id", lobbyId),
          supabase.from("lobby_events").select("id, client_id, kind, payload, created_at").eq("lobby_id", lobbyId).order("created_at", { ascending: false }).limit(100),
        ]);
        if (lobby) {
          set({
            lobbyId: lobby.id, code: lobby.code,
            status: lobby.status as LobbyRow["status"],
            hostClient: lobby.host_client,
            mode: (lobby.mode as LobbyRow["mode"]) ?? "play",
            sharedState: (lobby.shared_state as SharedState) ?? {},
            lobbyName: (lobby as { name?: string | null }).name ?? null,
            workshopId: (lobby as { workshop_id?: string | null }).workshop_id ?? null,
          });
        }
        set({
          players: (players ?? []) as LobbyPlayer[],
          votes: (votes ?? []) as CrisisVote[],
          events: (events ?? []) as LobbyEvent[],
        });

        const channel = supabase.channel(`lobby:${lobbyId}`)
          .on("postgres_changes",
            { event: "*", schema: "public", table: "lobbies", filter: `id=eq.${lobbyId}` },
            (p) => {
              const row = p.new as Partial<LobbyRow>;
              if (row && row.id) set({
                status: row.status as LobbyRow["status"],
                hostClient: row.host_client ?? get().hostClient,
                mode: (row.mode as LobbyRow["mode"]) ?? get().mode,
                sharedState: (row.shared_state as SharedState) ?? get().sharedState,
              });
            })
          .on("postgres_changes",
            { event: "*", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobbyId}` },
            async () => {
              const { data } = await supabase.from("lobby_players")
                .select("id, client_id, name, role, is_host, last_seen").eq("lobby_id", lobbyId);
              set({ players: (data ?? []) as LobbyPlayer[] });
            })
          .on("postgres_changes",
            { event: "INSERT", schema: "public", table: "lobby_events", filter: `lobby_id=eq.${lobbyId}` },
            (p) => {
              const e = p.new as LobbyEvent;
              set({ events: [e, ...get().events].slice(0, 100) });
              get()._listeners.forEach((fn) => fn(e));
            })
          .on("postgres_changes",
            { event: "*", schema: "public", table: "lobby_crisis_votes", filter: `lobby_id=eq.${lobbyId}` },
            async () => {
              const { data } = await supabase.from("lobby_crisis_votes")
                .select("crisis_id, client_id, choice_id").eq("lobby_id", lobbyId);
              set({ votes: (data ?? []) as CrisisVote[] });
            })
          .subscribe();

        const timer = window.setInterval(() => {
          heartbeat({ data: { lobbyId, clientId } }).catch(() => {});
        }, 15000);

        set({ _channel: channel, _heartbeatTimer: timer });
      },

      unsubscribe: () => {
        const { _channel, _heartbeatTimer } = get();
        if (_channel) supabase.removeChannel(_channel);
        if (_heartbeatTimer) clearInterval(_heartbeatTimer);
        set({ _channel: null, _heartbeatTimer: null });
      },

      clear: () => {
        get().unsubscribe();
        set({ lobbyId: null, code: null, status: null, hostClient: null, mode: null, lobbyName: null, workshopId: null, sharedState: {}, players: [], votes: [], events: [] });
      },
    }),
    {
      name: "tomorrow-matrix-lobby",
      partialize: (s) => ({ lobbyId: s.lobbyId, code: s.code, mode: s.mode }),
    },
  ),
);
