import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteFX } from "@/components/RouteFX";
import { site } from "@/lib/site";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { title: `${site.name} | ${site.tagline}`, description: site.description, type: "website" },
};

// Applies the saved theme before paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem('nvx-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <symbol id="mark" viewBox="0 0 24 24">
            <path d="M4 7l8-4 8 4-8 4z" fill="var(--cobalt)" />
            <path d="M4 12l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 16.5l8 4 8-4" fill="none" stroke="var(--amber)" strokeWidth="1.8" />
          </symbol>
        </svg>
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <RouteFX />
      </body>
    </html>
  );
}
