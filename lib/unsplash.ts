/* Photographs come live from Prashant's Unsplash profile, so uploading there is
   all it takes to update the site.

   Server side only: the access key is read from UNSPLASH_ACCESS_KEY and never
   prefixed NEXT_PUBLIC_. Listing a user's photos needs only the access key.
   Responses revalidate hourly because Unsplash limits demo apps to fifty
   requests an hour. */

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
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.unsplash.com/users/${UNSPLASH_USER}/photos?per_page=30&order_by=latest`,
      {
        headers: { "Accept-Version": "v1", Authorization: `Client-ID ${key}` },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];

    const raw: unknown = await res.json();
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
  } catch {
    return [];
  }
}
