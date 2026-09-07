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

/** Presign a direct-to-R2 upload (browser PUTs the file, bypassing Vercel's size limit). */
export const adminMediaPresign = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    token: z.string().min(1),
    key: z.string().min(1).max(200),
    contentType: z.string().min(1).max(120),
    ext: z.string().min(1).max(8),
  }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    requireAdmin(data.token);
    const { presignPut, publicUrl } = await import("./r2.server");
    const safeKey = data.key.replace(/[^\w/\-.]/g, "_");
    const safeExt = data.ext.replace(/[^\w]/g, "").slice(0, 8) || "bin";
    const path = `overrides/${safeKey}/${Date.now()}.${safeExt}`;
    const uploadUrl = await presignPut(path, data.contentType);
    return { uploadUrl, url: publicUrl(path), path };
  });

/** Record (or update) the override URL for a media key. */
export const adminMediaSetOverride = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), key: z.string().min(1).max(200), url: z.string().url() }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from("media_overrides")
      .upsert({ key: data.key, url: data.url, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** List every current media override (key -> url). Token-gated. */
export const adminMediaList = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabaseAdmin as any)
      .from("media_overrides").select("key, url, updated_at");
    const map: Record<string, { url: string; updatedAt: string | null }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const r of (rows ?? []) as any[]) map[r.key] = { url: r.url, updatedAt: r.updated_at ?? null };
    return { map };
  });

/** Remove an override (revert to the bundled default); deletes the uploaded R2 object. */
export const adminMediaDelete = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), key: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const { data: row } = await db.from("media_overrides").select("url").eq("key", data.key).maybeSingle();
    if (row?.url) {
      const base = (process.env.R2_PUBLIC_BASE ?? "").replace(/\/$/, "");
      const path = base && row.url.startsWith(base) ? row.url.slice(base.length + 1) : "";
      // Only ever delete objects we uploaded (never the original media set).
      if (path.startsWith("overrides/")) {
        const { deleteObject } = await import("./r2.server");
        try { await deleteObject(path); } catch { /* object may already be gone */ }
      }
    }
    await db.from("media_overrides").delete().eq("key", data.key);
    return { ok: true };
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
    const { data: saves } = await db.from("game_saves").select("id, state");
    const roleMap: Record<string, number> = {};
    const tierMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveById: Record<string, any> = {};
    let totalSolved = 0, healthSum = 0, healthN = 0;
    for (const s of saves ?? []) {
      const st = (s.state ?? {}) as Record<string, unknown>;
      if (s.id) saveById[s.id] = st;
      const role = st.role as string | undefined;
      if (role) roleMap[role] = (roleMap[role] || 0) + 1;
      const solved = Array.isArray(st.solvedMysteries) ? (st.solvedMysteries as unknown[]).length : 0;
      totalSolved += solved;
      if (typeof st.planetHealth === "number") { healthSum += st.planetHealth; healthN++; }
      let tier = 1;
      for (const t of [2, 3, 4]) if (solved >= THRESH[t]) tier = t;
      tierMap[tier]++;
    }

    // --- Per-user table (newest first) ---
    const { data: profiles } = await db.from("profiles").select("id, display_name");
    const profMap: Record<string, string> = {};
    for (const p of profiles ?? []) if (p.display_name) profMap[p.id] = p.display_name;
    const usersList = users
      .map((u) => {
        const st = saveById[u.id] ?? {};
        const solved = Array.isArray(st.solvedMysteries) ? st.solvedMysteries.length : 0;
        let tier = 1;
        for (const t of [2, 3, 4]) if (solved >= THRESH[t]) tier = t;
        const started = solved > 0 || !!st.role;
        return {
          id: u.id,
          name: profMap[u.id] ?? u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
          email: u.email ?? null,
          provider: u.app_metadata?.provider ?? "email",
          role: (st.role as string) ?? null,
          solved,
          tier: started ? tier : null,
          health: typeof st.planetHealth === "number" ? st.planetHealth : null,
          createdAt: u.created_at ?? null,
          lastSignIn: u.last_sign_in_at ?? null,
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

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
      usersList,
    };
  });
