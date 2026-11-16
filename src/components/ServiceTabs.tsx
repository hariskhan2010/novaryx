"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SERVICE_GROUPS, TEAM } from "@/lib/content";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Service groups as tabs; one pill slides to the selected tab. */
export function ServiceTabs() {
  const [sel, setSel] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useIso(() => {
    const place = () => {
      const b = list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[sel];
      if (!b || !pill.current) return;
      pill.current.style.setProperty("--x", `${b.offsetLeft}px`);
      pill.current.style.setProperty("--w", `${b.offsetWidth}px`);
    };
    place();
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
    if (!first.current && panel.current && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      panel.current.animate([{ opacity: 0, translate: "0 10px" }, { opacity: 1, translate: "0 0" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
    first.current = false;
    return () => removeEventListener("resize", place);
  }, [sel]);

  function key(e: React.KeyboardEvent, i: number) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + SERVICE_GROUPS.length) % SERVICE_GROUPS.length;
    setSel(n);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
  }

  const g = SERVICE_GROUPS[sel];
  const lead = TEAM.find((m) => m.id === g.lead)!;
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Service groups" ref={list}>
        <span className="pill" aria-hidden="true" ref={pill} />
        {SERVICE_GROUPS.map((x, i) => (
          <button key={x.id} type="button" role="tab" id={`t-${x.id}`} aria-controls="svc-panel" aria-selected={i === sel} tabIndex={i === sel ? 0 : -1} onClick={() => setSel(i)} onKeyDown={(e) => key(e, i)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="section" style={{ paddingTop: 34 }}>
        <div role="tabpanel" id="svc-panel" aria-labelledby={`t-${g.id}`} ref={panel}>
          <h2 className="sr">{g.label} services</h2>
          <ul className="svc reset">
            {g.items.map((s) => <li key={s.t}><b>{s.t}</b><span className="muted">{s.d}</span></li>)}
          </ul>
          <p className="lead-by"><Image src={lead.photo} alt="" width={40} height={40} />{g.leadNote}</p>
        </div>
      </div>
    </>
  );
}
