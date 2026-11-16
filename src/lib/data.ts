import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

const COLS =
  "id,slug,title,summary,description,category,tech,cover_url,demo_url,monthly_price,currency,offers_hosted,offers_setup,offers_source,published,created_at";

export async function listProjects(opts: { category?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let q = supabase.from("projects").select(COLS).eq("published", true).order("created_at", { ascending: false });
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function getProject(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select(COLS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Project | null;
}
