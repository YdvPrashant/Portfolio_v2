import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Unsplash serves every size off this one host. Photos stay hotlinked
    // rather than copied into the repo, which is both what their API terms
    // ask for and how the gallery updates itself when he uploads more.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
