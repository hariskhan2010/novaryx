import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProject } from "@/lib/projects";

// Project pages are rendered on request (new projects appear without a rebuild).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : { title: "Project not found" };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<div className="wrap page-head"><p className="muted">Loading project…</p></div>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  const paras = (t: string) => t.split(/\n{2,}|\r\n\r\n/).map((x) => x.trim()).filter(Boolean);

  return (
    <article className="wrap page-head proj">
      <Link href="/projects" className="mono muted proj-back">← All projects</Link>
      <p className="mono eyebrow" style={{ marginTop: 24 }}>{p.category}{p.year ? ` · ${p.year}` : ""}</p>
      <h1>{p.title}</h1>
      <p className="lead" style={{ fontSize: 21 }}>{p.summary}</p>

      <dl className="facts">
        <div><dt className="mono">Client</dt><dd className="proj-dd">{p.client || "Confidential"}</dd></div>
        <div><dt className="mono">Category</dt><dd className="proj-dd">{p.category}</dd></div>
        {p.year && <div><dt className="mono">Completed</dt><dd className="proj-dd">{p.year}</dd></div>}
        {p.demo_url && <div><dt className="mono">Live</dt><dd className="proj-dd"><a href={p.demo_url} target="_blank" rel="noopener noreferrer">Visit site ↗</a></dd></div>}
      </dl>

      {p.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="proj-cover" src={p.cover_url} alt={`${p.title} cover`} />
      )}

      <div className="proj-body">
        {p.description && (
          <section><h2>Overview</h2>{paras(p.description).map((t, i) => <p key={i}>{t}</p>)}</section>
        )}
        {p.client_need && (
          <section><h2>What the client needed</h2>{paras(p.client_need).map((t, i) => <p key={i}>{t}</p>)}</section>
        )}
        {p.delivered && (
          <section><h2>What we delivered</h2>{paras(p.delivered).map((t, i) => <p key={i}>{t}</p>)}</section>
        )}
        {p.tech.length > 0 && (
          <section><h2>Tech stack</h2><ul className="tags reset" aria-label="Tech stack">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul></section>
        )}
      </div>

      {p.gallery.length > 0 && (
        <section style={{ marginTop: 64 }} aria-labelledby="shots-h">
          <h2 className="h2" id="shots-h" style={{ fontSize: "clamp(30px,4vw,48px)" }}>Screenshots</h2>
          <ul className="proj-gallery reset">
            {p.gallery.map((g, i) => (
              <li key={g}>
                <a href={g} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="band" style={{ marginTop: 80 }}>
        <p className="mono">Like this project?</p>
        <h2>Tell us what you want built.</h2>
        <Link className="btn" href="/contact">Start a project</Link>
      </div>
    </article>
  );
}
