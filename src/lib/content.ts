import type { StaticImageData } from "next/image";
import haris from "@/assets/team/haris.png";
import anees from "@/assets/team/anees.jpg";
import jansher from "@/assets/team/jansher.png";

// All site copy that repeats across pages lives here.

export const WHY_US = [
  { t: "Reliable", d: "We do what we say. You always know who is on your project and where it stands." },
  { t: "Clear payments", d: "Terms are agreed in writing before work starts. No surprise invoices halfway through." },
  { t: "On-time delivery", d: "You get a delivery date at the start, and we hit it." },
];

export const MISSION = {
  lead: "We started NOVARYX to sell something rare online: trust.",
  body: "Every client should get exactly what they asked for: the design they pictured, built the way they wanted, delivered when we said. No client should walk away disappointed.",
};

export type Member = {
  id: "haris" | "anees" | "jansher";
  name: string;
  role: string;
  title: string;
  photo: StaticImageData;
  bio: string;
  skills: string[];
  stat: { value: string; label: string };
};

export const TEAM: Member[] = [
  {
    id: "haris", name: "Muhammad Haris", role: "Founder & Team Leader", title: "AI-Native Engineer", photo: haris,
    bio: "Haris founded NOVARYX and leads every project from the first message to the final delivery. He builds with Claude at the core of his workflow, which means faster delivery and cleaner code.",
    skills: ["Web Development", "App Development", "AI & Automation", "Team Leadership"],
    stat: { value: "AI", label: "native engineer" },
  },
  {
    id: "anees", name: "Anees Khan", role: "Co-Founder", title: "Marketing & SEO Expert", photo: anees,
    bio: "Anees makes sure the work gets found: Google rankings, site audits, social media, ads and content strategy, so a launch turns into real customers.",
    skills: ["SEO", "Digital Marketing", "Social Media", "Content Strategy"],
    stat: { value: "3", label: "years in SEO & marketing" },
  },
  {
    id: "jansher", name: "Jansher Khan", role: "Co-Founder", title: "Video Editor & Graphic Designer", photo: jansher,
    bio: "Jansher shapes how NOVARYX and its clients look and sound: reels, YouTube edits and video ads, plus logos, posters and brand graphics.",
    skills: ["Video Editing", "Graphic Design", "Logo Design", "Social Content"],
    stat: { value: "4", label: "years in video & design" },
  },
];

export const SERVICE_GROUPS = [
  {
    id: "build", label: "Build", lead: "haris" as const, leadNote: "Led by Muhammad Haris, AI-native engineer",
    items: [
      { t: "Web Development", d: "Websites and web apps, from first screen to launch." },
      { t: "App Development", d: "Mobile apps for Android and iOS." },
      { t: "Automation", d: "Workflows and AI helpers that save your team hours." },
    ],
  },
  {
    id: "grow", label: "Grow", lead: "anees" as const, leadNote: "Led by Anees Khan, 3 years in SEO and marketing",
    items: [
      { t: "SEO", d: "Rankings, site audits and pages people actually find." },
      { t: "Marketing", d: "Campaigns that turn a launch into customers." },
      { t: "Social Media", d: "Planning, posting and growing your accounts." },
      { t: "Content Writing", d: "Site copy, blogs and posts in your voice." },
    ],
  },
  {
    id: "create", label: "Create", lead: "jansher" as const, leadNote: "Led by Jansher Khan, 4 years in video and design",
    items: [
      { t: "Graphic Design", d: "Posters, social graphics and brand visuals." },
      { t: "Logo Design", d: "A mark that fits your business and works everywhere." },
      { t: "Video Editing", d: "Reels, YouTube edits and video ads." },
    ],
  },
];

export const NEEDS = ["A ready-made project", "A custom project", "SEO or marketing", "Design or video", "Something else"];
