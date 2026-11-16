import Image from "next/image";
import Link from "next/link";
import { Intro } from "@/components/Intro";
import { StoryHero } from "@/components/story/StoryHero";
import { TEAM, WHY_US } from "@/lib/content";

const WAYS = [
  { k: "Subscribe", t: "Ready-made projects", d: "Apps, websites and tools we've already built, on a monthly subscription.", href: "/projects" },
  { k: "Order", t: "Custom projects", d: "Tell us what you want and we build it to order, whatever it is.", href: "/contact" },
  { k: "Grow", t: "Services", d: "SEO, marketing, design and video, so what we build also gets seen.", href: "/services" },
];

export default function Home() {
  return (
    <>
      <Intro />
      <StoryHero />

      <section className="section wrap" aria-labelledby="why-h">
        <p className="mono eyebrow">Why NOVARYX</p>
        <h2 className="h2" id="why-h">Three promises we keep on every project.</h2>
        <ul className="why reset">
          {WHY_US.map((w) => <li key={w.t}><b>{w.t}</b><span className="muted">{w.d}</span></li>)}
        </ul>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }} aria-labelledby="ways-h">
        <p className="mono eyebrow">What we do</p>
        <h2 className="h2" id="ways-h">Three ways to work with us.</h2>
        <div className="ways">
          {WAYS.map((w) => (
            <Link key={w.k} href={w.href}>
              <span className="mono" style={{ color: "var(--amber)" }}>{w.k}</span>
              <b>{w.t}</b>
              <span className="muted">{w.d}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }} aria-labelledby="team-teaser">
        <div className="teaser">
          <div>
            <p className="mono eyebrow">The partners</p>
            <h2 className="h2" id="team-teaser" style={{ fontSize: "clamp(30px,4vw,54px)" }}>Three partners. One promise.</h2>
            <p className="lead" style={{ fontSize: 17 }}>An AI-native engineer, a marketer and a designer. You talk to the people doing the work.</p>
            <Link className="btn" href="/about" style={{ marginTop: 24 }}>Meet the partners →</Link>
          </div>
          <div className="faces">
            {TEAM.map((m) => <Image key={m.id} src={m.photo} alt={m.name} width={88} height={88} sizes="88px" placeholder="blur" />)}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 40 }} aria-labelledby="band-h">
        <div className="band">
          <p className="mono">Custom projects</p>
          <h2 id="band-h">Don&apos;t see what you need? We&apos;ll build it.</h2>
          <Link className="btn" href="/contact">Start a project</Link>
        </div>
      </section>
    </>
  );
}
