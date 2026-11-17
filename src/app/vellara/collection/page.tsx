import type { Metadata } from "next";
import { StoneGrid } from "../_components/StoneGrid";
import { KINDS, STONES } from "../stones";

export const metadata: Metadata = { title: "Stones", description: "Every stone in the VELLARA collection, with its weight, cut and the valley it came from." };

export default function CollectionPage() {
  return (
    <div className="vl-wrap vl-page">
      <h1 className="vl-h1">The stones</h1>
      <p className="vl-lead">{STONES.length} stones this season, each with the valley it came from and the altitude of the deposit. Prices are given on request.</p>
      <StoneGrid stones={STONES} kinds={KINDS} />
    </div>
  );
}
