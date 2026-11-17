import Image from "next/image";
import Link from "next/link";
import { Hero } from "./_components/Hero";
import { Film } from "./_components/Film";
import { STONES } from "./stones";

export default function VellaraHome() {
  const tones = STONES.map(({ name, tint, valley, altitude, slug, kind }) => ({ name, tint, valley, altitude, slug, kind }));
  const featured = ["swat-emerald", "hunza-ruby", "katlang-topaz"].map((s) => STONES.find((x) => x.slug === s)!);
  const byAltitude = [...STONES].sort((a, b) => b.altitude - a.altitude);
  const maxAlt = byAltitude[0].altitude;

  return (
    <>
      <Hero tones={tones} />
      <Film />

      <section className="vl-wrap vl-section" aria-labelledby="feat-h">
        <h2 id="feat-h" className="vl-h2">Three stones from this season</h2>
        <div className="vl-feature">
          {featured.map((s, i) => (
            <Link key={s.slug} href={`/vellara/collection/${s.slug}`} className={`vl-feat vl-feat-${i}`} style={{ ["--tint" as string]: s.tint }}>
              <span className="vl-feat-img"><Image src={s.image} alt={`${s.name}, ${s.carat} carats`} fill sizes="(min-width: 900px) 33vw, 100vw" /></span>
              <span className="vl-feat-name">{s.name}</span>
              <span className="vl-muted">{s.carat.toFixed(2)} ct, {s.cut.toLowerCase()}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="vl-wrap vl-section" aria-labelledby="alt-h">
        <h2 id="alt-h" className="vl-h2">Where each stone was found, by altitude</h2>
        <p className="vl-lead">The higher the deposit, the shorter the season. Peridot at Sapat can only be mined for a few weeks after the snow melts.</p>
        <ol className="vl-alt" aria-label="Deposits from highest to lowest">
          {byAltitude.map((s) => (
            <li key={s.slug} style={{ ["--tint" as string]: s.tint, ["--w" as string]: `${(s.altitude / maxAlt) * 100}%` }}>
              <Link href={`/vellara/collection/${s.slug}`}>
                <span className="vl-alt-name">{s.name}</span>
                <span className="vl-alt-bar" aria-hidden="true"><i /></span>
                <span className="vl-alt-m">{s.altitude.toLocaleString("en")} m</span>
                <span className="vl-alt-where vl-muted">{s.valley}, {s.region}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="vl-wrap vl-section vl-cta" aria-labelledby="cta-h">
        <h2 id="cta-h" className="vl-h2">Looking for a particular colour?</h2>
        <p className="vl-lead">Tell us the stone, size and colour you have in mind. We often have rough that hasn&apos;t been cut yet.</p>
        <Link className="vl-btn vl-btn-solid" href="/vellara/contact">Ask about a stone</Link>
      </section>
    </>
  );
}
