/* Photographs come live from Prashant's Unsplash profile, so uploading there is
   all it takes to update the site.

   Server side only: the access key is read from UNSPLASH_ACCESS_KEY and never
   prefixed NEXT_PUBLIC_. Listing a user's photos needs only the access key.
   Unsplash limits demo apps to fifty requests an hour, so the list and the
   profile's reach revalidate hourly, and a photograph's camera details daily. */

import { lensPhoto } from "./content";

export const UNSPLASH_USER = "pr7nt";
export const UNSPLASH_PROFILE = `https://unsplash.com/@${UNSPLASH_USER}`;

export type Photo = {
  id: string;
  width: number;
  height: number;
  /** Unsplash's dominant colour, used as the placeholder while loading. */
  color: string;
  alt: string;
  /** Base URL on Unsplash's image CDN; sizes are added by the loader. */
  src: string;
  link: string;
};

/** How often the whole profile has been seen and downloaded. */
export type Reach = { views: number; downloads: number };

/** One photograph's camera and settings, and how often it has been seen. */
export type PhotoDetails = {
  camera: string | null;
  settings: string[];
  views: number | null;
};

/** A photograph at a given width from Unsplash's own CDN, in the best format
    the browser accepts. */
export function photoUrl(src: string, width: number, quality = 72): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}

/** The photograph set into "I take ... photographs.": the chosen one, or
    failing that the first landscape frame. */
export function lensPhotoOf(photos: Photo[]): Photo | undefined {
  return photos.find((p) => p.id === lensPhoto) ?? photos.find((p) => p.width > p.height) ?? photos[0];
}

/** "OnePlus 8 · f/1.8 · 1/1100 s · ISO 100 · 10,914 views" */
export function describePhoto(details: PhotoDetails): string {
  const parts = [details.camera, ...details.settings];
  if (details.views !== null) parts.push(`${details.views.toLocaleString("en-US")} views`);
  return parts.filter(Boolean).join(" · ");
}

// Phones report a model code rather than the name on the box.
const CAMERAS: Record<string, string> = { "OnePlus IN2011": "OnePlus 8" };

async function api<T>(path: string, revalidate: number): Promise<T | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.unsplash.com${path}`, {
      headers: { "Accept-Version": "v1", Authorization: `Client-ID ${key}` },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type RawPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  alt_description: string | null;
  description: string | null;
  urls: { raw: string };
  links: { html: string };
};

export async function getPhotos(): Promise<Photo[]> {
  const raw = await api<unknown>(`/users/${UNSPLASH_USER}/photos?per_page=30&order_by=latest`, 3600);
  if (!Array.isArray(raw)) return [];

  return (raw as RawPhoto[]).map((p) => ({
    id: p.id,
    width: p.width,
    height: p.height,
    color: p.color ?? "#1a1a1a",
    // Most uploads carry only Unsplash's generated description. Empty alt is
    // better than an invented one.
    alt: p.description ?? p.alt_description ?? "",
    src: p.urls.raw,
    link: p.links.html,
  }));
}

export async function getReach(): Promise<Reach | null> {
  const stats = await api<{ views?: { total?: number }; downloads?: { total?: number } }>(
    `/users/${UNSPLASH_USER}/statistics`,
    3600,
  );
  const views = stats?.views?.total;
  const downloads = stats?.downloads?.total;
  return typeof views === "number" && typeof downloads === "number" ? { views, downloads } : null;
}

type RawDetails = {
  views?: number;
  exif?: {
    make?: string | null;
    model?: string | null;
    exposure_time?: string | null;
    aperture?: string | null;
    focal_length?: string | null;
    iso?: number | null;
  };
};

export async function getPhotoDetails(id: string): Promise<PhotoDetails | null> {
  const raw = await api<RawDetails>(`/photos/${encodeURIComponent(id)}`, 86400);
  if (!raw) return null;
  const exif = raw.exif ?? {};
  const make = exif.make?.trim() ?? "";
  const model = exif.model?.trim() ?? "";
  // Some cameras repeat the maker in the model name.
  const named = model.startsWith(make) ? model : [make, model].filter(Boolean).join(" ");
  const settings = [
    exif.aperture && `f/${exif.aperture}`,
    exif.exposure_time && `${exif.exposure_time} s`,
    exif.iso && `ISO ${exif.iso}`,
    exif.focal_length && `${exif.focal_length} mm`,
  ].filter((s): s is string => Boolean(s));
  return {
    camera: named ? (CAMERAS[named] ?? named) : null,
    settings,
    views: typeof raw.views === "number" ? raw.views : null,
  };
}
