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
  baseURL: STRAPI_URL,
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
  
  // Start tracking counts
  const stats = { properties: 0 };
  
  try {
    // 1. Export Properties
    await exportProperties(stats);
    
    // 2. Create normalized snapshot for static generation
    await createNormalizedSnapshot();
    
  } catch (error) {
    console.error('❌ Error during export:', error);
    
    // Create empty files instead of exiting with error
    console.log('Creating empty fallback files...');
    
    // Create empty property files
    fs.writeFileSync(
      path.join(DATA_DIR, 'properties.json'),
      JSON.stringify([], null, 2)
    );
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'processed-properties.json'),
      JSON.stringify([], null, 2)
    );
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'property-index.json'),
      JSON.stringify([], null, 2)
    );
  } finally {
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
    
    console.log('\n✅ Strapi data export completed');
    console.log('Summary:');
    Object.entries(stats).forEach(([key, count]) => {
      console.log(`- ${key}: ${count} items`);
    });
  }
}

/**
 * Export properties data
 */
async function exportProperties(stats) {
  console.log('\n📋 Exporting properties...');
  
  try {
    // Check if we can connect to Strapi first
    try {
      const healthCheck = await strapiClient.get('/');
      console.log('✅ Successfully connected to Strapi API');
    } catch (error) {
      console.error(`❌ Could not connect to Strapi at ${STRAPI_URL}: ${error.message}`);
      console.log('API may be unavailable or credentials may be incorrect');
      throw new Error(`Strapi connection failed: ${error.message}`);
    }
    
    // Fetch all properties with full data
    const query = {
      populate: '*',
      pagination: {
        limit: 100 // Adjust based on your needs
      }
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    
    // Log all available API endpoints for debugging
    console.log('Checking available API endpoints...');
    try {
      const availableEndpoints = await strapiClient.get('/');
      console.log('Available API endpoints:', JSON.stringify(availableEndpoints.data, null, 2));
    } catch (error) {
      console.log('Could not retrieve API endpoints listing');
    }
    
    // Try both API endpoint formats to ensure we're hitting the right one
    console.log(`Requesting properties with query: /properties?${queryString}`);
    let response;
    
    try {
      // Standard properties endpoint
      response = await strapiClient.get(`/api/properties?${queryString}`);
      console.log('✅ Successfully fetched from /api/properties endpoint');
    } catch (error) {
      console.log(`Error fetching from /api/properties endpoint: ${error.message}`);
      
      try {
        // Try the singular endpoint format
        console.log(`Trying alternative endpoint: /api/property?${queryString}`);
        response = await strapiClient.get(`/api/property?${queryString}`);
        console.log('✅ Successfully fetched from /api/property endpoint');
      } catch (altError) {
        console.error(`Error fetching from alternative endpoint: ${altError.message}`);
        throw new Error('Failed to fetch properties from any known endpoint');
      }
    }
    
    // Log the raw response structure for debugging
    const firstPartOfResponse = JSON.stringify(response.data, null, 2).substring(0, 500);
    console.log(`Raw Strapi response structure (first 500 chars): ${firstPartOfResponse}...`);
    
    const { data, meta } = response.data;
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ No properties data returned from Strapi');
      stats.properties = 0;
      return;
    }
    
    // Track count
    stats.properties = data.length;
    console.log(`Found ${data.length} properties`);
    
    // Create required directories if they don't exist
    if (!fs.existsSync(PROPERTIES_DIR)) {
      fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
    }
    
    // Map the properties based on actual structure
    // Properties are returned as an array of objects with id and attributes
    const processedProperties = data.map(item => {
      // Extract the actual property data
      const property = {
        id: item.id,
        // Include all top-level fields from the response
        ...item,
        // But also include any attributes if present
        ...(item.attributes || {})
      };
      
      // Log the property structure
      console.log(`Property ${item.id} structure:`, JSON.stringify(property, null, 2).substring(0, 200) + '...');
      
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
          slug: `property-${property.id}`,
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
          published_at: property.publishedAt || property.published_at,
          // Add documentId since it's in our data
          documentId: property.documentId || ''
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
  
  // If it's an array of Strapi media objects (the structure we're seeing)
  if (Array.isArray(imageData) && imageData.length > 0) {
    const image = imageData[0];
    if (image.url) {
      return image.url.startsWith('/') ? `${STRAPI_URL}${image.url}` : image.url;
    }
    
    // Handle the structure we're seeing in the current data
    if (image.formats && image.formats.medium && image.formats.medium.url) {
      return image.formats.medium.url.startsWith('/') ? `${STRAPI_URL}${image.formats.medium.url}` : image.formats.medium.url;
    }
    
    // Fallback to thumbnail if available
    if (image.formats && image.formats.thumbnail && image.formats.thumbnail.url) {
      return image.formats.thumbnail.url.startsWith('/') ? `${STRAPI_URL}${image.formats.thumbnail.url}` : image.formats.thumbnail.url;
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
exportStrapiData()
  .then(() => {
    // Check if we should auto-commit data changes
    if (process.env.AUTO_COMMIT === 'true') {
      console.log('\n🔄 Running auto-commit for data changes...');
      
      // Use dynamic import() for ESM/CommonJS compatibility
      import('child_process').then(({ execSync }) => {
        try {
          execSync('node scripts/auto-commit-data.js', { 
            stdio: 'inherit' 
          });
        } catch (error) {
          console.error('Error running auto-commit script:', error);
        }
      });
    }
  })
  .catch(error => {
    console.error('Unhandled error during export:', error);
    process.exit(1);
  }); 