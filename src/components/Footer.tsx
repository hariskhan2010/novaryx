import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {site.year} {site.name}. 3D visuals are renders.</p>
        <div className="flex flex-wrap gap-6">
          <Link href="/projects" className="hover:text-fg">Projects</Link>
          <Link href="/custom" className="hover:text-fg">Custom project</Link>
          <Link href="/about" className="hover:text-fg">About</Link>
          <span className="select-all">{site.email}</span>
        </div>
      </div>
    </footer>
  );
}
