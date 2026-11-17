"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Demo form: validates and confirms, but sends nothing. */
export function EnquiryForm({ stones }: { stones: { slug: string; name: string }[] }) {
  const pre = useSearchParams().get("stone") ?? "";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (String(f.get("name") ?? "").trim().length < 2) next.name = "Add your name.";
    if (!EMAIL.test(String(f.get("email") ?? "").trim())) next.email = "Add an email we can reply to, like you@example.com.";
    if (String(f.get("message") ?? "").trim().length < 10) next.message = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) {
      (e.currentTarget.querySelector(`[name="${Object.keys(next)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="vl-form" role="status">
        <h2 className="vl-h3">Enquiry ready</h2>
        <p className="vl-muted">This is a demo site, so nothing was sent. On a live site, this is where the stone dealer would receive your message.</p>
      </div>
    );
  }

  const field = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `vl-e-${k}` } : {});
  return (
    <form className="vl-form" onSubmit={submit} noValidate>
      <label htmlFor="vl-name">Your name</label>
      <input id="vl-name" name="name" autoComplete="name" {...field("name")} />
      {errors.name && <span className="vl-err" id="vl-e-name">{errors.name}</span>}

      <label htmlFor="vl-email">Email</label>
      <input id="vl-email" name="email" type="email" autoComplete="email" {...field("email")} />
      {errors.email && <span className="vl-err" id="vl-e-email">{errors.email}</span>}

      <label htmlFor="vl-stone">Stone</label>
      <select id="vl-stone" name="stone" defaultValue={pre}>
        <option value="">Not sure yet</option>
        {stones.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>

      <label htmlFor="vl-msg">What are you looking for?</label>
      <textarea id="vl-msg" name="message" rows={5} placeholder="Colour, size, budget, or the piece it's for." {...field("message")} />
      {errors.message && <span className="vl-err" id="vl-e-message">{errors.message}</span>}

      <button className="vl-btn vl-btn-solid" type="submit">Send enquiry</button>
      <p className="vl-muted vl-small">Demo site: enquiries are not sent anywhere.</p>
    </form>
  );
}
