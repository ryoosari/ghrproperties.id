#!/bin/bash

# Script to build the Next.js app and update the production branch with ONLY the built files
# This creates a clean production branch with just the files needed for deployment

# Exit on any error
set -e

# Export content snapshot (optional, usually already in the repo)
echo "📊 Verifying content snapshot data..."
if [ ! -d "data" ] || [ ! -f "data/property-index.json" ]; then
  echo "⚠️ Warning: No snapshot data found. Running export-data script..."
  npm run export-data
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

# Make sure we have the latest changes from remote
echo "🔄 Fetching latest changes from remote..."
git fetch

# Stash any changes to ensure clean working directory
echo "🧹 Cleaning working directory..."
git stash push -m "Stashed before updating production branch"

# Switch to production branch or create it if it doesn't exist
echo "🔄 Switching to production branch..."
if git show-ref --verify --quiet refs/heads/production; then
  git checkout production
  
  # Make sure we're up to date with remote production if it exists
  if git ls-remote --exit-code origin production; then
    git pull origin production
  fi
else
  # Create an orphan branch (no history from main)
  git checkout --orphan production
  
  # Clean everything
  echo "🧹 Creating clean production branch..."
  git rm -rf . || true
fi

# Copy the build output directly to the root of the production branch
echo "📋 Copying built files to production branch root..."
cp -R "$TMP_DIR"/. ./
rm -rf "$TMP_DIR"

# Copy any other essential files
if [ -f "${CURRENT_BRANCH}/.htaccess" ]; then
  echo "📄 Copying .htaccess to production..."
  cp "${CURRENT_BRANCH}/.htaccess" ./
fi

# Create a README for the production branch
echo "📄 Creating README for production branch..."
cat > README.md << 'EOL'
# GHR Properties Website - Production Branch

This branch contains the production-ready, statically generated website files for GHR Properties.

## Important Notes

- This branch is automatically generated from the `main` branch
- Do not make direct changes to this branch
- All changes should be made in the `main` branch

The site is built using Next.js with the content snapshot approach, which means:
- All property data is pre-rendered at build time
- No database dependencies in production
- Maximum performance and reliability
EOL

# Stage all changes
echo "➕ Staging changes to production branch..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit. Production branch is up to date."
else
  # Commit changes
  echo "💾 Committing changes to production branch..."
  git commit -m "Update static production build [skip ci]"

  # Push to remote
  echo "🚀 Pushing production branch to remote..."
  git push origin production
fi

# Switch back to original branch
echo "🔙 Switching back to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

# Restore stashed changes if any
if git stash list | grep -q "Stashed before updating production branch"; then
  echo "🔄 Restoring stashed changes..."
  git stash pop
fi

echo "✨ Done! The production branch has been updated with the latest static build."
echo "   You can now deploy this branch to your hosting provider." 