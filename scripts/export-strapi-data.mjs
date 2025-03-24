#!/usr/bin/env node

/**
 * Export Strapi Data to Static JSON Files
 * 
 * This script fetches data from Strapi and exports it as static JSON files
 * that can be used during the Next.js static site generation build process.
 * 
 * Usage:
 *   node scripts/export-strapi-data.mjs
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_DIR = path.join(DATA_DIR, 'properties');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(PROPERTIES_DIR)) {
  fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
}

// Create a configured axios instance for Strapi
const strapiClient = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: STRAPI_API_TOKEN 
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    : {}
});

/**
 * Main export function
 */
async function exportStrapiData() {
  const now = new Date();
  console.log(`🚀 Starting Strapi data export at ${now.toISOString()}`);
  console.log(`Using Strapi URL: ${STRAPI_URL}`);
  
  try {
    // Start tracking counts
    const stats = { properties: 0 };
    
    // 1. Export Properties
    await exportProperties(stats);
    
    // 2. Export Last Updated timestamp
    const metadata = {
      exportedAt: now.toISOString(),
      stats,
      source: STRAPI_URL
    };
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'last-updated.json'), 
      JSON.stringify({ lastUpdated: now.toISOString() }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'metadata.json'), 
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('\n✅ Strapi data export completed successfully');
    console.log('Summary:');
    Object.entries(stats).forEach(([key, count]) => {
      console.log(`- ${key}: ${count} items`);
    });
    
  } catch (error) {
    console.error('❌ Error during export:', error);
    process.exit(1);
  }
}

/**
 * Export properties data
 */
async function exportProperties(stats) {
  console.log('\n📋 Exporting properties...');
  
  try {
    // Fetch all properties with full data
    const response = await strapiClient.get('/properties', {
      params: {
        populate: 'deep,10', // Get all nested data
        pagination: {
          limit: 100 // Adjust based on your needs
        }
      }
    });
    
    const { data, meta } = response.data;
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ No properties data returned from Strapi');
      return;
    }
    
    // Track count
    stats.properties = data.length;
    console.log(`Found ${data.length} properties`);
    
    // Create property index file (with minimal data for listings)
    const propertyIndex = data.map(property => {
      const { id, attributes } = property;
      
      // Extract just the essential fields for the index
      return {
        id,
        attributes: {
          title: attributes.title,
          slug: attributes.slug,
          status: attributes.status,
          createdAt: attributes.createdAt,
          updatedAt: attributes.updatedAt,
          price: attributes.price,
          propertyType: attributes.propertyType,
          // Include a minimal image reference if available
          thumbnail: attributes.images?.data?.[0] ? {
            data: {
              attributes: {
                url: attributes.images.data[0].attributes.url
              }
            }
          } : null,
          // Include location info
          location: attributes.location?.address 
            ? `${attributes.location.city}, ${attributes.location.state}` 
            : undefined,
          // Include basic specs
          bedrooms: attributes.specifications?.bedrooms,
          bathrooms: attributes.specifications?.bathrooms,
          area: attributes.specifications?.totalArea
        }
      };
    });
    
    // Write the property index file
    fs.writeFileSync(
      path.join(DATA_DIR, 'property-index.json'),
      JSON.stringify(propertyIndex, null, 2)
    );
    
    // Write the full properties collection
    fs.writeFileSync(
      path.join(DATA_DIR, 'properties.json'),
      JSON.stringify(data, null, 2)
    );
    
    // Write individual property files
    data.forEach(property => {
      fs.writeFileSync(
        path.join(DATA_DIR, `properties-${property.id}.json`),
        JSON.stringify(property, null, 2)
      );
      
      // Also store in properties directory
      fs.writeFileSync(
        path.join(PROPERTIES_DIR, `${property.attributes.slug}.json`),
        JSON.stringify(property, null, 2)
      );
    });
    
    console.log('✅ Properties export completed');
    
  } catch (error) {
    console.error('❌ Error exporting properties:', error);
    throw error;
  }
}

// Execute the main function
exportStrapiData().catch(error => {
  console.error('Unhandled error during export:', error);
  process.exit(1);
}); 