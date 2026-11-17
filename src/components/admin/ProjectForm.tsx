"use client";
import { useActionState, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { createUploadUrl, saveProject, type SaveState } from "@/app/(site)/admin/actions";
import { CATEGORIES, type Project } from "@/lib/project-types";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

const MAX_MB = 10;

async function upload(file: File): Promise<string> {
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name} is over ${MAX_MB} MB.`);
  const r = await createUploadUrl(file.type);
  if ("error" in r) throw new Error(r.error);
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await sb.storage.from("projects").uploadToSignedUrl(r.path, r.token, file, { contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return r.publicUrl;
}

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProject, {});
  const [cover, setCover] = useState(project?.cover_url ?? "");
  const [gallery, setGallery] = useState<string[]>(project?.gallery ?? []);
  const [busy, setBusy] = useState("");
  const [upErr, setUpErr] = useState("");
  const f = state.fields ?? {};

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUpErr(""); setBusy("Uploading cover…");
    try { setCover(await upload(file)); } catch (err) { setUpErr((err as Error).message); }
    setBusy("");
  }
  async function onGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    if (!files.length) return;
    setUpErr("");
    for (const [i, file] of files.entries()) {
      setBusy(`Uploading screenshot ${i + 1} of ${files.length}…`);
      try { const url = await upload(file); setGallery((g) => [...g, url].slice(0, 12)); }
      catch (err) { setUpErr((err as Error).message); break; }
    }
    setBusy("");
  }

  const err = (k: keyof NonNullable<SaveState["fields"]>) =>
    f[k] ? { "aria-invalid": true as const, "aria-describedby": `e-${k}` } : {};

  return (
    <form className="form admin-form" action={action} noValidate>
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="cover_url" value={cover} />
      {gallery.map((g) => <input key={g} type="hidden" name="gallery" value={g} />)}

      <p className="mono form-title">Basics</p>
      <div className="row2">
        <div className="field">
          <label htmlFor="p-title">Project title</label>
          <input className="input" id="p-title" name="title" defaultValue={project?.title} placeholder="e.g. Clinic booking system" {...err("title")} />
          {f.title && <span className="field-err" id="e-title">{f.title}</span>}
        </div>
        <div className="field">
          <label htmlFor="p-cat">Category</label>
          <select className="input" id="p-cat" name="category" defaultValue={project?.category ?? CATEGORIES[0]} {...err("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {f.category && <span className="field-err" id="e-category">{f.category}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-sum">Short summary</label>
        <input className="input" id="p-sum" name="summary" maxLength={300} defaultValue={project?.summary} placeholder="One line shown on the project card." {...err("summary")} />
        {f.summary && <span className="field-err" id="e-summary">{f.summary}</span>}
      </div>
      <div className="field">
        <label htmlFor="p-desc">Full description</label>
        <textarea className="input" id="p-desc" name="description" defaultValue={project?.description} placeholder="What it is, the main features, how it works." style={{ minHeight: 170 }} />
      </div>
      <div className="field">
        <span className="lbl-text">Cover image</span>
        <div className="admin-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cover ? <img src={cover} alt="Cover preview" /> : <span className="admin-noimg big" aria-hidden="true" />}
          <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
            <label className="btn" htmlFor="p-cover">{cover ? "Replace cover" : "Upload cover"}</label>
            <input className="sr" id="p-cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onCover} />
            {cover && <button className="btn" type="button" onClick={() => setCover("")}>Remove</button>}
            <span className="muted" style={{ fontSize: 14 }}>JPG, PNG or WebP, up to {MAX_MB} MB. Wide images (16:9) look best.</span>
          </div>
        </div>
      </div>

      <p className="mono form-title">Client &amp; result</p>
      <div className="row2">
        <div className="field">
          <label htmlFor="p-client">Client name</label>
          <input className="input" id="p-client" name="client" defaultValue={project?.client} placeholder="Company name, or Confidential" />
        </div>
        <div className="field">
          <label htmlFor="p-year">Year completed</label>
          <input className="input" id="p-year" name="year" inputMode="numeric" maxLength={4} defaultValue={project?.year ?? new Date().getFullYear()} {...err("year")} />
          {f.year && <span className="field-err" id="e-year">{f.year}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-need">What the client needed</label>
        <textarea className="input" id="p-need" name="client_need" defaultValue={project?.client_need} placeholder="The problem or goal they came to us with." />
      </div>
      <div className="field">
        <label htmlFor="p-del">What we delivered</label>
        <textarea className="input" id="p-del" name="delivered" defaultValue={project?.delivered} placeholder="What we built and the result for the client." />
      </div>

      <p className="mono form-title">Tech &amp; links</p>
      <div className="row2">
        <div className="field">
          <label htmlFor="p-tech">Tech stack</label>
          <input className="input" id="p-tech" name="tech" defaultValue={project?.tech.join(", ")} placeholder="Next.js, Supabase, Tailwind" />
          <span className="muted" style={{ fontSize: 13 }}>Separate with commas.</span>
        </div>
        <div className="field">
          <label htmlFor="p-demo">Live link</label>
          <input className="input" id="p-demo" name="demo_url" type="url" defaultValue={project?.demo_url ?? ""} placeholder="https://" {...err("demo_url")} />
          {f.demo_url && <span className="field-err" id="e-demo_url">{f.demo_url}</span>}
        </div>
      </div>
      <div className="field">
        <span className="lbl-text">Screenshots</span>
        <ul className="admin-gallery reset">
          {gallery.map((g) => (
            <li key={g}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt="Screenshot preview" />
              <button type="button" aria-label="Remove screenshot" onClick={() => setGallery((x) => x.filter((y) => y !== g))}>×</button>
            </li>
          ))}
          {gallery.length < 12 && (
            <li><label className="admin-add" htmlFor="p-gal">+ Add<input className="sr" id="p-gal" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={onGallery} /></label></li>
          )}
        </ul>
      </div>

      <p className="muted" aria-live="polite">{busy}</p>
      <p className="err" aria-live="polite">{upErr || state.error}</p>
      <button className="btn btn-pri form-submit" type="submit" disabled={pending || !!busy}>
        {pending ? "Saving…" : project ? "Save changes" : "Publish project"}
      </button>
    </form>
  );
}
