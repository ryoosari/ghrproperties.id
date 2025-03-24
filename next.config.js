/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Set output to 'export' for static builds
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? 'export' : undefined,
  
  // Configure images for static export
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true',
  },
  
  // Ignore TypeScript and ESLint errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Exclude specific folders from the build
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'strapi-backend/**',
        'node_modules/**',
      ],
    },
  },
};

module.exports = nextConfig; 