# Development Commands for GHR Properties

This document contains all the commands you need to develop, test, and maintain the GHR Properties website and its Strapi backend.

## Project Structure
- **Frontend**: Next.js application in the root directory
- **Backend**: Strapi application in the `/strapi-backend` directory
- **Scripts**: Utility scripts in the `/scripts` directory
- **Data**: Exported content in the `/data` directory

## Getting Started

### 1. Starting the Strapi Backend
```bash
cd strapi-backend && npm run develop
```
This will:
- Start the Strapi development server
- Make the admin panel available at http://localhost:1337/admin
- Login with your admin credentials

### 2. Starting the Next.js Frontend
```bash
npm run dev
```
This will:
- Start the Next.js development server
- Make the website available at http://localhost:3000
- Enable hot reloading for development

## Essential Commands

### Strapi Backend Commands
```bash
# Start Strapi development server
cd strapi-backend && npm run develop

# Build Strapi for production
cd strapi-backend && npm run build

# Start Strapi in production mode
cd strapi-backend && npm run start

# Access Strapi console
cd strapi-backend && npm run console

# Upgrade Strapi (check for compatibility first)
cd strapi-backend && npm run upgrade
```

### Next.js Frontend Commands
```bash
# Start Next.js development server
npm run dev

# Build Next.js for production
npm run build

# Start Next.js in production mode
npm run start

# Lint Next.js code
npm run lint
```

### Data Export and Sync Commands
```bash
# Export data from Strapi to JSON files
npm run export-data

# Export and commit data in one command
npm run quick-export

# Export, commit, and push data to GitHub
npm run sync-strapi-data

# Build with static data export
npm run snapshot-build

# Full static export for hosting
npm run static-export

# Hybrid build (static data + SSR)
npm run hybrid-build
```

### Testing and Debugging Commands
```bash
# Test Strapi connection
npm run test-strapi

# Test dynamic mode
npm run test-dynamic

# Test property display
npm run test-property

# Debug Strapi property
npm run debug-strapi

# Diagnose Strapi issues
npm run diagnose-strapi

# Fix file permissions (if needed)
sh scripts/fix-permissions.sh
```

## Workflow for Content Updates

After making changes in Strapi:

1. **Manually export the data** (automatic export has been disabled to prevent crashes):
   ```bash
   npm run export-data
   ```

2. **Verify the exported data** in the `/data` directory

3. **Test locally** to ensure changes appear correctly:
   ```bash
   npm run dev
   ```

4. **Commit and push changes** when ready:
   ```bash
   npm run quick-export
   ```
   This will export data, commit, and push to GitHub in one step.

## Deployment Process

For deployment to production:

1. **Build for production**:
   ```bash
   npm run static-export
   ```
   This creates a static export in the `/out` directory.

2. **Deploy to hosting**:
   - Either manually upload the `/out` directory
   - Or use the Git-based deployment (see DEPLOYMENT.md)

## Environment Management

The project uses environment variables for configuration:

- `.env` - For local development
- `.env.production` - For production settings

Important environment variables:
- `NEXT_PUBLIC_STRAPI_URL` - URL of the Strapi API (default: http://localhost:1337)
- `NEXT_PUBLIC_STRAPI_API_TOKEN` - API token for accessing Strapi
- `NEXT_PUBLIC_STATIC_EXPORT` - Set to 'true' for static generation

## Troubleshooting

### If Strapi doesn't start:
```bash
# Clean up the temp files
cd strapi-backend
rm -rf .tmp
rm -rf node_modules/.cache
rm -rf build
rm -rf dist

# Reinstall dependencies if needed
npm install

# Rebuild and start
npm run build
npm run develop
```

### If content doesn't appear correctly:
```bash
# Verify Strapi is running
npm run test-strapi

# Diagnose Strapi issues
npm run diagnose-strapi

# Clear Next.js cache
rm -rf .next

# Export fresh data
npm run export-data
```

### If Strapi crashes after content changes:
See `STRAPI-PERMISSIONS-FIX.md` for detailed instructions on fixing permissions and rebuilding Strapi.

## Node.js Requirements

- **Node.js version**: 18.x - 22.x (as specified in strapi-backend/package.json)
- **npm version**: 6.0.0 or higher