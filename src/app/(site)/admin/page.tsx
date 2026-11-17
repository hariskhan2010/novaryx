import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin/ip";
import { adminConfigured, adminDb } from "@/lib/supabase/admin";
import { PROJECT_COLS, type Project } from "@/lib/project-types";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { deleteProject } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="wrap page-head section" style={{ paddingTop: "clamp(120px,16vh,170px)" }}>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Admin({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  if (!(await isAdmin())) notFound();
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : "";

  if (!adminConfigured) {
    return (
      <div className="admin-note">
        <h1 className="h2">Admin is almost ready.</h1>
        <p className="lead">Add <code>SUPABASE_SECRET_KEY</code> to <code>.env.local</code> (and to Vercel), then restart the dev server.</p>
      </div>
    );
  }

  const { data, error } = await adminDb().from("projects").select(PROJECT_COLS).order("created_at", { ascending: false });
  const projects = (data ?? []) as Project[];
  const editing = editId ? projects.find((p) => p.id === editId) : undefined;

  return (
    <>
      <p className="mono eyebrow">Admin</p>
      <h1 className="h2">Your projects</h1>
      {sp.saved && <p className="admin-ok" role="status">Saved. It&apos;s live on the Projects page.</p>}
      {sp.deleted && <p className="admin-ok" role="status">Project deleted.</p>}
      {error && <p className="err" style={{ marginTop: 16 }}>Couldn&apos;t load projects: {error.message}. Did you run the SQL update in Supabase?</p>}

      <ul className="admin-list reset">
        {projects.length === 0 && <li className="muted">No projects yet. Add your first one below.</li>}
        {projects.map((p) => (
          <li key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.cover_url ? <img src={p.cover_url} alt="" /> : <span className="admin-noimg" aria-hidden="true" />}
            <div>
              <b>{p.title}</b>
              <span className="muted">{p.category}{p.year ? ` · ${p.year}` : ""}{p.client ? ` · ${p.client}` : ""}</span>
            </div>
            <Link className="btn" href={`/projects/${p.slug}`}>View</Link>
            <Link className="btn" href={`/admin?edit=${p.id}#form`}>Edit</Link>
            <details className="admin-delwrap">
              <summary className="btn">Delete</summary>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn admin-del" type="submit">Yes, delete it</button>
              </form>
            </details>
          </li>
        ))}
      </ul>

      <section id="form" style={{ marginTop: 64 }} aria-labelledby="form-h">
        <h2 className="h2" id="form-h" style={{ fontSize: "clamp(30px,4vw,48px)" }}>{editing ? `Edit: ${editing.title}` : "Add a project"}</h2>
        {editing && <Link href="/admin#form" className="muted" style={{ display: "inline-block", marginTop: 10 }}>Cancel editing, add a new one instead</Link>}
        <ProjectForm key={editing?.id ?? "new"} project={editing} />
      </section>
    </>
  );
}
