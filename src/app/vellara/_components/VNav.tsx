"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/vellara/collection", label: "Stones" },
  { href: "/vellara/atelier", label: "Atelier" },
  { href: "/vellara/contact", label: "Enquire" },
];

export function VNav() {
  const path = usePathname();
  return (
    <header className="vl-nav">
      <div className="vl-wrap vl-nav-in">
        <Link href="/vellara" className="vl-logo" aria-label="VELLARA home">VELLARA</Link>
        <nav aria-label="VELLARA">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
