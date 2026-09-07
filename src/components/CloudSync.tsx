import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadFromCloud, startCloudSync, stopCloudSync } from "@/lib/game/cloud-sync";
import { logEvent } from "@/lib/analytics";

/**
 * Mounts app-wide (in the root). While a user is signed in, it hydrates the
 * game store from their cloud save and keeps pushing changes back up. Renders
 * nothing.
 */
export function CloudSync() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        if (event === "SIGNED_IN") logEvent("login", { provider: session.user.app_metadata?.provider ?? "email" });
        void loadFromCloud(session.user.id).then(() => startCloudSync(session.user!.id));
      } else if (event === "SIGNED_OUT") {
        stopCloudSync();
      }
    });
    return () => {
      stopCloudSync();
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
