"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const CH = "NOVARYX#01<>/*";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Decodes the page heading from random characters into the real text (800 ms). */
function scramble(h: HTMLElement) {
  h.setAttribute("aria-label", h.innerText.replace(/\s+/g, " ").trim());
  const nodes: { n: Text; t: string }[] = [];
  const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) nodes.push({ n: w.currentNode as Text, t: (w.currentNode as Text).nodeValue ?? "" });
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / 800);
    nodes.forEach(({ n, t }) => {
      const k = Math.floor(t.length * p);
      n.nodeValue = t.slice(0, k) + t.slice(k).replace(/\S/g, () => CH[(Math.random() * CH.length) | 0]);
    });
    if (p < 1) requestAnimationFrame(step);
    else h.removeAttribute("aria-label");
  };
  requestAnimationFrame(step);
}

/** Page change: a loading screen with a spinning ring, then the new heading decodes in. */
export function RouteFX() {
  const path = usePathname();
  const box = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const shownAt = useRef(0);

  // Show the loader as soon as an internal link to another page is clicked.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || reduced()) return;
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href || !href.startsWith("/") || href.startsWith("//") || a.target) return;
      if (href.split("#")[0] === location.pathname) return;
      if (box.current) { box.current.hidden = false; box.current.classList.add("on"); shownAt.current = performance.now(); }
    };
    // Capture phase: runs before Next.js Link takes over the click.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = box.current;
    const h = document.querySelector<HTMLElement>("main h1");
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    if (reduced()) { if (el) { el.classList.remove("on"); el.hidden = true; } return; }
    // Keep the loader on screen for at least 700 ms from the click, even when the page is already prefetched.
    const wait = Math.max(250, 700 - (performance.now() - shownAt.current));
    const t = setTimeout(() => {
      if (el) { el.classList.remove("on"); setTimeout(() => { if (!el.classList.contains("on")) el.hidden = true; }, 300); }
      if (h) scramble(h);
    }, wait);
    return () => clearTimeout(t);
  }, [path]);

  return (
    <div ref={box} className="loader" hidden aria-hidden="true">
      <div className="spin">
        <svg className="ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" /></svg>
        <svg className="logo" width="30" height="30" style={{ color: "var(--fg)" }}><use href="#mark" /></svg>
      </div>
    </div>
  );
}
