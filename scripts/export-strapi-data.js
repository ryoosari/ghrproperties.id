#!/usr/bin/env node

/**
 * Strapi Content Snapshot Exporter
 * 
 * This script exports content from Strapi CMS to JSON files
 * that can be used for static site generation without a database.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp');

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;
const OUTPUT_DIR = path.join(process.cwd(), 'data');

// Content types to export (add or remove as needed)
const contentTypes = [
  'properties',
  'categories',
  'agents',
  'testimonials',
  'pages',
  'settings'
];

// Create output directory
mkdirp.sync(OUTPUT_DIR);

// Helper to create API client with proper headers
const createApiClient = () => {
  const client = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: API_TOKEN 
      ? { Authorization: `Bearer ${API_TOKEN}` }
      : {}
  });
  return client;
};

// Export a single collection
async function exportCollection(client, contentType) {
  console.log(`Exporting ${contentType}...`);
  
  try {
    // Get all items with pagination (100 items per page)
    let page = 1;
    let allItems = [];
    let hasMore = true;
    
    while (hasMore) {
      const response = await client.get(`/${contentType}`, {
        params: {
          populate: '*',
          pagination: {
            page,
            pageSize: 100
          }
        }
      });
      
      const { data, meta } = response.data;
      
      if (!data || !Array.isArray(data)) {
        console.log(`Warning: Unexpected response format for ${contentType}`);
        hasMore = false;
        continue;
      }
      
      allItems = [...allItems, ...data];
      
      // Check if there are more pages
      const { pagination } = meta || {};
      hasMore = pagination && pagination.page < pagination.pageCount;
      page++;
    }
    
    // Save each item to its own file for easy lookup
    for (const item of allItems) {
      const itemPath = path.join(OUTPUT_DIR, `${contentType}-${item.id}.json`);
      fs.writeFileSync(itemPath, JSON.stringify(item, null, 2));
    }
    
    // Also save the entire collection to a single file
    const collectionPath = path.join(OUTPUT_DIR, `${contentType}.json`);
    fs.writeFileSync(collectionPath, JSON.stringify(allItems, null, 2));
    
    console.log(`✅ Exported ${allItems.length} ${contentType}`);
    
    // For properties, create an index file for faster lookup
    if (contentType === 'properties') {
      const index = allItems.map(item => ({
        id: item.id,
        attributes: {
          slug: item.attributes.slug,
          title: item.attributes.title,
          status: item.attributes.status,
          updatedAt: item.attributes.updatedAt
        }
      }));
      
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'property-index.json'),
        JSON.stringify(index, null, 2)
      );
      console.log(`✅ Created property index`);
    }
    
    return allItems.length;
  } catch (error) {
    console.error(`Error exporting ${contentType}:`, error.message);
    return 0;
  }
}

// Export all configured content types
async function exportAllContent() {
  console.log('🚀 Starting Strapi content export...');
  console.log(`Using Strapi URL: ${STRAPI_URL}`);
  console.log(`API Token: ${API_TOKEN ? 'Configured' : 'Not configured'}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('-----------------------------------');
  
  const client = createApiClient();
  const stats = {};
  
  for (const contentType of contentTypes) {
    stats[contentType] = await exportCollection(client, contentType);
  }
  
  // Create a metadata file with export information
  const metadata = {
    exportedAt: new Date().toISOString(),
    stats,
    source: STRAPI_URL
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('-----------------------------------');
  console.log('📊 Export Summary:');
  Object.entries(stats).forEach(([type, count]) => {
    console.log(`${type}: ${count} items`);
  });
  console.log('-----------------------------------');
  console.log('✅ Content export complete!');
}

// Run the export
exportAllContent()
  .then(() => {
    console.log('-----------------------------------');
    console.log('🔧 Running slug consistency fix...');
    // Run the fix-property-slugs script to ensure consistent slugs
    try {
      require('child_process').execSync('node scripts/fix-property-slugs.js', { 
        stdio: 'inherit'
      });
      console.log('✅ Slug consistency fix completed');
    } catch (error) {
      console.error('Error running slug fix script:', error);
    }
    console.log('-----------------------------------');
    console.log('✅ Export process complete!');
  })
  .catch(error => {
    console.error('Export failed:', error);
    process.exit(1);
  }); 