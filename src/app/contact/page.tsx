import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { CopyEmail } from "@/components/CopyEmail";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Tell ${site.name} what you need: a website, an app, automation, SEO, marketing, design or video.`,
};

export default function ContactPage() {
  return (
    <div className="wrap page-head section" style={{ paddingBottom: 0 }}>
      <div className="contact">
        <div>
          <p className="mono eyebrow">Contact</p>
          <h1 style={{ fontSize: "clamp(44px,6.4vw,92px)" }}>Tell us what to build.</h1>
          <p className="lead">Describe the project or service you need. We reply by email with how we&apos;d do it, the price and a delivery date.</p>
          <CopyEmail email={site.email} />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
