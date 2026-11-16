import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function Overview() {
  const supabase = await createClient();
  const count = async (table: string, col?: string, val?: string) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (col && val) q = q.eq(col, val);
    const { count } = await q;
    return count ?? 0;
  };
  const [projects, published, pending, active, newReq] = await Promise.all([
    count("projects"), count("projects", "published", "true"), count("subscriptions", "status", "pending"),
    count("subscriptions", "status", "active"), count("custom_requests", "status", "new"),
  ]);
  const tiles = [
    { label: "Subscriptions waiting", value: pending, href: "/admin/orders", hot: pending > 0 },
    { label: "New custom requests", value: newReq, href: "/admin/requests", hot: newReq > 0 },
    { label: "Active subscriptions", value: active, href: "/admin/orders" },
    { label: "Projects (published)", value: `${projects} (${published})`, href: "/admin/projects" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.label} href={t.href} className={`card grid gap-2 p-6 hover:border-accent ${t.hot ? "border-hot" : ""}`}>
          <span className="stretch text-4xl font-extrabold tabular-nums">{t.value}</span>
          <span className="text-muted">{t.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function AdminHome() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="stretch text-4xl font-extrabold sm:text-5xl">Admin</h1>
        <Link href="/admin/projects/new" className="btn btn-pri">+ Upload project</Link>
      </div>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Overview />
      </Suspense>
    </>
  );
}
