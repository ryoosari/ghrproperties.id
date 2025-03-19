#!/bin/bash

# Script to build the Next.js app and update the production branch with the built files

# Exit on any error
set -e

echo "📦 Building Next.js application..."
npm run build

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

# Switch to production branch
echo "🔄 Switching to production branch..."
git checkout production

# Copy new built files
echo "📋 Copying built files from $CURRENT_BRANCH branch..."
rsync -av --delete out/ out/

# Stage all changes
echo "➕ Staging changes to production branch..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit. Production branch is up to date."
else
  # Commit changes
  echo "💾 Committing changes to production branch..."
  git commit -m "Update built files from $CURRENT_BRANCH branch"

  # Push to remote
  echo "🚀 Pushing production branch to remote..."
  git push origin production
fi

# Switch back to original branch
echo "🔙 Switching back to $CURRENT_BRANCH branch..."
git checkout $CURRENT_BRANCH

echo "✨ Done! The production branch has been updated with the latest build."
echo "   You can now pull this branch in cPanel using Git Version Control." 