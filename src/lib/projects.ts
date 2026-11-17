import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

import { PROJECT_COLS, type Project } from "@/lib/project-types";

export type { Project };

const db = () => createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

/** Published projects, newest first. Cached; the admin panel refreshes the "projects" tag on save. */
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("days");
  if (!supabaseConfigured) return [];
  const { data, error } = await db().from("projects").select(PROJECT_COLS).eq("published", true)
    .order("year", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  if (error) { console.error("getProjects:", error.message); return []; }
  return (data ?? []) as Project[];
}

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects");
  cacheLife("days");
  if (!supabaseConfigured) return null;
  const { data } = await db().from("projects").select(PROJECT_COLS).eq("published", true).eq("slug", slug).maybeSingle();
  return (data as Project | null) ?? null;
}
