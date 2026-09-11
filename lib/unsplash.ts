/* Photography comes from his own Unsplash profile rather than from files in the
   repo, so uploading there is all it takes to update the gallery.

   Server side only. The access key is read from UNSPLASH_ACCESS_KEY and is
   never prefixed NEXT_PUBLIC_, so it cannot leak into the client bundle. The
   secret key is not used or stored: listing a user's photos needs only the
   access key, which Unsplash takes as client_id.

   Responses are revalidated hourly. Unsplash rate limits demo applications to
   fifty requests an hour, and without caching a dev session refreshing the page
   would burn through that in a couple of minutes. */

export const UNSPLASH_USER = "pr7nt";
export const UNSPLASH_PROFILE = "https://unsplash.com/@" + UNSPLASH_USER;

export type Photo = {
  id: string;
  width: number;
  height: number;
  color: string;
  alt: string;
  url: string;
  link: string;
};

type RawPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  alt_description: string | null;
  description: string | null;
  urls: { regular: string };
  links: { html: string };
};

export async function getPhotos(limit = 30): Promise<Photo[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.unsplash.com/users/${UNSPLASH_USER}/photos?per_page=${limit}&order_by=latest`,
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
      color: p.color ?? "#0b0b0b",
      // Most of his uploads have no caption. An empty alt is correct for a
      // decorative-by-position image; inventing one would be worse.
      alt: p.description ?? p.alt_description ?? "",
      url: p.urls.regular,
      link: p.links.html,
    }));
  } catch {
    return [];
  }
}

/* Row lengths for the gallery, cycled. Row height falls out of the count, since
   a justified row of n portraits is width / sum(aspects) tall, so varying the
   count is what gives the page a photo-book rhythm instead of a grid. Twos are
   left out on purpose: two portraits across a desktop measure comes out around
   900px tall. */
export const ROW_PATTERN = [3, 5, 4, 3, 4, 5, 3, 4];

const MIN_ROW = 3;
const MAX_ROW = 6;

export function intoRows<T>(items: T[], pattern: number[] = ROW_PATTERN): T[][] {
  const rows: T[][] = [];
  let i = 0;
  let p = 0;

  while (i < items.length) {
    let n = pattern[p % pattern.length];
    const left = items.length - i;

    if (left <= n) {
      n = left;
    } else if (left - n < MIN_ROW) {
      /* Following the pattern blindly leaves one or two photos over, and a
         justified row of two portraits comes out about a thousand pixels tall.
         Either swallow the remainder into this row, or if that makes the row
         too long, shorten this one so the last row is a full three. */
      n = left <= MAX_ROW ? left : left - MIN_ROW;
    }

    rows.push(items.slice(i, i + n));
    i += n;
    p++;
  }

  return rows;
}
