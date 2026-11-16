"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SPRING = "linear(0,.25 6%,.7 15%,1.04 26%,1.1 32%,1.06 40%,.99 52%,1 72%,1)";

/** Menu that grows out of its button (spatial origin), Esc closes, focus returns. */
export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !panel.current || !btn.current) return;
    const p = panel.current, t = btn.current.getBoundingClientRect(), d = p.getBoundingClientRect();
    p.style.transformOrigin = `${t.left + t.width / 2 - d.left}px ${t.top + t.height / 2 - d.top}px`;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      p.animate([{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }], { duration: 220, easing: SPRING });
      p.querySelectorAll("a").forEach((a, i) =>
        a.animate([{ opacity: 0, translate: "0 6px" }, { opacity: 1, translate: "0 0" }], { duration: 220, delay: i * 30, fill: "backwards" }),
      );
    }
    p.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const onClick = (e: MouseEvent) => { if (!p.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    addEventListener("keydown", onKey);
    addEventListener("click", onClick);
    return () => { removeEventListener("keydown", onKey); removeEventListener("click", onClick); };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg2 text-xl"
      >
        <span aria-hidden="true" className="transition-[rotate] duration-200" style={{ rotate: open ? "45deg" : "0deg" }}>+</span>
      </button>
      {open && (
        <div
          ref={panel}
          id="mobile-menu"
          className="fixed right-[max(16px,env(safe-area-inset-right,0px))] top-[72px] z-50 w-[min(280px,calc(100vw-32px))] rounded-[22px] border border-line bg-bg2 p-2.5 shadow-2xl"
        >
          <nav aria-label="Mobile">
            {[{ href: "/", label: "Home" }, ...items].map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3.5 py-3 font-semibold hover:bg-bg">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
