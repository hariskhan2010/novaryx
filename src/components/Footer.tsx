import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div className="foot-brand">
          <Link className="brand" href="/" aria-label={`${site.name} home`}>
            <svg width="26" height="26" style={{ color: "var(--fg)" }} aria-hidden="true"><use href="#mark" /></svg>{site.name}
          </Link>
          <p className="muted">A three-partner software studio from {site.location}. We build websites, apps and AI tools, then help them grow.</p>
          <Link className="btn btn-pri" href="/contact">Contact us</Link>
        </div>
        <nav aria-label="Footer">
          <p className="mono">Pages</p>
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div>
          <p className="mono">Contact</p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span className="muted">{site.location}</span>
          <span className="muted">Working remotely, worldwide</span>
        </div>
      </div>
      <div className="wrap foot-bar">
        <span>&copy; {site.year} {site.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
