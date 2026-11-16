"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SPRING = "linear(0,.25 6%,.7 15%,1.04 26%,1.1 32%,1.06 40%,.99 52%,1 72%,1)";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const isDarkNow = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
};
const subscribe = (cb: () => void) => {
  const mq = matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", cb);
  addEventListener("nvx-theme", cb);
  return () => { mq.removeEventListener("change", cb); removeEventListener("nvx-theme", cb); };
};

function ThemeSwitch() {
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => true);
  const knob = useRef<HTMLSpanElement>(null);
  function toggle() {
    const next = isDarkNow() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("nvx-theme", next); } catch {}
    dispatchEvent(new Event("nvx-theme"));
    const k = knob.current;
    if (k && !reduced()) {
      k.style.transformOrigin = next === "dark" ? "100% 50%" : "0% 50%";
      k.animate([{ scale: "1 1" }, { scale: "1.3 .88" }, { scale: "1 1" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }
  return (
    <button type="button" className="switch" role="switch" aria-checked={dark} aria-label="Dark mode" onClick={toggle}>
      <span ref={knob} className="knob" aria-hidden="true" />
    </button>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  // Open: grows from the corner nearest the button, links stagger in.
  useEffect(() => {
    const d = drawer.current;
    if (!open || !d) return;
    if (!reduced()) {
      d.animate([{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }], { duration: 220, easing: SPRING });
      [...d.children].forEach((a, i) => (a as HTMLElement).animate([{ opacity: 0, translate: "0 6px" }, { opacity: 1, translate: "0 0" }], { duration: 220, delay: i * 30, fill: "backwards" }));
    }
    (d.querySelector("a") as HTMLElement | null)?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(true); };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  function close(focus: boolean) {
    const d = drawer.current;
    const fin = () => { setOpen(false); if (focus) btn.current?.focus(); };
    if (d && !reduced()) d.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.6 }], { duration: 150, easing: "ease-in" }).finished.then(fin, fin);
    else fin();
  }

  const cur = (href: string) => (path === href ? "page" : undefined);
  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/" aria-label="NOVARYX home">
          <svg width="22" height="22" style={{ color: "var(--fg)" }} aria-hidden="true"><use href="#mark" /></svg>NOVARYX
        </Link>
        <nav className="links" aria-label="Main">
          {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={cur(n.href)}>{n.label}</Link>)}
        </nav>
        <ThemeSwitch />
        <Link className="btn btn-pri cta-nav" href="/contact" style={{ padding: "11px 18px" }}>Start a project</Link>
        <button ref={btn} type="button" className="menu-btn" aria-expanded={open} aria-controls="drawer" aria-label="Menu" onClick={() => (open ? close(true) : setOpen(true))}>
          <span aria-hidden="true">+</span>
        </button>
        {open && (
          <div ref={drawer} className="drawer" id="drawer" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
            {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={cur(n.href)}>{n.label}</Link>)}
          </div>
        )}
      </div>
    </header>
  );
}
