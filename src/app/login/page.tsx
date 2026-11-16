import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/StoreForms";

export const metadata: Metadata = { title: "Sign in" };

async function Inner({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/account";
  return (
    <>
      <AuthForm mode="login" next={next} />
      <p className="mt-6 text-muted">
        New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent underline">Create an account</Link>
      </p>
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="wrap grid min-h-[80svh] place-items-center pb-16 pt-32">
      <div className="card w-full max-w-md p-8">
        <h1 className="stretch text-4xl font-extrabold">Sign in</h1>
        <p className="mb-6 mt-2 text-muted">See your subscriptions and downloads.</p>
        <Suspense>
          <Inner searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
