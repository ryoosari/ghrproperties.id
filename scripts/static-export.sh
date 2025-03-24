#!/bin/bash

# Static Export Script
# This script temporarily removes dynamic routes for static export

echo "🚀 Starting static export process..."

# Check if the properties/[slug] directory exists
if [ -d "src/app/properties/[slug]" ]; then
  echo "📂 Temporarily disabling dynamic routes for static export..."
  
  # Create backup directory
  mkdir -p src/app/.temp
  
  # Move the dynamic route folder
  mv src/app/properties/[slug] src/app/.temp/slug_backup
  
  echo "✅ Dynamic routes temporarily disabled"
else
  echo "⚠️ Dynamic routes folder not found, proceeding without changes"
fi

# Run the static export
echo "🔨 Building static export..."
NEXT_PUBLIC_STATIC_EXPORT=true next build

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ Static export build completed successfully"
else
  echo "❌ Static export build failed"
fi

# Restore the dynamic route folder if backup exists
if [ -d "src/app/.temp/slug_backup" ]; then
  echo "🔄 Restoring dynamic routes..."
  
  # Ensure the destination directory exists
  mkdir -p src/app/properties
  
  # Move the dynamic route folder back
  mv src/app/.temp/slug_backup src/app/properties/[slug]
  
  # Remove the temp directory if empty
  rmdir src/app/.temp 2>/dev/null || true
  
  echo "✅ Dynamic routes restored"
fi

echo "🎉 Static export process complete"
echo "   Output is available in the 'out' directory" 