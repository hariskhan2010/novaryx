"use client";
import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { NEEDS } from "@/lib/content";

const shake = (el: Element | null) => {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  (el as HTMLElement).animate([0, -8, 8, -6, 6, -3, 0].map((v) => ({ translate: `${v}px 0` })), { duration: 420, easing: "ease-out" });
};

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});
  const form = useRef<HTMLFormElement>(null);

  // Errors: shake each bad field once (on submit only) and focus the first one.
  useEffect(() => {
    if (!state.fields || !form.current) return;
    const bad = Object.keys(state.fields).map((k) => form.current!.querySelector(`[name="${k}"]`));
    bad.forEach(shake);
    (bad[0] as HTMLElement | null)?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div className="form" role="status">
        <p className="done">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Message sent. We&apos;ll reply by email soon.
        </p>
      </div>
    );
  }

  const f = state.fields ?? {};
  return (
    <form ref={form} className="form" action={action} noValidate>
      <h2 className="sr">Send us a message</h2>
      <div className="hp" aria-hidden="true"><label htmlFor="f-web">Website</label><input id="f-web" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input className="input" id="f-name" name="name" autoComplete="name" aria-invalid={f.name ? true : undefined} aria-describedby={f.name ? "e-name" : undefined} />
        {f.name && <span className="field-err" id="e-name">{f.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input className="input" id="f-email" name="email" type="email" autoComplete="email" aria-invalid={f.email ? true : undefined} aria-describedby={f.email ? "e-email" : undefined} />
        {f.email && <span className="field-err" id="e-email">{f.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-need">What do you need?</label>
        <select className="input" id="f-need" name="need">{NEEDS.map((n) => <option key={n}>{n}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="f-details">Project details</label>
        <textarea className="input" id="f-details" name="details" placeholder="What should it do, who is it for, and when do you need it?" aria-invalid={f.details ? true : undefined} aria-describedby={f.details ? "e-details" : undefined} />
        {f.details && <span className="field-err" id="e-details">{f.details}</span>}
      </div>
      <p className="err" aria-live="polite">{state.error}</p>
      <button className="btn btn-pri" type="submit" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Sending…" : "Send request"}</button>
    </form>
  );
}
