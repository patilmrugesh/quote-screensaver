import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker container builds, let Vercel handle its native build
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
