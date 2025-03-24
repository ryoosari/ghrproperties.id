# GHR Properties Website

A modern real estate website built with Next.js that can be deployed as a fully static site or as a dynamic site with Strapi CMS integration.

## Features

- Modern, responsive design using Tailwind CSS
- Optimized for performance and SEO
- Multiple deployment options: static, hybrid, or fully dynamic
- Integrated with Strapi CMS for content management
- Property listings with search and filtering
- Detailed property pages with image galleries

## Deployment Options

This website supports three deployment modes:

1. **Static Export** - All pages pre-rendered at build time, ideal for hosting on GitHub Pages, Netlify, or any static hosting
2. **Hybrid Mode** - Pre-rendered pages with revalidation for updates when Strapi content changes
3. **Full Dynamic** - All content fetched at request time (requires a Node.js server)

For detailed instructions on each deployment option, see [STATIC-DEPLOYMENT.md](./STATIC-DEPLOYMENT.md).

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (standard Next.js build)
npm run build

# Build for static export (no server required)
npm run static-export
```

## Strapi Integration

The website can pull content from a Strapi CMS instance. Set up your environment variables:

```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-token-here
```

For static exports, content is pulled from Strapi at build time and embedded in the static site.

## Project Structure

- `src/app` - Next.js App Router pages and layouts
- `src/components` - React components
- `src/lib` - Utility libraries for Strapi, data fetching, etc.
- `src/utils` - Helper functions
- `public` - Static assets
- `data` - Directory for exported data from Strapi
- `scripts` - Utility scripts for export and deployment

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (server-required mode)
- `npm run static-export` - Build for static hosting (no server required)
- `npm run export-data` - Export data from Strapi to static JSON files
- `npm run hybrid-build` - Build with hybrid mode (static + revalidation)
- `npm run test-strapi` - Test connection to Strapi CMS
- `npm run test-dynamic` - Test dynamic mode integration

## License

ISC License
