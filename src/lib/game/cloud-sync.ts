// Cloud sync for single-player game progress.
//
// When a user is signed in, the game store is mirrored to the `game_saves`
// table in Supabase (one row per user). This lets progress follow the account
// across devices. Guests keep using localStorage only (via the store's persist
// middleware) and never touch the network here.
//
// Conflict policy: last-write-wins by timestamp. On load, if the cloud copy is
// newer than what this device last synced, we hydrate the store from the cloud;
// otherwise we push the local copy up.

import { supabase } from "@/integrations/supabase/client";
import { useGame } from "@/lib/game/store";

const TABLE = "game_saves";
const TS_KEY = "tomorrow-matrix-cloud-ts";

// The generated Supabase types don't include game_saves; cast to keep TS calm.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

function localTs(): number {
  try {
    return Number(localStorage.getItem(TS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setLocalTs(t: number) {
  try {
    localStorage.setItem(TS_KEY, String(t));
  } catch {
    /* storage unavailable — ignore */
  }
}

// Data-only snapshot of the store. JSON round-trip drops the action functions,
// leaving just the serializable game state (same shape the store persists).
function snapshot(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(useGame.getState()));
}

// Does this state represent real, worth-keeping progress? A freshly `reset()`
// store (which several "start over" / "try again" buttons produce) has none of
// these. We refuse to push such an empty snapshot over the cloud save so a
// signed-in player can never wipe their own progress by restarting locally.
function hasProgress(state: Record<string, unknown>): boolean {
  const len = (k: string) => (Array.isArray(state[k]) ? (state[k] as unknown[]).length : 0);
  const roleProgress = state.roleProgress as Record<string, unknown> | undefined;
  return (
    len("solvedMysteries") > 0 ||
    len("solveRecords") > 0 ||
    len("purchasedInterventions") > 0 ||
    len("resolvedCrises") > 0 ||
    (!!roleProgress && Object.keys(roleProgress).length > 0)
  );
}

// True while we're applying a remote state, so the store subscription doesn't
// immediately echo it back to the server.
let applyingRemote = false;

export async function saveToCloud(userId: string): Promise<void> {
  const state = snapshot();
  // Never overwrite the cloud save with an empty, freshly-reset store. This is
  // the guard that stops a local "restart" from nuking real cloud progress.
  if (!hasProgress(state)) return;
  const now = Date.now();
  const { error } = await db.from(TABLE).upsert({
    id: userId,
    state,
    updated_at: new Date(now).toISOString(),
  });
  if (!error) setLocalTs(now);
}

export async function loadFromCloud(userId: string): Promise<void> {
  const { data, error } = await db
    .from(TABLE)
    .select("state, updated_at")
    .eq("id", userId)
    .maybeSingle();

  // Table missing / offline / no permission: silently keep playing locally.
  if (error) return;

  const hasCloudState =
    data && data.state && Object.keys(data.state as object).length > 0;

  if (!hasCloudState) {
    // First time on this account — seed the row from whatever is local.
    await saveToCloud(userId);
    return;
  }

  const cloudTs = new Date(data.updated_at).getTime();
  if (cloudTs >= localTs()) {
    applyingRemote = true;
    useGame.setState(data.state as Record<string, unknown>);
    setLocalTs(cloudTs);
    applyingRemote = false;
  } else {
    // This device has newer progress (e.g. played offline) — push it up.
    await saveToCloud(userId);
  }
}

let unsubscribe: (() => void) | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;

export function startCloudSync(userId: string): void {
  stopCloudSync();
  unsubscribe = useGame.subscribe(() => {
    if (applyingRemote) return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      void saveToCloud(userId);
    }, 1500);
  });
}

export function stopCloudSync(): void {
  if (debounce) {
    clearTimeout(debounce);
    debounce = null;
  }
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
