import { LandingPage } from "@/components/liquidity/landing";

export const metadata = {
  title: "Liquidity Bias — Crypto Market Structure Intelligence",
  description:
    "See crypto futures market structure, liquidity, sweeps, fair value gaps, and multi-timeframe bias before you decide.",
  openGraph: {
    title: "Liquidity Bias — Crypto Market Structure Intelligence",
    description: "See the market structure before you make a decision.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <LandingPage />;
}
