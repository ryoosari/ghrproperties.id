#!/usr/bin/env node

/**
 * Test Dynamic Mode Integration
 * 
 * This script simulates how your Next.js app will fetch data in development mode
 * Run with: node scripts/test-dynamic-mode.mjs
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function testDynamicMode() {
  try {
    console.log(`🔍 Testing dynamic mode integration with Strapi at: ${STRAPI_URL}`);
    
    // Create the Strapi client (same as in your real application)
    const strapiClient = axios.create({
      baseURL: `${STRAPI_URL}/api`,
      headers: STRAPI_API_TOKEN 
        ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        : {}
    });
    
    // Get properties (simulates how your app will fetch data)
    console.log('\n📋 Fetching properties from Strapi...');
    
    try {
      const propertiesResponse = await strapiClient.get('/properties', {
        params: {
          populate: '*',
          sort: ['createdAt:desc']
        }
      });
      
      const { data, meta } = propertiesResponse.data;
      console.log('✅ Successfully fetched properties!');
      console.log(`📊 Found ${meta?.pagination?.total || 0} total properties`);
      
      if (data && data.length > 0) {
        console.log('\n📝 Properties found:');
        data.forEach((property, index) => {
          console.log(`\n${index + 1}. ${property.attributes.title || 'Untitled'}`);
          console.log(`   ID: ${property.id}`);
          console.log(`   Slug: ${property.attributes.slug || 'No slug'}`);
          console.log(`   Status: ${property.attributes.status || 'No status'}`);
          console.log(`   Price: ${property.attributes.price || 'No price'}`);
          
          if (property.attributes.images?.data?.length > 0) {
            console.log(`   Images: ${property.attributes.images.data.length}`);
          } else {
            console.log('   Images: None');
          }
        });
        
        console.log('\n✨ This is the data that will appear in your Next.js app!');
        console.log('   When you add or modify properties in Strapi, they will automatically appear in your local dev environment.');
      } else {
        console.log('\n⚠️ No properties found in Strapi. Try adding some!');
      }
    } catch (error) {
      console.log('❌ Error fetching properties:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response:`, error.response.data);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      
      throw new Error('Failed to fetch properties');
    }
    
  } catch (error) {
    console.error('\n❌ Dynamic mode test failed:');
    console.error(`   ${error.message}`);
    
    console.log('\n📋 Troubleshooting tips:');
    console.log('1. Follow the steps in STRAPI-PERMISSIONS-FIX.md');
    console.log('2. Make sure your Strapi server is running');
    console.log('3. Ensure you have created at least one property in Strapi');
    process.exit(1);
  }
}

// Run the test
testDynamicMode(); 