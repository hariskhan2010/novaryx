import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/** Secret key: bypasses row level security. Server only, never sent to the browser. */
const SECRET = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const adminConfigured = Boolean(SUPABASE_URL && SECRET);

export function adminDb() {
  if (!adminConfigured) throw new Error("SUPABASE_SECRET_KEY is not set.");
  return createClient(SUPABASE_URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const BUCKET = "projects";
