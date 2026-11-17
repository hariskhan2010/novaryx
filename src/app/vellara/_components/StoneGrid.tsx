"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Stone } from "../stones";

export function StoneGrid({ stones, kinds }: { stones: Stone[]; kinds: string[] }) {
  const [kind, setKind] = useState<string>("All");
  const shown = kind === "All" ? stones : stones.filter((s) => s.kind === kind);
  return (
    <>
      <div className="vl-filter" role="group" aria-label="Filter by stone">
        {["All", ...kinds].map((k) => (
          <button key={k} type="button" aria-pressed={k === kind} onClick={() => setKind(k)}>{k}</button>
        ))}
      </div>
      <p className="vl-sr" aria-live="polite">{shown.length} stones shown</p>
      <ul className="vl-grid">
        {shown.map((s) => (
          <li key={s.slug} style={{ ["--tint" as string]: s.tint }}>
            <Link href={`/vellara/collection/${s.slug}`} className="vl-stone">
              <span className="vl-stone-img"><Image src={s.image} alt="" fill sizes="(min-width: 1000px) 30vw, (min-width: 640px) 45vw, 100vw" /></span>
              <span className="vl-stone-name">{s.name}</span>
              <span className="vl-stone-meta">
                <span>{s.carat.toFixed(2)} ct</span>
                <span>{s.cut}</span>
                <span>{s.valley}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
