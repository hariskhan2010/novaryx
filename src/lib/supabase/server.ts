import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** A new client per request. Uses the visitor's session cookies, so RLS applies. */
export async function createClient() {
  // Mark this render as per-request before Supabase touches clocks or cookies
  // (required by Next.js cacheComponents; otherwise it reports a blocking route).
  await connection();
  const cookieStore = await cookies();
  const { createServerClient } = await import("@supabase/ssr");
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in user (verified), or null. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user ?? null };
}

/** True when the signed-in user is listed in public.admins. */
export async function getAdmin() {
  const { supabase, user } = await getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: data === true };
}
