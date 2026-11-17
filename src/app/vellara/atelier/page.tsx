import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Atelier", description: "How VELLARA buys, cuts and documents every stone." };

const STEPS = [
  { t: "We buy rough at the valley", d: "Each season we travel to Swat, Hunza, Shigar and Kohistan and buy directly from the families who mine there. We pay on the spot, at the mine." },
  { t: "We log where it came from", d: "Every parcel of rough gets a record: the valley, the mine, the month and the altitude. That record follows the stone to its buyer." },
  { t: "One cutter cuts it", d: "A single cutter takes the stone from rough to polish, so the decisions about shape and colour stay with one person." },
  { t: "A lab confirms it", d: "Finished stones go to an independent lab for an origin and treatment report before we offer them." },
];

const RULES = [
  { t: "Colour before weight", d: "We will cut away more of a stone if it shows the colour better. A lighter, brighter stone is worth more to the person wearing it." },
  { t: "Treatments in writing", d: "If a stone has been oiled or heated, it says so on its page and on its report. Most of ours are untreated." },
  { t: "No stone without a valley", d: "If we can't say where a stone came from, we don't sell it." },
];

export default function AtelierPage() {
  return (
    <>
      <div className="vl-wrap vl-page">
        <h1 className="vl-h1">The atelier</h1>
        <p className="vl-lead">We are a small house of buyers and cutters. We work with coloured stones from northern Pakistan only, because we know those valleys and the people who mine them.</p>
      </div>
      <div className="vl-wide-img">
        <Image src="/vellara/workshop.webp" alt="A faceting machine under a single lamp, with a green stone on the lap" fill sizes="100vw" />
      </div>
      <section className="vl-wrap vl-section" aria-labelledby="steps-h">
        <h2 id="steps-h" className="vl-h2">How a stone reaches you</h2>
        <ol className="vl-steps">
          {STEPS.map((s, i) => (
            <li key={s.t}><span className="vl-step-n">{i + 1}</span><h3>{s.t}</h3><p className="vl-muted">{s.d}</p></li>
          ))}
        </ol>
      </section>
      <section className="vl-wrap vl-section" aria-labelledby="rules-h">
        <h2 id="rules-h" className="vl-h2">Three things we don&apos;t compromise on</h2>
        <div className="vl-rules">
          {RULES.map((r) => <div key={r.t}><h3>{r.t}</h3><p className="vl-muted">{r.d}</p></div>)}
        </div>
      </section>
      <section className="vl-wrap vl-section vl-cta">
        <h2 className="vl-h2">See what we cut this season</h2>
        <Link className="vl-btn vl-btn-solid" href="/vellara/collection">See the stones</Link>
      </section>
    </>
  );
}
