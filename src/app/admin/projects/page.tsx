import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";

async function List({ searchParams }: { searchParams: PageProps<"/admin/projects">["searchParams"] }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id,slug,title,category,monthly_price,currency,published,created_at")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      {sp.saved && <p role="status" className="mb-4 text-ok">Project saved.</p>}
      {sp.deleted && <p role="status" className="mb-4 text-ok">Project deleted.</p>}
      {rows.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold">No projects yet.</p>
          <Link href="/admin/projects/new" className="btn btn-pri mt-5">Upload your first project</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="mono text-muted">
              <tr><th className="p-4">Project</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-4 font-semibold">{p.title}<span className="block font-normal text-muted">/{p.slug}</span></td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 tabular-nums">{formatPrice(p)}</td>
                  <td className="p-4">{p.published ? <span className="badge badge-active">Published</span> : <span className="badge badge-pending">Draft</span>}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/projects/${p.id}`} className="btn btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminProjects(props: PageProps<"/admin/projects">) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="stretch text-4xl font-extrabold sm:text-5xl">Projects</h1>
        <Link href="/admin/projects/new" className="btn btn-pri">+ Upload project</Link>
      </div>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <List searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
