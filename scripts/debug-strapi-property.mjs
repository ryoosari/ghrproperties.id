#!/usr/bin/env node

/**
 * Debug Strapi Property Data Structure
 * 
 * This script connects to Strapi and retrieves a property,
 * then logs its complete data structure for debugging purposes.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import qs from 'qs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Ensure API token is set
if (!STRAPI_API_TOKEN) {
  console.warn('⚠️ No STRAPI_API_TOKEN found in environment variables');
}

/**
 * Format a value for display, handling different types
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return 'null/undefined';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `Array(${value.length})`;
    }
    return 'Object';
  }
  
  return String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '');
}

/**
 * Recursively display an object's structure
 */
function displayObjectStructure(obj, indent = 0, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return '  '.repeat(indent) + '[Max depth reached]';
  }
  
  if (obj === null || obj === undefined) {
    return '  '.repeat(indent) + 'null/undefined';
  }
  
  if (typeof obj !== 'object') {
    return '  '.repeat(indent) + formatValue(obj);
  }

  let output = '';
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      output += '  '.repeat(indent) + 'Empty Array[]\n';
    } else {
      output += '  '.repeat(indent) + `Array(${obj.length})[\n`;
      // Show first item in array as example
      if (obj.length > 0) {
        output += '  '.repeat(indent + 1) + 'Example item:\n';
        output += displayObjectStructure(obj[0], indent + 2, maxDepth, currentDepth + 1);
        if (obj.length > 1) {
          output += '  '.repeat(indent + 1) + `... and ${obj.length - 1} more items\n`;
        }
      }
      output += '  '.repeat(indent) + ']\n';
    }
  } else {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      output += '  '.repeat(indent) + 'Empty Object{}\n';
    } else {
      output += '  '.repeat(indent) + '{\n';
      for (const key of keys) {
        const value = obj[key];
        output += '  '.repeat(indent + 1) + `${key}: (${typeof value}) `;
        
        if (typeof value === 'object' && value !== null) {
          output += '\n';
          output += displayObjectStructure(value, indent + 2, maxDepth, currentDepth + 1);
        } else {
          output += formatValue(value) + '\n';
        }
      }
      output += '  '.repeat(indent) + '}\n';
    }
  }
  
  return output;
}

/**
 * Debug function to fetch and display raw property data from Strapi
 */
async function debugStrapiProperty() {
  console.log(`🔍 Debugging Strapi property data from: ${STRAPI_URL}`);
  
  if (!STRAPI_API_TOKEN) {
    console.error('❌ NEXT_PUBLIC_STRAPI_API_TOKEN is not set in environment variables');
    process.exit(1);
  }
  
  try {
    // Prepare the query with full population
    const query = qs.stringify({
      populate: '*',  // Populate all fields
    }, {
      encodeValuesOnly: true,
    });
    
    const url = `${STRAPI_URL}/api/properties?${query}`;
    console.log(`📋 Fetching from URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = response.data;
    
    console.log('\n📊 API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log(`\n✅ Found ${data.data.length} properties`);
      
      // Display the structure of the first property
      const firstProperty = data.data[0];
      console.log('\n📝 First Property Structure:');
      console.log('ID:', firstProperty.id);
      console.log('Document ID:', firstProperty.documentId);
      
      // Check common field names - the fields are directly on the root object, not in attributes
      console.log('\n🔍 Property Fields:');
      console.log('Title:', firstProperty.Title);
      console.log('Description:', firstProperty.Description);
      console.log('createdAt:', firstProperty.createdAt);
      console.log('updatedAt:', firstProperty.updatedAt);
      console.log('publishedAt:', firstProperty.publishedAt);
      
      // Check image
      if (firstProperty.Image && Array.isArray(firstProperty.Image) && firstProperty.Image.length > 0) {
        console.log('\n🖼️ Image Details:');
        const image = firstProperty.Image[0];
        console.log('Image ID:', image.id);
        console.log('Image Name:', image.name);
        console.log('Image URL:', image.url);
        console.log('Full Image URL:', `${STRAPI_URL}${image.url}`);
        
        // Check available formats
        if (image.formats) {
          console.log('\n📐 Available Image Formats:');
          Object.keys(image.formats).forEach(format => {
            console.log(`- ${format}: ${STRAPI_URL}${image.formats[format].url}`);
          });
        }
      } else {
        console.log('\n❌ No images found for this property');
      }
    } else {
      console.log('❌ No properties found in response');
    }
    
  } catch (error) {
    console.error('❌ Error fetching properties:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Execute the debug function
debugStrapiProperty(); 