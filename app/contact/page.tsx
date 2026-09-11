import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import ContactSurface from "@/components/contact/ContactSurface";
import { person } from "@/lib/content";

/* Contact. Hot magenta, the last colour the site introduces, sitting next to
   violet on the wheel so it still belongs to the family. */

export const metadata: Metadata = {
  title: "Contact / " + person.full,
  description: "Write to " + person.full + " at " + person.email + ".",
};

const RESUME = "prashant-yadav-resume.pdf";

/* The link only exists if the file does. Compile resume/*.tex and drop the PDF
   in public/ and it appears; until then Contact simply does not offer it,
   rather than pointing at a 404. */
function resumeHref(): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", RESUME)) ? "/" + RESUME : null;
}

export default function ContactPage() {
  return (
    <main className="relative">
      <h1 className="sr-only">Contact</h1>
      <div className="absolute inset-x-0 top-0 z-20">
        <SiteNav tone="#0b0b0b" />
      </div>
      <ContactSurface resume={resumeHref()} />
    </main>
  );
}
