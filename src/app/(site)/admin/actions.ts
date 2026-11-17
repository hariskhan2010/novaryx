"use server";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, COOKIE_MAX_AGE, assertAdmin, passwordConfigured, passwordMatches, sessionToken } from "@/lib/admin/auth";
import { adminDb, BUCKET } from "@/lib/supabase/admin";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { CATEGORIES } from "@/lib/project-types";

export type LoginState = { error?: string };

/** Checks the admin password and remembers this device for 30 days. */
export async function login(_prev: LoginState, f: FormData): Promise<LoginState> {
  if (!passwordConfigured()) return { error: "Admin password is not set. Add ADMIN_PASSWORD (8+ characters) to the environment." };
  const input = String(f.get("password") ?? "").slice(0, 200);
  if (!passwordMatches(input)) {
    await new Promise((r) => setTimeout(r, 900)); // slows down guessing
    return { error: "Wrong password." };
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: COOKIE_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

export type SaveState = { error?: string; fields?: Partial<Record<"title" | "summary" | "category" | "demo_url" | "year", string>> };

const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const ours = (u: string) => u.startsWith(PUBLIC_PREFIX) && !u.includes("..");
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "project";

const MIME: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** A one-time link the browser uses to upload one image straight to Supabase Storage. */
export async function createUploadUrl(type: string): Promise<{ path: string; token: string; publicUrl: string } | { error: string }> {
  await assertAdmin();
  const ext = MIME[type];
  if (!ext) return { error: "Use a JPG, PNG, WebP or AVIF image." };
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await adminDb().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "Couldn't start the upload. Is the 'projects' storage bucket created?" };
  return { path, token: data.token, publicUrl: PUBLIC_PREFIX + path };
}

export async function saveProject(_prev: SaveState, f: FormData): Promise<SaveState> {
  await assertAdmin();
  const id = str(f, "id", 64);
  const title = str(f, "title", 120);
  const category = str(f, "category", 60);
  const summary = str(f, "summary", 300);
  const description = str(f, "description", 10000);
  const client = str(f, "client", 120);
  const client_need = str(f, "client_need", 3000);
  const delivered = str(f, "delivered", 3000);
  const yearRaw = str(f, "year", 4);
  const demo_url = str(f, "demo_url", 500);
  const tech = str(f, "tech", 500).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
  const cover_url = str(f, "cover_url", 500);
  const gallery = f.getAll("gallery").map(String).filter(ours).slice(0, 12);

  const fields: SaveState["fields"] = {};
  if (title.length < 2) fields.title = "Add a title.";
  if (!(CATEGORIES as readonly string[]).includes(category)) fields.category = "Pick a category.";
  if (summary.length < 10) fields.summary = "Add a short summary (at least 10 characters).";
  if (demo_url && !/^https?:\/\/[^\s]+$/i.test(demo_url)) fields.demo_url = "Use a full link starting with https://";
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && !(Number.isInteger(year) && year >= 2000 && year <= 2100)) fields.year = "Use a year like 2026.";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };
  if (cover_url && !ours(cover_url)) return { error: "The cover image must be uploaded here." };

  const row = {
    title, category, summary, description, client, client_need, delivered, year, tech,
    demo_url: demo_url || null, cover_url: cover_url || null, gallery, published: true,
  };
  const db = adminDb();
  const { error } = id
    ? await db.from("projects").update(row).eq("id", id)
    : await db.from("projects").insert({ ...row, slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 4)}` });
  if (error) return { error: `Save failed: ${error.message}` };

  updateTag("projects");
  redirect("/admin?saved=1");
}

export async function deleteProject(f: FormData) {
  await assertAdmin();
  const id = String(f.get("id") ?? "");
  const db = adminDb();
  const { data } = await db.from("projects").select("cover_url,gallery").eq("id", id).maybeSingle();
  await db.from("projects").delete().eq("id", id);
  const files = [data?.cover_url, ...(data?.gallery ?? [])]
    .filter((u): u is string => typeof u === "string" && ours(u)).map((u) => u.slice(PUBLIC_PREFIX.length));
  if (files.length) await db.storage.from(BUCKET).remove(files);
  updateTag("projects");
  redirect("/admin?deleted=1");
}
