# Automated Property Slug Management

This guide explains how the automated property slug system works and how to maintain it.

## Overview

The system automatically generates and maintains URL-friendly slugs for properties based on their titles. This ensures:

1. Consistent, SEO-friendly URLs for all properties
2. No conflicts in static file generation during the build process
3. Easy maintenance when adding or updating properties

## How It Works

### 1. Automatic Slug Generation in Strapi

The system uses Strapi lifecycle hooks to automatically generate slugs when:
- A new property is created
- A property's title is changed
- A property's slug is removed

The lifecycle hook is located at:
```
strapi-backend/src/api/property/content-types/property/lifecycles/index.js
```

It implements the following logic:
- When a property is created with a Title but no Slug, it generates a slug
- When a property is updated and its Title changes, it can regenerate the slug
- Slugs are created using a standardized slugify function

### 2. Export Process Improvements

The export script (`export-strapi-data.mjs`) has been enhanced to:
- Always use the Strapi-generated slug if available
- Fallback to generating a slug from the Title if needed
- Ensure consistent slug usage across all exported JSON files
- Update all references to a property's slug in one place

### 3. Updating Existing Properties

For properties that already exist in your Strapi database:
- Use `update-property-slugs.js` to scan and fix inconsistent slugs
- This script detects properties with missing or generic slugs and updates them

## Usage Guide

### Adding New Properties

When adding new properties in Strapi:
1. Always provide a Title
2. You don't need to manually enter a Slug - it will be generated automatically
3. If you want a custom slug, you can override the automatic generation by entering it manually

### Updating Existing Properties

If you need to update titles of existing properties:
1. Edit the property in Strapi and update the Title
2. The slug will automatically update if you clear the Slug field (or you can keep the old slug)
3. Run the export script to update all your static data files

### Bulk Updating Slugs

To update all properties' slugs at once:

1. Run the update-property-slugs.js script:
   ```bash
   node scripts/update-property-slugs.js
   ```

2. Export the updated data to your static files:
   ```bash
   node scripts/export-strapi-data.mjs
   ```

3. Alternatively, use the combined script:
   ```bash
   bash scripts/update-and-export-properties.sh
   ```

### Verifying Slug Consistency

To check that all your slugs are consistent:

1. After exporting, check the property-index.json file:
   ```bash
   cat data/property-index.json
   ```

2. Verify that each property has a descriptive slug based on its title

## Troubleshooting

### If a property has the wrong slug

1. In Strapi admin, edit the property
2. Delete the content of the "Slug" field
3. Save the property (a new slug will be generated)
4. Run the export script again

### If static export fails with path conflicts

This usually happens when two properties have the same slug. To fix:

1. Run the update script to regenerate unique slugs:
   ```bash
   node scripts/update-property-slugs.js
   ```

2. Export the data and rebuild the site:
   ```bash
   node scripts/export-strapi-data.mjs
   npm run build
   ```

## Technical Details

### Slug Format

Slugs are generated using this transformation:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Replace "&" with "and"
- Trim hyphens from start and end

For example:
- "3BR Villa in Seminyak" → "3br-villa-in-seminyak"
- "Luxury Apartment & Pool" → "luxury-apartment-and-pool"

### Data File Structure

The export process creates several data files:
- `property-index.json`: Lightweight index of all properties
- `properties.json`: Full collection of all properties
- `processed-properties.json`: Processed version with consistent structure
- `properties/[slug].json`: Individual property files named by slug
- `data/[slug].json`: Additional copies in the data directory 