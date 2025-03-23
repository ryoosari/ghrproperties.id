/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? 'export' : undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true',
  },
  // For static exports, adjust the basePath if you're not deploying to the root of your domain
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = nextConfig; 