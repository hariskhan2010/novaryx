import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiryForm } from "../_components/EnquiryForm";
import { STONES } from "../stones";

export const metadata: Metadata = { title: "Enquire", description: "Ask VELLARA about a stone, a colour or a custom cut." };

export default function ContactPage() {
  const options = STONES.map((s) => ({ slug: s.slug, name: s.name }));
  return (
    <div className="vl-wrap vl-page vl-contact">
      <div>
        <h1 className="vl-h1">Ask about a stone</h1>
        <p className="vl-lead">Tell us which stone you&apos;re interested in, or the colour and size you&apos;re looking for. We reply within two working days with photos in daylight, the lab report and a price.</p>
      </div>
      <Suspense fallback={null}>
        <EnquiryForm stones={options} />
      </Suspense>
    </div>
  );
}
