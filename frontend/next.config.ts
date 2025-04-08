import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

// Check for HTTPS certificates
const certsDir = path.join(process.cwd(), 'certs');
const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// Create HTTPS options if certificates exist
const httpsOptions = fs.existsSync(keyPath) && fs.existsSync(certPath) 
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    } 
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Add your external domains here
    domains: ["assets.aceternity.com"],
  },
  
  // Configure HTTPS using the experimental property
  // This is the correct way to enable HTTPS in Next.js 15+
  experimental: {
    // @ts-ignore - The type definitions might not include this yet
    https: httpsOptions
  },
};

export default nextConfig;
