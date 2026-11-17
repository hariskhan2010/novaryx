"use server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

export type ContactState = { ok?: boolean; error?: string; fields?: Partial<Record<"phone" | "email" | "details", string>> };

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const PHONE = /^\+?\d{7,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Saves a contact message into public.custom_requests (anyone may insert; only admins can read). */
export async function sendMessage(_prev: ContactState, f: FormData): Promise<ContactState> {
  if (str(f, "website", 200)) return { ok: true }; // honeypot: bots fill hidden fields
  const phone = str(f, "phone", 30), email = str(f, "email", 200), details = str(f, "details", 5000);
  const fields: ContactState["fields"] = {};
  if (!PHONE.test(phone.replace(/[\s\-().]/g, ""))) fields.phone = "Add a phone number we can reach you on, like +92 300 1234567.";
  if (!EMAIL.test(email)) fields.email = "Add an email we can reply to, like you@example.com.";
  if (details.length < 10) fields.details = "Tell us a little about the project (at least 10 characters).";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };
  if (!supabaseConfigured) return { error: "Messages can't be sent right now. Please email us instead." };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("custom_requests").insert({
    phone, email, details, name: "", project_type: "", budget: "",
  });
  if (error) return { error: "Your message didn't go through. Please try again, or email us." };
  return { ok: true };
}
