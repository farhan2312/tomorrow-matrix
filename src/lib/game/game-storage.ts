// Per-tab game state for multiplayer.
//
// The single-player game persists to localStorage, which is shared across every
// tab of a browser. In multiplayer that's wrong: two players opened in one
// browser (or two tabs testing) would share one solved list / role progress /
// CAP, which is why an already-solved mystery re-asked its questions and a late
// joiner skipped the stakeholder questions (MP-03 / MP-06).
//
// While a tab is in a multiplayer session we flag it (in sessionStorage, which
// is per-tab) and route the game store's persistence to sessionStorage, so each
// player's game state is their own. Single-player keeps using localStorage and
// is untouched — it stays frozen in localStorage while a multiplayer session
// runs in sessionStorage, and is restored when the tab leaves multiplayer.

const MP_FLAG = "tm-mp-active";

export function isMultiplayerSession(): boolean {
  try { return sessionStorage.getItem(MP_FLAG) === "1"; } catch { return false; }
}

export function setMultiplayerSession(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(MP_FLAG, "1");
    else sessionStorage.removeItem(MP_FLAG);
  } catch { /* storage blocked — multiplayer falls back to shared state */ }
}

/**
 * A Storage-shaped adapter for zustand persist: reads/writes the game state
 * from sessionStorage while this tab is in a multiplayer session, otherwise
 * from localStorage. Every access is guarded so a blocked/absent store just
 * behaves like "no saved state".
 */
export const gameStateStorage = {
  getItem(name: string): string | null {
    try {
      return (isMultiplayerSession() ? sessionStorage : localStorage).getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name: string, value: string): void {
    try {
      (isMultiplayerSession() ? sessionStorage : localStorage).setItem(name, value);
    } catch { /* ignore */ }
  },
  removeItem(name: string): void {
    try { localStorage.removeItem(name); } catch { /* ignore */ }
    try { sessionStorage.removeItem(name); } catch { /* ignore */ }
  },
};
