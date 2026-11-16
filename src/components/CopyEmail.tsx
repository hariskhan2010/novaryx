"use client";
import { useRef, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [msg, setMsg] = useState("");
  const code = useRef<HTMLElement>(null);
  function copy() {
    const select = () => {
      const r = document.createRange();
      if (code.current) r.selectNodeContents(code.current);
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
      setMsg("Selected. Press Ctrl+C to copy.");
    };
    try { navigator.clipboard.writeText(email).then(() => setMsg("Email copied."), select); } catch { select(); }
  }
  return (
    <>
      <div className="mail"><code ref={code}>{email}</code><button className="btn" type="button" onClick={copy}>Copy email</button></div>
      <p className="muted" aria-live="polite" style={{ marginTop: 10, fontSize: 14 }}>{msg}</p>
    </>
  );
}
