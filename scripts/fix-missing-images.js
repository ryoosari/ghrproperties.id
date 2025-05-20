#!/usr/bin/env node

/**
 * Fix Missing Images Script
 * 
 * This script creates placeholder images for properties that are missing images,
 * particularly for the Vero Soluna property that has 404 errors when downloading images.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DIR, 'property-images');
const PLACEHOLDER_SIZES = ['large', 'medium', 'small', 'thumbnail', 'original'];

async function createPlaceholdersForProperty(propertySlug) {
  try {
    console.log(`Creating placeholder images for property: ${propertySlug}`);
    
    // Create the property directory if it doesn't exist
    const propertyDir = path.join(PUBLIC_IMAGES_DIR, propertySlug);
    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true });
    }
    
    // Copy placeholder images for each size
    for (const size of PLACEHOLDER_SIZES) {
      const outputFile = path.join(propertyDir, `${size}-placeholder.jpg`);
      
      if (!fs.existsSync(outputFile)) {
        // Copy the default placeholder image
        fs.copyFileSync(
          path.join(PUBLIC_DIR, 'placeholder-property.jpg'),
          outputFile
        );
        console.log(`✅ Created ${size} placeholder at ${outputFile}`);
      } else {
        console.log(`⏩ Placeholder already exists: ${outputFile}`);
      }
    }
    
    // Also create placeholder images for out directory (static export)
    const outDir = path.join(process.cwd(), 'out', 'property-images', propertySlug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
      
      // Copy all placeholders to the out directory
      await exec(`cp -r ${propertyDir}/* ${outDir}/`);
      console.log(`✅ Copied placeholders to static export directory: ${outDir}`);
    }
    
    console.log(`✅ Completed creating placeholders for ${propertySlug}`);
  } catch (error) {
    console.error(`❌ Error creating placeholders for ${propertySlug}:`, error);
  }
}

async function main() {
  try {
    console.log('Starting fix-missing-images script...');
    
    // Make sure the property-images directory exists
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }
    
    // Create placeholder images for Vero Soluna property
    await createPlaceholdersForProperty('vero-soluna-3br-hideaway');
    
    // Check all properties for missing images
    const dataDir = path.join(process.cwd(), 'data', 'properties');
    if (fs.existsSync(dataDir)) {
      const propertyFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
      
      console.log(`\nChecking ${propertyFiles.length} properties for missing images...`);
      
      for (const file of propertyFiles) {
        const propertySlug = file.replace('.json', '');
        const propertyDir = path.join(PUBLIC_IMAGES_DIR, propertySlug);
        
        // If property directory doesn't exist or is empty, create placeholders
        if (!fs.existsSync(propertyDir) || fs.readdirSync(propertyDir).length === 0) {
          await createPlaceholdersForProperty(propertySlug);
        }
      }
    }
    
    console.log('\n✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
main(); 