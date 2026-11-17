import type { Metadata } from "next";
import { Bodoni_Moda, Schibsted_Grotesk } from "next/font/google";
import { VNav } from "./_components/VNav";
import { SmoothScroll } from "./_components/SmoothScroll";
import Link from "next/link";
import "./vellara.css";

const display = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--vl-display", axes: ["opsz"] });
const body = Schibsted_Grotesk({ subsets: ["latin"], variable: "--vl-body" });

export const metadata: Metadata = {
  title: { absolute: "VELLARA | Coloured stones from northern Pakistan", template: "%s | VELLARA" },
  description: "Emerald, ruby, spinel, peridot, topaz, aquamarine and tourmaline from the valleys of northern Pakistan. A demo site by NOVARYX.",
  robots: { index: false },
};

export default function VellaraLayout({ children }: LayoutProps<"/vellara">) {
  return (
    <div className={`vl ${display.variable} ${body.variable}`}>
      <SmoothScroll />
      <a className="vl-skip" href="#vl-main">Skip to content</a>
      <VNav />
      <main id="vl-main" tabIndex={-1}>{children}</main>
      <footer className="vl-foot">
        <div className="vl-wrap vl-foot-in">
          <div>
            <p className="vl-logo">VELLARA</p>
            <p className="vl-muted">Coloured stones from the valleys of northern Pakistan, cut for jewellers and collectors.</p>
          </div>
          <nav aria-label="VELLARA footer">
            <Link href="/vellara/collection">Stones</Link>
            <Link href="/vellara/atelier">Atelier</Link>
            <Link href="/vellara/contact">Enquire</Link>
          </nav>
          <p className="vl-demo">
            VELLARA is a demo brand designed and built by <Link href="/">NOVARYX</Link>. The valleys are real gem sources;
            the stones, weights and images are illustrative and nothing here is for sale.
          </p>
        </div>
      </footer>
    </div>
  );
}
