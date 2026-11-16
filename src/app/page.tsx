import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { TEAM } from "@/lib/about";
import { site } from "@/lib/site";
import { StoryHero } from "@/components/story/StoryHero";
import { ProjectCard, SetupNotice } from "@/components/ui";
import { listProjects } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { OPTION_HELP, OPTION_LABEL } from "@/lib/types";

async function LatestProjects() {
  if (!supabaseConfigured) return <SetupNotice />;
  const projects = await listProjects({ limit: 6 });
  if (projects.length === 0) {
    return (
      <div className="wrap">
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold">New projects are on the way.</p>
          <p className="mt-2 text-muted">Want something now? Order a custom project and we&apos;ll build it for you.</p>
          <Link href="/custom" className="btn btn-pri mt-6">Order a custom project</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="wrap">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>
      <div className="mt-10 text-center">
        <Link href="/projects" className="btn">See all projects →</Link>
      </div>
    </div>
  );
}

const STEPS = [
  { t: "Choose a project", d: "Browse ready-made apps, websites and tools. Open any project to see what it does and try the demo." },
  { t: "Subscribe", d: "Pick how you want it: hosted for you, set up on your server, or as source code. Send your request." },
  { t: "Start using it", d: "Once your subscription is active, your access appears in your account: the live link or the download." },
];

export default function Home() {
  return (
    <>
      <StoryHero />

      <section className="py-24 sm:py-32" aria-labelledby="latest">
        <div className="wrap mb-10 grid gap-3">
          <p className="mono text-accent">Projects</p>
          <h2 id="latest" className="stretch text-4xl font-extrabold sm:text-6xl">Latest projects</h2>
        </div>
        <Suspense fallback={<div className="wrap text-muted">Loading projects…</div>}>
          <LatestProjects />
        </Suspense>
      </section>

      <section id="how" className="scroll-mt-24 py-24 sm:py-32" aria-labelledby="how-h">
        <div className="wrap">
          <p className="mono text-accent">How it works</p>
          <h2 id="how-h" className="stretch mt-3 max-w-[16ch] text-4xl font-extrabold sm:text-6xl">Three steps from browsing to using.</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="grid gap-2.5 border-t-2 border-line pt-5">
                <span className="mono text-hot">Step {i + 1}</span>
                <h3 className="text-2xl font-extrabold">{s.t}</h3>
                <p className="text-muted">{s.d}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-20 text-2xl font-extrabold">Three ways to get a project</h3>
          <div className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {(["hosted", "setup", "source"] as const).map((o) => (
              <div key={o} className="grid gap-2 bg-bg p-7">
                <p className="text-xl font-bold">{OPTION_LABEL[o]}</p>
                <p className="text-muted">{OPTION_HELP[o]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap pb-24" aria-labelledby="about-teaser">
        <div className="card grid gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="mono text-accent">About us</p>
            <h2 id="about-teaser" className="stretch mt-3 max-w-[18ch] text-3xl font-extrabold sm:text-5xl">Three partners from {site.location} who deliver on time.</h2>
            <p className="mt-4 max-w-[52ch] text-muted">Software, SEO, marketing, design and video under one roof. Reliable, clear on payments, on time.</p>
            <Link href="/about" className="btn mt-6">Meet the partners →</Link>
          </div>
          <div className="flex -space-x-5">
            {TEAM.map((m) => (
              <Image key={m.name} src={m.photo} alt={m.name} placeholder="blur" sizes="112px" className="h-24 w-24 rounded-full border-4 border-bg2 object-cover sm:h-28 sm:w-28" />
            ))}
          </div>
        </div>
      </section>

      <section className="wrap pb-24" aria-labelledby="custom-h">
        <div className="grid justify-items-start gap-5 rounded-[32px] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_90%,#000),color-mix(in_oklab,var(--accent)_55%,var(--hot)))] p-[clamp(32px,6vw,80px)] text-white">
          <p className="mono">Custom projects</p>
          <h2 id="custom-h" className="stretch max-w-[14ch] text-4xl font-extrabold sm:text-6xl">Don&apos;t see what you need? We&apos;ll build it.</h2>
          <Link href="/custom" className="btn border-white bg-white text-[#0a0d18]">Order a custom project</Link>
        </div>
      </section>
    </>
  );
}
