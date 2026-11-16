import { Suspense } from "react";
import { updateSubscription } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { OPTION_LABEL, type SubOption } from "@/lib/types";

type Row = {
  id: string; option: SubOption; status: string; message: string; admin_note: string; created_at: string;
  contact_email: string; contact_phone: string; projects: { title: string } | null;
};

async function Orders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id,option,status,message,admin_note,created_at,contact_email,contact_phone,projects(title)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as Row[];
  if (!rows.length) return <div className="card p-8 text-center text-muted">No subscription requests yet.</div>;

  return (
    <ul className="grid gap-4">
      {rows.map((r) => (
        <li key={r.id} className="card grid gap-4 p-6 lg:grid-cols-[1fr_minmax(0,360px)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">{r.projects?.title ?? "Removed project"}</h2>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-muted">{OPTION_LABEL[r.option]} · {new Date(r.created_at).toLocaleString("en-GB")}</p>
            <p className="mt-3 select-all">{r.contact_email}{r.contact_phone && <> · {r.contact_phone}</>}</p>
            {r.message && <p className="mt-2 whitespace-pre-line text-muted">&ldquo;{r.message}&rdquo;</p>}
          </div>
          <form action={updateSubscription} className="grid gap-2">
            <input type="hidden" name="id" value={r.id} />
            <label className="text-sm font-semibold" htmlFor={`s-${r.id}`}>Status</label>
            <select id={`s-${r.id}`} name="status" defaultValue={r.status} className="input">
              <option value="pending">Pending (waiting for payment)</option>
              <option value="active">Active (paid, give access)</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <label className="text-sm font-semibold" htmlFor={`n-${r.id}`}>Note to customer</label>
            <input id={`n-${r.id}`} name="admin_note" defaultValue={r.admin_note} className="input" placeholder="e.g. Paid until 15 Dec" />
            <button className="btn btn-pri btn-sm justify-self-start">Save</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function AdminOrders() {
  return (
    <>
      <h1 className="stretch mb-2 text-4xl font-extrabold sm:text-5xl">Subscriptions</h1>
      <p className="mb-8 text-muted">Contact the customer, confirm payment, then set the status to Active to give them access.</p>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Orders />
      </Suspense>
    </>
  );
}
