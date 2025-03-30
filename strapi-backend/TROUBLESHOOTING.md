# Strapi Troubleshooting Guide

This document provides solutions for common issues with Strapi.

## "The port 1337 is already used by another application"

If you see this error when trying to start Strapi:

```
[error]: The port 1337 is already used by another application.
[info]: Shutting down Strapi
```

### Solution:

1. Find the process using port 1337:

   ```bash
   lsof -i :1337 | grep LISTEN
   ```

2. Kill the process (replace PROCESS_ID with the ID from the previous command):

   ```bash
   kill -9 PROCESS_ID
   ```

3. Start Strapi again:

   ```bash
   npm run develop
   ```

## "Invalid key address" Error in Admin Panel

If you encounter an "invalid key address" error when accessing the Strapi admin panel:

### Solution:

1. Stop any running Strapi instances
2. Verify the APP_KEYS in your .env file are correct and properly formatted:

   ```
   APP_KEYS=4aJr1nnXXbbP7n/ZCjFKAg==,kyccNOJGa5xjJsM8apps5w==,3TDguJeMCu111Bc+Lr6S8w==,/2XKXSQSu5X3cHH2XsXvdg==
   ```

3. If the keys are corrupted, generate new ones:

   ```bash
   node -e "console.log('APP_KEYS=' + Array(4).fill().map(()=>require('crypto').randomBytes(16).toString('base64')).join(','))"
   ```

4. Update the .env file with the new keys
5. Clean cache and rebuild:

   ```bash
   rm -rf .tmp
   rm -rf node_modules/.cache
   rm -rf build
   rm -rf dist
   npm run build
   npm run develop
   ```

## Database Corruption

If you suspect database corruption:

### Solution:

1. Stop Strapi
2. Make a backup of your database:

   ```bash
   cp .tmp/data.db .tmp/data.db.backup
   ```

3. Restore from a previous backup (if available):

   ```bash
   cp .tmp/data.db.bak .tmp/data.db
   ```

4. Restart Strapi

## Content Type Permission Issues

If you can't access/edit content in the admin panel:

### Solution:

Follow the instructions in [STRAPI-PERMISSIONS-FIX.md](../STRAPI-PERMISSIONS-FIX.md) to update permissions.

## Startup Hangs or Crashes

If Strapi is hanging or crashing at startup:

### Solution:

1. Check for error messages in the console
2. Increase Node.js memory limit:

   ```bash
   export NODE_OPTIONS=--max-old-space-size=4096
   ```

3. Try running in debug mode:

   ```bash
   DEBUG=strapi:* npm run develop
   ```

## Can't Access Admin Panel

If you can't access the admin panel at all:

### Solution:

1. Verify Strapi is running (check console output)
2. Clear browser cache
3. Try different browser
4. Check your network configuration (firewall, etc.)
5. Ensure admin plugin is configured correctly in config/admin.ts

## General Reset Procedure

When all else fails, follow this general reset procedure:

```bash
# Stop Strapi
pkill -f "strapi develop"

# Backup database
cp .tmp/data.db .tmp/data.db.thorough-backup

# Clean everything
rm -rf .tmp
rm -rf node_modules/.cache
rm -rf build
rm -rf dist

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Start in development mode
npm run develop
```