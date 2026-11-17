import "server-only";
import { headers } from "next/headers";

/** Allowed admin IPs, comma separated, from the ADMIN_IPS env var. */
const allowed = () =>
  (process.env.ADMIN_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

/**
 * The visitor's IP. Only trusted on Vercel, which overwrites x-real-ip and
 * x-forwarded-for itself, so a visitor cannot fake them. Anywhere else we
 * don't know who set those headers, so we return null.
 */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  if (!process.env.VERCEL) return null;
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/** True when this request may use the admin panel. */
export async function isAdmin(): Promise<boolean> {
  // `next dev` on this computer: there is no proxy in front, so allow it.
  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    const h = await headers();
    const host = (h.get("host") ?? "").split(":")[0];
    return host === "localhost" || host === "127.0.0.1";
  }
  const ip = await clientIp();
  return ip !== null && allowed().includes(ip);
}

/** Throws unless the request comes from an allowed IP. Call at the top of every admin action. */
export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Not allowed.");
}
