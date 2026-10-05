import { DashboardPage } from "@/components/liquidity/dashboard";

export const metadata = {
  title: "Live Market Structure Dashboard — Liquidity Bias",
  description:
    "Monitor live crypto futures structure, liquidity, fair value gaps, order blocks, and multi-timeframe bias.",
  openGraph: {
    title: "Live Market Structure Dashboard — Liquidity Bias",
    description:
      "Decision-focused crypto futures structure and liquidity analysis.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <DashboardPage />;
}
