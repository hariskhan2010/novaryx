import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Admin access: one password (ADMIN_PASSWORD env var), remembered on the device by a signed cookie. */
export const ADMIN_COOKIE = "nvx_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const password = () => process.env.ADMIN_PASSWORD ?? "";
export const passwordConfigured = () => password().length >= 8;

/** Cookie value derived from the password; changing the password signs everyone out. */
export function sessionToken(): string {
  return createHmac("sha256", password()).update("novaryx-admin-v1").digest("hex");
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function passwordMatches(input: string): boolean {
  return passwordConfigured() && same(input, password());
}

/** True when this request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  // Read the cookie first, always: this keeps /admin rendered per request (never a static page).
  const c = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  return passwordConfigured() && same(c, sessionToken());
}

/** Throws unless signed in. Call at the top of every admin action. */
export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Not allowed.");
}
