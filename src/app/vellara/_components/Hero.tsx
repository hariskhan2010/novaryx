"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GemHero } from "./GemHero";

type Tone = { name: string; tint: string; valley: string; altitude: number; slug: string; kind: string };

/** Hero copy + the live gem. The caption follows whichever stone's colour the gem is showing. */
export function Hero({ tones }: { tones: Tone[] }) {
  const [i, setI] = useState(0);
  const stable = useMemo(() => tones, [tones]);
  const t = tones[i];
  return (
    <section className="vl-hero" style={{ ["--tint" as string]: t.tint }} aria-labelledby="vl-hero-h">
      <div className="vl-wrap vl-hero-in">
        <div className="vl-hero-copy">
          <h1 id="vl-hero-h">Colour from the mountains of northern Pakistan</h1>
          <p className="vl-lead">
            Emerald, ruby, spinel and peridot, bought as rough in the valleys where they were mined and cut one stone at a time.
          </p>
          <div className="vl-actions">
            <Link className="vl-btn vl-btn-solid" href="/vellara/collection">See the stones</Link>
            <Link className="vl-btn" href="/vellara/contact">Ask about a stone</Link>
          </div>
        </div>
        <div className="vl-hero-stage">
          <GemHero tones={stable} onTone={setI} />
          <p className="vl-hero-caption" aria-live="polite">
            <Link href={`/vellara/collection/${t.slug}`}>{t.name}</Link>
            <span>{t.valley}, {t.altitude.toLocaleString("en")} m</span>
          </p>
        </div>
      </div>
      <svg className="vl-contours" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M0 ${470 - k * 34} C 220 ${400 - k * 40}, 380 ${520 - k * 30}, 600 ${430 - k * 42} S 980 ${360 - k * 36}, 1200 ${420 - k * 38}`} />
        ))}
      </svg>
    </section>
  );
}
