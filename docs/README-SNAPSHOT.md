# GHR Properties Content Snapshot Approach

This document explains the content snapshot approach used in the GHR Properties website for static generation.

## Overview

Instead of fetching content from the Strapi CMS at runtime, we export all content to JSON files during the build process. This allows us to:

1. Generate a completely static website with no database dependencies
2. Improve performance by eliminating API calls
3. Increase reliability and security
4. Make deployment easier

## How It Works

### 1. Content Export

We use a Node.js script to export all content from Strapi to JSON files:

```
npm run export-data
```

This creates JSON files in the `data/` directory with all the content from Strapi.

### 2. Static Generation

During the build process, Next.js loads content from these JSON files instead of making API calls:

```
NEXT_PUBLIC_STATIC_EXPORT=true npm run build
```

### 3. Deployment

The static site is deployed to the production server, with no database connection required.

## Implementation Details

### Export Script

The `scripts/export-strapi-data.js` script fetches all content types from Strapi and saves them as:

- Individual files for each item: `data/contentType-id.json`
- Collection files: `data/contentType.json`
- Index files for quick lookup: `data/property-index.json`

### Snapshot Utility

The `src/utils/snapshot.ts` utility provides functions for loading content from the snapshot files:

- `loadCollection()`: Load all items of a content type
- `loadItem()`: Load a single item by ID
- `getPropertyBySlug()`: Find a property by slug
- `getAllProperties()`: Get all properties with filtering

### Dual-Mode Operation

The system supports both static (production) and dynamic (development) modes:

- In static mode, content is loaded from JSON files
- In dynamic mode, content is fetched from the Strapi API

The mode is controlled by the `NEXT_PUBLIC_STATIC_EXPORT` environment variable.

## Deployment Process

1. **Export Content**: Run `npm run export-data` to create the snapshot
2. **Commit Changes**: Commit the updated snapshot to Git
3. **Build Site**: Run `NEXT_PUBLIC_STATIC_EXPORT=true npm run build`
4. **Deploy**: Deploy the static site to your hosting

Or use our scripts:

- `./build-and-commit.sh`: Build and stage changes
- `./deploy.sh`: Create a deployment package
- `./update-production.sh`: Update the production branch
- `./update-clean-production.sh`: Create a clean production branch

## Benefits

- **Performance**: No API calls means faster page loads
- **Reliability**: No database connection means fewer points of failure
- **Security**: No exposed API endpoints in production
- **SEO**: All pages are pre-rendered
- **Cost**: Reduced server requirements
- **Offline Development**: Work without a running CMS

## Updating Content

When content changes in Strapi:

1. Run `npm run export-data` to update the snapshot
2. Commit the changes to Git
3. Deploy using one of the deployment scripts

## GitHub Actions Integration

Our GitHub Actions workflow is already configured to use this approach:

- The workflow checks for snapshot data
- It builds the site with `NEXT_PUBLIC_STATIC_EXPORT=true`
- It deploys to the production branch

## Troubleshooting

If you encounter issues:

1. Check that snapshot data exists in the `data/` directory
2. Verify that the `NEXT_PUBLIC_STATIC_EXPORT` environment variable is set to `true` during build
3. Check the console for error messages
4. Try recreating the snapshot with `npm run export-data`

## Adding New Content Types

To add a new content type to the snapshot:

1. Add it to the `contentTypes` array in `scripts/export-strapi-data.js`
2. Create appropriate loading functions in `src/utils/snapshot.ts`
3. Run `npm run export-data` to update the snapshot 