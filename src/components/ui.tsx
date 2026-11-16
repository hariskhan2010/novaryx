import Link from "next/link";
import { formatPrice, OPTION_LABEL, offeredOptions, type Project } from "@/lib/types";

export function PageHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="wrap pt-32 sm:pt-40">
      <p className="mono text-accent">{eyebrow}</p>
      <h1 className="stretch mt-3 max-w-[14ch] text-5xl font-extrabold sm:text-7xl">{title}</h1>
      {intro && <p className="mt-5 max-w-[56ch] text-lg text-muted">{intro}</p>}
    </div>
  );
}

export function SetupNotice({ page = false }: { page?: boolean }) {
  const H = page ? "h1" : "h2";
  return (
    <div className={`wrap py-10 ${page ? "pt-32" : ""}`}>
      <div className="card p-6">
        <p className="mono text-hot">Setup needed</p>
        <H className="mt-2 text-2xl font-bold">Connect Supabase to load projects</H>
        <p className="mt-2 max-w-[60ch] text-muted">
          Copy <code>.env.local.example</code> to <code>.env.local</code>, add your Supabase URL and key, run{" "}
          <code>supabase/schema.sql</code> in the Supabase SQL editor, then restart the dev server.
        </p>
      </div>
    </div>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:border-accent">
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        {p.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_oklab,var(--accent)_30%,transparent),transparent)]">
            <span className="mono text-muted">{p.category}</span>
          </div>
        )}
        <span className="mono absolute left-3 top-3 rounded-full bg-bg/80 px-3 py-1.5 backdrop-blur">{p.category}</span>
      </div>
      <div className="grid gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold group-hover:text-accent">{p.title}</h3>
          <span className="mono shrink-0 text-hot">{formatPrice(p)}</span>
        </div>
        {p.summary && <p className="text-muted">{p.summary}</p>}
        <div className="flex flex-wrap gap-1.5">
          {offeredOptions(p).map((o) => (
            <span key={o} className="tag">{OPTION_LABEL[o]}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
