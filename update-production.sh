#!/bin/bash

# Script to build the Next.js app and update the production branch with the built files

# Exit on any error
set -e

# Export content snapshot (optional, usually already in the repo)
echo "📊 Verifying content snapshot data..."
if [ ! -d "data" ] || [ ! -f "data/property-index.json" ]; then
  echo "⚠️ Warning: No snapshot data found. Running export-data script..."
  npm run export-data
  
  # Stage the exported data
  git add data/
  git commit -m "Update content snapshot data" || echo "No changes to snapshot data"
else
  echo "✅ Content snapshot data found."
fi

echo "📦 Building Next.js application with snapshot data..."
NEXT_PUBLIC_STATIC_EXPORT=true npm run build

if [ ! -d "out" ]; then
  echo "❌ Error: 'out' directory not found. Build may have failed."
  exit 1
fi

# Copy .htaccess to the out directory if it doesn't exist
if [ ! -f "out/.htaccess" ]; then
  echo "📄 Copying .htaccess to the build output..."
  cp .htaccess out/
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🔍 Current branch: $CURRENT_BRANCH"

# Create a temporary directory to store the build output
echo "📋 Saving build output to temporary location..."
TMP_DIR=$(mktemp -d)
cp -R out/. "$TMP_DIR"/

# Stash any changes to ensure clean working directory
echo "🧹 Cleaning working directory..."
git stash push -m "Stashed before updating production branch"

# Switch to production branch
echo "🔄 Switching to production branch..."
git checkout production

# Clean the out directory and copy the new files
echo "📋 Replacing built files in production branch..."
rm -rf out/*
cp -R "$TMP_DIR"/. out/
rm -rf "$TMP_DIR"

# Stage all changes
echo "➕ Staging changes to production branch..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit. Production branch is up to date."
else
  # Commit changes
  echo "💾 Committing changes to production branch..."
  git commit -m "Update production build [skip ci]"

  # Push changes
  echo "🚀 Pushing production branch..."
  git push origin production
fi

# Switch back to the original branch
echo "🔄 Switching back to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Restore changes from stash if necessary
if git stash list | grep -q "Stashed before updating production branch"; then
  echo "🔄 Restoring stashed changes..."
  git stash pop
fi

echo "✅ Production branch updated successfully!" 