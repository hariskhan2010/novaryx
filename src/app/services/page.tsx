import type { Metadata } from "next";
import Link from "next/link";
import { ServiceTabs } from "@/components/ServiceTabs";

export const metadata: Metadata = {
  title: "Services",
  description: "Web and app development, automation, SEO, marketing, social media, content writing, graphic and logo design, and video editing.",
};

export default function ServicesPage() {
  return (
    <>
      <div className="wrap page-head">
        <p className="mono eyebrow">Services</p>
        <h1>Build it, grow it, make it look right.</h1>
        <p className="lead">Ten services, each led by the partner who does that work every day.</p>
        <ServiceTabs />
      </div>
      <section className="wrap" style={{ paddingBottom: 40 }} aria-labelledby="band-h">
        <div className="band">
          <p className="mono">Not sure what you need?</p>
          <h2 id="band-h">Describe the problem. We&apos;ll suggest the fix.</h2>
          <Link className="btn" href="/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
