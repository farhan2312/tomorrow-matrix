// Server-only admin auth helpers. Never imported into the client bundle
// (only referenced via dynamic import inside server-function handlers).
import crypto from "node:crypto";

/** Constant-time compare of a supplied password against ADMIN_PASSWORD. */
export function checkPassword(pw: string): boolean {
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) return false;
  const a = crypto.createHash("sha256").update(String(pw)).digest();
  const b = crypto.createHash("sha256").update(admin).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Issue a signed, expiring session token (HMAC keyed by ADMIN_PASSWORD). */
export function issueToken(hours = 8): string {
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) throw new Error("ADMIN_PASSWORD is not configured on the server.");
  const payload = String(Date.now() + hours * 3_600_000);
  const sig = crypto.createHmac("sha256", admin).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Validate a session token (signature + expiry). Used to gate admin data calls. */
export function validToken(token: string | undefined | null): boolean {
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", admin).update(payload).digest("base64url");
  if (sig.length !== expected.length) return false;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  return Date.now() <= Number(payload);
}

/** Throw if the token is invalid; call at the top of every admin data handler. */
export function requireAdmin(token: string | undefined | null): void {
  if (!validToken(token)) throw new Error("Unauthorized");
}
