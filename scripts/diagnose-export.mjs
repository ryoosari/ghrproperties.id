#!/usr/bin/env node

/**
 * Diagnose Strapi Export Issues
 * 
 * This script helps identify issues with the Strapi export process.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load all environment files
console.log('Loading environment variables...');
dotenv.config();
try {
  dotenv.config({ path: '.env.local' });
  console.log('Loaded .env.local');
} catch (e) {
  console.log('No .env.local file found');
}

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

console.log('Environment configuration:');
console.log(`STRAPI_URL: ${STRAPI_URL}`);
console.log(`STRAPI_API_TOKEN: ${STRAPI_API_TOKEN ? 'Token exists' : 'No token provided'}`);

// Create a configured axios instance for Strapi
const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  headers: STRAPI_API_TOKEN 
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    : {}
});

async function diagnoseExportIssues() {
  console.log('\n🔍 Starting Strapi export diagnosis...');
  
  // Check if Strapi is running
  try {
    console.log(`Checking Strapi connection at ${STRAPI_URL}...`);
    const healthCheck = await strapiClient.get('/');
    console.log('✅ Successfully connected to Strapi API');
  } catch (error) {
    console.error(`❌ Could not connect to Strapi at ${STRAPI_URL}: ${error.message}`);
    console.log('API may be unavailable or the URL might be incorrect');
    return;
  }
  
  // Try to check available endpoints
  console.log('\nChecking available API endpoints...');
  try {
    const availableEndpoints = await strapiClient.get('/');
    console.log('Available API endpoints:', JSON.stringify(availableEndpoints.data, null, 2));
  } catch (error) {
    console.log('Could not retrieve API endpoints listing');
  }
  
  // Try all possible properties endpoints
  const endpoints = [
    '/api/properties',
    '/api/property',
    '/properties',
    '/property'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTrying endpoint: ${endpoint}`);
    try {
      const response = await strapiClient.get(endpoint);
      console.log(`✅ Successfully fetched from ${endpoint}`);
      console.log(`Data structure:`, JSON.stringify(response.data).substring(0, 200) + '...');
      console.log(`Received ${response.data?.data?.length || 0} properties`);
    } catch (error) {
      console.log(`❌ Error fetching from ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Diagnosis complete!');
  console.log('\nRecommendations:');
  console.log('1. Make sure Strapi server is running at the correct URL');
  console.log('2. Check that .env.local contains NEXT_PUBLIC_STRAPI_URL=http://localhost:1337');
  console.log('3. If API requires authentication, provide NEXT_PUBLIC_STRAPI_API_TOKEN');
  console.log('4. Update the export script to use the correct endpoint based on diagnosis');
}

// Run the diagnostic function
diagnoseExportIssues()
  .catch(error => {
    console.error('Unhandled error during diagnosis:', error);
  });