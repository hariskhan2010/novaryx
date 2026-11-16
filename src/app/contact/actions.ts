"use server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";
import { NEEDS } from "@/lib/content";

export type ContactState = { ok?: boolean; error?: string; fields?: Partial<Record<"name" | "email" | "details", string>> };

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Saves a contact message into public.custom_requests (anyone may insert; only admins can read). */
export async function sendMessage(_prev: ContactState, f: FormData): Promise<ContactState> {
  if (str(f, "website", 200)) return { ok: true }; // honeypot: bots fill hidden fields
  const name = str(f, "name", 120), email = str(f, "email", 200), details = str(f, "details", 5000);
  const need = str(f, "need", 60);
  const fields: ContactState["fields"] = {};
  if (name.length < 2) fields.name = "Add your name.";
  if (!EMAIL.test(email)) fields.email = "Add an email we can reply to, like you@example.com.";
  if (details.length < 10) fields.details = "Tell us a little about the project (at least 10 characters).";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };
  if (!supabaseConfigured) return { error: "Messages can't be sent right now. Please email us instead." };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("custom_requests").insert({
    name, email, details, project_type: NEEDS.includes(need) ? need : "", budget: "",
  });
  if (error) return { error: "Your message didn't go through. Please try again, or email us." };
  return { ok: true };
}
