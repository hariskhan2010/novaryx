import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

async function Editor({ params }: { params: PageProps<"/admin/projects/[id]">["params"] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: p }, { data: acc }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_access").select("live_url,source_path").eq("project_id", id).maybeSingle(),
  ]);
  if (!p) notFound();
  return (
    <>
      <h1 className="stretch mb-8 text-4xl font-extrabold sm:text-5xl">Edit: {p.title}</h1>
      <ProjectEditor initial={{ ...(p as Project), live_url: acc?.live_url, source_path: acc?.source_path }} />
    </>
  );
}

export default function EditProject(props: PageProps<"/admin/projects/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <Editor params={props.params} />
    </Suspense>
  );
}
