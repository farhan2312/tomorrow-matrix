import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget analytics event. Never throws, never blocks. Clients can only
 * write to analytics_events (RLS); the admin dashboard reads them server-side.
 */
export function logEvent(event: string, meta: Record<string, unknown> = {}): void {
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("analytics_events")
        .insert({ user_id: data.session?.user?.id ?? null, event, meta });
    } catch {
      /* analytics must never break the app */
    }
  })();
}
