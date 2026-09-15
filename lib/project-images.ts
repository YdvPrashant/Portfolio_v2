import fs from "node:fs";
import path from "node:path";

/* Project screenshots are resolved at build time from public/projects/<id>.<ext>.
   Drop a file in and it replaces the placeholder with no code change; until
   then the Projects slide draws a crossed box naming the file it wants. Server
   only. */

const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

export function projectImage(id: string): string | null {
  const dir = path.join(process.cwd(), "public", "projects");
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(dir, id + "." + ext))) return "/projects/" + id + "." + ext;
  }
  return null;
}
