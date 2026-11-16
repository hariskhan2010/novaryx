export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  tech: string[];
  cover_url: string | null;
  demo_url: string | null;
  monthly_price: number | null;
  currency: string;
  offers_hosted: boolean;
  offers_setup: boolean;
  offers_source: boolean;
  published: boolean;
  created_at: string;
};

export type SubOption = "hosted" | "setup" | "source";
export type SubStatus = "pending" | "active" | "cancelled";

export const OPTION_LABEL: Record<SubOption, string> = {
  hosted: "Live hosted app",
  setup: "Setup & customization",
  source: "Source code",
};

export const OPTION_HELP: Record<SubOption, string> = {
  hosted: "Use the project online. We host and maintain it for you.",
  setup: "We install it on your server or domain and customize it for you.",
  source: "Download the full source code and run it yourself.",
};

export const CATEGORIES = ["Web app", "Website", "Mobile app", "Dashboard", "E-commerce", "AI tool", "Design kit", "Other"];

export function formatPrice(p: Pick<Project, "monthly_price" | "currency">) {
  if (p.monthly_price == null) return "Price on request";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency, maximumFractionDigits: 2 }).format(p.monthly_price) + "/mo";
  } catch {
    return `${p.monthly_price} ${p.currency}/mo`;
  }
}

export function offeredOptions(p: Pick<Project, "offers_hosted" | "offers_setup" | "offers_source">): SubOption[] {
  return (["hosted", "setup", "source"] as const).filter((o) => p[`offers_${o}`]);
}
