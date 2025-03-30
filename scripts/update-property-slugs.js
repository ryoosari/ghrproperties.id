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
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

async function updatePropertySlugs() {
  try {
    console.log('Fetching properties from Strapi...');
    
    // Fetch all properties
    const response = await strapiClient.get('/api/properties');
    
    // Debug the response structure
    console.log('Response structure:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format from Strapi API');
    }
    
    const properties = response.data.data;
    console.log(`Found ${properties.length} properties`);
    
    // Counter for updated properties
    let updatedCount = 0;
    
    // Process each property
    for (const property of properties) {
      console.log('Processing property:', JSON.stringify(property).substring(0, 500) + '...');
      
      if (!property || typeof property !== 'object') {
        console.log('Invalid property object, skipping');
        continue;
      }
      
      const id = property.id;
      
      // Check if property already has Slug directly on the property object
      if (property.Slug) {
        console.log(`Property #${id} already has slug: ${property.Slug}`);
        continue;
      }
      
      // Check if property has a title
      if (!property.Title) {
        console.log(`Property #${id} has no title, skipping`);
        continue;
      }
      
      const newSlug = slugify(property.Title);
      console.log(`Property #${id} "${property.Title}" -> slug: "${newSlug}"`);
      
      try {
        // Update the property with the new slug
        console.log(`Updating property #${id} with slug: ${newSlug}`);
        console.log(`PUT request to: ${STRAPI_URL}/api/properties/${id}`);
        
        const updateResponse = await strapiClient.put(`/api/properties/${id}`, {
          data: {
            Slug: newSlug
          }
        });
        
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
    
    console.log(`\n✅ Update complete. Updated ${updatedCount} properties.`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the update
updatePropertySlugs();