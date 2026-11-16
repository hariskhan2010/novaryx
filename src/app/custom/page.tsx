import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { CustomRequestForm } from "@/components/StoreForms";

export const metadata: Metadata = {
  title: "Custom project",
  description: "Tell us what you want built: websites, web apps, mobile apps, AI tools and design.",
};

export default function CustomPage() {
  return (
    <div className="pb-24">
      <PageHead eyebrow="Custom project" title="Tell us what to build." intro="Describe your idea and we'll reply by email with how we'd build it and what it costs." />
      <div className="wrap mt-12">
        <CustomRequestForm />
      </div>
    </div>
  );
}
