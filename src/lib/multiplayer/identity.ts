// Per-TAB guest identity for multiplayer.
//
// The id lives in sessionStorage (NOT localStorage) so that every browser tab
// is its own player: opening a second tab of the same browser used to reuse the
// first tab's localStorage id, which made the 2nd tab "become" the 1st tab's
// player and inherit its role. sessionStorage survives reloads of the same tab
// but is not shared with other tabs/windows, so each tab gets a fresh id.
const CLIENT_KEY = "tomorrow-matrix-client-id";
const NAME_KEY = "tomorrow-matrix-name";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// In-memory fallback for environments where sessionStorage throws (private
// mode, blocked site data). Still unique per page load / tab.
let memoryId: string | null = null;
let memoryName: string | null = null;

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    if (!memoryId) memoryId = uuid();
    return memoryId;
  }
}

export function getGuestName(): string {
  if (typeof window === "undefined") return "Player";
  try {
    let n = sessionStorage.getItem(NAME_KEY);
    if (!n) {
      n = `Player ${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem(NAME_KEY, n);
    }
    return n;
  } catch {
    if (!memoryName) memoryName = `Player ${Math.floor(1000 + Math.random() * 9000)}`;
    return memoryName;
  }
}

export function setGuestName(name: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NAME_KEY, name);
  } catch {
    memoryName = name;
  }
}
