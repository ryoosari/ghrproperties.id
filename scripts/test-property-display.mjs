#!/usr/bin/env node

/**
 * Test Property Display
 * 
 * This script simulates how the PropertyCard component accesses property data
 * to help diagnose display issues.
 */

import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function testPropertyDisplay() {
  console.log(`🔍 Testing property display from: ${STRAPI_URL}`);
  console.log(`API Token set: ${Boolean(STRAPI_API_TOKEN)}`);
  
  try {
    // Fetch a property from Strapi
    const query = qs.stringify({
      populate: '*',
    }, {
      encodeValuesOnly: true
    });
    
    // Fetch properties from Strapi
    console.log('📋 Fetching a property from Strapi...');
    const response = await axios.get(`${STRAPI_URL}/api/properties?${query}`, {
      headers: STRAPI_API_TOKEN ? {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`
      } : {}
    });
    
    if (!response.data || !response.data.data || !response.data.data.length) {
      console.error('❌ No properties found in response');
      return;
    }
    
    const property = response.data.data[0];
    console.log('\n📊 Raw Property Data:');
    console.log(JSON.stringify(property, null, 2));
    
    // Simulate normalized property structure
    const normalizedProperty = {
      id: property.id,
      attributes: {
        title: property.Title || 'Untitled Property',
        slug: property.Slug || `property-${property.id}`,
        status: 'published',
        price: property.Price || 0,
        description: property.Description || '',
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        featuredImage: property.Image && property.Image.length > 0 ? {
          url: property.Image[0].url,
          alternativeText: property.Image[0].alternativeText || property.Title,
          width: property.Image[0].width,
          height: property.Image[0].height
        } : null,
        images: property.Image && Array.isArray(property.Image) ? 
          property.Image.map(img => ({
            url: img.url,
            alternativeText: img.alternativeText || property.Title,
            width: img.width,
            height: img.height
          })) : []
      }
    };
    
    console.log('\n📝 Normalized Property:');
    console.log(JSON.stringify(normalizedProperty, null, 2));
    
    // Simulate how PropertyCard accesses data
    console.log('\n🧪 Simulating PropertyCard access:');
    
    // Property without attributes (old code)
    console.log('\n1. Direct access (original code):');
    console.log('Title:', property.Title || property.title || 'Unnamed Property');
    console.log('Location:', property.Location || property.location || 'Location not specified');
    console.log('Price:', property.Price || property.price || 0);
    
    // Property with attributes (new code)
    console.log('\n2. Attributes access (fixed code):');
    const attrs = normalizedProperty.attributes || {};
    console.log('Title:', attrs.title || property.Title || property.title || 'Unnamed Property');
    console.log('Location:', attrs.location || property.Location || property.location || 'Location not specified');
    console.log('Price:', attrs.price || property.Price || property.price || 0);
    
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Please check that your Strapi server is running and accessible');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testPropertyDisplay().catch(err => {
  console.error('Unhandled error:', err);
}); 