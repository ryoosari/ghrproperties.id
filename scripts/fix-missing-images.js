#!/usr/bin/env node

/**
 * Fix Missing Images Script
 * 
 * This script creates placeholder images for properties that are missing images,
 * particularly for the Vero Soluna property that has 404 errors when downloading images.
 * 
 * It will:
 * 1. Check the properties index file for all property slugs
 * 2. Ensure each property has at least one image in the public and out directories
 * 3. Create placeholder images if none are found
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DIR, 'property-images');
const OUT_DIR = path.join(process.cwd(), 'out');
const OUT_IMAGES_DIR = path.join(OUT_DIR, 'property-images');
const DATA_DIR = path.join(process.cwd(), 'data');
const PLACEHOLDER_SIZES = ['large', 'medium', 'small', 'thumbnail', 'original'];

// Ensure necessary directories exist
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

if (fs.existsSync(OUT_DIR) && !fs.existsSync(OUT_IMAGES_DIR)) {
  fs.mkdirSync(OUT_IMAGES_DIR, { recursive: true });
}

// Function to get all property slugs from the data directory
function getAllPropertySlugs() {
  try {
    // First check if we have a property index file
    const indexPath = path.join(DATA_DIR, 'property-index.json');
    if (fs.existsSync(indexPath)) {
      const propertyIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const slugs = propertyIndex.map(p => p.attributes?.slug || '').filter(Boolean);
      console.log(`Found ${slugs.length} properties in property index`);
      return slugs;
    }
    
    // Otherwise scan individual property files
    const files = fs.readdirSync(DATA_DIR).filter(file => 
      file.endsWith('.json') && file !== 'properties.json' && 
      file !== 'property-index.json' && file !== 'summary.json'
    );
    
    const slugs = [];
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        const slug = data.Slug || data.slug;
        if (slug) {
          slugs.push(slug);
        }
      } catch (error) {
        console.error(`Error reading property file ${file}:`, error.message);
      }
    }
    
    console.log(`Found ${slugs.length} properties in data directory`);
    return slugs;
  } catch (error) {
    console.error('Error getting property slugs:', error);
    return [];
  }
}

async function createPlaceholdersForProperty(propertySlug) {
  try {
    console.log(`Creating placeholder images for property: ${propertySlug}`);
    
    // Create the property directory if it doesn't exist
    const propertyDir = path.join(PUBLIC_IMAGES_DIR, propertySlug);
    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true });
    }
    
    // Check if this property already has at least one image
    let hasImages = false;
    try {
      const files = fs.readdirSync(propertyDir);
      hasImages = files.some(file => 
        file.endsWith('.jpg') || file.endsWith('.jpeg') || 
        file.endsWith('.png') || file.endsWith('.webp')
      );
    } catch (error) {
      // Directory might not exist or other error
      hasImages = false;
    }
    
    // If property already has images, skip creating placeholders
    if (hasImages) {
      console.log(`⏩ Property ${propertySlug} already has images, skipping placeholders`);
      return;
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
    if (fs.existsSync(OUT_DIR)) {
      const outDir = path.join(OUT_IMAGES_DIR, propertySlug);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      // Check if out directory already has images
      let hasOutImages = false;
      try {
        const files = fs.readdirSync(outDir);
        hasOutImages = files.some(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || 
          file.endsWith('.png') || file.endsWith('.webp')
        );
      } catch (error) {
        hasOutImages = false;
      }
      
      // Only copy if needed
      if (!hasOutImages) {
        // Copy all placeholders to the out directory
        for (const size of PLACEHOLDER_SIZES) {
          const srcFile = path.join(propertyDir, `${size}-placeholder.jpg`);
          const destFile = path.join(outDir, `${size}-placeholder.jpg`);
          
          if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`✅ Copied ${size} placeholder to static export directory: ${destFile}`);
          }
        }
      } else {
        console.log(`⏩ Static export directory already has images for ${propertySlug}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating placeholders for ${propertySlug}:`, error);
    return false;
  }
}

// Special handling for Vero Soluna property
async function ensureVeroSolunaImages() {
  const veroSolunaSlug = 'vero-soluna-3br-hideaway';
  console.log(`Checking special case: ${veroSolunaSlug}`);
  
  // Force create placeholders for Vero Soluna even if it has some images
  await createPlaceholdersForProperty(veroSolunaSlug);
  
  // Ensure we copy these placeholders to the out directory
  if (fs.existsSync(OUT_DIR)) {
    const outDir = path.join(OUT_IMAGES_DIR, veroSolunaSlug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // Copy all placeholders to the out directory
    const srcDir = path.join(PUBLIC_IMAGES_DIR, veroSolunaSlug);
    if (fs.existsSync(srcDir)) {
      try {
        await exec(`cp -r ${srcDir}/* ${outDir}/`);
        console.log(`✅ Force copied placeholders for ${veroSolunaSlug} to static export directory`);
      } catch (error) {
        console.error(`Error copying placeholders for ${veroSolunaSlug}:`, error);
      }
    }
  }
}

// Main function
async function main() {
  console.log('🔧 Starting fix-missing-images process...');
  
  // Get all property slugs
  const slugs = getAllPropertySlugs();
  
  // Special care for problematic properties first
  await ensureVeroSolunaImages();
  
  // Process all other properties
  for (const slug of slugs) {
    await createPlaceholdersForProperty(slug);
  }
  
  // Create a .gitkeep file in the public images directory to ensure it's committed
  const gitkeepPath = path.join(PUBLIC_IMAGES_DIR, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    console.log('Created .gitkeep file in property-images directory');
  }
  
  // Copy all public/property-images to out/property-images if out directory exists
  if (fs.existsSync(OUT_DIR) && fs.existsSync(PUBLIC_IMAGES_DIR)) {
    try {
      // Ensure the out/property-images directory exists
      if (!fs.existsSync(OUT_IMAGES_DIR)) {
        fs.mkdirSync(OUT_IMAGES_DIR, { recursive: true });
      }
      
      // Copy all property images to the out directory
      await exec(`cp -r ${PUBLIC_IMAGES_DIR}/* ${OUT_IMAGES_DIR}/`);
      console.log('✅ Copied all property images to static export directory');
    } catch (error) {
      console.error('Error copying images to out directory:', error);
    }
  }
  
  console.log('✅ Fix-missing-images process completed successfully');
}

main().catch(error => {
  console.error('Error in fix-missing-images process:', error);
  process.exit(1);
}); 