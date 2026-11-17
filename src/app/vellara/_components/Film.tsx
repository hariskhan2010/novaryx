"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { pinnedScene } from "../_animation/gsap/pinned-scene";
import { setupGsap } from "../_animation/gsap/setup";
import "../_animation/css/scene.css";

const SHOTS = [
  { img: "/vellara/valley.webp", alt: "A footpath climbing a scree slope to a small mine in a Karakoram valley at dusk", t: "The mountain", d: "Our stones start in the high valleys of Gilgit-Baltistan and Swat, mined by hand by families who have worked the same slopes for generations. Some deposits sit above 4,000 metres and open only in late summer." },
  { img: "/vellara/ruby.webp", alt: "A ruby resting on the white marble it grew in", t: "The rough", d: "We buy rough at the valley, not at auction. Ruby and spinel come out of white marble, emerald from dark talc schist, aquamarine as long clear crystals. Each lot is logged with the place and month it was found." },
  { img: "/vellara/workshop.webp", alt: "A faceting machine under a single lamp, a green stone on the lap", t: "The cut", d: "Every stone is cut by one cutter from start to finish. We cut for colour first and weight second, so a stone may lose a little more to show the hue it was meant to." },
  { img: "/vellara/emerald.webp", alt: "A finished oval emerald on slate", t: "The light", d: "Finished stones go to a gem lab for an origin and treatment report, then to the jewellers and collectors who asked for them." },
];

/** Home film: four pinned stills cross-fade with a slow push while the story scrolls over them. */
export function Film() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    setupGsap();
    const imgs = [...el.querySelectorAll<HTMLElement>("[data-shot]")];
    const n = imgs.length;
    const scene = pinnedScene(el, {
      onProgress: (p) => {
        // Content = a title act + one act per shot; shot i is centred when act i+1 fills the screen.
        const pos = Math.min(n - 1, Math.max(0, p * n - 1));
        imgs.forEach((img, i) => {
          const d = Math.abs(pos - i);
          img.style.opacity = String(Math.max(0, 1 - d));
          img.style.transform = `scale(${1.12 - 0.12 * Math.min(1, Math.max(0, pos - i + 1) / 2)})`;
        });
        el.style.setProperty("--film-p", String(p));
      },
    });
    return () => scene.destroy();
  }, []);

  return (
    <div ref={root} data-scene-root className="vl-film" aria-labelledby="film-h">
      <div data-scene-pin>
        {SHOTS.map((s, i) => (
          <div key={s.img} data-shot className="vl-film-shot" style={{ opacity: i === 0 ? 1 : 0 }}>
            <Image src={s.img} alt={s.alt} fill sizes="100vw" quality={70} />
          </div>
        ))}
        <div className="vl-film-shade" />
        <div className="vl-film-rail" aria-hidden="true"><i /></div>
      </div>
      <div data-scene-content>
        <section className="vl-film-act vl-wrap">
          <h2 id="film-h" className="vl-h2">From the mountain to the light</h2>
        </section>
        {SHOTS.map((s, i) => (
          <section key={s.t} className="vl-film-act vl-wrap">
            <div className="vl-film-card">
              <span className="vl-film-n">{i + 1} of {SHOTS.length}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
