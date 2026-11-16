"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";
import type { FormState } from "@/app/actions";

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isUrl = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch { return false; } };

async function requireAdmin() {
  const ctx = await getAdmin();
  if (!ctx.isAdmin) throw new Error("Not allowed");
  return ctx.supabase;
}

export async function saveProject(_prev: FormState, f: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = str(f, "id", 64);
  const title = str(f, "title", 120);
  const slug = str(f, "slug", 80).toLowerCase();
  const priceRaw = str(f, "monthly_price", 20);
  const currency = str(f, "currency", 3).toUpperCase() || "USD";
  const category = str(f, "category", 60);
  const demo_url = str(f, "demo_url", 500);
  const live_url = str(f, "live_url", 500);
  const cover_url = str(f, "cover_url", 500);
  const source_path = str(f, "source_path", 300);

  const fields: Record<string, string> = {};
  if (title.length < 2) fields.title = "Enter a title.";
  if (!SLUG.test(slug)) fields.slug = "Use lowercase letters, numbers and dashes, like my-project.";
  const price = priceRaw === "" ? null : Number(priceRaw);
  if (price !== null && (!Number.isFinite(price) || price < 0)) fields.monthly_price = "Enter a number, or leave empty for 'Price on request'.";
  if (!/^[A-Z]{3}$/.test(currency)) fields.currency = "Use a 3-letter code like USD or PKR.";
  if (demo_url && !isUrl(demo_url)) fields.demo_url = "Enter a full link starting with https://";
  if (live_url && !isUrl(live_url)) fields.live_url = "Enter a full link starting with https://";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };

  const row = {
    title, slug, currency,
    summary: str(f, "summary", 300),
    description: str(f, "description", 10000),
    category: CATEGORIES.includes(category) ? category : "Other",
    tech: str(f, "tech", 500).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20),
    demo_url: demo_url || null,
    cover_url: cover_url || null,
    monthly_price: price,
    offers_hosted: f.get("offers_hosted") === "on",
    offers_setup: f.get("offers_setup") === "on",
    offers_source: f.get("offers_source") === "on",
    published: f.get("published") === "on",
  };

  let projectId = id;
  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) return { error: error.code === "23505" ? "That link name (slug) is already used." : error.message };
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) return { error: error.code === "23505" ? "That link name (slug) is already used." : error.message };
    projectId = data.id;
  }
  const { error: accErr } = await supabase
    .from("project_access")
    .upsert({ project_id: projectId, live_url: live_url || null, source_path: source_path || null });
  if (accErr) return { error: "Project saved, but the private links failed: " + accErr.message };

  revalidatePath("/", "layout");
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(f: FormData) {
  const supabase = await requireAdmin();
  const id = str(f, "id", 64);
  const { data: acc } = await supabase.from("project_access").select("source_path").eq("project_id", id).maybeSingle();
  if (acc?.source_path) await supabase.storage.from("sources").remove([acc.source_path]);
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/projects?deleted=1");
}

export async function updateSubscription(f: FormData) {
  const supabase = await requireAdmin();
  const status = str(f, "status", 20);
  if (!["pending", "active", "cancelled"].includes(status)) throw new Error("Bad status");
  await supabase.from("subscriptions").update({ status, admin_note: str(f, "admin_note", 2000) }).eq("id", str(f, "id", 64));
  revalidatePath("/admin/orders");
}

export async function updateRequest(f: FormData) {
  const supabase = await requireAdmin();
  const status = str(f, "status", 20);
  if (!["new", "contacted", "closed"].includes(status)) throw new Error("Bad status");
  await supabase.from("custom_requests").update({ status }).eq("id", str(f, "id", 64));
  revalidatePath("/admin/requests");
}
