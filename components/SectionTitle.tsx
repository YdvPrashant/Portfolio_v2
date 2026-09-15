import { ViewTransition } from "react";

/* A section's name, shared between its row in the Home index and the heading on
   its own page. Both carry the same view transition name, so following the link
   carries the one word from where it was to where it lands.

   The child must be a single element. */
export default function SectionTitle({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={"title-" + slug} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
