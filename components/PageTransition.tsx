import { ViewTransition } from "react";

/* Wraps a page so route changes animate. Links tagged nav-forward or nav-back
   slide a short way in the direction of travel; anything untagged, like the
   browser's own back button, fades. The classes are styled in globals.css.

   In each page rather than the layout, because a layout persists across
   navigation and so never enters or exits. Where the browser has no view
   transitions, pages simply change as they always did. */

const CLASSES = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" };

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={CLASSES} exit={CLASSES} default="none">
      {children}
    </ViewTransition>
  );
}
