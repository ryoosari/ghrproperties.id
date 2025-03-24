#!/usr/bin/env node

/**
 * Test Strapi Connection
 * 
 * This script tests the connection to Strapi API
 * Run with: node scripts/test-strapi-connection.mjs
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function testStrapiConnection() {
  try {
    console.log(`🔍 Testing connection to Strapi at: ${STRAPI_URL}`);
    
    // Basic connectivity test
    try {
      const response = await axios.get(`${STRAPI_URL}`);
      console.log('✅ Successfully connected to Strapi server!');
    } catch (error) {
      console.error('❌ Cannot connect to Strapi server:');
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
      throw new Error('Strapi server connection failed');
    }
    
    // Test public permission first (without token)
    console.log('\n🔍 Testing public access (without token)...');
    try {
      const publicClient = axios.create({
        baseURL: `${STRAPI_URL}/api`
      });
      
      const publicResponse = await publicClient.get('/properties');
      console.log('✅ Public access to properties is enabled!');
    } catch (error) {
      console.log('❌ Public access to properties failed:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        
        if (error.response.status === 403) {
          console.log('   ⚠️ Public permissions are not enabled for properties.');
          console.log('   Go to Settings → Roles → Public → Property and enable find/findOne permissions.');
        }
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    // Create Axios instance with token
    const strapiClient = axios.create({
      baseURL: `${STRAPI_URL}/api`,
      headers: STRAPI_API_TOKEN 
        ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        : {}
    });
    
    // Check if token is being used
    console.log('\n🔍 Checking API token...');
    if (STRAPI_API_TOKEN) {
      console.log('✅ API token is configured');
      
      // First 10 characters of token for verification
      const tokenPreview = STRAPI_API_TOKEN.substring(0, 10) + '...';
      console.log(`   Token begins with: ${tokenPreview}`);
    } else {
      console.log('❌ No API token configured in environment variables');
    }
    
    // Check if admin API is accessible
    console.log('\n🔍 Checking Strapi Admin API access...');
    try {
      await strapiClient.get('/admin/users/me');
      console.log('✅ You have admin access to Strapi!');
    } catch (error) {
      console.log('⚠️ No admin access. This is expected if you\'re using a regular API token.');
    }
    
    // Check accessing content using token
    console.log('\n🔍 Testing API token access to properties...');
    
    try {
      console.log('Attempting to access "api/properties" with your token...');
      const propertiesResponse = await strapiClient.get('/properties');
      console.log('✅ Successfully accessed properties with your API token!');
      
      const { data, meta } = propertiesResponse.data;
      console.log(`📊 Found ${meta?.pagination?.total || 0} total properties`);
      
      if (data && data.length > 0) {
        const property = data[0];
        console.log('📝 Sample property:');
        console.log(`   ID: ${property.id}`);
        console.log(`   Title: ${property.attributes.title || 'No title'}`);
        console.log(`   Slug: ${property.attributes.slug || 'No slug'}`);
      } else {
        console.log('ℹ️ No properties found in Strapi');
      }
    } catch (error) {
      console.log('❌ Cannot access properties with your API token:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        
        if (error.response.status === 403) {
          console.log('   ⚠️ Your API token does not have permission to access properties.');
          console.log('   Go to Settings → API Tokens → Edit your token and enable find/findOne permissions for Property.');
        } else if (error.response.status === 404) {
          console.log('\n   ⚠️ The "properties" content-type doesn\'t exist yet.');
          console.log('   You need to:');
          console.log('   1. Create a "properties" collection type in Strapi');
          console.log('   2. Add necessary fields (title, slug, etc.)');
        }
        
        console.log(`   Response:`, error.response.data);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Ensure the "properties" content type exists in Strapi');
    console.log('2. Configure permissions in Settings → Roles → Public → Property (find and findOne)');
    console.log('3. Configure permissions in Settings → API Tokens → Your token (find and findOne for Property)');
    
  } catch (error) {
    console.error('\n❌ Overall connection test failed:');
    console.error(`   ${error.message}`);
    
    console.log('\n📋 Troubleshooting tips:');
    console.log('1. Check that your Strapi server is running');
    console.log('2. Verify NEXT_PUBLIC_STRAPI_URL is correct in your .env file');
    console.log('3. Ensure NEXT_PUBLIC_STRAPI_API_TOKEN is valid');
    console.log('4. Check that the "properties" content type exists and is accessible');
  }
}

// Run the test
testStrapiConnection(); 