"use client";
import { useState } from "react";
import { saveProject, deleteProject } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/forms";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Project } from "@/lib/types";

type Initial = Partial<Project> & { live_url?: string | null; source_path?: string | null };

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);

/** Upload a file straight from the browser to Supabase Storage (admin-only via RLS). */
function useUpload(bucket: "covers" | "sources") {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true); setErr("");
    const path = `${crypto.randomUUID()}/${safeName(file.name)}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    setBusy(false);
    if (error) { setErr(error.message); return null; }
    return bucket === "covers" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path;
  }
  return { upload, busy, err };
}

export function ProjectEditor({ initial }: { initial?: Initial }) {
  const p = initial ?? {};
  const [title, setTitle] = useState(p.title ?? "");
  const [slug, setSlug] = useState(p.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(p.slug));
  const [cover, setCover] = useState(p.cover_url ?? "");
  const [source, setSource] = useState(p.source_path ?? "");
  const coverUp = useUpload("covers");
  const srcUp = useUpload("sources");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="grid gap-10">
      <ActionForm action={saveProject} className="grid gap-8">
        {(state, pending) => (
          <>
            <input type="hidden" name="id" value={p.id ?? ""} />
            <input type="hidden" name="cover_url" value={cover} />
            <input type="hidden" name="source_path" value={source} />

            <section className="card grid gap-2 p-6">
              <h2 className="mb-2 text-xl font-bold">Basics</h2>
              <div className="field">
                <label htmlFor="f-title">Title</label>
                <input id="f-title" name="title" className="input" value={title} required aria-invalid={state.fields?.title ? true : undefined}
                  onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
                <p className="min-h-[1.2em] text-sm text-bad" aria-live="polite">{state.fields?.title}</p>
              </div>
              <div className="field">
                <label htmlFor="f-slug">Link name (slug)</label>
                <p className="text-sm text-muted">The page address: /projects/{slug || "my-project"}</p>
                <input id="f-slug" name="slug" className="input" value={slug} required aria-invalid={state.fields?.slug ? true : undefined}
                  onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
                <p className="min-h-[1.2em] text-sm text-bad" aria-live="polite">{state.fields?.slug}</p>
              </div>
              <div className="field">
                <label htmlFor="f-category">Category</label>
                <select id="f-category" name="category" className="input" defaultValue={p.category ?? "Web app"}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="h-3" />
              <Field name="summary" label="Short summary" state={state} defaultValue={p.summary} hint="One sentence shown on the project card (max 300 characters)." />
              <Field name="description" label="Full description" state={state} textarea defaultValue={p.description} hint="Features, what's included, requirements." />
              <Field name="tech" label="Built with (comma separated)" state={state} defaultValue={p.tech?.join(", ")} placeholder="Next.js, Supabase, Stripe" />
            </section>

            <section className="card grid gap-4 p-6">
              <h2 className="text-xl font-bold">Screenshot</h2>
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="Current cover" className="max-h-64 w-fit rounded-2xl border border-line object-cover" />
              )}
              <div className="field">
                <label htmlFor="f-cover-file">{cover ? "Replace image" : "Upload image"}</label>
                <input id="f-cover-file" type="file" accept="image/png,image/jpeg,image/webp" className="input"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await coverUp.upload(f); if (url) setCover(url); } }} />
                <p className="text-sm text-muted" aria-live="polite">{coverUp.busy ? "Uploading…" : coverUp.err ? <span className="text-bad">{coverUp.err}</span> : "PNG, JPG or WebP."}</p>
              </div>
            </section>

            <section className="card grid gap-2 p-6">
              <h2 className="mb-2 text-xl font-bold">Price &amp; options</h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field name="monthly_price" label="Monthly price" type="number" state={state} defaultValue={p.monthly_price?.toString() ?? ""} hint="Leave empty to show 'Price on request'." />
                <Field name="currency" label="Currency" state={state} defaultValue={p.currency ?? "USD"} />
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 font-semibold">Customers can choose</legend>
                {([["offers_hosted", "Live hosted app", p.offers_hosted ?? true], ["offers_setup", "Setup & customization", p.offers_setup ?? true], ["offers_source", "Source code download", p.offers_source ?? true]] as const).map(([n, l, d]) => (
                  <label key={n} className="flex items-center gap-3"><input type="checkbox" name={n} defaultChecked={d} className="h-4 w-4 accent-[var(--accent)]" /> {l}</label>
                ))}
              </fieldset>
            </section>

            <section className="card grid gap-2 p-6">
              <h2 className="text-xl font-bold">Links</h2>
              <p className="mb-2 text-sm text-muted">The demo link is public. The live app link and source code are only shown to customers with an active subscription.</p>
              <Field name="demo_url" label="Public demo link (optional)" type="url" state={state} defaultValue={p.demo_url ?? ""} placeholder="https://demo.example.com" />
              <Field name="live_url" label="Live app link for subscribers (optional)" type="url" state={state} defaultValue={p.live_url ?? ""} placeholder="https://app.example.com" />
              <div className="field">
                <label htmlFor="f-source-file">Source code (.zip)</label>
                {source && <p className="text-sm">Uploaded: <span className="mono normal-case">{source.split("/").pop()}</span></p>}
                <input id="f-source-file" type="file" accept=".zip,application/zip" className="input"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const path = await srcUp.upload(f); if (path) setSource(path); } }} />
                <p className="text-sm text-muted" aria-live="polite">{srcUp.busy ? "Uploading… keep this page open." : srcUp.err ? <span className="text-bad">{srcUp.err}</span> : "Stored privately. Supabase's free plan allows files up to 50 MB."}</p>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-3 font-semibold"><input type="checkbox" name="published" defaultChecked={p.published ?? false} className="h-4 w-4 accent-[var(--accent)]" /> Published (visible to customers)</label>
              <button className="btn btn-pri" disabled={pending || coverUp.busy || srcUp.busy}>{pending ? "Saving…" : "Save project"}</button>
            </div>
          </>
        )}
      </ActionForm>

      {p.id && (
        <form action={deleteProject} className="card grid gap-3 border-bad/40 p-6">
          <input type="hidden" name="id" value={p.id} />
          <h2 className="text-xl font-bold">Delete project</h2>
          <p className="text-muted">This removes the project, its subscriptions and its source file. It can&apos;t be undone.</p>
          <label className="flex items-center gap-3"><input type="checkbox" checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} className="h-4 w-4" /> Yes, delete &ldquo;{p.title}&rdquo; permanently</label>
          <div><button className="btn border-bad text-bad" disabled={!confirmDelete}>Delete project</button></div>
        </form>
      )}
    </div>
  );
}
