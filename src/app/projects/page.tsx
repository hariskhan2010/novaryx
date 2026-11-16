import type { Metadata } from "next";
import Link from "next/link";
import { CategoryTabs } from "@/components/CategoryTabs";

export const metadata: Metadata = {
  title: "Projects",
  description: "Web apps, websites, mobile apps and AI tools built by NOVARYX: use them hosted, set up on your server, or as source code.",
};

export default function ProjectsPage() {
  return (
    <div className="wrap page-head">
      <p className="mono eyebrow">Projects</p>
      <h1>Software you can subscribe to.</h1>
      <p className="lead">Every project is something we built and run ourselves. Pick a category to see what it covers and how you can get it.</p>
      <div className="status">
        <span className="dot" aria-hidden="true" />
        <span>The first projects are being listed now. Want one today? <Link href="/contact">Order it as a custom project.</Link></span>
      </div>
      <CategoryTabs />
    </div>
  );
}
