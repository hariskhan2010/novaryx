"use client";
import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions";

/** Shared field: shows the error text and marks the input invalid (never motion alone). */
export function Field({
  name, label, state, type = "text", textarea, required, defaultValue, autoComplete, placeholder, hint,
}: {
  name: string; label: string; state: FormState; type?: string; textarea?: boolean; required?: boolean;
  defaultValue?: string; autoComplete?: string; placeholder?: string; hint?: string;
}) {
  const err = state.fields?.[name];
  const id = `f-${name}`;
  const common = {
    id, name, required, defaultValue, placeholder, autoComplete,
    className: "input",
    "aria-invalid": err ? true : undefined,
    "aria-describedby": `${id}-err${hint ? ` ${id}-hint` : ""}`,
  } as const;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>}
      {textarea ? <textarea {...common} /> : <input type={type} {...common} />}
      <p id={`${id}-err`} className="min-h-[1.2em] text-sm text-bad" aria-live="polite">{err}</p>
    </div>
  );
}

/** Form wrapper: shakes the first invalid field on a failed submit. */
export function ActionForm({
  action, children, className, success,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  children: (state: FormState, pending: boolean) => React.ReactNode;
  className?: string;
  success?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state.error || !ref.current) return;
    const bad = ref.current.querySelector<HTMLElement>("[aria-invalid='true']");
    if (bad) {
      bad.focus();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
        bad.animate([0, -8, 8, -6, 6, -3, 0].map((x) => ({ translate: `${x}px 0` })), { duration: 420, easing: "ease-out" });
    }
  }, [state]);
  if (state.ok && success) return <>{success}</>;
  return (
    <form ref={ref} action={formAction} className={className} noValidate>
      {children(state, pending)}
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
    </form>
  );
}

export function SuccessBox({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-ok p-5">
      <svg viewBox="0 0 28 28" className="h-7 w-7 flex-none" aria-hidden="true">
        <path d="M6 14.5l5 5 11-11" style={{ stroke: "var(--ok)", strokeWidth: 3, fill: "none", strokeDasharray: 30, strokeDashoffset: 0, animation: "draw .3s ease-out" }} />
      </svg>
      <div>
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 text-muted">{children}</div>}
      </div>
      <style>{`@keyframes draw{from{stroke-dashoffset:30}}`}</style>
    </div>
  );
}
