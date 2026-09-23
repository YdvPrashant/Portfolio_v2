import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Mona_Sans, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { InlineScript } from "@/components/site/InlineScript";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { person } from "@/lib/content";
import { introScript } from "@/lib/intro-script";
import { description, siteUrl } from "@/lib/site";

// Mona Sans with its width axis: the hero and the numerals use the extremes.
const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-news",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jet",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${person.name}, software engineer`,
    template: `%s · ${person.name}`,
  },
  description,
  applicationName: person.name,
  authors: [{ name: person.name }],
  openGraph: {
    type: "website",
    siteName: person.name,
    title: `${person.name}, software engineer`,
    description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f0efeb",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${mona.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body>
        <InlineScript html={introScript} />
        <Header />
        <SmoothScroll />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
