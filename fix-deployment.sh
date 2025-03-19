#!/bin/bash

# Fix deployment script for ghrproperties.id
echo "Fixing deployment for ghrproperties.id..."

# Build the Next.js application
echo "Building Next.js application..."
npm run build

if [ ! -d "out" ]; then
  echo "Error: 'out' directory not found. Build may have failed."
  exit 1
fi

# Copy main .htaccess to the root directory
echo "Copying main .htaccess to the build output..."
cp .htaccess out/

# Create specific .htaccess for the /out directory
echo "Creating redirect .htaccess for /out directory..."
cat > out/.htaccess << 'EOL'
# Simple .htaccess for /out directory
Options +FollowSymLinks
RewriteEngine On
RewriteBase /out/

# Redirect everything in /out to the root directory
RewriteRule ^(.*)$ /$1 [R=301,L]
EOL

# Add diagnostic files
echo "Copying diagnostic files..."
cp test.php out/
cp test.html out/
cp docroot-check.php out/

# Create redirect for /out directory
echo "Creating redirect for /out directory..."
cat > out/index.php << 'EOL'
<?php
// Redirect from /out directory to the main directory
header('Location: /');
exit;
?>
EOL

# Set file permissions
echo "Setting file permissions..."
find out -type f -exec chmod 644 {} \;
find out -type d -exec chmod 755 {} \;
chmod 644 out/.htaccess

# Stage files for commit
echo "Staging files for commit..."
git add -f out/
git add .htaccess
git add .cpanel.yml
git add test.php
git add test.html
git add docroot-check.php

echo ""
echo "Fix deployment preparation complete."
echo "To complete the process:"
echo "1. Commit the changes: git commit -m 'Fix deployment with simplified .htaccess'"
echo "2. Push to GitHub: git push"
echo ""
echo "After pushing, the site should be properly deployed." 