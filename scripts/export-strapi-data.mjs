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
import qs from 'qs';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_DIR = path.join(DATA_DIR, 'properties');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshot');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(PROPERTIES_DIR)) {
  fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
}

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
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
    
    // 2. Create normalized snapshot for static generation
    await createNormalizedSnapshot();
    
    // 3. Export Last Updated timestamp
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
    const query = {
      populate: '*',
      pagination: {
        limit: 100 // Adjust based on your needs
      }
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const response = await strapiClient.get(`/properties?${queryString}`);
    
    // Log the raw response to debug
    console.log('Raw Strapi response structure:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    const { data, meta } = response.data;
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ No properties data returned from Strapi');
      return;
    }
    
    // Track count
    stats.properties = data.length;
    console.log(`Found ${data.length} properties`);
    
    // Map the properties based on actual structure
    // Properties are returned as an array of objects with id and attributes
    const processedProperties = data.map(item => {
      // Extract the actual property data
      const property = {
        id: item.id,
        ...item.attributes
      };
      
      return property;
    });
    
    // Create property index file (with minimal data for listings)
    const propertyIndex = processedProperties.map(property => {
      // Extract just the essential fields for the index
      return {
        id: property.id,
        attributes: {
          title: property.Title || property.title || 'Untitled Property',
          slug: property.Slug || property.slug || `property-${property.id}`,
          status: property.Status || property.status || 'published',
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          price: property.Price || property.price || 0,
          propertyType: property.PropertyType || property.property_type || 'Property',
          // Include a minimal image reference if available
          image: property.Image && Array.isArray(property.Image) && property.Image.length > 0 
            ? property.Image[0].url 
            : null,
          // Include location info
          location: property.Location || property.location || 'Unknown location',
          // Include basic specs
          bedrooms: property.Bedrooms || property.bedrooms || 0,
          bathrooms: property.Bathrooms || property.bathrooms || 0,
          area: property.Area || property.area || property.square_footage || 0
        }
      };
    });
    
    // Write the property index file
    fs.writeFileSync(
      path.join(DATA_DIR, 'property-index.json'),
      JSON.stringify(propertyIndex, null, 2)
    );
    
    // Write the full properties collection (original data)
    fs.writeFileSync(
      path.join(DATA_DIR, 'properties.json'),
      JSON.stringify(data, null, 2)
    );
    
    // Also write the processed properties
    fs.writeFileSync(
      path.join(DATA_DIR, 'processed-properties.json'),
      JSON.stringify(processedProperties, null, 2)
    );
    
    // Write individual property files using processed properties
    processedProperties.forEach(property => {
      const slug = property.Slug || property.slug || `property-${property.id}`;
      
      fs.writeFileSync(
        path.join(DATA_DIR, `properties-${property.id}.json`),
        JSON.stringify(property, null, 2)
      );
      
      // Also store in properties directory
      fs.writeFileSync(
        path.join(PROPERTIES_DIR, `${slug}.json`),
        JSON.stringify(property, null, 2)
      );
    });
    
    console.log('✅ Properties export completed');
    
  } catch (error) {
    console.error('❌ Error exporting properties:', error);
    throw error;
  }
}

/**
 * Create a normalized snapshot of the data for static generation
 */
async function createNormalizedSnapshot() {
  console.log('\n📷 Creating normalized data snapshot...');
  
  try {
    // Load properties data
    const propertiesPath = path.join(DATA_DIR, 'processed-properties.json');
    
    if (!fs.existsSync(propertiesPath)) {
      console.warn('⚠️ No processed properties data found, skipping normalized snapshot');
      return;
    }
    
    const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    
    // Normalize the data structure to match what the components expect
    const normalizedProperties = propertiesData.map(property => {
      // Create a consistent property structure
      return {
        id: property.id,
        attributes: {
          title: property.Title || property.title || 'Untitled Property',
          slug: property.Slug || property.slug || `property-${property.id}`,
          description: property.Description || property.description || '',
          status: property.Status || property.status || 'published',
          price: property.Price || property.price || 0,
          property_type: property.PropertyType || property.property_type || 'Property',
          location: property.Location || property.location || 'Unknown location',
          bedrooms: property.Bedrooms || property.bedrooms || 0,
          bathrooms: property.Bathrooms || property.bathrooms || 0,
          area: property.Area || property.area || property.square_footage || 0,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          amenities: normalizeAmenities(property),
          featured_image: normalizeImage(property.Image || property.featured_image),
          images: normalizeImages(property.Image || property.images),
          published_at: property.publishedAt || property.published_at
        }
      };
    });
    
    // Write the normalized properties file
    fs.writeFileSync(
      path.join(SNAPSHOT_DIR, 'properties.json'),
      JSON.stringify(normalizedProperties, null, 2)
    );
    
    // Write individual normalized property files
    normalizedProperties.forEach(property => {
      fs.writeFileSync(
        path.join(SNAPSHOT_DIR, `property-${property.id}.json`),
        JSON.stringify(property, null, 2)
      );
      
      if (property.attributes.slug) {
        fs.writeFileSync(
          path.join(SNAPSHOT_DIR, `property-${property.attributes.slug}.json`),
          JSON.stringify(property, null, 2)
        );
      }
    });
    
    console.log(`✅ Created normalized snapshot with ${normalizedProperties.length} properties`);
    
  } catch (error) {
    console.error('❌ Error creating normalized snapshot:', error);
    throw error;
  }
}

/**
 * Normalize amenities data into a consistent format
 */
function normalizeAmenities(property) {
  const amenities = property.Amenities || property.amenities;
  
  if (!amenities) return [];
  
  // If it's already an array of strings, return as is
  if (Array.isArray(amenities) && typeof amenities[0] === 'string') {
    return amenities;
  }
  
  // If it's a Strapi data structure
  if (amenities && amenities.data && Array.isArray(amenities.data)) {
    return amenities.data.map(item => {
      return item.attributes?.name || item.attributes?.title || 'Unnamed Amenity';
    });
  }
  
  // Return empty array if we can't find amenities
  return [];
}

/**
 * Normalize primary image data
 */
function normalizeImage(imageData) {
  if (!imageData) return null;
  
  // If it's a URL string
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  // If it's an array of Strapi media objects
  if (Array.isArray(imageData) && imageData.length > 0) {
    const image = imageData[0];
    if (image.url) {
      return image.url.startsWith('/') ? `${STRAPI_URL}${image.url}` : image.url;
    }
  }
  
  // If it's a Strapi media relation
  if (imageData && imageData.data) {
    // Handle an array in data
    if (Array.isArray(imageData.data) && imageData.data.length > 0) {
      const { url } = imageData.data[0].attributes;
      return url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
    }
    
    // Handle single object in data
    if (imageData.data && imageData.data.attributes && imageData.data.attributes.url) {
      const { url } = imageData.data.attributes;
      return url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
    }
  }
  
  return null;
}

/**
 * Normalize multiple images data
 */
function normalizeImages(imagesData) {
  if (!imagesData) return [];
  
  // If it's an array of URL strings
  if (Array.isArray(imagesData) && typeof imagesData[0] === 'string') {
    return imagesData;
  }
  
  // If it's an array of Strapi media objects
  if (Array.isArray(imagesData)) {
    return imagesData.map(image => {
      if (image && image.url) {
        return image.url.startsWith('/') ? `${STRAPI_URL}${image.url}` : image.url;
      }
      return null;
    }).filter(Boolean);
  }
  
  // If it's a Strapi media relation
  if (imagesData && imagesData.data) {
    if (Array.isArray(imagesData.data)) {
      return imagesData.data.map(image => {
        if (image && image.attributes && image.attributes.url) {
          const { url } = image.attributes;
          return url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
        }
        return null;
      }).filter(Boolean);
    }
  }
  
  return [];
}

// Execute the main function
exportStrapiData().catch(error => {
  console.error('Unhandled error during export:', error);
  process.exit(1);
}); 