#!/usr/bin/env node

/**
 * Check Environment Variables
 * 
 * This script checks if environment variables are properly loaded
 * Run with: node scripts/check-env.mjs
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Checking environment variables...');

// Check Strapi URL
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
console.log('NEXT_PUBLIC_STRAPI_URL:', strapiUrl || 'Not set');

// Check Strapi API token
const strapiToken = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
if (strapiToken) {
  console.log('NEXT_PUBLIC_STRAPI_API_TOKEN: Set (first 10 chars):', strapiToken.substring(0, 10) + '...');
  console.log('Token length:', strapiToken.length);
} else {
  console.log('NEXT_PUBLIC_STRAPI_API_TOKEN: Not set');
}

// Check if .env.local file exists and read it directly
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('\nFile .env.local exists, checking contents:');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // Extract Strapi token line for analysis
  const tokenLine = envContent.split('\n').find(line => 
    line.trim().startsWith('NEXT_PUBLIC_STRAPI_API_TOKEN=')
  );
  
  if (tokenLine) {
    console.log('Token line found in .env.local:', tokenLine.substring(0, 60) + '...');
    
    // Check for any unusual characters
    const tokenValue = tokenLine.split('=')[1];
    
    // Check for spaces or quotes
    if (tokenValue.includes(' ')) {
      console.log('⚠️ Warning: Token contains spaces which may cause issues');
    }
    if (tokenValue.includes('"') || tokenValue.includes("'")) {
      console.log('⚠️ Warning: Token contains quotes which may cause issues');
    }
    
    // Check for line endings or other invisible characters
    try {
      const buffer = Buffer.from(tokenValue);
      let unusualChars = [];
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] < 32 || buffer[i] > 126) {
          unusualChars.push(buffer[i]);
        }
      }
      
      if (unusualChars.length > 0) {
        console.log('⚠️ Warning: Token contains unusual characters:', unusualChars);
      }
    } catch (error) {
      console.log('Error analyzing token:', error.message);
    }
  } else {
    console.log('Token line not found in .env.local');
  }
} else {
  console.log('\nWarning: .env.local file does not exist');
} 