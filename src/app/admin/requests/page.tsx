import { Suspense } from "react";
import { updateRequest } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

async function Requests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_requests")
    .select("id,name,email,project_type,budget,details,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = data ?? [];
  if (!rows.length) return <div className="card p-8 text-center text-muted">No custom requests yet.</div>;
  const badge: Record<string, string> = { new: "badge-pending", contacted: "badge-active", closed: "badge-cancelled" };

  return (
    <ul className="grid gap-4">
      {rows.map((r) => (
        <li key={r.id} className="card grid gap-4 p-6 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">{r.name}</h2>
              <span className={`badge ${badge[r.status]}`}>{r.status}</span>
            </div>
            <p className="mt-1 select-all text-muted">{r.email}</p>
            <p className="mt-1 text-muted">{[r.project_type, r.budget && `Budget: ${r.budget}`, new Date(r.created_at).toLocaleDateString("en-GB")].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 whitespace-pre-line">{r.details}</p>
          </div>
          <form action={updateRequest} className="grid content-start gap-2">
            <input type="hidden" name="id" value={r.id} />
            <label className="text-sm font-semibold" htmlFor={`r-${r.id}`}>Status</label>
            <select id={`r-${r.id}`} name="status" defaultValue={r.status} className="input">
              <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
            </select>
            <button className="btn btn-pri btn-sm justify-self-start">Save</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function AdminRequests() {
  return (
    <>
      <h1 className="stretch mb-8 text-4xl font-extrabold sm:text-5xl">Custom requests</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Requests />
      </Suspense>
    </>
  );
}
