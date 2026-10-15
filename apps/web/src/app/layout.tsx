import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FounderVoice — Fundraising readiness infrastructure",
  description:
    "Turn rambling founder thinking into an investor-ready truth with a verified Claim Graph, deck, model, and FAQ.",
  openGraph: {
    title: "FounderVoice",
    description:
      "Turn rambling founder thinking into an investor-ready truth with a verified Claim Graph, deck, model, and FAQ.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
