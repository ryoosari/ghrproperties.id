#!/bin/bash

# Static Export Script
# This script builds a static export of the Next.js application

echo "🚀 Starting static export process..."

# Export data from Strapi if not already exported
if [ ! -f "data/processed-properties.json" ] || [ ! -s "data/processed-properties.json" ]; then
  echo "📂 No property data found or empty file. Running data export..."
  npm run export-data
else
  echo "✅ Using existing exported data"
fi

# Run the static export
echo "🔨 Building static export..."
NEXT_PUBLIC_STATIC_EXPORT=true next build

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ Static export build completed successfully"
else
  echo "❌ Static export build failed"
  exit 1
fi

echo "🎉 Static export process complete"
echo "   Output is available in the 'out' directory" 