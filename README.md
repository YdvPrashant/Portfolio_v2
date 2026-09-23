# Prashant Yadav, portfolio

Next.js 16 (App Router, Turbopack), React 19.2, Tailwind CSS 4, Lenis for smooth
scrolling. Everything else, the canvases included, is written by hand. The
design notes, including which Awwwards winners each idea came from, are in
[docs/design.md](docs/design.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

## Where things live

| What | Where |
| --- | --- |
| Every word and number on the site | `lib/content.ts` (from `resume/prashant-yadav-resume.tex`) |
| The CV people download | `public/prashant-yadav-resume.pdf` |
| Project screenshots | `public/projects/` |
| Photographs | Live from unsplash.com/@pr7nt through `lib/unsplash.ts`, refreshed hourly |
| Like counter | `app/api/likes/route.ts`, Upstash Redis through the Vercel Marketplace |
| Typing speed | `typing.wpm` in `lib/content.ts`, edited by hand (keybr has no API) |

## Environment

Kept in `.env.local`, never committed:

- `UNSPLASH_ACCESS_KEY` for the photographs. Without it the photography
  sections fall back to a link to the Unsplash profile.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` for the like counter, provisioned
  by the Upstash integration. Without them the like button hides itself.

## Pages

- `/` the name, a statement, selected work, measured results, a typing race,
  photographs, the CV and contact.
- `/work/prism`, `/work/conflict-detection`, `/work/ctximg` case studies.
- `/photography` every photograph on an endless field you can drag.
