import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/StoreForms";

export const metadata: Metadata = { title: "Create account" };

async function Inner({ searchParams }: { searchParams: PageProps<"/signup">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/account";
  return (
    <>
      <AuthForm mode="signup" next={next} />
      <p className="mt-6 text-muted">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent underline">Sign in</Link>
      </p>
    </>
  );
}

export default function SignupPage(props: PageProps<"/signup">) {
  return (
    <div className="wrap grid min-h-[80svh] place-items-center pb-16 pt-32">
      <div className="card w-full max-w-md p-8">
        <h1 className="stretch text-4xl font-extrabold">Create account</h1>
        <p className="mb-6 mt-2 text-muted">Subscribe to projects and track your requests.</p>
        <Suspense>
          <Inner searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
