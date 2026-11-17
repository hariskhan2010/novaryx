export const CATEGORIES = ["Web app", "Website", "Mobile app", "AI tool"] as const;

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  cover_url: string | null;
  client: string;
  client_need: string;
  delivered: string;
  year: number | null;
  tech: string[];
  demo_url: string | null;
  gallery: string[];
  created_at: string;
};

export const PROJECT_COLS =
  "id,slug,title,category,summary,description,cover_url,client,client_need,delivered,year,tech,demo_url,gallery,created_at";
