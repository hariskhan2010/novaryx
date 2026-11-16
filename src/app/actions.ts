"use server";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { SITE_URL, supabaseConfigured } from "@/lib/supabase/env";
import { offeredOptions, type SubOption } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean; fields?: Record<string, string> };

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/account");

/* ── Subscribe to a project (creates a pending request) ── */
export async function subscribe(_prev: FormState, f: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: "The store isn't connected yet." };
  const { supabase, user } = await getUser();
  if (!user) return { error: "Please sign in first." };

  const projectId = str(f, "project_id", 64);
  const option = str(f, "option", 16) as SubOption;
  const message = str(f, "message", 2000);
  const contact_phone = str(f, "contact_phone", 40);

  const { data: project } = await supabase
    .from("projects")
    .select("id,slug,offers_hosted,offers_setup,offers_source,published")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || !project.published) return { error: "This project isn't available." };
  if (!offeredOptions(project).includes(option)) return { error: "Choose one of the options for this project.", fields: { option: "Choose an option." } };

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id,status")
    .eq("project_id", projectId)
    .eq("option", option)
    .in("status", ["pending", "active"])
    .limit(1);
  if (existing && existing.length) {
    return { error: existing[0].status === "active" ? "You already have this subscription. Find it in My account." : "Your request for this is already waiting for confirmation." };
  }

  const { error } = await supabase.from("subscriptions").insert({ project_id: projectId, option, message, contact_phone, contact_email: user.email ?? "" });
  if (error) return { error: "Couldn't send your request. Please try again." };
  redirect("/account?requested=1");
}

/* ── Custom project request (no sign-in needed) ── */
export async function sendCustomRequest(_prev: FormState, f: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: "The store isn't connected yet." };
  const name = str(f, "name", 120), email = str(f, "email", 200), details = str(f, "details", 5000);
  const project_type = str(f, "project_type", 60), budget = str(f, "budget", 60);
  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Enter your name.";
  if (!EMAIL.test(email)) fields.email = "Enter an email like name@company.com.";
  if (details.length < 10) fields.details = "Describe the project in at least 10 characters.";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("custom_requests").insert({ name, email, details, project_type, budget, user_id: auth.user?.id ?? null });
  if (error) return { error: "Couldn't send your request. Please try again." };
  return { ok: true };
}

/* ── Auth ── */
export async function signIn(_prev: FormState, f: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: "Sign-in isn't connected yet." };
  const email = str(f, "email", 200), password = String(f.get("password") ?? "");
  if (!EMAIL.test(email) || !password) return { error: "Enter your email and password.", fields: { email: EMAIL.test(email) ? "" : "Enter a valid email." } };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email or password is wrong, or the email isn't confirmed yet." };
  redirect(safeNext(str(f, "next", 200)));
}

export async function signUp(_prev: FormState, f: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: "Sign-up isn't connected yet." };
  const email = str(f, "email", 200), password = String(f.get("password") ?? "");
  const fields: Record<string, string> = {};
  if (!EMAIL.test(email)) fields.email = "Enter a valid email.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";
  if (Object.keys(fields).length) return { error: "Check the highlighted fields.", fields };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/confirm?next=/account` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/account");
  return { ok: true };
}

export async function signOut() {
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
