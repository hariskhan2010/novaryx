"use client";
import { useEffect, useRef } from "react";

/** Logo-window intro: the page opens through the NOVARYX mark. Once per visit, skipped for reduced motion.
    Server-rendered hidden, so the page is never covered if scripts are slow or off. */
export function Intro() {
  const box = useRef<HTMLDivElement>(null);
  const hole = useRef<SVGGElement>(null);
  const line = useRef<SVGGElement>(null);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("nvx-intro") === "1"; sessionStorage.setItem("nvx-intro", "1"); } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches || !box.current) return;
    const el = box.current;
    el.hidden = false;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const p = Math.min(1, Math.max(0, (t - 0.2) / 1));
      const tr = `translate(50 50) scale(${(1 + 19 * p * p * p) * 1.4}) translate(-6 -3.5)`;
      hole.current?.setAttribute("transform", tr);
      line.current?.setAttribute("transform", tr);
      if (line.current) line.current.style.opacity = String(1 - Math.min(1, Math.max(0, (t - 0.6) / 0.5)));
      if (t < 1.25) raf = requestAnimationFrame(tick); else el.hidden = true;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); el.hidden = true; };
  }, []);

  return (
    <div ref={box} className="intro" aria-hidden="true" hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <mask id="nvx-hole">
            <rect width="100" height="100" fill="#fff" />
            <g ref={hole} transform="translate(50 50) scale(1.4) translate(-6 -3.5)"><path d="M1 3.5l5-2.5 5 2.5-5 2.5z" fill="#000" /></g>
          </mask>
        </defs>
        <rect width="100" height="100" fill="var(--ink)" mask="url(#nvx-hole)" />
        <g ref={line} transform="translate(50 50) scale(1.4) translate(-6 -3.5)"><path d="M1 3.5l5-2.5 5 2.5-5 2.5z" fill="none" stroke="var(--cobalt)" strokeWidth=".25" /></g>
      </svg>
    </div>
  );
}
