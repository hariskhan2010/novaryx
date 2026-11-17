// VELLARA is a demo brand built by NOVARYX. The valleys are real gem localities of northern Pakistan;
// the individual stones, weights and descriptions are illustrative.

export type Stone = {
  slug: string;
  name: string;
  kind: "Emerald" | "Ruby" | "Topaz" | "Peridot" | "Aquamarine" | "Spinel" | "Tourmaline";
  carat: number;
  cut: string;
  size: string; // millimetres
  valley: string;
  region: string;
  altitude: number; // metres, approximate altitude of the deposit
  treatment: string;
  tint: string; // the stone's own colour, used to tint its page
  image: string;
  line: string; // one-sentence description
  story: string[];
};

export const STONES: Stone[] = [
  {
    slug: "swat-emerald", name: "Swat emerald", kind: "Emerald", carat: 2.14, cut: "Oval", size: "9.1 × 7.0 × 4.6",
    valley: "Mingora", region: "Swat, Khyber Pakhtunkhwa", altitude: 980, treatment: "Minor oil", tint: "#2fae7f",
    image: "/vellara/emerald.webp",
    line: "A deep, slightly bluish green from the old Mingora workings.",
    story: [
      "Swat emeralds grow in talc-carbonate rock above the river at Mingora. They tend to be small and richly saturated, with a cooler green than Colombian stones.",
      "This oval was cut shallow on purpose, to keep weight and let the colour show through the table rather than darken in the pavilion.",
    ],
  },
  {
    slug: "hunza-ruby", name: "Hunza ruby", kind: "Ruby", carat: 1.62, cut: "Cushion", size: "7.2 × 6.6 × 4.1",
    valley: "Hunza", region: "Gilgit-Baltistan", altitude: 2900, treatment: "None", tint: "#d8344f",
    image: "/vellara/ruby.webp",
    line: "A pinkish crimson ruby that grew inside white marble.",
    story: [
      "Hunza rubies form in marble bands high on the valley walls. Miners follow the white rock up the slopes, often working above 2,800 metres.",
      "Marble-hosted rubies glow under daylight because they carry little iron. This cushion keeps that glow across the whole face.",
    ],
  },
  {
    slug: "katlang-topaz", name: "Katlang pink topaz", kind: "Topaz", carat: 3.05, cut: "Pear", size: "11.4 × 7.8 × 5.2",
    valley: "Katlang", region: "Mardan, Khyber Pakhtunkhwa", altitude: 450, treatment: "None", tint: "#f0a7a0",
    image: "/vellara/pink-topaz.webp",
    line: "Natural pink topaz from Ghundao hill, one of very few sources in the world.",
    story: [
      "Most pink topaz on the market is heated. The Katlang deposit near Mardan is one of the few places it grows pink in the ground.",
      "The colour is soft, between peach and rose, and the pear shape gives it a long, even sparkle.",
    ],
  },
  {
    slug: "kohistan-peridot", name: "Kohistan peridot", kind: "Peridot", carat: 6.4, cut: "Emerald cut", size: "12.0 × 9.3 × 6.1",
    valley: "Sapat", region: "Kohistan, Khyber Pakhtunkhwa", altitude: 4500, treatment: "None", tint: "#9bc23c",
    image: "/vellara/peridot.webp",
    line: "Clean lime-green peridot from glacier-fed pockets above 4,000 metres.",
    story: [
      "The Sapat deposit sits so high that it can only be worked in late summer. Its crystals are known for size and clarity.",
      "A step cut suits peridot: long, calm facets that show its strong double refraction as a soft blur on the back facets.",
    ],
  },
  {
    slug: "shigar-aquamarine", name: "Shigar aquamarine", kind: "Aquamarine", carat: 8.12, cut: "Oval", size: "15.0 × 11.2 × 7.4",
    valley: "Shigar", region: "Baltistan, Gilgit-Baltistan", altitude: 3200, treatment: "None", tint: "#7cc4dc",
    image: "/vellara/aquamarine.webp",
    line: "Pale sea-blue aquamarine from the pegmatites of the Shigar valley.",
    story: [
      "Baltistan's pegmatites produce some of the cleanest aquamarine crystals anywhere, often found as long hexagonal prisms.",
      "We left this stone unheated so it keeps its slightly green, natural blue.",
    ],
  },
  {
    slug: "hunza-spinel", name: "Hunza spinel", kind: "Spinel", carat: 1.88, cut: "Round brilliant", size: "7.6 × 7.6 × 4.9",
    valley: "Hunza", region: "Gilgit-Baltistan", altitude: 2800, treatment: "None", tint: "#e0457b",
    image: "/vellara/spinel.webp",
    line: "A hot pink-red spinel from the same marble as Hunza ruby.",
    story: [
      "Spinel grows beside ruby in Hunza's marble and was long mistaken for it. Today collectors prize it in its own right.",
      "A round brilliant cut gives this stone the most fire of anything in the collection.",
    ],
  },
  {
    slug: "stak-tourmaline", name: "Stak Nala tourmaline", kind: "Tourmaline", carat: 4.3, cut: "Long octagon", size: "14.2 × 6.8 × 5.0",
    valley: "Stak Nala", region: "Skardu, Gilgit-Baltistan", altitude: 3600, treatment: "None", tint: "#3f9a63",
    image: "/vellara/tourmaline.webp",
    line: "Forest-green tourmaline, cut long to follow the crystal.",
    story: [
      "Tourmaline crystals from Stak Nala grow long and thin, so the best yield comes from following their length.",
      "The ends of this stone are a shade deeper than the middle, a natural colour zone we chose to keep.",
    ],
  },
];

export const KINDS = [...new Set(STONES.map((s) => s.kind))];
export const stoneBySlug = (slug: string) => STONES.find((s) => s.slug === slug);
