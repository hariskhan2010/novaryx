"use client";
import { useRef, type ReactNode } from "react";

/** Tilts the photo toward the pointer (mouse/pen only, skipped for reduced motion). */
export function Tilt({ children }: { children: ReactNode }) {
  const photo = useRef<HTMLDivElement>(null);
  const set = (k: string, v: string) => photo.current?.style.setProperty(k, v);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    set("--rx", `${(-y * 10).toFixed(2)}deg`); set("--ry", `${(x * 12).toFixed(2)}deg`);
    set("--gx", `${((x + 0.5) * 100).toFixed(1)}%`); set("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  return (
    <div className="tilt" onPointerMove={move} onPointerLeave={() => { set("--rx", "0deg"); set("--ry", "0deg"); }}>
      <div ref={photo} className="photo">{children}<i aria-hidden="true" /></div>
    </div>
  );
}
