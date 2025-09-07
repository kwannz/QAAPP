/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable typed routes to avoid generated types impacting TS across the app
  typedRoutes: false,
  output: 'standalone',
  trailingSlash: false,
  distDir: 'dist',
  experimental: {
    // Keep only essential experimental features
    ppr: false,
  },
  images: {
    unoptimized: true,
    domains: [
      'ipfs.io',
      'gateway.pinata.cloud', 
      'qa-app.s3.amazonaws.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
