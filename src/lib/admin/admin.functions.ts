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
