# Strapi Data Export Guide

This guide explains how to export data from your local Strapi instance to be used in the static site build.

## Prerequisites

Before exporting data, make sure:

1. Your local Strapi server is running (`cd strapi-backend && npm run develop`)
2. You have created and published properties in Strapi
3. Your API token is correctly set up in Strapi with the appropriate permissions

## Quick Export

The simplest way to export and push Strapi data:

```bash
npm run quick-export
```

This command will:
1. Check if your Strapi server is running
2. Export data from Strapi to the data directory
3. Commit and push changes to GitHub
4. Show colorful status messages throughout the process

## Detailed Export Options

If you need more control, there are several other commands available:

1. **Export data only** (without committing or pushing):
   ```bash
   npm run export-data
   ```

2. **Export data and auto-commit** (without pushing):
   ```bash
   npm run export-and-commit
   ```

3. **Export, commit and push** (with standard commit message):
   ```bash
   npm run sync-strapi-data
   ```

## Troubleshooting

If you encounter issues with the export process:

1. Run the diagnostics tool to check your Strapi connection:
   ```bash
   npm run diagnose-strapi
   ```

2. For detailed debugging of a specific property:
   ```bash
   npm run debug-strapi
   ```

3. Make sure your Strapi API token has the proper permissions:
   - Navigate to Strapi admin panel → Settings → API Tokens
   - Verify that your token has Read permissions for all content types
   - If needed, regenerate the token and update your .env.local file

4. Check that your properties are published in Strapi (not in draft mode)

5. If the API token is not being recognized, make sure it's set correctly in your environment:
   ```bash
   export NEXT_PUBLIC_STRAPI_API_TOKEN=your_token_here
   ```
   Then run the export command.

## Incorporating Exported Data in the Build

After exporting data, you can build the site with:

```bash
npm run snapshot-build
```

This will use the exported data to generate a static site with all your Strapi content included.