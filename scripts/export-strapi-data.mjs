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

// Log configuration details for debugging
console.log(`\nExport Configuration:`);
console.log(`- Strapi URL: ${STRAPI_URL}`);
console.log(`- API Token: ${STRAPI_API_TOKEN ? 'Provided' : 'Not provided'}`);
console.log(`- Data Directory: ${DATA_DIR}`);
console.log();

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
    // Clean up old property files to prevent stale data
    console.log('🧹 Cleaning up old property files...');
    cleanupOldPropertyFiles();
    
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
    
    // Try all possible endpoint formats to ensure we're hitting the right one
    console.log(`Requesting properties with query parameters: ${queryString}`);
    let response;
    let endpoints = [
      `/api/properties?${queryString}`,
      `/api/property?${queryString}`,
      `/properties?${queryString}`, 
      `/property?${queryString}`,
    ];
    
    let success = false;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await strapiClient.get(endpoint);
        console.log(`✅ Successfully fetched from ${endpoint}`);
        
        // Verify the response has the expected data structure
        if (response.data && (response.data.data || Array.isArray(response.data))) {
          success = true;
          console.log(`Found valid data structure in response`);
          break;
        } else {
          console.log(`Response doesn't contain expected data structure, trying next endpoint...`);
        }
      } catch (error) {
        console.log(`Error fetching from endpoint ${endpoint}: ${error.message}`);
        
        if (error.response) {
          console.log(`Status: ${error.response.status}, ${error.response.statusText}`);
        }
      }
    }
    
    if (!success) {
      console.error(`Failed to fetch properties from any known endpoint`);
      console.error(`This could be due to missing authentication, network issues, or incorrect URL`);
      console.error(`If you have added properties in Strapi, make sure they're published and accessible`);
      
      // Instead of failing completely, create empty data files
      console.log(`Creating empty properties files to handle the no-data scenario correctly...`);
      response = { data: { data: [] } }; // Empty data structure
    }
    
    // Log the raw response structure for debugging
    const firstPartOfResponse = JSON.stringify(response.data, null, 2).substring(0, 500);
    console.log(`Raw Strapi response structure (first 500 chars): ${firstPartOfResponse}...`);
    
    // Handle different response formats (Strapi v4 vs v3 or other formats)
    let data = [];
    let meta = {};
    
    // Check response format and extract data accordingly
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Standard Strapi v4 format with data and meta
      data = response.data.data;
      meta = response.data.meta || {};
      console.log('Using Strapi v4 response format (data + meta)');
    } else if (Array.isArray(response.data)) {
      // Direct array format
      data = response.data;
      console.log('Using direct array response format');
    } else if (response.data && Array.isArray(response.data.results)) {
      // Some APIs use a results array
      data = response.data.results;
      meta = response.data.pagination || {};
      console.log('Using results array response format');
    } else {
      console.warn('⚠️ Unrecognized response format from Strapi');
      if (response.data) {
        console.log('Response data keys:', Object.keys(response.data));
      }
      data = [];
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
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
      // Helper function to generate a slug from title if needed
      const generateSlug = (text) => {
        if (!text) return '';
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')           // Replace spaces with -
          .replace(/&/g, '-and-')         // Replace & with 'and'
          .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
          .replace(/\-\-+/g, '-')         // Replace multiple - with single -
          .replace(/^-+/, '')             // Trim - from start
          .replace(/-+$/, '');            // Trim - from end
      };
      
      // Get title and determine the correct slug
      const title = property.Title || property.title || 'Untitled Property';
      let slug = property.Slug || property.slug;
      
      // If no slug is available or it's using a default/generic format, generate one from the title
      if (!slug || slug === 'property' || slug === `property-${property.id}`) {
        slug = generateSlug(title);
        console.log(`Generated slug for property index #${property.id}: "${title}" -> "${slug}"`);
      }
      
      // Extract just the essential fields for the index
      return {
        id: property.id,
        attributes: {
          title: title,
          slug: slug,
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
    
    // Track which files we're creating so we know which ones to keep
    const currentPropertyFiles = new Set();
    
    // Write individual property files using processed properties
    processedProperties.forEach(property => {
      const slug = property.Slug || property.slug || `property-${property.id}`;
      
      // Use slug for naming the files instead of property-id format
      const slugFilePathInDataDir = path.join(DATA_DIR, `${slug}.json`);
      const slugFilePath = path.join(PROPERTIES_DIR, `${slug}.json`);
      
      // Add to our tracking set
      currentPropertyFiles.add(slugFilePathInDataDir);
      currentPropertyFiles.add(slugFilePath);
      
      // Use slug for the main file in data directory
      fs.writeFileSync(
        slugFilePathInDataDir,
        JSON.stringify(property, null, 2)
      );
      
      // Also store in properties directory
      fs.writeFileSync(
        slugFilePath,
        JSON.stringify(property, null, 2)
      );
      
      // For backward compatibility, still create a properties-id.json file
      // but add a note that this is being deprecated
      const idFilePath = path.join(DATA_DIR, `properties-${property.id}.json`);
      currentPropertyFiles.add(idFilePath);
      
      const propertyWithNote = {
        ...property,
        _note: "This ID-based filename is deprecated. Use the slug-based filename instead."
      };
      
      fs.writeFileSync(
        idFilePath,
        JSON.stringify(propertyWithNote, null, 2)
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
    // Clean up old snapshot files first
    cleanupSnapshotFiles();
    
    // Load properties data
    const propertiesPath = path.join(DATA_DIR, 'processed-properties.json');
    
    if (!fs.existsSync(propertiesPath)) {
      console.warn('⚠️ No processed properties data found, skipping normalized snapshot');
      return;
    }
    
    const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    
    // Helper function to generate a slug from title if needed
    const generateSlug = (text) => {
      if (!text) return '';
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
    };
    
    // Normalize the data structure to match what the components expect
    const normalizedProperties = propertiesData.map(property => {
      // Determine the slug - use the one from Strapi if it exists, otherwise generate one
      const title = property.Title || property.title || 'Untitled Property';
      let slug = property.Slug || property.slug;
      
      // If no slug is available, generate one from the title
      if (!slug || slug === 'property' || slug === `property-${property.id}`) {
        slug = generateSlug(title);
        console.log(`Generated slug for property #${property.id}: "${title}" -> "${slug}"`);
      }
      
      // Create a consistent property structure
      return {
        id: property.id,
        attributes: {
          title: title,
          slug: slug,
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
    
    // Track which snapshot files we're creating to keep track of current data
    const currentSnapshotFiles = new Set();
    
    // Write individual normalized property files
    normalizedProperties.forEach(property => {
      // Get the slug from attributes
      const slug = property.attributes.slug;
      
      // Create the slug-based filename
      const slugFilePath = path.join(SNAPSHOT_DIR, `${slug}.json`);
      currentSnapshotFiles.add(slugFilePath);
      
      // Write the file with slug-based filename
      fs.writeFileSync(
        slugFilePath,
        JSON.stringify(property, null, 2)
      );
      
      // For backward compatibility, also create property-id.json and property-slug.json files
      // but with a note about deprecation
      const propertyWithNote = {
        ...property,
        _note: "This file naming format is deprecated. Please use the slug-based filename format instead."
      };
      
      // Create property-id.json
      const idFilePath = path.join(SNAPSHOT_DIR, `property-${property.id}.json`);
      currentSnapshotFiles.add(idFilePath);
      fs.writeFileSync(
        idFilePath,
        JSON.stringify(propertyWithNote, null, 2)
      );
      
      // Create property-slug.json
      if (slug) {
        const oldSlugFilePath = path.join(SNAPSHOT_DIR, `property-${slug}.json`);
        currentSnapshotFiles.add(oldSlugFilePath);
        fs.writeFileSync(
          oldSlugFilePath,
          JSON.stringify(propertyWithNote, null, 2)
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

/**
 * Clean up snapshot files to ensure they match current Strapi data
 */
function cleanupSnapshotFiles() {
  try {
    // Check if snapshot directory exists
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      console.log('Snapshot directory does not exist, nothing to clean up');
      return;
    }
    
    // Get the processed properties as reference (if available)
    let processedProperties = [];
    const processedPropertiesPath = path.join(DATA_DIR, 'processed-properties.json');
    
    if (fs.existsSync(processedPropertiesPath)) {
      try {
        processedProperties = JSON.parse(fs.readFileSync(processedPropertiesPath, 'utf8'));
        console.log(`Using ${processedProperties.length} properties from processed-properties.json as reference`);
      } catch (error) {
        console.warn(`Warning: Could not parse processed-properties.json: ${error.message}`);
        // Continue with empty array if file can't be parsed
      }
    }
    
    // Create sets of valid IDs and slugs
    const validIds = new Set(processedProperties.map(p => p.id));
    const validSlugs = new Set(processedProperties.map(p => 
      p.Slug || p.slug || `property-${p.id}`
    ));
    
    // Get all files in the snapshot directory
    const snapshotFiles = fs.readdirSync(SNAPSHOT_DIR).filter(file => file.endsWith('.json'));
    console.log(`Found ${snapshotFiles.length} files in snapshot directory`);
    
    // Keep main properties.json file
    const propertiesToKeep = new Set(['properties.json']);
    
    // Keep files that match valid IDs and slugs
    let removedFiles = 0;
    
    snapshotFiles.forEach(file => {
      // Skip properties.json master file
      if (file === 'properties.json') {
        return;
      }
      
      let shouldKeep = false;
      
      // Check if file matches id pattern (property-123.json)
      const idMatch = file.match(/^property-(\d+)\.json$/);
      if (idMatch) {
        const id = parseInt(idMatch[1], 10);
        if (validIds.has(id)) {
          shouldKeep = true;
        }
      }
      
      // Check if file matches old slug pattern (property-slug-name.json)
      const oldSlugMatch = file.match(/^property-(.+)\.json$/);
      if (oldSlugMatch && !idMatch) { // Only if it's not an ID file (already checked)
        const slug = oldSlugMatch[1];
        if (validSlugs.has(slug)) {
          shouldKeep = true;
        }
      }
      
      // Check if file matches new slug pattern (just-the-slug.json)
      if (file.endsWith('.json') && !idMatch && !oldSlugMatch) {
        const slug = file.replace(/\.json$/, '');
        if (validSlugs.has(slug)) {
          shouldKeep = true;
        }
      }
      
      // Remove if not in our keep list
      if (!shouldKeep) {
        const filePath = path.join(SNAPSHOT_DIR, file);
        console.log(`Removing stale snapshot file: ${filePath}`);
        fs.unlinkSync(filePath);
        removedFiles++;
      }
    });
    
    console.log(`Cleaned up ${removedFiles} stale files from snapshot directory`);
    
  } catch (error) {
    console.error(`Error during snapshot file cleanup: ${error.message}`);
    // Continue with the snapshot creation even if cleanup fails
  }
}

/**
 * Clean up old property files to prevent stale data
 * This ensures deleted properties in Strapi don't persist as files
 */
function cleanupOldPropertyFiles() {
  // Find all files in the properties directory
  try {
    // Get all files from the DATA_DIR that look like property files (both ID and slug-based)
    const dataFiles = fs.readdirSync(DATA_DIR)
      .filter(file => 
        file.match(/^properties-\d+\.json$/) || // Old ID-based format
        (file.endsWith('.json') && file !== 'properties.json' && 
         file !== 'processed-properties.json' && file !== 'property-index.json' &&
         file !== 'last-updated.json' && file !== 'metadata.json')
      );
    
    // Get all files from the PROPERTIES_DIR
    const propertiesFiles = fs.existsSync(PROPERTIES_DIR) 
      ? fs.readdirSync(PROPERTIES_DIR).filter(file => file.endsWith('.json'))
      : [];
    
    console.log(`Found ${dataFiles.length} property files in data directory`);
    console.log(`Found ${propertiesFiles.length} property files in properties directory`);
    
    // Reading the processed properties file as a reference
    let processedPropertiesExist = false;
    let processedProperties = [];
    
    const processedPropertiesPath = path.join(DATA_DIR, 'processed-properties.json');
    if (fs.existsSync(processedPropertiesPath)) {
      try {
        processedProperties = JSON.parse(fs.readFileSync(processedPropertiesPath, 'utf8'));
        processedPropertiesExist = true;
        console.log(`Read ${processedProperties.length} properties from processed-properties.json as reference`);
      } catch (error) {
        console.warn(`Warning: Could not parse processed-properties.json: ${error.message}`);
      }
    }
    
    // If we don't have a reference file, we can't safely clean up
    if (!processedPropertiesExist) {
      console.log('No reference file found, skipping cleanup to prevent data loss');
      return;
    }
    
    // Create a set of valid IDs and slugs
    const validIds = new Set(processedProperties.map(p => p.id));
    const validSlugs = new Set(processedProperties.map(p => 
      p.Slug || p.slug || `property-${p.id}`
    ));
    
    // Remove files in DATA_DIR that don't correspond to valid properties
    let removedDataFiles = 0;
    dataFiles.forEach(file => {
      // Skip common non-property files (already filtered but keeping this check for safety)
      if (file === 'properties.json' || file === 'processed-properties.json' || 
          file === 'property-index.json' || file === 'last-updated.json' ||
          file === 'metadata.json') {
        return;
      }
      
      let shouldKeep = false;
      
      // Check for ID-based files (properties-123.json)
      const idMatch = file.match(/^properties-(\d+)\.json$/);
      if (idMatch) {
        const id = parseInt(idMatch[1], 10);
        if (validIds.has(id)) {
          shouldKeep = true;
        }
      } 
      // Check for slug-based files (any-slug-name.json)
      else {
        const slug = file.replace(/\.json$/, '');
        if (validSlugs.has(slug)) {
          shouldKeep = true;
        }
      }
      
      // If file should not be kept, remove it
      if (!shouldKeep) {
        const filePath = path.join(DATA_DIR, file);
        console.log(`Removing stale property file: ${filePath}`);
        try {
          fs.unlinkSync(filePath);
          removedDataFiles++;
        } catch (err) {
          console.warn(`Warning: Could not remove file ${filePath}: ${err.message}`);
        }
      }
    });
    
    // Remove files in PROPERTIES_DIR that don't correspond to valid slugs
    let removedPropertiesFiles = 0;
    propertiesFiles.forEach(file => {
      // Extract slug from filename (property-name.json -> property-name)
      const slug = file.replace(/\.json$/, '');
      if (!validSlugs.has(slug)) {
        const filePath = path.join(PROPERTIES_DIR, file);
        console.log(`Removing stale slug file: ${filePath}`);
        fs.unlinkSync(filePath);
        removedPropertiesFiles++;
      }
    });
    
    console.log(`Cleaned up ${removedDataFiles} stale files in data directory`);
    console.log(`Cleaned up ${removedPropertiesFiles} stale files in properties directory`);
    
  } catch (error) {
    console.error(`Error during file cleanup: ${error.message}`);
    // Continue with the export process even if cleanup fails
  }
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