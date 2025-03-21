#!/bin/bash

# Script to deploy the API files to Bluehost for ghrproperties.id
# Usage: ./deploy-api.sh username@your-bluehost-server.com

# Check if hostname was provided
if [ -z "$1" ]; then
  echo "Usage: ./deploy-api.sh avidityi@162.241.225.189"
  echo "This script will deploy API files to the ghrproperties.id directory on your Bluehost server."
  exit 1
fi

REMOTE_HOST=$1
API_DIR="api"
CREDENTIALS_FILE="db-credentials.php"
REMOTE_PUBLIC_HTML="public_html/ghrproperties.id"
REMOTE_HOME_DIR="~"

echo "🚀 Deploying API files to $REMOTE_HOST..."

# First, deploy the credentials file to the home directory
echo "📦 Deploying database credentials file to home directory..."
scp "$CREDENTIALS_FILE" "$REMOTE_HOST:$REMOTE_HOME_DIR/"

# Set proper permissions for the credentials file
echo "🔒 Setting secure permissions on credentials file..."
ssh "$REMOTE_HOST" "chmod 600 $REMOTE_HOME_DIR/$CREDENTIALS_FILE"

# Create the API directory if it doesn't exist
echo "📁 Ensuring API directory exists..."
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_PUBLIC_HTML/$API_DIR"

# Deploy all API files
echo "📦 Deploying API files..."
scp -r "$API_DIR"/* "$REMOTE_HOST:$REMOTE_PUBLIC_HTML/$API_DIR/"

# Set proper permissions for API files
echo "🔒 Setting permissions on API files..."
ssh "$REMOTE_HOST" "chmod 644 $REMOTE_PUBLIC_HTML/$API_DIR/*.php && chmod 644 $REMOTE_PUBLIC_HTML/$API_DIR/.htaccess"

echo "✅ Deployment complete!"
echo ""
echo "🌐 You can now test your API at:"
echo "   https://ghrproperties.id/api/db-test.php"

exit 0 