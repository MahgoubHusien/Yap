import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Add your external domains here
    domains: ["assets.aceternity.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* config options here */
};

export default nextConfig;
