"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@/lib/project-types";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CATS = [
  { id: "web", cat: "Web app", label: "Web apps", d: "Dashboards, booking systems, stores and internal tools that run in the browser." },
  { id: "site", cat: "Website", label: "Websites", d: "Business sites, portfolios and landing pages, fast and ready to rank." },
  { id: "mob", cat: "Mobile app", label: "Mobile apps", d: "Apps for Android and iOS, built from one codebase." },
  { id: "ai", cat: "AI tool", label: "AI tools", d: "Chat assistants and automations that take repetitive work off your plate." },
];

// What every project listing shows.
const OPTIONS = [
  { t: "Full details", d: "What the client needed, what we built and how it works." },
  { t: "Tech used", d: "The stack and tools behind each project." },
  { t: "Want one like it?", d: "Tell us your idea on the Contact page and we'll build it for you." },
];

/** Project categories as tabs; one pill slides to the selected tab. */
export function CategoryTabs({ projects = [] }: { projects?: Project[] }) {
  const [sel, setSel] = useState(() => Math.max(0, CATS.findIndex((c) => projects.some((p) => p.category === c.cat))));
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
  const list2 = projects.filter((p) => p.category === c.cat);
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
        <ul className="pgrid reset" aria-label={`${c.label} projects`}>
          {list2.length === 0 && <li className="pempty muted">No {c.label.toLowerCase()} listed yet. <Link href="/contact">Tell us about yours.</Link></li>}
          {list2.map((p) => (
            <li key={p.id}>
              <Link className="pcard" href={`/projects/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" /> : <span className="pcard-ph" aria-hidden="true">{p.title.slice(0, 1)}</span>}
                <span className="mono" style={{ color: "var(--amber)" }}>{p.category}{p.year ? ` · ${p.year}` : ""}</span>
                <b>{p.title}</b>
                <span className="muted">{p.summary}</span>
                {p.tech.length > 0 && <span className="pcard-tech">{p.tech.slice(0, 4).join(" · ")}</span>}
                <span className="pcard-more">View details →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
