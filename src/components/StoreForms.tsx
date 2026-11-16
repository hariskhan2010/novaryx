"use client";
import Link from "next/link";
import { useState } from "react";
import { sendCustomRequest, signIn, signUp, subscribe } from "@/app/actions";
import { OPTION_HELP, OPTION_LABEL, type SubOption } from "@/lib/types";
import { ActionForm, Field, SuccessBox } from "./forms";

export function SubscribeForm({ projectId, options }: { projectId: string; options: SubOption[] }) {
  const [opt, setOpt] = useState<SubOption>(options[0]);
  return (
    <ActionForm action={subscribe} className="grid gap-4">
      {(state, pending) => (
        <>
          <input type="hidden" name="project_id" value={projectId} />
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-semibold">How do you want it?</legend>
            {options.map((o) => (
              <label
                key={o}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${opt === o ? "border-accent bg-accent/10" : "border-line"}`}
              >
                <input type="radio" name="option" value={o} checked={opt === o} onChange={() => setOpt(o)} className="mt-1 accent-[var(--accent)]" />
                <span>
                  <span className="block font-semibold">{OPTION_LABEL[o]}</span>
                  <span className="text-sm text-muted">{OPTION_HELP[o]}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Field name="contact_phone" label="WhatsApp or phone (optional)" type="tel" state={state} autoComplete="tel" hint="So we can reach you to confirm payment." />
          <Field name="message" label="Anything we should know? (optional)" state={state} textarea placeholder="Your domain, branding, deadline…" />
          <button className="btn btn-pri" disabled={pending}>{pending ? "Sending…" : "Request subscription"}</button>
          <p className="text-sm text-muted">We confirm payment with you, then activate your access. You can see the status in My account.</p>
        </>
      )}
    </ActionForm>
  );
}

export function CustomRequestForm() {
  return (
    <ActionForm
      action={sendCustomRequest}
      className="grid max-w-2xl gap-2"
      success={
        <SuccessBox title="Request sent">
          Thanks. We&apos;ll read your request and reply by email. <Link href="/projects" className="text-accent underline">Browse projects</Link> meanwhile.
        </SuccessBox>
      }
    >
      {(state, pending) => (
        <>
          <Field name="name" label="Your name" state={state} autoComplete="name" required />
          <Field name="email" label="Email" type="email" state={state} autoComplete="email" required />
          <div className="field">
            <label htmlFor="f-project_type">Type of project</label>
            <select id="f-project_type" name="project_type" className="input">
              <option>Website</option><option>Web app</option><option>Mobile app</option><option>E-commerce</option>
              <option>AI tool</option><option>Design / branding</option><option>Other</option>
            </select>
          </div>
          <div className="h-3" />
          <Field name="budget" label="Budget (optional)" state={state} placeholder="e.g. 500 USD" />
          <Field name="details" label="What should we build?" state={state} textarea required hint="Features, pages, examples you like, deadline." />
          <div><button className="btn btn-pri" disabled={pending}>{pending ? "Sending…" : "Send request"}</button></div>
        </>
      )}
    </ActionForm>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const login = mode === "login";
  return (
    <ActionForm
      action={login ? signIn : signUp}
      className="grid gap-2"
      success={<SuccessBox title="Check your email">We sent you a link to confirm your account. Open it, then sign in.</SuccessBox>}
    >
      {(state, pending) => (
        <>
          <input type="hidden" name="next" value={next} />
          <Field name="email" label="Email" type="email" state={state} autoComplete="email" required />
          <Field name="password" label="Password" type="password" state={state} autoComplete={login ? "current-password" : "new-password"} required hint={login ? undefined : "At least 8 characters."} />
          <button className="btn btn-pri" disabled={pending}>{pending ? "Please wait…" : login ? "Sign in" : "Create account"}</button>
        </>
      )}
    </ActionForm>
  );
}
