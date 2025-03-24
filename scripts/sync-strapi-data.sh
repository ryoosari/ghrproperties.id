#!/bin/bash

# Strapi Data Sync Script
# This script exports data from Strapi and commits it to the repository
# Usage: ./scripts/sync-strapi-data.sh [commit message]

echo "🚀 Starting Strapi data sync process..."

# Default commit message
COMMIT_MSG="Update Strapi data export - $(date '+%Y-%m-%d %H:%M:%S')"

# Use custom commit message if provided
if [ ! -z "$1" ]; then
  COMMIT_MSG=$1
fi

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_STRAPI_URL" ] || [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
  echo "⚠️ Environment variables not set!"
  echo "NEXT_PUBLIC_STRAPI_URL or NEXT_PUBLIC_STRAPI_API_TOKEN is missing."
  echo ""
  echo "Please set these variables before running this script:"
  echo "export NEXT_PUBLIC_STRAPI_URL=your-strapi-url"
  echo "export NEXT_PUBLIC_STRAPI_API_TOKEN=your-strapi-token"
  exit 1
fi

# Ensure data directories exist
mkdir -p data/properties data/snapshot

# Export data from Strapi
echo "📥 Exporting data from Strapi..."
node scripts/export-strapi-data.mjs

# Check if export was successful
if [ $? -ne 0 ]; then
  echo "❌ Error exporting data from Strapi"
  exit 1
fi

# Check for changes
if [[ -z "$(git status --porcelain data)" ]]; then
  echo "ℹ️ No changes detected in data files"
  exit 0
fi

# Stage changes
echo "📝 Staging changes..."
git add data/

# Show summary of changes
echo "📊 Changes to be committed:"
git diff --staged --stat

# Confirm commit
echo ""
read -p "Commit these changes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Operation canceled by user"
  exit 1
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Confirm push
echo ""
read -p "Push changes to origin/main? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "ℹ️ Changes committed but not pushed"
  echo "You can push later with: git push origin main"
  exit 0
fi

# Push changes
echo "🚀 Pushing changes to origin/main..."
git push origin main

echo "✅ Data sync process completed successfully!" 