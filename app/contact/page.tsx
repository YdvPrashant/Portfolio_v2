import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ContactSurface from "@/components/contact/ContactSurface";
import PageTransition from "@/components/PageTransition";
import { person } from "@/lib/content";

/* Contact. The last page in the sequence, so its way onward leads back to the
   start. data-page lets a theme give it its own ground: in Vivid, the original
   magenta. */

export const metadata: Metadata = {
  title: "Contact / " + person.full,
  description: "Write to " + person.full + " at " + person.email + ".",
};

const RESUME = "prashant-yadav-resume.pdf";

/* The link only exists if the file does. Drop the PDF in public/ and it appears;
   until then Contact simply does not offer it, rather than pointing at a 404. */
function resumeHref(): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", RESUME)) ? "/" + RESUME : null;
}

export default function ContactPage() {
  return (
    <PageTransition>
      <main data-page="contact" className="bg-ground text-ink">
        <ContactSurface resume={resumeHref()} />
      </main>
    </PageTransition>
  );
}
