"use client";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/(site)/admin/actions";

export function AdminLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form className="form admin-login" action={action}>
      <p className="mono form-title">Admin</p>
      <h1 className="h2" style={{ fontSize: "clamp(30px,4vw,44px)" }}>Enter the admin password</h1>
      <div className="field">
        <label htmlFor="a-pass">Password</label>
        <input className="input" id="a-pass" name="password" type="password" autoComplete="current-password" required
          aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? "a-err" : undefined} />
      </div>
      <p className="err" id="a-err" aria-live="polite">{state.error}</p>
      <button className="btn btn-pri form-submit" type="submit" disabled={pending} style={{ justifySelf: "start" }}>
        {pending ? "Checking…" : "Open admin"}
      </button>
    </form>
  );
}
