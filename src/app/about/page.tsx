import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TiltFrame } from "@/components/TiltFrame";
import { MISSION, SERVICES, TEAM, WHAT_WE_DO, WHY_US } from "@/lib/about";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} builds ready-made and custom software from ${site.location}, and offers SEO, marketing, design and video services. Meet the team.`,
};

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* ── Company ─────────────────────────────── */}
      <section className="about-hero relative overflow-hidden" aria-labelledby="about-h">
        <div className="wrap relative pt-32 pb-20 sm:pt-40">
          <p className="mono text-accent">About {site.name}</p>
          <h1 id="about-h" className="stretch mt-3 max-w-[15ch] text-5xl font-extrabold sm:text-7xl">
            We build it, ship it, and help it <span className="text-hot">grow.</span>
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-muted">
            {site.name} builds ready-to-use software projects you can subscribe to, creates custom projects to order, whatever you need, and
            offers services like SEO, marketing, design and video to help your business grow.
          </p>

          <dl className="mt-10 flex flex-wrap gap-3">
            {[
              ["Founded", String(site.year)],
              ["Based in", site.location],
              ["Works", "Remotely, with clients worldwide"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-bg2/70 px-5 py-3 backdrop-blur">
                <dt className="mono text-muted">{k}</dt>
                <dd className="mt-1 font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap mb-20" aria-labelledby="mission-h">
        <figure className="relative overflow-hidden rounded-[32px] border border-line bg-bg2 p-[clamp(28px,5vw,64px)]">
          <span aria-hidden="true" className="stretch pointer-events-none absolute -top-6 right-6 text-[160px] font-extrabold leading-none text-hot/15">&rdquo;</span>
          <p id="mission-h" className="mono text-hot">Our mission</p>
          <blockquote className="relative mt-4 grid gap-4">
            <p className="stretch max-w-[22ch] text-3xl font-extrabold sm:text-5xl">{MISSION.lead}</p>
            <p className="max-w-[60ch] text-lg text-muted">{MISSION.body}</p>
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted">Muhammad Haris, Anees Khan &amp; Jansher Khan, the founders of {site.name}</figcaption>
        </figure>
      </section>

      <section className="wrap" aria-labelledby="do-h">
        <h2 id="do-h" className="text-2xl font-extrabold">What we do</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {WHAT_WE_DO.map((w, i) => (
            <div key={w.t} className="grid content-start gap-2 bg-bg p-7">
              <span className="mono text-hot">0{i + 1}</span>
              <p className="text-xl font-bold">{w.t}</p>
              <p className="text-muted">{w.d}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-14 text-2xl font-extrabold">Services</h3>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {SERVICES.map((s) => (
            <li key={s} className="rounded-full border border-line bg-bg2 px-4 py-2 font-semibold">{s}</li>
          ))}
        </ul>

        <h3 className="mt-14 text-2xl font-extrabold">Why {site.name}</h3>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {WHY_US.map((w) => (
            <li key={w.t} className="grid gap-2 border-t-2 border-accent pt-5">
              <p className="text-xl font-extrabold">{w.t}</p>
              <p className="text-muted">{w.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Team ────────────────────────────────── */}
      <section className="wrap mt-28" aria-labelledby="team-h">
        <p className="mono text-accent">The partners</p>
        <h2 id="team-h" className="stretch mt-3 text-4xl font-extrabold sm:text-6xl">Three partners. One promise.</h2>
        <p className="mt-4 max-w-[56ch] text-lg text-muted">{site.name} is run by three founding partners. Each one owns their craft, and together they own every project, start to finish.</p>

        <div className="mt-12 grid gap-8">
          {TEAM.map((m) => (
            <article key={m.name} className="member card reveal grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-center md:gap-12">
              <TiltFrame>
                <div className="member-photo">
                  <Image
                    src={m.photo}
                    alt={`${m.name}, ${m.role} at ${site.name}`}
                    placeholder="blur"
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="member-shine" aria-hidden="true" />
                </div>
              </TiltFrame>

              <div className="grid content-center gap-4">
                <p className="mono text-hot">{m.role}</p>
                <h3 className="stretch text-4xl font-extrabold sm:text-5xl">{m.name}</h3>
                <p className="text-lg font-semibold text-accent">{m.title}</p>
                <p className="max-w-[58ch] text-muted">{m.bio}</p>
                <ul className="flex flex-wrap gap-2" aria-label="Skills">
                  {m.skills.map((s) => <li key={s} className="tag">{s}</li>)}
                </ul>
                <p className="mt-2 flex items-baseline gap-3 border-t border-line pt-4">
                  <span className="stretch text-4xl font-extrabold text-hot">{m.stat.value}</span>
                  <span className="text-muted">{m.stat.label}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap mt-24">
        <div className="card flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-extrabold">Have a project in mind?</p>
            <p className="mt-1 text-muted">Pick a ready-made project or tell us what to build.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="btn">Browse projects</Link>
            <Link href="/custom" className="btn btn-pri">Order a custom project</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
