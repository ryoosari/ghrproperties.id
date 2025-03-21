#!/bin/bash

# Script to build the Next.js app and update the production branch with ONLY the built files
# This creates a clean production branch with just the files needed for deployment

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
  # Remove all files from staging
  git rm -rf --cached .
fi

# Clean the working directory (remove all files)
echo "🧹 Cleaning production branch..."
# Keep only .git directory
find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \;

# Copy the new files from temporary directory to root
echo "📋 Copying built files to production branch root..."
cp -R "$TMP_DIR"/. ./
rm -rf "$TMP_DIR"

# Get .cpanel.yml from main branch
echo "📄 Adding .cpanel.yml from main branch..."
git checkout main -- .cpanel.yml

# Add all files to git
echo "➕ Staging all files in production branch..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit. Production branch is up to date."
else
  # Commit changes
  echo "💾 Committing changes to production branch..."
  git commit -m "Update production with static files from $CURRENT_BRANCH branch"

  # Push to remote
  echo "🚀 Pushing production branch to remote..."
  git push -u origin production
fi

# Switch back to original branch
echo "🔙 Switching back to $CURRENT_BRANCH branch..."
git checkout $CURRENT_BRANCH

# Restore stashed changes if any
if git stash list | grep -q "Stashed before updating production branch"; then
  echo "🔄 Restoring stashed changes..."
  git stash pop
fi

echo "✨ Done! The production branch has been updated with only the static files at the root level."
echo "   You can now pull this branch in cPanel using Git Version Control." 