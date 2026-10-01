"use client";

import type { ImageLoaderProps } from "next/image";
import { photoUrl } from "./unsplash";

/* Unsplash serves every size from its own imgix CDN, so their images skip the
   Next optimiser and ask the CDN for the width the browser picked. */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  return photoUrl(src, width, quality ?? 72);
}
