#!/usr/bin/env node

/**
 * Test Dynamic Mode Integration
 * 
 * This script simulates how your Next.js app will fetch data in development mode
 * Run with: node scripts/test-dynamic-mode.mjs
 */

import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local first, then from .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

/**
 * Test the dynamic mode integration with Strapi
 */
async function testDynamicMode() {
  console.log(`🔍 Testing dynamic mode integration with Strapi at: ${STRAPI_URL}`);

  try {
    // Prepare the query with parameters
    const query = qs.stringify({
      populate: '*', // Populate all relations
      sort: 'createdAt:desc', // Sort by creation date
    }, {
      encodeValuesOnly: true
    });

    // Fetch properties from Strapi
    console.log('\n📋 Fetching properties from Strapi...');
    const response = await axios.get(`${STRAPI_URL}/api/properties?${query}`, {
      headers: STRAPI_API_TOKEN ? {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`
      } : {}
    });

    // Check if data is returned correctly
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Strapi - no data');
    }

    console.log('✅ Successfully fetched properties!');

    // Get properties from the response
    const properties = response.data.data;
    console.log(`📊 Found ${properties.length} total properties`);

    if (properties.length > 0) {
      // Log the raw data structure of the first property for debugging
      console.log('\n📝 Raw property data structure (first property):');
      console.log(JSON.stringify(properties[0], null, 2));

      // Display all property details
      console.log('\n📝 Properties found:');
      properties.forEach((property, index) => {
        console.log(`\n--- Property ${index + 1} ---`);
        console.log(`ID: ${property.id}`);
        console.log(`Title: ${property.Title || 'No title'}`);
        console.log(`Slug: ${property.Slug || 'No slug'}`);
        console.log(`Status: ${property.Status || 'Unknown'}`);
        console.log(`Price: ${property.Price ? '$' + property.Price.toLocaleString() : 'Not set'}`);
        console.log(`Created: ${new Date(property.createdAt).toLocaleString()}`);
        
        // Check for images
        if (property.Image && Array.isArray(property.Image)) {
          console.log(`Images: ${property.Image.length}`);
          
          // Display image details
          property.Image.forEach((img, i) => {
            console.log(`  Image ${i+1}: ${img.name} (${img.width}x${img.height})`);
            console.log(`  URL: ${STRAPI_URL}${img.url}`);
          });
        } else {
          console.log('Images: None');
        }
      });

      return {
        success: true,
        properties: properties
      };
    } else {
      console.log('❌ No properties found in Strapi');
      return {
        success: false,
        error: 'No properties found'
      };
    }
  } catch (error) {
    console.log('❌ Error fetching properties:');
    console.log('   ' + error.message);

    console.log('\n📋 Troubleshooting tips:');
    console.log('1. Follow the steps in STRAPI-PERMISSIONS-FIX.md');
    console.log('2. Make sure your Strapi server is running');
    console.log('3. Ensure you have created at least one property in Strapi');

    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test function and handle errors
try {
  const result = await testDynamicMode();
  
  if (!result.success) {
    console.log('\n❌ Dynamic mode test failed:');
    console.log(`   ${result.error || 'Failed to fetch properties'}`);
    process.exit(1);
  }
  
  console.log('\n✅ Dynamic mode test passed!');
  console.log('   Strapi integration is working correctly');
} catch (error) {
  console.error('\n❌ Unexpected error:');
  console.error(error);
  process.exit(1);
} 