/* Where the site lives. Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every
   deployment, so link previews and the sitemap point at the real domain
   without hard coding it. */
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const description =
  "Prashant Yadav is a software engineer in Lucknow working across full-stack web and applied machine learning. Case studies, benchmarks and photographs.";
