import type { StaticImageData } from "next/image";
import haris from "@/assets/team/haris.png";
import anees from "@/assets/team/anees.jpg";
import jansher from "@/assets/team/jansher.png";

// Everything on the About page lives here. Edit text in this file.

export const SERVICES = [
  "Web Development",
  "App Development",
  "SEO",
  "Graphic Design",
  "Logo Design",
  "Social Media",
  "Video Editing",
  "Content Writing",
  "Automation",
  "Marketing",
];

export const MISSION = {
  lead: "We started NOVARYX to sell something rare online: trust.",
  body: "Every client should get exactly what they asked for: the design they pictured, built the way they wanted, delivered when we said it would be. Our goal is simple. No client should ever walk away disappointed.",
};

export const WHAT_WE_DO = [
  { t: "Ready-made projects", d: "Apps, websites and tools we've already built, available on a monthly subscription. Hosted for you, set up for you, or as source code." },
  { t: "Custom projects", d: "Need something that doesn't exist yet? Tell us what you want and we build it to order, whatever it is." },
  { t: "Services", d: "SEO, marketing, design, video and more, so the thing we build for you also gets seen." },
];

export const WHY_US = [
  { t: "Reliable", d: "We do what we say we'll do. You always know who is working on your project and where it stands." },
  { t: "Clear payments", d: "Payment terms are agreed up front, in writing. No surprise invoices halfway through." },
  { t: "On-time delivery", d: "We give you a delivery date and we hit it." },
];

export type Member = {
  name: string;
  role: string;
  title: string;
  photo: StaticImageData;
  stat: { value: string; label: string };
  bio: string;
  skills: string[];
};

export const TEAM: Member[] = [
  {
    name: "Muhammad Haris",
    role: "Founder & Team Leader",
    title: "AI-Native Engineer",
    photo: haris,
    stat: { value: "AI", label: "native engineer" },
    bio: "Haris founded NOVARYX and leads every project from the first message to the final delivery. He builds with Claude at the core of his workflow, which means faster delivery, cleaner code and more done for less. He engineers the ready-made projects on NOVARYX and the custom builds clients order.",
    skills: ["Web Development", "App Development", "AI & Automation", "Team Leadership"],
  },
  {
    name: "Anees Khan",
    role: "Co-Founder",
    title: "Marketing & SEO Expert",
    photo: anees,
    stat: { value: "3", label: "years in SEO & marketing" },
    bio: "Anees makes sure the work gets found. He handles everything from Google rankings and site audits to social media, ads and content strategy, so a launch turns into real visitors and real customers.",
    skills: ["SEO", "Digital Marketing", "Social Media", "Content Strategy"],
  },
  {
    name: "Jansher Khan",
    role: "Co-Founder",
    title: "Video Editor & Graphic Designer",
    photo: jansher,
    stat: { value: "4", label: "years in video & design" },
    bio: "Jansher shapes how NOVARYX and its clients look and sound. Reels, YouTube edits and video ads on one side; logos, posters and brand graphics on the other. If people see it, he has made it sharp.",
    skills: ["Video Editing", "Graphic Design", "Logo Design", "Social Content"],
  },
];
