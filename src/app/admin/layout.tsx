import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SetupNotice } from "@/components/ui";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/orders", label: "Subscriptions" },
  { href: "/admin/requests", label: "Custom requests" },
];

async function Guard({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) return <SetupNotice page />;
  const { user, isAdmin } = await getAdmin();
  if (!user || !isAdmin) {
    return (
      <div className="wrap pb-24 pt-32">
        <h1 className="stretch text-4xl font-extrabold">No access</h1>
        <p className="mt-3 text-muted">This area is for the site owner. <Link href="/" className="text-accent underline">Go home</Link></p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="wrap pb-24 pt-28">
      <nav aria-label="Admin" className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-accent hover:text-fg">
            {t.label}
          </Link>
        ))}
      </nav>
      <Suspense fallback={<p className="text-muted">Checking access…</p>}>
        <Guard>{children}</Guard>
      </Suspense>
    </div>
  );
}
