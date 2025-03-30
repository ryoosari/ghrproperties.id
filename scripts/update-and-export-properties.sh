#!/bin/bash

# Script to update property slugs and then export updated properties
# This will fix existing properties to have proper slugs based on their titles

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting property slug update process...${NC}"

# Check if Strapi is running locally
curl -s http://localhost:1337 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error: Local Strapi server is not running!${NC}"
  echo -e "${YELLOW}ℹ️  Please start your Strapi server with 'cd strapi-backend && npm run develop'${NC}"
  exit 1
fi

# Check for required Node modules
if ! node -e "require('axios')" 2>/dev/null; then
  echo -e "${YELLOW}Installing required dependencies...${NC}"
  npm install axios dotenv
fi

# Run the slug update script
echo -e "${YELLOW}📝 Updating property slugs...${NC}"
node scripts/update-property-slugs.js

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error during slug update!${NC}"
  exit 1
fi

# Export the updated data
echo -e "${YELLOW}📦 Exporting updated property data...${NC}"
node scripts/export-strapi-data.mjs

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error during data export!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Process completed successfully!${NC}"
echo -e "${YELLOW}ℹ️  The updated properties with proper slugs have been exported.${NC}"
echo -e "${YELLOW}ℹ️  The URLs on your website should now use the property slugs.${NC}"