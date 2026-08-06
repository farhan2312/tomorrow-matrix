// Per-tab guest identity. Persists across reloads in localStorage.
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

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export function getGuestName(): string {
  if (typeof window === "undefined") return "Player";
  let n = localStorage.getItem(NAME_KEY);
  if (!n) {
    n = `Player ${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(NAME_KEY, n);
  }
  return n;
}

export function setGuestName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
}
