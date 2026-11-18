import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import appgateShot from "@/assets/projects/appgate-home.webp";
import { CategoryTabs } from "@/components/CategoryTabs";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Web apps, websites, mobile apps and AI tools built by NOVARYX, with the full details of each project.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="wrap page-head">
      <p className="mono eyebrow">Projects</p>
      <h1>Projects we&apos;ve built.</h1>
      <p className="lead">Every project here is something we designed and built ourselves. Pick a category to see what it covers.</p>
      <Link href="/projects/appgate" className="feat-proj" aria-label="AppGate case study: per-app internet control for Windows">
        <span className="feat-proj-img"><Image src={appgateShot} alt="" placeholder="blur" sizes="(min-width: 900px) 560px, 100vw" /></span>
        <span className="feat-proj-body">
          <span className="mono eyebrow">Featured · Windows app · Built in one week</span>
          <b>AppGate</b>
          <span className="muted">Block the internet for any app on a Windows PC while the rest stays online. A desktop app, a Windows service, a recovery tool and 119 automated tests.</span>
          <span className="feat-proj-more">Watch the case study →</span>
        </span>
      </Link>
      {projects.length === 0 && (
        <div className="status">
          <span className="dot" aria-hidden="true" />
          <span>The first projects are being listed now. Want something like this? <Link href="/contact">Tell us about your project.</Link></span>
        </div>
      )}
      <CategoryTabs projects={projects} />
    </div>
  );
}
