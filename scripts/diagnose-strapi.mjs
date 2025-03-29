#!/usr/bin/env node

/**
 * Diagnose Strapi Connection and Content Types
 * 
 * This script checks if Strapi is running and available,
 * and displays information about the configured content types.
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

console.log(`📊 Strapi Diagnostic Tool`);
console.log(`===============================`);
console.log(`Strapi URL: ${STRAPI_URL}`);
console.log(`API Token: ${STRAPI_API_TOKEN ? '✅ Present' : '❌ Missing'}`);

async function diagnoseStrapiConnection() {
  try {
    // Create the API client with headers
    const apiClient = axios.create({
      baseURL: STRAPI_URL,
      headers: STRAPI_API_TOKEN ? {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`
      } : {}
    });
    
    console.log(`\n1️⃣ Checking Strapi server status...`);
    
    try {
      const response = await apiClient.get('/');
      console.log(`✅ Strapi is running! Status: ${response.status}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`❌ Could not connect to Strapi at ${STRAPI_URL}`);
        console.error(`   Please check that your Strapi server is running.`);
        return;
      } else {
        console.log(`ℹ️ Received response from server with status ${error.response?.status || 'unknown'}`);
        console.log(`   This might be normal as the root endpoint might not be accessible.`);
      }
    }
    
    console.log(`\n2️⃣ Checking API connection...`);
    
    try {
      const response = await apiClient.get('/api');
      console.log(`✅ API connection successful! Status: ${response.status}`);
    } catch (error) {
      console.log(`ℹ️ API endpoint response: ${error.response?.status || 'unknown'}`);
      console.log(`   This could be normal depending on your Strapi configuration.`);
    }
    
    console.log(`\n3️⃣ Looking for available content types...`);
    
    // Try to find content types through the content-manager plugin
    try {
      const contentTypesResponse = await apiClient.get('/api/content-manager/content-types');
      console.log(`✅ Found ${Object.keys(contentTypesResponse.data).length} content types!`);
      contentTypesResponse.data.data.forEach(ct => {
        console.log(`   - ${ct.uid} (${ct.info.displayName})`);
      });
    } catch (error) {
      console.log(`ℹ️ Could not fetch content types from content-manager: ${error.message}`);
    }
    
    console.log(`\n4️⃣ Checking for properties content type...`);
    
    // Check the main property endpoint
    try {
      const propertyResponse = await apiClient.get('/api/properties');
      console.log(`✅ Properties endpoint found! Status: ${propertyResponse.status}`);
      console.log(`   Found ${propertyResponse.data.data?.length || 0} properties`);
    } catch (propertyError) {
      console.log(`ℹ️ Could not access /api/properties: ${propertyError.message}`);
      
      // Try alternative endpoint
      try {
        const altPropertyResponse = await apiClient.get('/api/property');
        console.log(`✅ Alternative property endpoint found! Status: ${altPropertyResponse.status}`);
        console.log(`   Found ${altPropertyResponse.data.data?.length || 0} properties`);
      } catch (altError) {
        console.error(`❌ Could not access either /api/properties or /api/property endpoints`);
        console.error(`   Error: ${altError.message}`);
      }
    }
    
    console.log(`\n5️⃣ Final diagnosis:`);
    console.log(`===============================`);
    console.log(`→ If your Strapi server is running but you're not seeing any properties:`);
    console.log(`  1. Make sure you've created and published properties in Strapi`);
    console.log(`  2. Check that your API token has permission to read properties`);
    console.log(`  3. Verify the API endpoint format (singular vs. plural, namespaced vs. direct)`);
    console.log(`  4. Try running "npm run export-data" to see detailed error messages`);
    
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
}

// Run the diagnostic
diagnoseStrapiConnection().catch(console.error);