import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uuidSchema = z.string().uuid();

function genCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const createLobby = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      clientId: uuidSchema,
      name: z.string().min(1).max(40),
      mode: z.enum(["play", "workshop"]).default("play"),
      workshopId: uuidSchema.optional(),
      lobbyName: z.string().min(1).max(60).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let code = genCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin
        .from("lobbies").select("id").eq("code", code).maybeSingle();
      if (!exists) break;
      code = genCode();
    }
    const { data: lobby, error } = await supabaseAdmin
      .from("lobbies")
      .insert({
        code,
        host_client: data.clientId,
        status: "waiting",
        mode: data.mode,
        shared_state: { paused: false, notes: "" },
        workshop_id: data.workshopId ?? null,
        name: data.lobbyName ?? null,
      })
      .select("id, code, mode, name, workshop_id")
      .single();
    if (error || !lobby) throw new Error(error?.message ?? "Failed to create lobby");
    if (data.mode !== "workshop") {
      const { error: pErr } = await supabaseAdmin
        .from("lobby_players")
        .insert({ lobby_id: lobby.id, client_id: data.clientId, name: data.name, is_host: true });
      if (pErr) throw new Error(pErr.message);
    }
    return { lobbyId: lobby.id, code: lobby.code, mode: lobby.mode, name: lobby.name, workshopId: lobby.workshop_id };
  });

export const createWorkshop = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      clientId: uuidSchema,
      name: z.string().min(1).max(80),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let code = genCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabaseAdmin
        .from("workshops").select("id").eq("code", code).maybeSingle();
      if (!exists) break;
      code = genCode();
    }
    const { data: ws, error } = await supabaseAdmin
      .from("workshops")
      .insert({ code, name: data.name, host_client: data.clientId, status: "active" })
      .select("id, code, name")
      .single();
    if (error || !ws) throw new Error(error?.message ?? "Failed to create workshop");
    return { workshopId: ws.id, code: ws.code, name: ws.name };
  });

export const endWorkshop = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ workshopId: uuidSchema, clientId: uuidSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ws } = await supabaseAdmin.from("workshops").select("host_client").eq("id", data.workshopId).maybeSingle();
    if (!ws || ws.host_client !== data.clientId) throw new Error("Only the workshop host can end it.");
    await supabaseAdmin.from("workshops").update({ status: "ended" }).eq("id", data.workshopId);
    await supabaseAdmin.from("lobbies").update({ status: "ended" }).eq("workshop_id", data.workshopId);
    return { ok: true };
  });

export const joinLobby = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      code: z.string().min(4).max(8).transform((s) => s.toUpperCase()),
      clientId: uuidSchema,
      name: z.string().min(1).max(40),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby, error } = await supabaseAdmin
      .from("lobbies").select("id, status, mode").eq("code", data.code).maybeSingle();
    if (error || !lobby) throw new Error("Lobby not found");
    const { error: pErr } = await supabaseAdmin
      .from("lobby_players")
      .upsert(
        { lobby_id: lobby.id, client_id: data.clientId, name: data.name, last_seen: new Date().toISOString() },
        { onConflict: "lobby_id,client_id" },
      );
    if (pErr) throw new Error(pErr.message);
    return { lobbyId: lobby.id, code: data.code, status: lobby.status, mode: lobby.mode };
  });

export const claimRole = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      lobbyId: uuidSchema, clientId: uuidSchema, role: z.string().min(1).max(40),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("lobby_players")
      .update({ role: null })
      .eq("lobby_id", data.lobbyId).eq("role", data.role);
    const { error } = await supabaseAdmin.from("lobby_players")
      .update({ role: data.role, last_seen: new Date().toISOString() })
      .eq("lobby_id", data.lobbyId).eq("client_id", data.clientId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const heartbeat = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ lobbyId: uuidSchema, clientId: uuidSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("lobby_players")
      .update({ last_seen: new Date().toISOString() })
      .eq("lobby_id", data.lobbyId).eq("client_id", data.clientId);
    return { ok: true };
  });

export const leaveLobby = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ lobbyId: uuidSchema, clientId: uuidSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("lobby_players")
      .delete().eq("lobby_id", data.lobbyId).eq("client_id", data.clientId);
    return { ok: true };
  });

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ lobbyId: uuidSchema, clientId: uuidSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby } = await supabaseAdmin
      .from("lobbies").select("host_client").eq("id", data.lobbyId).maybeSingle();
    if (!lobby || lobby.host_client !== data.clientId) throw new Error("Only the host can start.");
    const { error } = await supabaseAdmin.from("lobbies")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", data.lobbyId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const endSession = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ lobbyId: uuidSchema, clientId: uuidSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby } = await supabaseAdmin
      .from("lobbies").select("host_client").eq("id", data.lobbyId).maybeSingle();
    if (!lobby || lobby.host_client !== data.clientId) throw new Error("Only the facilitator can end.");
    await supabaseAdmin.from("lobbies").update({ status: "ended" }).eq("id", data.lobbyId);
    return { ok: true };
  });

export const setPaused = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ lobbyId: uuidSchema, clientId: uuidSchema, paused: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby } = await supabaseAdmin
      .from("lobbies").select("host_client, shared_state").eq("id", data.lobbyId).maybeSingle();
    if (!lobby || lobby.host_client !== data.clientId) throw new Error("Only the facilitator can pause.");
    const next = { ...((lobby.shared_state as Record<string, unknown>) ?? {}), paused: data.paused };
    await supabaseAdmin.from("lobbies").update({ shared_state: next }).eq("id", data.lobbyId);
    return { ok: true };
  });

export const setFacilitatorNotes = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ lobbyId: uuidSchema, clientId: uuidSchema, notes: z.string().max(4000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby } = await supabaseAdmin
      .from("lobbies").select("host_client, shared_state").eq("id", data.lobbyId).maybeSingle();
    if (!lobby || lobby.host_client !== data.clientId) throw new Error("Forbidden");
    const next = { ...((lobby.shared_state as Record<string, unknown>) ?? {}), notes: data.notes };
    await supabaseAdmin.from("lobbies").update({ shared_state: next }).eq("id", data.lobbyId);
    return { ok: true };
  });

export const injectCrisis = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ lobbyId: uuidSchema, clientId: uuidSchema, crisisId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lobby } = await supabaseAdmin
      .from("lobbies").select("host_client").eq("id", data.lobbyId).maybeSingle();
    if (!lobby || lobby.host_client !== data.clientId) throw new Error("Only the facilitator can inject crises.");
    const { error } = await supabaseAdmin.from("lobby_events").insert({
      lobby_id: data.lobbyId, client_id: data.clientId,
      kind: "crisis_injected", payload: { crisisId: data.crisisId } as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const pushEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      lobbyId: uuidSchema, clientId: uuidSchema,
      kind: z.string().min(1).max(40),
      payload: z.record(z.string(), z.unknown()).default({}),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lobby_events").insert({
      lobby_id: data.lobbyId, client_id: data.clientId,
      kind: data.kind, payload: data.payload as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const castVote = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      lobbyId: uuidSchema, clientId: uuidSchema,
      crisisId: z.string().min(1), choiceId: z.string().min(1),
      responseMs: z.number().int().nonnegative().default(0),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lobby_crisis_votes").upsert(
      {
        lobby_id: data.lobbyId, crisis_id: data.crisisId,
        client_id: data.clientId, choice_id: data.choiceId,
        response_ms: data.responseMs,
      },
      { onConflict: "lobby_id,crisis_id,client_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
