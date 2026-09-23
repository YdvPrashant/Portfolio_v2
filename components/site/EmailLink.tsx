"use client";

import { useRef } from "react";
import { FitLines } from "@/components/type/FitLines";

/* The address, as large as the page allows, split at the @. Pointing at it
   pulls cyan and magenta out from under the letters, the same misregistration
   as the name at the top of the home page. */

export function EmailLink({ email }: { email: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [user, domain] = email.split("@");

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    el.style.setProperty("--sx", x.toFixed(3));
    el.style.setProperty("--sy", y.toFixed(3));
  };
  const leave = () => {
    ref.current?.style.setProperty("--sx", "0");
    ref.current?.style.setProperty("--sy", "0");
  };

  return (
    <a
      ref={ref}
      href={`mailto:${email}`}
      onPointerMove={move}
      onPointerLeave={leave}
      className="email-link block font-[640] leading-[0.92] tracking-[-0.045em]"
      aria-label={`Email ${email}`}
    >
      <FitLines lines={[user, `@${domain}`]} estimate="10.4vw" />
    </a>
  );
}
