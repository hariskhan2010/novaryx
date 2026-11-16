import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { ThemeSwitch } from "./ThemeSwitch";
import { MobileMenu } from "./MobileMenu";
import { UserNav } from "./UserNav";

export const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/custom", label: "Custom project" },
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About" },
];

export function Logo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px]">
      <path d="M4 7l8-4 8 4-8 4z" style={{ fill: "var(--accent)" }} />
      <path d="M4 12l8 4 8-4" style={{ fill: "none", stroke: "var(--fg)", strokeWidth: 1.8 }} />
      <path d="M4 16.5l8 4 8-4" style={{ fill: "none", stroke: "var(--hot)", strokeWidth: 1.8 }} />
    </svg>
  );
}

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-[max(16px,env(safe-area-inset-left,0px))] pt-3">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 rounded-full border border-line bg-bg/80 py-2 pl-4 pr-2 backdrop-blur-md">
        <Link href="/" className="stretch flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
          <Logo />
          {site.name}
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-sm text-muted hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Suspense fallback={<span className="h-9 w-20" />}>
            <UserNav />
          </Suspense>
          <ThemeSwitch />
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
