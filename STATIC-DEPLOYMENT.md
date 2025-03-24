# Static Deployment Guide for GHR Properties Website

This guide explains how to deploy the GHR Properties website as a static site, while still leveraging Strapi content.

## Understanding the Options

The website supports three deployment modes:

1. **Static Export** - All pages pre-rendered at build time, no dynamic content after build
2. **Hybrid Mode** - Pre-rendered pages with revalidation for updates when Strapi content changes
3. **Full Dynamic** - All content fetched at request time (requires a Node.js server)

## Static Export Deployment

Use this when you want to deploy to static hosting like GitHub Pages, Netlify, or Vercel's static deployments.

```bash
# 1. Export data from Strapi to static JSON files
npm run export-data

# 2. Build the site as a static export
npm run snapshot-build

# 3. The output will be in the "out" directory
```

**Pros:**
- Can be hosted on any static file hosting (GitHub Pages, Netlify, S3, etc.)
- Extremely fast page loads
- No server required

**Cons:**
- Content is frozen at build time
- Requires a rebuild to update content from Strapi

## ⚠️ Current Limitation for Static Export

Next.js 14 has strict requirements for static exports with dynamic routes. The current error we're seeing:

```
Error: Page "/properties/[slug]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.
```

This happens because our `generateStaticParams()` function isn't providing the paths needed for static generation.

**Solutions for static export:**

1. **Temporary workaround**: Comment out or remove the dynamic `[slug]` route by renaming or temporarily removing the folder.
   
   ```bash
   # Temporarily rename the dynamic route folder before building
   mv src/app/properties/\[slug\] src/app/properties/_slug_disabled
   
   # Run the export
   npm run snapshot-build
   
   # Restore the folder for development
   mv src/app/properties/_slug_disabled src/app/properties/\[slug\]
   ```

2. **Future fix**: We need to enhance the `generateStaticParams()` function to properly read data during build time.

## Hybrid Mode Deployment

Use this when deploying to Vercel, Netlify, or any platform that supports Next.js ISR (Incremental Static Regeneration).

```bash
# 1. Export data from Strapi for initial static generation
npm run export-data

# 2. Build the site in hybrid mode
npm run hybrid-build

# 3. Deploy the result to a service that supports Next.js
```

**Pros:**
- Fast initial page loads with static generation
- Content updates periodically via revalidation (every 60 seconds)
- Can still use static hosting platforms that support Next.js ISR

**Cons:**
- Requires a hosting platform that supports Next.js
- Updates have a delay based on the revalidation period

## Full Dynamic Mode

Use this when you need real-time content updates from Strapi.

```bash
# 1. Make sure your NEXT_PUBLIC_STRAPI_URL and NEXT_PUBLIC_STRAPI_API_TOKEN are set

# 2. Build normally
npm run build

# 3. Deploy to a service that supports Next.js API routes
```

**Pros:**
- Real-time content updates
- No rebuild needed when content changes

**Cons:**
- Requires a Node.js server
- Slower page loads compared to static generation
- Higher hosting costs

## Choosing the Right Approach

- **Static Export**: When content updates are infrequent and you want the simplest hosting
- **Hybrid Mode**: When you want both performance and semi-regular content updates
- **Full Dynamic**: When you need real-time updates and have server resources

## Environment Setup

Set these environment variables for the appropriate mode:

```
# For static export
NEXT_PUBLIC_STATIC_EXPORT=true

# For all modes, set these for Strapi connection
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-api-token
```

## Updating Content

### For Static Export

After updating content in Strapi:

1. Run `npm run export-data` to fetch the latest data
2. Run `npm run snapshot-build` to rebuild the site
3. Deploy the new "out" directory

### For Hybrid Mode

Content will update automatically based on the revalidation period (60 seconds by default).

However, for immediate updates:

1. Run `npm run export-data` to update the static data
2. Trigger a new deployment on your hosting platform

### For Full Dynamic Mode

Content will update in real-time as you make changes in Strapi. 