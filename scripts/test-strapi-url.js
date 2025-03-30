#!/usr/bin/env node

/**
 * Test Strapi URL Script
 * 
 * This script checks if the Strapi URL environment variable is correctly set
 * and tests if images can be accessed using the configured URL.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files
dotenv.config({ path: '.env.local' }); // First check .env.local
dotenv.config(); // Then check .env for defaults

// Get the Strapi URL from environment variables
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
console.log('Strapi URL from environment:', STRAPI_URL);

// Function to test if the Strapi URL is accessible
async function testStrapiUrl() {
  try {
    console.log(`Testing Strapi URL: ${STRAPI_URL}...`);
    
    // Create a promise to handle the request
    const checkUrl = () => {
      return new Promise((resolve, reject) => {
        // Determine which protocol to use
        const client = STRAPI_URL.startsWith('https') ? https : http;
        
        const req = client.get(STRAPI_URL, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Strapi URL is accessible (${res.statusCode})`);
            resolve(true);
          } else {
            console.log(`❌ Strapi URL returned status code ${res.statusCode}`);
            resolve(false);
          }
        });
        
        req.on('error', (err) => {
          console.error(`❌ Error connecting to Strapi URL: ${err.message}`);
          reject(err);
        });
        
        // Set a timeout
        req.setTimeout(5000, () => {
          req.destroy();
          console.error('❌ Connection timed out');
          resolve(false);
        });
      });
    };
    
    await checkUrl();
    
    // Now let's check if we can load our property data
    console.log('\nChecking property data files...');
    const dataDir = path.join(process.cwd(), 'data');
    const propertyFiles = fs.readdirSync(dataDir).filter(file => 
      file.endsWith('.json') && file !== 'properties.json' && file !== 'processed-properties.json'
    );
    
    console.log(`Found ${propertyFiles.length} property files`);
    
    // Load the first property file to check image URLs
    if (propertyFiles.length > 0) {
      const filePath = path.join(dataDir, propertyFiles[0]);
      console.log(`Checking property file: ${propertyFiles[0]}`);
      
      const property = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check for Image array
      if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
        console.log(`Property has ${property.Image.length} images`);
        
        // Check the first image
        const firstImage = property.Image[0];
        console.log('First image details:');
        console.log('- Has formats:', !!firstImage.formats);
        
        if (firstImage.formats) {
          console.log('- Available formats:', Object.keys(firstImage.formats));
          
          // Check for large format
          if (firstImage.formats.large && firstImage.formats.large.url) {
            const url = firstImage.formats.large.url;
            console.log('- Large URL:', url);
            
            // Test if this URL is accessible with Strapi prefix
            const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
            console.log('- Full URL:', fullUrl);
            
            // Test this URL
            await testImageUrl(fullUrl);
          }
        }
        
        // Check original URL
        if (firstImage.url) {
          console.log('- Original URL:', firstImage.url);
          
          // Test if this URL is accessible with Strapi prefix
          const fullUrl = firstImage.url.startsWith('/') ? `${STRAPI_URL}${firstImage.url}` : firstImage.url;
          console.log('- Full original URL:', fullUrl);
          
          // Test this URL
          await testImageUrl(fullUrl);
        }
      } else {
        console.log('❌ Property has no images or Image is not an array');
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Function to test if an image URL is accessible
async function testImageUrl(url) {
  return new Promise((resolve) => {
    console.log(`Testing image URL: ${url}...`);
    
    // Determine which protocol to use
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ Image URL is accessible (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`❌ Image URL returned status code ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.error(`❌ Error accessing image URL: ${err.message}`);
      resolve(false);
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      console.error('❌ Connection timed out');
      resolve(false);
    });
  });
}

// Run the test
testStrapiUrl()
  .then(() => {
    console.log('\nTests completed.');
  })
  .catch(error => {
    console.error('Test script failed:', error);
  }); 