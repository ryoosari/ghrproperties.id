#!/bin/bash

# Build and commit script for Next.js static export with content snapshot
echo "Building Next.js application for deployment..."

# Export content snapshot from Strapi
echo "Exporting content snapshot from Strapi..."
npm run export-data

# Build the Next.js application with static export enabled
echo "Building static site using snapshot data..."
NEXT_PUBLIC_STATIC_EXPORT=true npm run build

if [ ! -d "out" ]; then
  echo "Error: 'out' directory not found. Build may have failed."
  exit 1
fi

# Copy .htaccess to the out directory
echo "Copying .htaccess to the build output..."
cp .htaccess out/

# Add the out directory to git
echo "Adding build files to git..."
git add -f out/
git add .htaccess
git add data/

echo ""
echo "Build complete and files staged for commit."
echo "Now you can:"
echo "1. Review the changes with 'git status'"
echo "2. Commit with 'git commit -m \"Your commit message\"'"
echo "3. Push to GitHub with 'git push'"
echo ""
echo "After pushing, GitHub will deploy to your Bluehost server." 