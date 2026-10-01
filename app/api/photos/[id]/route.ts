import { NextResponse } from "next/server";
import { getPhotoDetails, getPhotos } from "@/lib/unsplash";

/* One photograph's camera, settings and views, for the viewer on the
   photography page. Only Prashant's own photographs are looked up, and each
   answer is kept for a day, so the route cannot spend the Unsplash budget of
   fifty requests an hour on anything else. */

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photos = await getPhotos();
  if (!photos.some((p) => p.id === id)) {
    return NextResponse.json(null, { status: 404 });
  }

  const details = await getPhotoDetails(id);
  if (!details) {
    return NextResponse.json(null, { status: 502 });
  }

  return NextResponse.json(details, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
  });
}
