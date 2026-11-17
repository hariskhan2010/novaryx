import type { Metadata } from "next";
import Link from "next/link";
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
