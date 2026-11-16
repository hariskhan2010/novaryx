import Image from "next/image";
import Link from "next/link";
import { Intro } from "@/components/Intro";
import { StoryHero } from "@/components/story/StoryHero";
import { SERVICE_GROUPS, TEAM, WHY_US } from "@/lib/content";

const WAYS: Record<string, string> = {
  build: "Websites, web apps, mobile apps and automations, built in-house.",
  grow: "SEO, marketing, social media and content, so people find what we build.",
  create: "Logos, graphics and video that make your brand look right.",
};

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
        <h2 className="h2" id="ways-h">Build it. Grow it. Make it look right.</h2>
        <div className="ways">
          {SERVICE_GROUPS.map((g) => (
            <Link key={g.id} href="/services">
              <span className="mono" style={{ color: "var(--amber)" }}>{g.label}</span>
              <b>{g.items.map((i) => i.t).slice(0, 2).join(" & ")}{g.items.length > 2 ? " +" : ""}</b>
              <span className="muted">{WAYS[g.id]}</span>
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
          <p className="mono">Have a project in mind?</p>
          <h2 id="band-h">Tell us what you need. We&apos;ll take it from there.</h2>
          <Link className="btn" href="/contact">Start a project</Link>
        </div>
      </section>
    </>
  );
}
