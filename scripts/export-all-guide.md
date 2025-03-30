# Enhanced Property Export Guide

This guide explains how to use the enhanced property data export system that now handles all aspects of property data management in a single script.

## Overview

The `npm run export-data` command now includes comprehensive functionality:

1. Connects to your Strapi instance
2. Updates all property slugs in Strapi based on their titles
3. Exports all property data to static JSON files
4. Creates normalized data for the website
5. Validates the exported data for consistency

This provides a complete solution for transitioning from Strapi to static snapshot data, ensuring all properties have proper slugs throughout the process.

## When to Use

You should run `npm run export-data` in these scenarios:

- **Regular Data Updates**: Whenever you've added or modified properties in Strapi
- **Before Deployments**: As part of your pre-deployment workflow
- **Fixing Slug Issues**: When you need to resolve generic or missing slugs
- **Data Consistency Checks**: To verify your property data is correctly structured

## Usage Instructions

### Basic Usage

```bash
npm run export-data
```

This command will:
- Connect to your Strapi instance (using either the NEXT_PUBLIC_STRAPI_URL environment variable or defaulting to localhost:1337)
- Update all property slugs in Strapi based on their titles
- Export all data to the correct static files
- Create a normalized snapshot for the website
- Clean up any stale data files

### Options and Environment Variables

You can control the script behavior with these environment variables:

- `NEXT_PUBLIC_STRAPI_URL`: Set this to your Strapi API URL if not running locally
- `NEXT_PUBLIC_STRAPI_API_TOKEN`: Your Strapi API token for authentication
- `AUTO_COMMIT`: Set to 'true' to automatically commit changes to git

Example with a custom Strapi URL:

```bash
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-instance.com npm run export-data
```

### Offline Mode

If Strapi is not accessible, the script will detect this and proceed with exporting the existing data only (skipping the slug update phase). This is useful in scenarios where:

- You're working offline
- The Strapi server is down for maintenance
- You just want to check your existing exported data

## Understanding the Output

The script provides detailed output that helps you understand what's happening:

1. **Slug Update Phase**: Shows which properties are being processed, which slugs are being updated, and any errors during the update process
2. **Data Export Phase**: Shows what property data is being exported and any issues encountered
3. **Summary**: Final stats including the number of properties and how many slugs were updated

## Build Commands

All the build commands use the enhanced export script:

- `npm run snapshot-build`: Runs the export and builds for static export
- `npm run static-export`: Runs the export and performs a full static export
- `npm run hybrid-build`: Runs the export and builds for hybrid mode

## How It Works

### Slug Updates

The script checks each property and determines if it needs a slug update by:
- Looking for missing slugs
- Identifying generic slugs (like "property" or "property-123")
- Finding slugs that don't match the property title

When it finds a property that needs updating, it:
1. Generates a proper slug from the property title
2. Updates the property in Strapi using the appropriate API endpoint
3. Logs the changes for review

### Data Export

After updating the slugs, the script:
1. Cleans up old property files to prevent stale data
2. Exports all properties with their updated slugs
3. Creates individual property JSON files named by slug
4. Creates a normalized snapshot for the website

## Troubleshooting

### Strapi Connection Issues

If the script can't connect to Strapi:
1. It will log an error with details
2. Continue with existing data (skipping slug updates)
3. Still produce a usable export from existing data

### Slug Update Errors

If a specific property can't be updated:
1. The error will be logged but won't stop the process
2. The property will be exported with its existing slug
3. You can manually fix the issue in Strapi and run the export again

### Data Inconsistencies

If you see unexpected data in the export:
1. Check the Strapi property data structure
2. Look for any errors during the export process
3. Verify that the properties have the expected fields 