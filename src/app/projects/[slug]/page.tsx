import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SetupNotice } from "@/components/ui";
import { SubscribeForm } from "@/components/StoreForms";
import { getProject } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/supabase/server";
import { formatPrice, offeredOptions } from "@/lib/types";

async function ProjectDetail({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  if (!supabaseConfigured) return <SetupNotice page />;
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();
  const { user } = await getUser();
  const options = offeredOptions(p);

  return (
    <article className="wrap grid gap-12 pb-24 pt-32 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <Link href="/projects" className="text-sm text-muted hover:text-fg">← All projects</Link>
        <p className="mono mt-6 text-accent">{p.category}</p>
        <h1 className="stretch mt-2 text-4xl font-extrabold sm:text-6xl">{p.title}</h1>
        {p.summary && <p className="mt-4 text-lg text-muted">{p.summary}</p>}
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-bg2">
          {p.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.cover_url} alt={`${p.title} screenshot`} className="w-full object-cover" />
          ) : (
            <div className="grid aspect-[16/9] place-items-center text-muted">No screenshot yet</div>
          )}
        </div>
        {p.description && (
          <section className="mt-10" aria-labelledby="about-h">
            <h2 id="about-h" className="text-2xl font-bold">About this project</h2>
            <p className="mt-3 whitespace-pre-line text-muted">{p.description}</p>
          </section>
        )}
        {p.tech.length > 0 && (
          <section className="mt-8" aria-labelledby="tech-h">
            <h2 id="tech-h" className="text-2xl font-bold">Built with</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.tech.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card grid gap-5 p-6">
          <div>
            <p className="mono text-muted">Subscription</p>
            <p className="stretch mt-1 text-4xl font-extrabold">{formatPrice(p)}</p>
          </div>
          {p.demo_url && (
            <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="btn">Open live demo ↗</a>
          )}
          {options.length === 0 ? (
            <p className="text-muted">Subscriptions for this project aren&apos;t open yet.</p>
          ) : user ? (
            <SubscribeForm projectId={p.id} options={options} />
          ) : (
            <div className="grid gap-3">
              <p className="text-muted">Sign in to request a subscription. It takes a minute.</p>
              <Link href={`/login?next=/projects/${p.slug}`} className="btn btn-pri">Sign in to subscribe</Link>
              <Link href={`/signup?next=/projects/${p.slug}`} className="btn">Create an account</Link>
            </div>
          )}
        </div>
      </aside>
    </article>
  );
}

export default function ProjectPage(props: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<div className="wrap pt-32 text-muted">Loading project…</div>}>
      <ProjectDetail params={props.params} />
    </Suspense>
  );
}
