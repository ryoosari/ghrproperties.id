# Fixing Strapi Loading and Permission Issues

This guide provides instructions for fixing issues with Strapi when it stops loading after content changes.

## Issue Diagnosis

The main issue identified was that the Strapi backend was running an automatic data export process after every content change (create, update, or delete). This automatic export process was:

1. Running a complex script with API calls, file operations and Git commands
2. Potentially causing database locks
3. Causing the Strapi server to crash or hang

## How the Issue Was Fixed

1. The automatic export process was disabled in `strapi-backend/src/index.ts`
2. The schema was updated to include proper field types for the Property content type

## How to Rebuild Strapi after the Fix

Follow these steps to properly rebuild your Strapi application:

### 1. Stop any running Strapi instances

```bash
# If running in a terminal, use Ctrl+C to terminate
# Or find and kill the process
ps aux | grep strapi
kill <process_id>
```

### 2. Clean the Strapi build and temp files

```bash
cd strapi-backend
rm -rf .tmp
rm -rf node_modules/.cache
rm -rf build
rm -rf dist
```

### 3. Install dependencies and rebuild

```bash
npm install
npm run build
```

### 4. Start Strapi in development mode

```bash
npm run develop
```

### 5. Update Permissions in the Admin Panel

Once Strapi is running, log into the admin panel at http://localhost:1337/admin and:

1. Go to Settings → Roles → Public
2. Find the "Property" content type
3. Enable the following permissions:
   - Find (GET)
   - FindOne (GET)
   - Count (GET)

### 6. Manually Export Data After Making Changes

Instead of automatic exports, run the export manually after making content changes:

```bash
# From the root project directory
npm run export-data
# Or for a complete export and git commit
npm run quick-export
```

## Database Backup

It's recommended to regularly back up your Strapi database:

```bash
# Copy the SQLite database file
cp strapi-backend/.tmp/data.db strapi-backend/.tmp/data.db.bak
```

## Troubleshooting

If you continue to experience issues:

1. Check the Strapi logs for error messages
2. Verify your API token in the .env file is correct
3. Ensure the database file is not corrupted
4. Run the fix-permissions script: `npm run fix-permissions`

## Permissions for the IsFeatured Field

Since we added the `IsFeatured` field to the Property content type, make sure to:

1. Go to Settings → Roles → Public
2. Find the "Property" content type
3. Make sure the new field is included in the permitted fields list
4. Update permissions for any other roles (Editor, Author, etc.) as needed