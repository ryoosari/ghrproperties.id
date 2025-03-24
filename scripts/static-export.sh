#!/bin/bash

# Static Export Script
# This script builds a static export of the Next.js application

echo "🚀 Starting static export process..."

# Ensure data directories exist
mkdir -p data/properties data/snapshot

# Check for pre-committed data files first, then try to export data from Strapi
if [ ! -f "data/processed-properties.json" ] || [ ! -s "data/processed-properties.json" ]; then
  echo "📂 No property data found or empty file. Attempting to export data..."
  
  # Check for required environment variables
  if [ -z "$NEXT_PUBLIC_STRAPI_URL" ] || [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
    echo "⚠️ NEXT_PUBLIC_STRAPI_URL or NEXT_PUBLIC_STRAPI_API_TOKEN not set"
    echo "⚠️ Creating fallback empty data files instead of attempting to export"
    
    # Create empty processed-properties.json
    echo "[]" > data/processed-properties.json
    
    # Create empty property-index.json
    echo "[]" > data/property-index.json
    
    # Create empty properties.json
    echo "[]" > data/properties.json
    
    # Create metadata.json with current timestamp
    echo "{\"exportedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"stats\": {\"properties\": 0}, \"source\": \"fallback\"}" > data/metadata.json
    
    # Create last-updated.json
    echo "{\"lastUpdated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > data/last-updated.json
  else
    # Try to run export data, but continue with empty data if it fails
    npm run export-data || {
      echo "⚠️ Strapi export failed, creating fallback empty data files"
      
      # Create empty processed-properties.json
      echo "[]" > data/processed-properties.json
      
      # Create empty property-index.json
      echo "[]" > data/property-index.json
      
      # Create empty properties.json
      echo "[]" > data/properties.json
      
      # Create metadata.json with current timestamp
      echo "{\"exportedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"stats\": {\"properties\": 0}, \"source\": \"fallback\"}" > data/metadata.json
      
      # Create last-updated.json
      echo "{\"lastUpdated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > data/last-updated.json
    }
  fi
else
  echo "✅ Using existing pre-committed data files"
  
  # Show data summary
  if [ -f "data/metadata.json" ]; then
    echo "📊 Data summary:"
    cat data/metadata.json
  fi
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