import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Exchange the admin password for a signed session token (server-validated). */
export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { checkPassword, issueToken } = await import("./admin.server");
    if (!checkPassword(data.password)) {
      throw new Error("Incorrect admin password.");
    }
    return { token: issueToken() };
  });

/** Cheap check that a stored token is still valid (used to restore a session). */
export const adminVerify = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { validToken } = await import("./admin.server");
    return { ok: validToken(data.token) };
  });

const THRESH: Record<number, number> = { 1: 0, 2: 4, 3: 12, 4: 22 };

/** Aggregated analytics for the admin dashboard. Token-gated; reads via service_role. */
export const adminAnalytics = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const now = Date.now();
    const DAY = 86_400_000;

    // --- Auth users (paginated) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: any[] = [];
    for (let page = 1; page <= 20; page++) {
      const { data: res, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !res?.users?.length) break;
      users.push(...res.users);
      if (res.users.length < 1000) break;
    }
    const activeSince = (days: number) =>
      users.filter((u) => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < days * DAY).length;

    const signupMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) signupMap[new Date(now - i * DAY).toISOString().slice(0, 10)] = 0;
    for (const u of users) { const k = (u.created_at || "").slice(0, 10); if (k in signupMap) signupMap[k]++; }

    const provMap: Record<string, number> = {};
    for (const u of users) { const p = u.app_metadata?.provider ?? "email"; provMap[p] = (provMap[p] || 0) + 1; }

    // --- Game saves (progress) ---
    const { data: saves } = await db.from("game_saves").select("state");
    const roleMap: Record<string, number> = {};
    const tierMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalSolved = 0, healthSum = 0, healthN = 0;
    for (const s of saves ?? []) {
      const st = (s.state ?? {}) as Record<string, unknown>;
      const role = st.role as string | undefined;
      if (role) roleMap[role] = (roleMap[role] || 0) + 1;
      const solved = Array.isArray(st.solvedMysteries) ? (st.solvedMysteries as unknown[]).length : 0;
      totalSolved += solved;
      if (typeof st.planetHealth === "number") { healthSum += st.planetHealth; healthN++; }
      let tier = 1;
      for (const t of [2, 3, 4]) if (solved >= THRESH[t]) tier = t;
      tierMap[tier]++;
    }

    // --- Sessions + events ---
    const { count: lobbyCount } = await db.from("lobbies").select("id", { count: "exact", head: true });
    const { count: totalEvents } = await db.from("analytics_events").select("id", { count: "exact", head: true });
    const { data: recent } = await db
      .from("analytics_events").select("event, created_at, user_id")
      .order("created_at", { ascending: false }).limit(15);
    const { data: ev7 } = await db
      .from("analytics_events").select("event")
      .gte("created_at", new Date(now - 7 * DAY).toISOString());
    const ev7Map: Record<string, number> = {};
    for (const e of ev7 ?? []) ev7Map[e.event] = (ev7Map[e.event] || 0) + 1;

    return {
      users: {
        total: users.length,
        active7d: activeSince(7),
        active30d: activeSince(30),
        providers: Object.entries(provMap).map(([provider, count]) => ({ provider, count })),
      },
      signupsByDay: Object.entries(signupMap).map(([date, count]) => ({ date, count })),
      roles: Object.entries(roleMap).map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count),
      byTier: [1, 2, 3, 4].map((t) => ({ tier: t, players: tierMap[t] })),
      progress: { players: saves?.length ?? 0, totalSolved, avgHealth: healthN ? Math.round(healthSum / healthN) : 0 },
      sessions: { multiplayer: lobbyCount ?? 0 },
      events: { total: totalEvents ?? 0, last7d: ev7Map, recent: recent ?? [] },
    };
  });
