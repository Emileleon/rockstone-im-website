import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/components/ThemeToggle";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rockstone-im.com"),
  title: {
    default: "Rockstone IM — Multi-Family Office Immobilier",
    template: "%s · Rockstone IM",
  },
  description:
    "Multi-Family Office immobilier indépendant à Paris depuis 2015. Investissement, Conseil et Asset Management au service des investisseurs privés. Transparence, rigueur, confiance durable.",
  keywords: [
    "family office immobilier",
    "investissement immobilier",
    "asset management",
    "conseil patrimonial",
    "Rockstone IM",
    "Paris",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Rockstone IM",
    title: "Rockstone IM — Multi-Family Office Immobilier",
    description:
      "Investissement, Conseil et Asset Management immobilier pour investisseurs privés. Paris, depuis 2015.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${bebas.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-canvas text-ink">{children}</body>
    </html>
  );
}
