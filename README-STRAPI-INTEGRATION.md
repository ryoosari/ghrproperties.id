# Strapi Integration for Static Site Generation

This document explains how the Strapi CMS integration works with the static site generation process.

## How It Works

1. **Content Creation**: You create and manage property listings in Strapi
2. **Data Export**: The data export script fetches all content from Strapi
3. **Static File Generation**: Data is saved as JSON files in the `/data` directory
4. **Build Process**: Next.js uses these JSON files during the static build process
5. **Deployment**: The static site is deployed to production

## Development vs Production Mode

The application can operate in two different modes:

### Development Mode (Dynamic Content)

In development mode, the application directly fetches content from your Strapi API in real-time. This means:

- When you add or update content in Strapi, it will automatically appear in your local development environment
- No need to run the export script to see content changes
- Ideal for content development and testing

To use development mode:

1. Make sure your Strapi server is running
2. Set up your environment variables (see below)
3. Run `npm run dev` to start the development server
4. Changes in Strapi will immediately appear in your local site

### Production Mode (Static Content)

In production mode, the application uses pre-exported JSON files for content. This means:

- Content is "frozen" at build time
- No database or API connection is needed in production
- Faster page loads and better security
- Ideal for production deployment

## Workflow Options

There are two ways to update the website with new Strapi content:

### Option 1: Manual Export and Commit (Recommended)

1. Run the data export script locally:
   ```bash
   npm run export-data
   ```
   
2. Commit the updated data files:
   ```bash
   git add data/
   git commit -m "Update content from Strapi"
   git push
   ```
   
3. GitHub Actions will use the committed data files for the next build

### Option 2: Automated Export in GitHub Actions

1. Trigger a manual workflow dispatch in GitHub Actions
2. GitHub Actions will:
   - Fetch the latest data from Strapi
   - Generate the static site
   - Deploy the site

This option requires setting up Strapi URL and API token secrets in GitHub.

## Required Environment Variables

The following environment variables need to be set:

- `NEXT_PUBLIC_STRAPI_URL`: The URL of your Strapi instance (e.g., `http://localhost:1337`)
- `NEXT_PUBLIC_STRAPI_API_TOKEN`: API token for accessing Strapi

For GitHub Actions, set these as repository secrets.

## Setting Up Strapi API Token

To create an API token in Strapi:

1. Go to Settings > API Tokens
2. Click "Create new API Token"
3. Set the token name, description, and expiration
4. Select the appropriate permissions (at minimum, read access to properties)
5. Copy the generated token for use in environment variables

## Data Structure

The export process creates the following files:

- `data/property-index.json`: Index of all properties with basic metadata
- `data/properties.json`: All properties with complete data
- `data/properties-[id].json`: Individual property files by ID
- `data/properties/[slug].json`: Individual property files by slug
- `data/last-updated.json`: Timestamp of the last export
- `data/metadata.json`: Export metadata and statistics

## Customizing the Export Process

To modify what data is exported or how it's formatted, edit the `scripts/export-strapi-data.mjs` file.

## Troubleshooting

If you encounter issues with the data export:

1. Check that your Strapi instance is running
2. Verify your Strapi URL and API token are correct
3. Check the Strapi API endpoints are accessible
4. Look for error logs in the console during the export process

## Testing Strapi Connectivity

To verify your connection to Strapi is working properly:

```bash
npm run test-strapi
```

This script will:
1. Attempt to connect to your Strapi instance
2. Fetch a sample property
3. Display relevant information or detailed error messages

If the test fails, it will provide troubleshooting tips to help you resolve connectivity issues.

## Best Practices

- Run `npm run export-data` before commits to ensure fresh content
- Keep the data directory in version control to ensure build reproducibility
- Use the Strapi admin panel for content management, not direct file editing 