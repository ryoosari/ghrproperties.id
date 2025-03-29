#!/bin/bash

# Export and Push Strapi Data
# This script exports data from Strapi and pushes it to GitHub in one step

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting Strapi data export process...${NC}"

# Check if Strapi is running locally
curl -s http://localhost:1337 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error: Local Strapi server is not running!${NC}"
  echo -e "${YELLOW}ℹ️  Please start your Strapi server with 'cd strapi-backend && npm run develop'${NC}"
  exit 1
fi

# Check if API token is set
if [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  Warning: NEXT_PUBLIC_STRAPI_API_TOKEN is not set. Using default configuration.${NC}"
fi

# Export data from Strapi
echo -e "${YELLOW}📦 Exporting data from Strapi...${NC}"
node scripts/export-strapi-data.mjs

# Check if export was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error during data export!${NC}"
  exit 1
fi

# Stage changes
echo -e "${YELLOW}📋 Staging changes...${NC}"
git add data/

# Check if there are any changes to commit
if git diff --staged --quiet; then
  echo -e "${YELLOW}ℹ️  No changes detected in data files. Nothing to commit.${NC}"
  echo -e "${GREEN}✅ Process completed successfully!${NC}"
  exit 0
fi

# Show what's being committed
echo -e "${YELLOW}📊 Changes to be committed:${NC}"
git diff --staged --stat

# Commit with timestamp
DATE=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="Update Strapi data export - ${DATE} [Manual]"

echo -e "${YELLOW}💾 Committing changes with message: \"${COMMIT_MSG}\"${NC}"
git commit -m "${COMMIT_MSG}"

# Push to GitHub
echo -e "${YELLOW}🚀 Pushing changes to GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Data export, commit, and push completed successfully!${NC}"