import { ViewTransition } from "react";

/* Every page slides left when you go deeper and right when you come back,
   while the header stays put. Links carry the direction as a transition type;
   the browser's own back button carries none, so it simply swaps. */

const directions = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={directions} exit={directions} default="none">
      {children}
    </ViewTransition>
  );
}
