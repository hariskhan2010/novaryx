"use client";
import { useRef, useSyncExternalStore } from "react";

const isDarkNow = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
};
const subscribe = (cb: () => void) => {
  const mq = matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", cb);
  addEventListener("yc-theme", cb);
  return () => { mq.removeEventListener("change", cb); removeEventListener("yc-theme", cb); };
};

/** Spring + stretch toggle: the knob squashes as it springs to the other side. */
export function ThemeSwitch() {
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => true);
  const knob = useRef<HTMLSpanElement>(null);

  function toggle() {
    const next = isDarkNow() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("yc-theme", next); } catch {}
    window.dispatchEvent(new Event("yc-theme"));
    const k = knob.current;
    if (k && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      k.style.transformOrigin = next === "dark" ? "0% 50%" : "100% 50%";
      k.animate([{ scale: "1 1" }, { scale: "1.3 .88" }, { scale: "1 1" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  return (
    <button type="button" className="switch" role="switch" aria-checked={dark} aria-label="Dark theme" onClick={toggle}>
      <span ref={knob} className="knob" aria-hidden="true">{dark ? "☾" : "☀"}</span>
    </button>
  );
}
