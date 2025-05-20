#!/usr/bin/env node

/**
 * Export Strapi Data to Static JSON Files
 * 
 * This script fetches data from Strapi and exports it as static JSON files
 * that can be used during the Next.js static site generation build process.
 * 
 * It also updates property slugs in Strapi to ensure all properties have proper slugs,
 * eliminating the need to run a separate script for slug updates.
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
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_DIR = path.join(DATA_DIR, 'properties');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshot');

// -------------------------
// Helper Functions - Start
// -------------------------

/**
 * Slugify text to create URL-friendly slugs
 */
function slugify(text) {
  if (!text) return '';
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
    
  // Critical fix for numerical prefixes - ensure "3BR" becomes "3br" not "3-br"
  // This is essential for path matching in Next.js
  slug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
  
  return slug;
}

/**
 * Determines if a slug needs to be updated
 */
function shouldUpdateSlug(property) {
  // No slug at all
  if (!property.Slug && !property.slug) {
    return true;
  }
  
  const slug = property.Slug || property.slug;
  const title = property.Title || property.title;
  
  // Check for numerical prefix with dash that needs to be fixed
  if (slug && slug.match(/(\d+)-([a-z])/)) {
    console.log(`Slug #${property.id} "${slug}" has a numerical prefix with dash that should be fixed`);
    return true;
  }
  
  // Generic slug that should be replaced
  if (slug === 'property' || slug === `property-${property.id}`) {
    return true;
  }
  
  // Title and slug don't match (might indicate a title change)
  if (title && slug) {
    const expectedSlug = slugify(title);
    if (slug !== expectedSlug) {
      console.log(`Slug mismatch for property #${property.id}: "${slug}" vs expected "${expectedSlug}"`);
      // Only offer to update if it's clearly a generic slug or very different
      if (slug.length < 5 || slug.indexOf(expectedSlug.substring(0, 3)) === -1) {
        return true;
      }
    }
  }
  
  return false;
}

// -------------------------
// Helper Functions - End
// -------------------------

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
  const stats = { properties: 0, updatedSlugs: 0 };
  
  try {
    // 0. Check Strapi connection and update slugs if needed
    const success = await updatePropertySlugs(stats);
    
    // Only continue with export if the connection is successful
    if (success) {
      // 1. Export Properties
      await exportProperties(stats);
      
      // 2. Create normalized snapshot for static generation
      await createNormalizedSnapshot();
    }
    
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
 * Update property slugs in Strapi
 * This is the functionality from update-property-slugs.js, now integrated directly
 */
async function updatePropertySlugs(stats) {
  console.log('\n🔄 Checking and updating property slugs in Strapi...');
  
  try {
    // First check if we can connect to Strapi
    try {
      const healthCheck = await strapiClient.get('/');
      console.log('✅ Successfully connected to Strapi API');
    } catch (error) {
      console.error(`❌ Could not connect to Strapi at ${STRAPI_URL}: ${error.message}`);
      console.log('API may be unavailable or credentials may be incorrect');
      console.log('Will continue with existing data and skip slug updates');
      return false;
    }
    
    console.log('Fetching properties from Strapi...');
    
    // Try different API endpoints to handle various versions of Strapi
    const endpoints = [
      '/api/properties',
      '/api/property',
      '/properties'
    ];
    
    let properties = [];
    let endpointUsed = '';
    
    // Try each endpoint until we get a successful response
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to fetch properties from ${endpoint}...`);
        const response = await strapiClient.get(endpoint);
        
        // Handle different response formats
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Strapi v4 format
          properties = response.data.data.map(item => ({
            id: item.id,
            ...item.attributes
          }));
          endpointUsed = endpoint;
          break;
        } else if (Array.isArray(response.data)) {
          // Direct array format
          properties = response.data;
          endpointUsed = endpoint;
          break;
        }
      } catch (error) {
        console.log(`Error fetching from ${endpoint}: ${error.message}`);
      }
    }
    
    if (properties.length === 0) {
      console.warn('⚠️ Could not fetch properties from any endpoint, skipping slug updates');
      return false;
    }
    
    console.log(`Found ${properties.length} properties using endpoint: ${endpointUsed}`);
    
    // Counter for updated properties
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each property
    for (const property of properties) {
      console.log(`\nProcessing property #${property.id}: "${property.Title || property.title || 'Untitled'}"`);
      
      if (!property || typeof property !== 'object') {
        console.log('Invalid property object, skipping');
        skippedCount++;
        continue;
      }
      
      const id = property.id;
      
      // Check if this property needs a slug update
      if (!shouldUpdateSlug(property)) {
        console.log(`Property #${id} already has a valid slug: ${property.Slug || property.slug}, skipping`);
        skippedCount++;
        continue;
      }
      
      // Check if property has a title
      if (!property.Title && !property.title) {
        console.log(`Property #${id} has no title, skipping`);
        skippedCount++;
        continue;
      }
      
      const title = property.Title || property.title;
      const newSlug = slugify(title);
      console.log(`Property #${id} "${title}" -> new slug: "${newSlug}"`);
      
      try {
        // Determine the correct endpoint and payload structure based on which endpoint worked
        let updateEndpoint = '';
        let updatePayload = {};
        
        if (endpointUsed.startsWith('/api/')) {
          // Strapi v4 format
          updateEndpoint = `${endpointUsed}/${id}`;
          updatePayload = {
            data: {
              Slug: newSlug
            }
          };
        } else {
          // Direct format
          updateEndpoint = `${endpointUsed}/${id}`;
          updatePayload = {
            Slug: newSlug
          };
        }
        
        console.log(`Updating property: PUT ${updateEndpoint}`);
        console.log(`Payload: ${JSON.stringify(updatePayload)}`);
        
        const updateResponse = await strapiClient.put(updateEndpoint, updatePayload);
        
        console.log(`Response status: ${updateResponse.status}`);
        console.log(`✅ Updated property #${id} with slug: ${newSlug}`);
        updatedCount++;
      } catch (updateError) {
        console.error(`❌ Error updating property #${id}:`, updateError.message);
        if (updateError.response) {
          console.error('Error response:', updateError.response.data);
        }
      }
    }
    
    console.log(`\n✅ Slug update complete. Updated ${updatedCount} properties. Skipped ${skippedCount} properties.`);
    stats.updatedSlugs = updatedCount;
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating slugs:', error.message);
    console.log('Will continue with export process using existing slugs');
    return true; // Continue with export even if slug updates fail
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
        let slug = text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')           // Replace spaces with -
          .replace(/&/g, '-and-')         // Replace & with 'and'
          .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
          .replace(/\-\-+/g, '-')         // Replace multiple - with single -
          .replace(/^-+/, '')             // Trim - from start
          .replace(/-+$/, '');            // Trim - from end
        
        // Critical fix for numerical prefixes - ensure "3BR" becomes "3br" not "3-br"
        // This is essential for path matching in Next.js
        slug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
        
        return slug;
      };
      
      // Get title and determine the correct slug
      const title = property.Title || property.title || 'Untitled Property';
      let slug = property.Slug || property.slug;
      
      // Apply fix for numerical prefixes to existing slugs
      if (slug && slug.match(/(\d+)-([a-z])/)) {
        const fixedSlug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
        console.log(`Fixed numerical prefix in slug for property index #${property.id}: "${slug}" -> "${fixedSlug}"`);
        slug = fixedSlug;
        
        // Update the slug in the property data to ensure consistency
        if (property.Slug !== undefined) {
          property.Slug = slug;
        } else if (property.slug !== undefined) {
          property.slug = slug;
        }
      }
      
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
      // Get the title for generating a proper slug
      const title = property.Title || property.title || 'Untitled Property';
      
      // Generate a slug from the title if needed
      let slug = property.Slug || property.slug;
      
      // Apply fix for numerical prefixes to existing slugs
      if (slug && slug.match(/(\d+)-([a-z])/)) {
        const fixedSlug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
        console.log(`Fixed numerical prefix in slug for property index #${property.id}: "${slug}" -> "${fixedSlug}"`);
        slug = fixedSlug;
        
        // Update the slug in the property object
        if (property.Slug !== undefined) {
          property.Slug = slug;
        } else if (property.slug !== undefined) {
          property.slug = slug;
        }
      }
      
      // If there's no slug or it's the generic "property" slug, replace it with a generated one
      if (!slug || slug === 'property' || slug === `property-${property.id}`) {
        slug = slugify(title);
        console.log(`Generated slug for property file #${property.id}: "${title}" -> "${slug}"`);
        
        // Add the generated slug to the property object to ensure it's saved in the file
        if (property.Slug !== undefined) {
          property.Slug = slug;
        } else if (property.slug !== undefined) {
          property.slug = slug;
        } else {
          property.Slug = slug; // Add a new property if neither exists
        }
      }
      
      // Don't create files named "property.json" or with generic slugs
      if (slug === 'property') {
        console.log(`⚠️ Refusing to create generic property.json file for property #${property.id}`);
        // Force a better slug
        slug = `property-${property.id}`;
        console.log(`Using ${slug} instead`);
        
        // Update the slug in the property data
        if (property.Slug !== undefined) {
          property.Slug = slug;
        } else if (property.slug !== undefined) {
          property.slug = slug;
        } else {
          property.Slug = slug;
        }
      }
      
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
      let slug = text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
      
      // Critical fix for numerical prefixes - ensure "3BR" becomes "3br" not "3-br"
      // This is essential for path matching in Next.js
      slug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
      
      return slug;
    };
    
    // Normalize the data structure to match what the components expect
    const normalizedProperties = propertiesData.map(property => {
      // Determine the slug - use the one from Strapi if it exists, otherwise generate one
      const title = property.Title || property.title || 'Untitled Property';
      let slug = property.Slug || property.slug;
      
      // Apply fix for numerical prefixes to existing slugs
      if (slug && slug.match(/(\d+)-([a-z])/)) {
        const fixedSlug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
        console.log(`Fixed numerical prefix in normalized snapshot for property #${property.id}: "${slug}" -> "${fixedSlug}"`);
        slug = fixedSlug;
      }
      
      // If no slug is available, generate one from the title
      if (!slug || slug === 'property' || slug === `property-${property.id}`) {
        slug = generateSlug(title);
        console.log(`Generated slug for normalized property #${property.id}: "${title}" -> "${slug}"`);
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
          main_image: normalizeImage(property.MainImage) || normalizeImage(property.Image && Array.isArray(property.Image) && property.Image.length > 0 ? property.Image[0] : null),
          images: normalizeImages(property.Image || property.images),
          published_at: property.publishedAt || property.published_at,
          // Add documentId since it's in our data
          documentId: property.documentId || ''
        }
      };
    });
    
    // Write the normalized properties file (always keep this as the main collection)
    fs.writeFileSync(
      path.join(SNAPSHOT_DIR, 'properties.json'),
      JSON.stringify(normalizedProperties, null, 2)
    );
    
    // Track created files to avoid duplicates
    const createdFiles = new Set(['properties.json']);
    
    // Write individual normalized property files - ONLY in the preferred format
    normalizedProperties.forEach(property => {
      // Get the slug from attributes
      const slug = property.attributes.slug;
      
      // Create the slug-based filename (preferred modern format)
      const slugFilePath = path.join(SNAPSHOT_DIR, `${slug}.json`);
      createdFiles.add(`${slug}.json`);
      
      // Write the file with slug-based filename
      fs.writeFileSync(
        slugFilePath,
        JSON.stringify(property, null, 2)
      );
      
      console.log(`Created normalized property file: ${slugFilePath}`);
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
  
  // If it's a MainImage object (single object with url and formats)
  if (!Array.isArray(imageData) && imageData.url) {
    const url = imageData.url;
    return url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
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
    console.log('\n🧹 Cleaning up snapshot directory...');
    
    // Check if snapshot directory exists
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      console.log('Snapshot directory does not exist, creating it');
      fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
      return;
    }
    
    // Get all files in the snapshot directory
    const snapshotFiles = fs.readdirSync(SNAPSHOT_DIR).filter(file => file.endsWith('.json'));
    console.log(`Found ${snapshotFiles.length} files in snapshot directory`);
    
    // AGGRESSIVE CLEANUP: Remove ALL files except properties.json
    // We'll recreate the individual property files with the correct format
    let removedCount = 0;
    
    for (const file of snapshotFiles) {
      // Keep properties.json (main collection file)
      if (file === 'properties.json') {
        continue;
      }
      
      // Remove all other files
      const filePath = path.join(SNAPSHOT_DIR, file);
      console.log(`Removing file: ${filePath}`);
      
      try {
        fs.unlinkSync(filePath);
        removedCount++;
      } catch (error) {
        console.error(`Error removing file: ${error.message}`);
      }
    }
    
    console.log(`✅ Snapshot cleanup complete: removed ${removedCount} files`);
    
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
    console.log('🧹 Performing thorough cleanup of stale property files...');
    
    // Create the directories if they don't exist
    if (!fs.existsSync(PROPERTIES_DIR)) {
      fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
    }
    
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
    
    // EXPLICITLY CHECK FOR GENERIC PROPERTY.JSON FILES!
    // Remove any property.json files which cause routing issues
    const genericFilesToRemove = [
      path.join(DATA_DIR, 'property.json'),
      path.join(PROPERTIES_DIR, 'property.json')
    ];
    
    genericFilesToRemove.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        console.log(`🔴 Found problematic generic file: ${filePath}`);
        console.log('Removing this file to prevent routing issues...');
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Successfully removed ${filePath}`);
        } catch (err) {
          console.error(`❌ Error removing generic file ${filePath}: ${err.message}`);
          console.log('Attempting forced removal...');
          try {
            // Try one more time with different approach
            require('child_process').execSync(`rm -f "${filePath}"`);
            console.log(`✅ Successfully removed ${filePath} via shell command`);
          } catch (shellErr) {
            console.error(`❌ Failed to remove file even with shell command: ${shellErr.message}`);
          }
        }
      }
    });
    
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
      console.log('No reference file found, creating a fresh start by removing all property files');
      
      // Remove all property files to start fresh
      dataFiles.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        if (file !== 'properties.json' && file !== 'processed-properties.json' && 
            file !== 'property-index.json' && file !== 'last-updated.json' &&
            file !== 'metadata.json') {
          try {
            fs.unlinkSync(filePath);
            console.log(`Removed old file: ${filePath}`);
          } catch (err) {
            console.warn(`Warning: Could not remove file ${filePath}: ${err.message}`);
          }
        }
      });
      
      propertiesFiles.forEach(file => {
        const filePath = path.join(PROPERTIES_DIR, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Removed old file: ${filePath}`);
        } catch (err) {
          console.warn(`Warning: Could not remove file ${filePath}: ${err.message}`);
        }
      });
      
      console.log('Cleaned up all old property files');
      return;
    }
    
    // Create a set of valid IDs and slugs
    const validIds = new Set(processedProperties.map(p => p.id));
    const validSlugs = new Set();
    
    // Add all possible slug variants to the valid set
    processedProperties.forEach(p => {
      // Original slug
      const slug = p.Slug || p.slug;
      if (slug) validSlugs.add(slug);
      
      // ID-based slug
      validSlugs.add(`property-${p.id}`);
      
      // Title-based slug
      const title = p.Title || p.title;
      if (title) {
        const generatedSlug = slugify(title);
        validSlugs.add(generatedSlug);
      }
    });
    
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
      
      // Always remove property.json regardless of other checks
      if (file === 'property.json') {
        shouldKeep = false;
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
      
      // Always remove property.json regardless of other checks
      if (file === 'property.json' || !validSlugs.has(slug)) {
        const filePath = path.join(PROPERTIES_DIR, file);
        console.log(`Removing stale slug file: ${filePath}`);
        try {
          fs.unlinkSync(filePath);
          removedPropertiesFiles++;
        } catch (err) {
          console.warn(`Warning: Could not remove file ${filePath}: ${err.message}`);
        }
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
    // Run the fix-property-slugs script to ensure consistent slugs
    console.log('\n🔧 Running slug consistency fix...');
    import('child_process').then(({ execSync }) => {
      try {
        execSync('node scripts/fix-property-slugs.js', { 
          stdio: 'inherit' 
        });
        console.log('✅ Slug consistency fix completed');
        
        // Now update the property page to use local images
        console.log('\n🔄 Updating property page to use local images...');
        try {
          // Download property images first
          console.log('Downloading property images...');
          execSync('node scripts/download-images.js', {
            stdio: 'inherit'
          });
          
          // Now update the property page component using the ES module wrapper
          console.log('Updating property page component...');
          
          // Use a dynamic import with promise chaining
          import('./fix-property-images.mjs')
            .then(module => {
              return module.fixPropertyImages();
            })
            .then(result => {
              if (result) {
                console.log('✅ Successfully updated property page to use local images');
              } else {
                console.error('❌ Failed to update property page to use local images');
              }
            })
            .catch(error => {
              console.error('Error updating property page:', error);
            });
        } catch (error) {
          console.error('Error updating property page:', error);
        }
        
        // Check if we should auto-commit data changes
        if (process.env.AUTO_COMMIT === 'true') {
          console.log('\n🔄 Running auto-commit for data changes...');
          
          try {
            execSync('node scripts/auto-commit-data.js', { 
              stdio: 'inherit' 
            });
          } catch (error) {
            console.error('Error running auto-commit script:', error);
          }
        }
      } catch (error) {
        console.error('Error running slug fix script:', error);
      }
    });
  })
  .catch(error => {
    console.error('Unhandled error during export:', error);
    process.exit(1);
  }); 