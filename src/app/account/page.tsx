import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/actions";
import { SetupNotice, StatusBadge } from "@/components/ui";
import { SuccessBox } from "@/components/forms";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/supabase/server";
import { OPTION_LABEL, type SubOption, type SubStatus } from "@/lib/types";

export const metadata: Metadata = { title: "My account" };

type Row = {
  id: string; option: SubOption; status: SubStatus; created_at: string; admin_note: string;
  project_id: string; projects: { title: string; slug: string } | null;
};

async function AccountInner({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  if (!supabaseConfigured) return <SetupNotice page />;
  const { supabase, user } = await getUser();
  if (!user) redirect("/login?next=/account");
  const sp = await searchParams;

  const { data } = await supabase
    .from("subscriptions")
    .select("id,option,status,created_at,admin_note,project_id,projects(title,slug)")
    .order("created_at", { ascending: false });
  const subs = (data ?? []) as unknown as Row[];

  const activeIds = [...new Set(subs.filter((s) => s.status === "active").map((s) => s.project_id))];
  const access = new Map<string, { live_url: string | null; source_path: string | null }>();
  if (activeIds.length) {
    const { data: acc } = await supabase.from("project_access").select("project_id,live_url,source_path").in("project_id", activeIds);
    acc?.forEach((a) => access.set(a.project_id, a));
  }

  return (
    <div className="wrap pb-24 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-accent">My account</p>
          <h1 className="stretch mt-2 text-4xl font-extrabold sm:text-6xl">Your subscriptions</h1>
          <p className="mt-2 text-muted">Signed in as {user.email}</p>
        </div>
        <form action={signOut}><button className="btn">Sign out</button></form>
      </div>

      {sp.requested && (
        <div className="mt-8">
          <SuccessBox title="Request sent">We&apos;ll contact you to confirm payment, then activate your access here.</SuccessBox>
        </div>
      )}

      {subs.length === 0 ? (
        <div className="card mt-10 p-8 text-center">
          <p className="text-lg font-semibold">No subscriptions yet.</p>
          <Link href="/projects" className="btn btn-pri mt-5">Browse projects</Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4">
          {subs.map((s) => {
            const a = access.get(s.project_id);
            return (
              <li key={s.id} className="card grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {s.projects ? <Link href={`/projects/${s.projects.slug}`} className="hover:text-accent">{s.projects.title}</Link> : "Removed project"}
                    </h2>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-muted">{OPTION_LABEL[s.option]} · requested {new Date(s.created_at).toLocaleDateString("en-GB")}</p>
                  {s.status === "pending" && <p className="mt-2 text-sm text-muted">Waiting for payment confirmation.</p>}
                  {s.admin_note && <p className="mt-2 text-sm">Note from us: {s.admin_note}</p>}
                </div>
                {s.status === "active" && (
                  <div className="flex flex-wrap gap-2">
                    {a?.live_url && (s.option === "hosted" || s.option === "setup") && (
                      <a href={a.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-pri">Open app ↗</a>
                    )}
                    {s.option === "source" && a?.source_path && (
                      <a href={`/account/download/${s.id}`} className="btn btn-pri">Download source</a>
                    )}
                    {s.option === "setup" && !a?.live_url && <span className="text-sm text-muted">We&apos;ll email you when setup is done.</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AccountPage(props: PageProps<"/account">) {
  return (
    <Suspense fallback={<div className="wrap pt-32 text-muted">Loading your account…</div>}>
      <AccountInner searchParams={props.searchParams} />
    </Suspense>
  );
}
