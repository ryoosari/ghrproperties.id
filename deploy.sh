#!/bin/bash

# Next.js Deployment Script for Bluehost with content snapshot
echo "Starting Next.js deployment to Bluehost..."

# Export content snapshot from Strapi
echo "Exporting content snapshot from Strapi..."
npm run export-data

# Build the Next.js application
echo "Building static site using snapshot data..."
NEXT_PUBLIC_STATIC_EXPORT=true npm run build

if [ ! -d "out" ]; then
  echo "Error: 'out' directory not found. Build may have failed."
  exit 1
fi

# Create a deployment zip file
echo "Creating deployment zip file..."
cd out
zip -r ../deploy.zip .
cd ..

# Add .htaccess to the zip
echo "Adding .htaccess to the zip..."
zip -j deploy.zip .htaccess

echo "Deployment package created: deploy.zip"
echo ""
echo "DEPLOYMENT INSTRUCTIONS:"
echo "1. Upload deploy.zip to your Bluehost public_html directory"
echo "2. Extract the zip file in the public_html directory"
echo "3. Verify file permissions (files: 644, directories: 755)"
echo "4. Test your site by visiting your domain"
echo ""
echo "For subdirectory deployment:"
echo "If your files are in a subdirectory (like ghrproperties.id), either:"
echo "- Move all files to the main public_html directory, or"
echo "- Set up domain pointing in cPanel to the subdirectory"
echo ""
echo "Deployment package ready!" 