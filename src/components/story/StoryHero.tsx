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
            <div className="word">Design · Design ·</div>
            <div className="word o">Build · Build · Build ·</div>
            <div className="word a">Ship · Ship · Ship ·</div>
          </div>
          <div className="wordmark" aria-hidden="true">NOVARYX</div>
          <canvas className="story-gl" aria-hidden="true" />
          <div className="story-front">
            <div className="scene" data-r="-1,0,.55,.95" style={{ ["--o" as string]: 1 }}>
              <p className="mono kick">Software studio · Peshawar, Pakistan</p>
              <h1>We build it. <span style={{ color: "var(--cobalt)" }}>You use it</span> from day one.</h1>
              <p className="lede">See the apps, websites and AI tools we have built, or tell us what you need and we build it for you.</p>
              <div className="btns">
                <Link className="btn btn-pri" href="/projects">See the projects</Link>
                <Link className="btn" href="/contact">Contact us</Link>
              </div>
            </div>
            <div className="scene" data-r="1.0,1.3,2.0,2.2">
              <p className="mono kick">Built in-house</p>
              <h2>Every screen is designed, coded and tested by us.</h2>
              <div className="mono muted" style={{ marginTop: 24, display: "grid", gap: 6 }}>
                <span>Building project <b style={{ color: "var(--fg)", fontWeight: 500 }} data-pct>0%</b></span>
                <div className="bar"><i data-pbar /></div>
                <span data-layer>Layer: Design</span>
              </div>
            </div>
            <div className="scene" data-r="2.25,2.55,3.3,3.5">
              <p className="mono kick">Four layers in every build</p>
              <h2>Design, frontend, backend and AI.</h2>
            </div>
            <svg className="leaders" aria-hidden="true" />
            <div className="lbl" aria-hidden="true"><b>Design</b><span className="mono">UI/UX · brand · systems</span></div>
            <div className="lbl" aria-hidden="true"><b>Frontend</b><span className="mono">Web · iOS · Android</span></div>
            <div className="lbl" aria-hidden="true"><b>Backend</b><span className="mono">APIs · data · integrations</span></div>
            <div className="lbl" aria-hidden="true"><b>AI</b><span className="mono">Assistants · automations</span></div>
            <div className="rl mono" aria-hidden="true">01 Tell us</div>
            <div className="rl mono" aria-hidden="true">02 We build</div>
            <div className="rl mono" aria-hidden="true">03 You launch</div>
            <div className="scene" data-r="4.8,5.1,7,8">
              <p className="mono kick">How it works</p>
              <h2>Tell us your idea. We build it. You launch it.</h2>
              <p className="lede">We design, build and test every part, then hand it over ready to use.</p>
              <div className="btns">
                <Link className="btn btn-pri" href="/projects">See the projects</Link>
                <Link className="btn" href="/about#partners-h">Meet the partners</Link>
              </div>
            </div>
            <p className="mono hint" data-hint>Scroll to build ↓</p>
          </div>
          <div className="story-fx" />
        </div>
      </div>
    </div>
  );
}
