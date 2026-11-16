"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CATS = [
  { id: "web", label: "Web apps", d: "Dashboards, booking systems, stores and internal tools that run in the browser." },
  { id: "site", label: "Websites", d: "Business sites, portfolios and landing pages, fast and ready to rank." },
  { id: "mob", label: "Mobile apps", d: "Apps for Android and iOS, built from one codebase." },
  { id: "ai", label: "AI tools", d: "Chat assistants and automations that take repetitive work off your plate." },
];

// Same wording as the delivery options in the store.
const OPTIONS = [
  { t: "Live hosted app", d: "Use the project online. We host and maintain it for you." },
  { t: "Setup & customization", d: "We install it on your server or domain and customize it for you." },
  { t: "Source code", d: "Download the full source code and run it yourself." },
];

/** Project categories as tabs; one pill slides to the selected tab. */
export function CategoryTabs() {
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
    const n = (i + d + CATS.length) % CATS.length;
    setSel(n);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
  }

  const c = CATS[sel];
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Project categories" ref={list}>
        <span className="pill" aria-hidden="true" ref={pill} />
        {CATS.map((x, i) => (
          <button key={x.id} type="button" role="tab" id={`c-${x.id}`} aria-controls="cat-panel" aria-selected={i === sel} tabIndex={i === sel ? 0 : -1} onClick={() => setSel(i)} onKeyDown={(e) => key(e, i)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="section" style={{ paddingTop: 34 }}>
        <div role="tabpanel" id="cat-panel" aria-labelledby={`c-${c.id}`} ref={panel} className="cat">
          <div>
            <h2>{c.label}</h2>
            <p className="lead">{c.d}</p>
          </div>
          <div className="opt">
            {OPTIONS.map((o) => <div key={o.t}><b>{o.t}</b><span className="muted">{o.d}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}
