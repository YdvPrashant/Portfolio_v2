"use client";

import type { ImageLoaderProps } from "next/image";

/* Unsplash serves every size from its own imgix CDN, so their images skip the
   Next optimiser and ask the CDN for the width the browser picked. */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 72));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
