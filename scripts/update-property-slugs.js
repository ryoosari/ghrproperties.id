/**
 * This script updates existing property slugs in Strapi
 * Run it with: node scripts/update-property-slugs.js
 */

const axios = require('axios');
require('dotenv').config();

// Debug strapi client configuration
console.log(`Using Strapi URL: ${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}`);
console.log(`Has API token: ${Boolean(process.env.NEXT_PUBLIC_STRAPI_API_TOKEN)}`);

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Create a configured axios instance for Strapi
const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  headers: STRAPI_API_TOKEN 
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    : {}
});

// Function to convert a title to a slug
function slugify(text) {
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
}

// Determines if a slug needs to be updated
function shouldUpdateSlug(property) {
  // No slug at all
  if (!property.Slug && !property.slug) {
    return true;
  }
  
  const slug = property.Slug || property.slug;
  const title = property.Title || property.title;
  
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

async function updatePropertySlugs() {
  try {
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
      throw new Error('Could not fetch properties from any endpoint');
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
    
    console.log(`\n✅ Update complete. Updated ${updatedCount} properties. Skipped ${skippedCount} properties.`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the update
updatePropertySlugs();