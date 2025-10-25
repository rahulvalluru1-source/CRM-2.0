import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  output: "standalone",
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
