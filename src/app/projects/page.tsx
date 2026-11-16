import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHead, ProjectCard, SetupNotice } from "@/components/ui";
import { listProjects } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Projects",
  description: "Ready-made web apps, websites, mobile apps and AI tools you can subscribe to.",
};

async function Catalog({ searchParams }: { searchParams: PageProps<"/projects">["searchParams"] }) {
  if (!supabaseConfigured) return <SetupNotice />;
  const sp = await searchParams;
  const raw = typeof sp.category === "string" ? sp.category : undefined;
  const category = raw && CATEGORIES.includes(raw) ? raw : undefined;
  const projects = await listProjects({ category });

  return (
    <div className="wrap">
      <nav aria-label="Categories" className="mb-10 flex flex-wrap gap-2">
        {[undefined, ...CATEGORIES].map((c) => {
          const on = c === category;
          return (
            <Link
              key={c ?? "all"}
              href={c ? `/projects?category=${encodeURIComponent(c)}` : "/projects"}
              aria-current={on ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm ${on ? "border-accent bg-accent text-ink" : "border-line text-muted hover:text-fg"}`}
            >
              {c ?? "All"}
            </Link>
          );
        })}
      </nav>
      {projects.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          No projects here yet. <Link href="/custom" className="text-accent underline">Order a custom one</Link>.
        </div>
      ) : (
        <>
          <h2 className="sr-only">Project list</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProjectsPage(props: PageProps<"/projects">) {
  return (
    <div className="pb-24">
      <PageHead eyebrow="Projects" title="Ready-made projects" intro="Subscribe to any project below. Use it hosted, get it set up for you, or download the source code." />
      <div className="mt-12">
        <Suspense fallback={<div className="wrap text-muted">Loading projects…</div>}>
          <Catalog searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
