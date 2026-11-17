import type { Metadata } from "next";
import Image from "next/image";
import { Tilt } from "@/components/Tilt";
import { HOW_WE_WORK, MISSION, SERVICE_GROUPS, TEAM } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is a three-partner studio from ${site.location}. Meet Muhammad Haris, Anees Khan and Jansher Khan.`,
};

export default function AboutPage() {
  return (
    <>
      <div className="wrap page-head">
        <p className="mono eyebrow">About {site.name}</p>
        <h1>We build it, ship it, and help it grow.</h1>
        <p className="lead">{site.name} builds websites, apps and automations, then helps them grow with SEO, marketing, design and video.</p>
        <dl className="facts">
          <div><dt className="mono">Founded</dt><dd>{site.year}</dd><span className="muted">Started in November</span></div>
          <div><dt className="mono">Partners</dt><dd>3</dd><span className="muted">Engineering, marketing, design</span></div>
          <div><dt className="mono">Based in</dt><dd>Peshawar</dd><span className="muted">Pakistan</span></div>
          <div><dt className="mono">Works</dt><dd>Worldwide</dd><span className="muted">Remotely, with clients anywhere</span></div>
        </dl>
      </div>

      <div className="wrap section" style={{ paddingBottom: 0 }}>
        <figure className="mission">
          <span className="q" aria-hidden="true">&rdquo;</span>
          <p className="mono" style={{ color: "var(--amber)" }}>Our mission</p>
          <blockquote style={{ margin: 0 }}>
            <p className="big">{MISSION.lead}</p>
            <p className="lead">{MISSION.body}</p>
          </blockquote>
          <figcaption className="muted" style={{ marginTop: 22, fontSize: 14 }}>Muhammad Haris, Anees Khan &amp; Jansher Khan, the founders of {site.name}</figcaption>
        </figure>
      </div>

      <section className="wrap section" style={{ paddingBottom: 0 }} aria-labelledby="do-h">
        <p className="mono eyebrow">What we do</p>
        <h2 className="h2" id="do-h">Build it. Grow it. Make it look right.</h2>
        <div className="pillars">
          {SERVICE_GROUPS.map((g, i) => (
            <article key={g.id} className="pillar reveal">
              <span className="num">0{i + 1}</span>
              <h3>{g.label}</h3>
              <p className="muted">{g.leadNote}</p>
              <ul className="reset">{g.items.map((it) => <li key={it.t}><b>{it.t}</b><span className="muted">{it.d}</span></li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" style={{ paddingBottom: 0 }} aria-labelledby="how-h">
        <p className="mono eyebrow">How we work</p>
        <h2 className="h2" id="how-h">Four steps, from first message to delivery.</h2>
        <ol className="flow reset">
          {HOW_WE_WORK.map((s, i) => (
            <li key={s.t} className="reveal"><span className="num">0{i + 1}</span><h3>{s.t}</h3><p className="muted">{s.d}</p></li>
          ))}
        </ol>
      </section>

      <section className="wrap section" aria-labelledby="partners-h">
        <p className="mono eyebrow">The partners</p>
        <h2 className="h2" id="partners-h">Three partners. One promise.</h2>
        <div style={{ marginTop: 44 }}>
          {TEAM.map((m) => (
            <article key={m.id} className="partner reveal">
              <Tilt>
                <Image src={m.photo} alt={`${m.name}, ${m.role} at ${site.name}`} placeholder="blur" sizes="(min-width: 760px) 340px, 100vw" />
              </Tilt>
              <div>
                <p className="mono" style={{ color: "var(--amber)" }}>{m.role}</p>
                <h3>{m.name}</h3>
                <p className="title">{m.title}</p>
                <p className="bio">{m.bio}</p>
                <ul className="tags reset" aria-label="Skills">{m.skills.map((s) => <li key={s}>{s}</li>)}</ul>
                <p className="stat"><b>{m.stat.value}</b><span className="muted">{m.stat.label}</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
