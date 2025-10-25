/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;