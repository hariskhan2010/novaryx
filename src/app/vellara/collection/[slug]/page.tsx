import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STONES, stoneBySlug } from "../../stones";

export function generateStaticParams() {
  return STONES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vellara/collection/[slug]">): Promise<Metadata> {
  const s = stoneBySlug((await params).slug);
  return s ? { title: s.name, description: s.line } : {};
}

export default async function StonePage({ params }: PageProps<"/vellara/collection/[slug]">) {
  const s = stoneBySlug((await params).slug);
  if (!s) notFound();
  const i = STONES.indexOf(s);
  const next = STONES[(i + 1) % STONES.length];

  return (
    <article className="vl-stonepage" style={{ ["--tint" as string]: s.tint }}>
      <div className="vl-wrap vl-stone-layout">
        <div className="vl-stone-photo">
          <Image src={s.image} alt={`${s.name}, ${s.carat} carats, ${s.cut.toLowerCase()} cut`} fill priority sizes="(min-width: 900px) 50vw, 100vw" />
        </div>
        <div className="vl-stone-info">
          <Link href="/vellara/collection" className="vl-back">All stones</Link>
          <h1 className="vl-h1">{s.name}</h1>
          <p className="vl-lead">{s.line}</p>
          <dl className="vl-specs">
            <div><dt>Weight</dt><dd>{s.carat.toFixed(2)} ct</dd></div>
            <div><dt>Cut</dt><dd>{s.cut}</dd></div>
            <div><dt>Size</dt><dd>{s.size} mm</dd></div>
            <div><dt>Treatment</dt><dd>{s.treatment}</dd></div>
            <div><dt>Valley</dt><dd>{s.valley}</dd></div>
            <div><dt>Region</dt><dd>{s.region}</dd></div>
            <div><dt>Deposit altitude</dt><dd>{s.altitude.toLocaleString("en")} m</dd></div>
            <div><dt>Price</dt><dd>On request</dd></div>
          </dl>
          <div className="vl-story">{s.story.map((p, k) => <p key={k}>{p}</p>)}</div>
          <Link className="vl-btn vl-btn-solid" href={`/vellara/contact?stone=${s.slug}`}>Ask about this stone</Link>
        </div>
      </div>
      <nav className="vl-wrap vl-next" aria-label="Next stone" style={{ ["--tint" as string]: next.tint }}>
        <Link href={`/vellara/collection/${next.slug}`}>
          <span className="vl-muted">Next stone</span>
          <span className="vl-next-name">{next.name}</span>
        </Link>
      </nav>
    </article>
  );
}
