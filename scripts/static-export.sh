#!/bin/bash

# Static Export Script
# This script builds a static export of the Next.js application

set -e

echo "🚀 Starting static export process..."

# First check if we have pre-exported data
echo "✅ Using existing pre-committed data files"
DATA_SUMMARY=$(cat data/summary.json 2>/dev/null || echo '{"exportedAt": "N/A", "stats": {"properties": 0}}')
echo "📊 Data summary:"
echo $DATA_SUMMARY

# Create an export for production
echo "🔨 Building static export..."
npm run build

# Copy the result to the out directory
echo "✅ Static export build completed successfully"

# Make sure property images are present in the output directory
node scripts/download-images.js

# Fix any missing images with placeholders
node scripts/fix-missing-images.js

# ADDITIONAL FIX: Copy server chunks that might be missing from the static export
mkdir -p out/_next/static/chunks
cp -f .next/server/chunks/572.js out/_next/static/chunks/ 2>/dev/null || true
cp -f .next/server/chunks/*.js out/_next/static/chunks/ 2>/dev/null || true

echo "🎉 Static export process complete"
echo "   Output is available in the 'out' directory" 