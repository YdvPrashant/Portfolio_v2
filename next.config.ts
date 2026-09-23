import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The photographs are hotlinked from Unsplash, as their API terms ask, so
    // uploading to the profile is all it takes to update the site.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
