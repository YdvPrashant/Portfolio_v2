import type { Metadata } from "next";
import { Archivo, Bricolage_Grotesque, Instrument_Serif, Geist_Mono, Anton, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
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

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const syne = Syne({
  variable: "--font-syne",
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
      className={`${archivo.variable} ${bricolage.variable} ${instrument.variable} ${geistMono.variable} ${anton.variable} ${syne.variable}`}
    >
      <body>
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
