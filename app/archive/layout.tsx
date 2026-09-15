import { Anton, Bricolage_Grotesque, Syne } from "next/font/google";

/* Faces used only by the archived rounds. Loaded here so the live site does not
   preload three fonts it never shows. */

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
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

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${bricolage.variable} ${anton.variable} ${syne.variable}`}>{children}</div>;
}
