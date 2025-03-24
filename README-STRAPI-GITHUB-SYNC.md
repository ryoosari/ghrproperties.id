# Strapi Data Synchronization with GitHub Actions

This document explains how Strapi data is synchronized with your GitHub repository and used for static site generation.

## Overview

Instead of fetching Strapi data during the GitHub Actions build process, we now use a two-step process:

1. **Data Synchronization**: A separate GitHub Action that runs on a schedule (or manually) to fetch data from Strapi and commit it to the repository
2. **Static Site Generation**: The deployment workflow uses the pre-committed data without connecting to Strapi

This approach provides several benefits:
- GitHub Actions doesn't need direct access to Strapi
- More reliable builds (not dependent on Strapi being available during build)
- Clear history of content changes in your repository
- Ability to review content changes before deployment

## How It Works

### 1. Automated Data Synchronization

A GitHub Action workflow (`sync-strapi-data.yml`) runs:
- On a daily schedule (midnight UTC)
- When manually triggered via GitHub UI

This workflow:
1. Connects to your Strapi CMS
2. Fetches all content
3. Processes and normalizes the data
4. Saves it as JSON files in the `data/` directory
5. Commits and pushes changes to the main branch

### 2. Static Site Generation

The deployment workflow (`deploy-production.yml`) runs:
- On pushes to the main branch (including changes from the sync workflow)
- When manually triggered

This workflow:
1. Uses the pre-committed Strapi data in the repository
2. Builds the Next.js site with `NEXT_PUBLIC_STATIC_EXPORT=true`
3. Creates a static export
4. Deploys it to the production branch

## Workflow

Here's the typical workflow for updating content:

1. **Content Creation/Editing**: Make changes in your Strapi CMS
2. **Data Synchronization**: 
   - Wait for the scheduled sync (daily), or
   - Manually trigger the "Sync Data from Strapi" workflow
3. **Deployment**: 
   - The site automatically rebuilds and deploys after the sync commits changes, or
   - Manually trigger the "Deploy to Production Branch" workflow

## Manual Synchronization

To manually sync data from Strapi:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Sync Data from Strapi" workflow
3. Click "Run workflow" button (dropdown on the right)
4. Select the branch (usually main) and click "Run workflow"

## Configuration

The workflows require these GitHub secrets:
- `STRAPI_URL`: Your Strapi API URL
- `STRAPI_API_TOKEN`: Your Strapi API token for authentication

## Troubleshooting

### Missing or Empty Data Files

If your data files are empty or missing:

1. Check your Strapi credentials in GitHub Secrets
2. Verify your Strapi instance is accessible
3. Check the logs from the Sync workflow for error messages
4. Try running the workflow manually

### Content Not Updating

If your content isn't updating:

1. Check if the data sync workflow completed successfully
2. Verify that changes were committed to the repository
3. Make sure the deployment workflow ran after the data sync

## Local Development

For local development:

1. Run your Strapi server locally
2. Set up your `.env.local` with Strapi credentials
3. Run `npm run export-data` to fetch current data
4. Run `npm run dev` to start the development server

## Adding New Content Types

To add new content types to the synchronization:

1. Modify the `scripts/export-strapi-data.mjs` script to export the new content type
2. Update the `src/utils/snapshot.ts` utilities to handle the new content type
3. Run the data sync workflow to fetch and commit the new data 