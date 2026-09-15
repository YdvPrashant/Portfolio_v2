import type { Metadata } from "next";
import { Archivo, Instrument_Serif, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteNav from "@/components/SiteNav";
import { DEFAULT_PALETTE, PALETTE_SCRIPT } from "@/lib/palette";
import "./globals.css";

/* Anton, Syne and Bricolage Grotesque are only used by the archived landing
   rounds, so they load in app/archive/layout.tsx rather than being preloaded on
   every page of the live site. */

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prashant Yadav",
  description: "Software engineer working across full-stack web and applied ML.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-palette={DEFAULT_PALETTE}
      className={`${archivo.variable} ${instrument.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the visitor's stored colour theme before first paint, so a
            returning visitor never sees the default flash first. */}
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
      </head>
      <body>
        <SiteNav />
        {children}
        {/* Vercel's own analytics. Cookieless and no consent banner to add,
            which is the point: a banner would be the first thing anyone sees
            on a portfolio. Analytics counts visits, Speed Insights reports the
            Core Web Vitals real visitors actually get. Both are inert until
            switched on for the project in the dashboard. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
