"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function StoryHero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./engine").then(({ initStory }) => {
      if (!cancelled && root.current) cleanup = initStory(root.current);
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <div ref={root}>
      <div className="story-scroller">
        <div className="story-stage">
          <div className="story-bg" />
          <div className="story-back" aria-hidden="true">
            <div className="story-word">Design · Design ·</div>
            <div className="story-word o">Build · Build · Build ·</div>
            <div className="story-word a">Ship · Ship · Ship ·</div>
          </div>
          <canvas className="story-gl" aria-hidden="true" />
          <div className="story-front">
            <div className="scene" data-r="-1,0,.55,.95" style={{ ["--o" as string]: 1 }}>
              <p className="mono kick">Ready-made projects on subscription</p>
              <h1 className="stretch text-[clamp(44px,6.4vw,92px)] font-extrabold leading-[1.02]">
                Projects we built. <span className="text-accent">Yours to use</span> monthly.
              </h1>
              <p className="mt-5 max-w-[440px] text-[clamp(17px,1.5vw,20px)] text-muted">
                Subscribe to web apps, websites, mobile apps and AI tools. Use them hosted, get them set up for you, or download
                the source code. Need something else? We&apos;ll build it.
              </p>
              <div className="btns mt-8 flex flex-wrap gap-2.5">
                <Link className="btn btn-pri" href="/projects">Browse projects</Link>
                <Link className="btn" href="/custom">Order a custom project</Link>
                <Link className="btn" href="/about">About us</Link>
              </div>
            </div>
            <div className="scene" data-r="1.0,1.3,2.0,2.2">
              <p className="mono kick">Built in-house</p>
              <h2 className="stretch text-[clamp(34px,4.4vw,64px)] font-extrabold">Every project is designed, built and tested by our team.</h2>
              <div className="mono mt-6 grid gap-1.5 text-muted">
                <span>Building project <b className="font-medium text-fg" data-pct>0%</b></span>
                <div className="bar"><i data-pbar /></div>
                <span data-layer>Layer: Design</span>
              </div>
            </div>
            <div className="scene explode" data-r="2.25,2.55,3.3,3.5">
              <p className="mono kick">Four layers in every build</p>
              <h2 className="stretch text-[clamp(34px,4.4vw,64px)] font-extrabold">Design, frontend, backend and AI.</h2>
            </div>
            <svg className="leaders" aria-hidden="true" />
            <div className="lbl" aria-hidden="true"><b>Design</b><span className="mono">UI/UX · brand · systems</span></div>
            <div className="lbl" aria-hidden="true"><b>Frontend</b><span className="mono">Web · iOS · Android</span></div>
            <div className="lbl" aria-hidden="true"><b>Backend</b><span className="mono">APIs · data · integrations</span></div>
            <div className="lbl" aria-hidden="true"><b>AI</b><span className="mono">Assistants · automations</span></div>
            <div className="rl mono" aria-hidden="true">01 Choose</div>
            <div className="rl mono" aria-hidden="true">02 Subscribe</div>
            <div className="rl mono" aria-hidden="true">03 Use it</div>
            <div className="scene" data-r="4.8,5.1,7,8">
              <p className="mono kick">The loop</p>
              <h2 className="stretch text-[clamp(34px,4.4vw,64px)] font-extrabold">Pick a project. Subscribe. Start using it.</h2>
              <p className="mt-5 max-w-[440px] text-lg text-muted">Choose a live hosted app, setup on your own server, or the full source code.</p>
              <div className="btns mt-8 flex flex-wrap gap-2.5">
                <Link className="btn btn-pri" href="/projects">Browse projects</Link>
                <Link className="btn" href="#how">How it works</Link>
              </div>
            </div>
            <p className="mono scroll-hint" data-r="-1,0,.15,.4">Scroll to build ↓</p>
          </div>
          <div className="story-fx" />
        </div>
      </div>
    </div>
  );
}
