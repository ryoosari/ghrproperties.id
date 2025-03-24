#!/bin/bash

# Fix Data Directory Permissions
# This script ensures proper permissions for the data directory and files

echo "🔒 Fixing permissions for data directory and files..."

# Ensure data directories exist
mkdir -p data/properties data/snapshot

# Set directory permissions
chmod -R 755 data/
find data/ -type d -exec chmod 755 {} \;
find data/ -type f -exec chmod 644 {} \;

echo "✅ Permissions fixed successfully!"
echo "Directory structure:"
ls -la data/

# Show data file contents summary
if [ -f "data/metadata.json" ]; then
  echo "📊 Metadata:"
  cat data/metadata.json
fi

if [ -f "data/property-index.json" ]; then
  echo "📋 Property count:"
  echo -n "There are "
  jq 'length' data/property-index.json
  echo " properties in the index."
else
  echo "⚠️ property-index.json not found or empty!"
fi

echo "🔍 Checking for .htaccess file:"
if [ -f ".htaccess" ]; then
  echo "✅ .htaccess exists"
  cat .htaccess | head -5
  echo "... (truncated)"
else
  echo "❌ .htaccess missing!"
fi 