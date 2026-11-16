import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getAdmin } from "@/lib/supabase/server";

export async function UserNav() {
  if (!supabaseConfigured) return null;
  const { user, isAdmin } = await getAdmin();
  if (!user) {
    return (
      <Link href="/login" className="btn btn-sm btn-pri">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link href="/admin" className="btn btn-sm hidden sm:inline-flex">
          Admin
        </Link>
      )}
      <Link href="/account" className="btn btn-sm btn-pri">
        My account
      </Link>
    </div>
  );
}
