import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteFX } from "@/components/RouteFX";

/** NOVARYX chrome: menu, footer and page-change effect. Demo sites under /vellara have their own. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <RouteFX />
    </>
  );
}
