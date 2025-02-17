import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Add your external domains here
    domains: ["assets.aceternity.com"],
  },

  /* config options here */
};

export default nextConfig;
