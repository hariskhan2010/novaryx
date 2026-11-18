"use client";
import { useEffect, useRef } from "react";
import { initAppGateFilm } from "./agEngine";

const SCENES: { r: string; eyebrow: string; h: string; p: string; h1?: boolean }[] = [
  { r: "-1,0,.8,.98", eyebrow: "Case study · Windows app · Built in one week", h: "AppGate", h1: true, p: "Some apps use your internet without asking, like a Game launcher quietly downloading a huge update." },
  { r: "1,1.15,1.82,1.98", eyebrow: "The fix", h: "Pick the app. Switch its internet off.", p: "In AppGate, turn off the switch next to the app and confirm. AppGate tells you to restart it so open connections close." },
  { r: "2,2.15,2.82,2.98", eyebrow: "The result", h: "Only that app goes offline.", p: "The Game launcher shows “No internet”. The browser and everything else keep working. The Game launcher still opens and plays offline. Only its internet is off." },
  { r: "3,3.15,3.82,3.98", eyebrow: "Every network", h: "Wi-Fi or cable, the app stays offline.", p: "Your Wi-Fi and cable keep working. Only the Game launcher is blocked, on every connection. The same switch turns it back on." },
  { r: "4,4.15,4.82,4.98", eyebrow: "Built to be trusted", h: "Every block is checked and recorded.", p: "AppGate checks the request, creates a Windows Firewall rule, reads it back, saves it and logs it." },
  { r: "5,5.15,6.5,7", eyebrow: "Always reversible", h: "One click undoes everything.", p: "“Restore all” removes only AppGate’s own rules, shown here on the real AppGate Home screen." },
];

/** AppGate case-study film: a laptop whose screen shows one idea per scene, driven by scroll. */
export function AppGateFilm({ homeShot, gameIcon, logo }: { homeShot: string; gameIcon: string; logo: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    return initAppGateFilm(root.current, homeShot, gameIcon, logo);
  }, [homeShot, gameIcon, logo]);

  return (
    <div ref={root} className="ag-film">
      <div className="ag-scroller">
        <div className="ag-stage">
          <canvas className="ag-gl" aria-hidden="true" />
          <div className="ag-front wrap">
            {SCENES.map((sc, i) => (
              <div key={i} className="ag-scene" data-r={sc.r} style={i === 0 ? { ["--o" as string]: 1 } : undefined}>
                <p className="mono eyebrow">{sc.eyebrow}</p>
                {sc.h1 ? <h1>{sc.h}</h1> : <h2>{sc.h}</h2>}
                <p className="lede">{sc.p}</p>
              </div>
            ))}
          </div>
          <p className="mono ag-note">Scroll to play</p>
        </div>
      </div>
    </div>
  );
}
