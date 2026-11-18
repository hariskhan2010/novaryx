import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppGateFilm } from "@/components/appgate/AppGateFilm";
import shot from "@/assets/projects/appgate-home.webp";
import gameIcon from "@/assets/projects/game-launcher-icon.webp";

export const metadata: Metadata = {
  title: "AppGate · per-app internet control for Windows",
  description: "Case study: AppGate blocks or restores internet access for individual Windows apps using firewall rules it owns, verifies and can always remove. Built by NOVARYX in one week.",
};

const FEATURES = [
  ["Block any app", "Switch off the internet for one program. The rest of the PC stays online."],
  ["Wi-Fi only", "Block an app only on Wi-Fi, so it still works on a cable connection."],
  ["Finds your apps", "Scans Start Menu shortcuts, installed programs, running processes, or any EXE you pick."],
  ["Checks its own work", "Every rule is read back after it is created, and checked again every 15 minutes."],
  ["Activity log", "Every block, change and restore is recorded."],
  ["Always reversible", "Restore all blocks in one click. A recovery tool works even without the service."],
];

const PARTS = [
  ["Desktop app (WPF)", "Home, Apps, Activity and Settings pages, a first-run screen and a tray menu. Never runs as admin."],
  ["Windows service", "Runs as LocalSystem. Talks to Windows Firewall, checks every caller, logs to files."],
  ["Core engine", "All the decision logic, with no Windows calls, so it is fully unit-tested."],
  ["Storage", "SQLite with forward-only migrations."],
  ["Scanner", "Shortcuts, Uninstall registry keys, running processes, signatures and related EXEs."],
  ["Recovery CLI", "List, check or remove every AppGate rule, even if the service or database is gone."],
];

const VERIFIED: [string, string, string][] = [
  ["Block, Wi-Fi only, replace, remove, repair, emergency restore", "Unit tests", "Pass"],
  ["Bad callers, malformed requests, unsafe file paths", "Unit tests", "Pass"],
  ["Named pipe, caller identity, 64 KB limit, 12 clients at once", "Integration tests", "Pass"],
  ["Reading real Windows Firewall status and rules", "Integration tests", "Pass"],
  ["Finding apps on a real PC (134 found)", "Integration + manual", "Pass"],
  ["Install: service registered, starts, answers", "Manual, real PC", "Pass"],
  ["Blocked app cannot connect, unblocked one can", "Manual, real PC", "Pass"],
  ["Wi-Fi-only block, then remove: app back online", "Manual, real PC", "Pass"],
];

const TECH = ["C#", ".NET 8", "WPF", "Windows Service", "Windows Defender Firewall (COM)", "Named pipes", "SQLite", "Inno Setup", "xUnit"];

export default function AppGatePage() {
  return (
    <>
      <AppGateFilm homeShot={shot.src} gameIcon={gameIcon.src} />

      <section className="wrap section ag-detail" aria-labelledby="ag-what">
        <Link href="/projects" className="mono muted proj-back">← All projects</Link>
        <p className="mono eyebrow" style={{ marginTop: 28 }}>The project</p>
        <h2 className="h2" id="ag-what">A firewall switch for every app, that you can trust.</h2>
        <p className="lead">
          AppGate is a Windows 10 and 11 desktop utility. It blocks or restores internet access for individual apps while the rest of the
          PC stays online. It does this with ordinary Windows Defender Firewall rules that it owns, records, verifies and can always remove.
        </p>
        <dl className="facts">
          <div><dt className="mono">Platform</dt><dd className="proj-dd">Windows 10 / 11</dd></div>
          <div><dt className="mono">Built in</dt><dd className="proj-dd">One week</dd></div>
          <div><dt className="mono">Tests</dt><dd className="proj-dd">119 passing</dd></div>
          <div><dt className="mono">Status</dt><dd className="proj-dd">V1 complete</dd></div>
        </dl>
        <figure className="ag-shot">
          <Image src={shot} alt="AppGate Home screen: no apps blocked, 151 programs found, Windows Firewall on" placeholder="blur" sizes="(min-width: 1200px) 1100px, 100vw" />
          <figcaption className="muted">The real AppGate Home screen after scanning a PC.</figcaption>
        </figure>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }} aria-labelledby="ag-feat">
        <p className="mono eyebrow">What it does</p>
        <h2 className="h2" id="ag-feat">Six things it does well.</h2>
        <ul className="ag-grid reset">
          {FEATURES.map(([t, d]) => <li key={t}><b>{t}</b><span className="muted">{d}</span></li>)}
        </ul>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }} aria-labelledby="ag-parts">
        <p className="mono eyebrow">How it is built</p>
        <h2 className="h2" id="ag-parts">Six parts, one solution.</h2>
        <ul className="ag-grid reset">
          {PARTS.map(([t, d]) => <li key={t}><b>{t}</b><span className="muted">{d}</span></li>)}
        </ul>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }} aria-labelledby="ag-ver">
        <p className="mono eyebrow">Proof</p>
        <h2 className="h2" id="ag-ver">What has been tested.</h2>
        <div className="ag-table" role="table" aria-label="Verification results">
          <div role="row" className="ag-row ag-head"><span role="columnheader">Area</span><span role="columnheader">How</span><span role="columnheader">Result</span></div>
          {VERIFIED.map(([a, h, r]) => (
            <div role="row" className="ag-row" key={a}><span role="cell">{a}</span><span role="cell" className="muted">{h}</span><span role="cell" className="ag-pass">{r}</span></div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>Still to run: the automated real-firewall tests on a virtual machine, and reboot, VPN and policy-conflict checks.</p>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }} aria-labelledby="ag-tech">
        <p className="mono eyebrow">Tech stack</p>
        <h2 className="h2" id="ag-tech">Native Windows, end to end.</h2>
        <ul className="tags reset" style={{ marginTop: 28 }}>{TECH.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="wrap" style={{ paddingBottom: 40 }}>
        <div className="band">
          <p className="mono">Need something like this?</p>
          <h2>We build advanced software in days, not months.</h2>
          <Link className="btn" href="/contact">Start a project</Link>
        </div>
      </section>
    </>
  );
}
