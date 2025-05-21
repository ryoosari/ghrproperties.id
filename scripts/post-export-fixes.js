#!/usr/bin/env node

/**
 * Post-Export Fixes
 * 
 * This script runs after the static export to fix any remaining issues with image paths.
 * It scans all HTML files in the export directory and applies our image mapping
 * directly to any image tags that might have been missed during the export process.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const OUT_DIR = path.join(process.cwd(), 'out');
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Check if out directory exists
if (!fs.existsSync(OUT_DIR)) {
  console.error(`Output directory ${OUT_DIR} not found`);
  process.exit(1);
}

// Load image mappings
let imageMappings = {};
try {
  const mappingsPath = path.join(process.cwd(), 'public', 'image-mappings.json');
  if (fs.existsSync(mappingsPath)) {
    imageMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
    console.log(`Loaded ${Object.keys(imageMappings).length} image mappings`);
  } else {
    console.warn('No image mappings file found, will try to fix images without mappings');
  }
} catch (error) {
  console.error('Error loading image mappings:', error.message);
}

// Convert a Strapi URL to a local path
function convertImageUrl(url) {
  // If the URL is already a local path, return it as is
  if (!url || url.startsWith('/property-images/') || url.startsWith('/placeholder')) {
    return url;
  }
  
  // Check if there's a direct mapping
  if (imageMappings[url]) {
    return imageMappings[url];
  }
  
  // If the URL is a Strapi URL, try to convert it
  if (url.includes(STRAPI_URL) && url.includes('/uploads/')) {
    // First check if we have a mapping for a similar URL
    const similarKeys = Object.keys(imageMappings).filter(key => 
      url.includes(key.split('/').pop())
    );
    
    if (similarKeys.length > 0) {
      const bestMatch = similarKeys[0];
      console.log(`Using similar mapping: ${bestMatch} → ${imageMappings[bestMatch]}`);
      return imageMappings[bestMatch];
    }
    
    // Try to extract the property slug from the URL or context
    const pathParts = url.split('/');
    const filename = pathParts.pop();
    
    // Check if we're in a property-specific directory
    const currentPath = process.cwd();
    const propertyMatch = currentPath.match(/\/properties\/([^\/]+)/);
    let propertySlug = propertyMatch ? propertyMatch[1] : 'unknown-property';
    
    // For URLs with format prefixes
    const formatMatch = filename.match(/^(large|medium|small|thumbnail)_(.+)$/);
    const format = formatMatch ? formatMatch[1] : 'large';
    
    // Construct a local path
    return `/property-images/${propertySlug}/${format}-${filename}`;
  }
  
  // If we can't convert it, return the original URL
  return url;
}

// Process an HTML file to fix image paths
function processHtmlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all image tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    let replaced = false;
    let newContent = content;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const fullTag = match[0];
      const srcUrl = match[1];
      
      // Skip if the URL is already local
      if (srcUrl.startsWith('/property-images/') || srcUrl.startsWith('/placeholder')) {
        continue;
      }
      
      // Skip if the URL is an external domain but not Strapi
      if (srcUrl.startsWith('http') && !srcUrl.includes(STRAPI_URL)) {
        continue;
      }
      
      // Convert the URL
      const convertedUrl = convertImageUrl(srcUrl);
      if (convertedUrl !== srcUrl) {
        // Replace the URL in the tag
        const newTag = fullTag.replace(srcUrl, convertedUrl);
        newContent = newContent.replace(fullTag, newTag);
        replaced = true;
        console.log(`  Fixed image path: ${srcUrl} → ${convertedUrl}`);
      }
    }
    
    // Find all Next.js Image component data attributes
    const dataRegex = /data-src=["']([^"']+)["']|data-srcset=["']([^"']+)["']/g;
    while ((match = dataRegex.exec(content)) !== null) {
      const fullAttr = match[0];
      const srcUrl = match[1] || match[2];
      
      // Skip if the URL is already local
      if (srcUrl.startsWith('/property-images/') || srcUrl.startsWith('/placeholder')) {
        continue;
      }
      
      // Skip if the URL is an external domain but not Strapi
      if (srcUrl.startsWith('http') && !srcUrl.includes(STRAPI_URL)) {
        continue;
      }
      
      // Convert the URL
      const convertedUrl = convertImageUrl(srcUrl);
      if (convertedUrl !== srcUrl) {
        // Replace the URL in the attribute
        const newAttr = fullAttr.replace(srcUrl, convertedUrl);
        newContent = newContent.replace(fullAttr, newAttr);
        replaced = true;
        console.log(`  Fixed Next.js image data attribute: ${srcUrl} → ${convertedUrl}`);
      }
    }
    
    // Write back the content if changes were made
    if (replaced) {
      fs.writeFileSync(filePath, newContent);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Find and process all HTML files
function processAllHtmlFiles() {
  try {
    // Use synchronous globbing to avoid potential issues
    const files = glob.sync('**/*.html', { cwd: OUT_DIR });
    
    console.log(`Found ${files.length} HTML files to process`);
    
    let fixedFiles = 0;
    
    files.forEach(file => {
      const filePath = path.join(OUT_DIR, file);
      console.log(`Processing: ${file}`);
      
      const fixed = processHtmlFile(filePath);
      if (fixed) {
        fixedFiles++;
      }
    });
    
    return fixedFiles;
  } catch (error) {
    console.error('Error processing HTML files:', error);
    return 0;
  }
}

// Main function
async function main() {
  console.log('🔧 Starting post-export fixes...');
  
  try {
    // Check if output directory exists
    if (!fs.existsSync(OUT_DIR)) {
      console.log(`Output directory ${OUT_DIR} does not exist, skipping HTML fixes`);
    } else {
      const fixedFiles = processAllHtmlFiles();
      console.log(`✅ Fixed image paths in ${fixedFiles} files`);
    }
    
    // Ensure image-converter.js is in the output directory
    const srcFile = path.join(process.cwd(), 'public', 'image-converter.js');
    const destFile = path.join(OUT_DIR, 'image-converter.js');
    
    if (fs.existsSync(srcFile) && fs.existsSync(OUT_DIR)) {
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log('✅ Copied image-converter.js to output directory');
      } else {
        console.log('✅ image-converter.js already exists in output directory');
      }
    }
    
    console.log('✅ Post-export fixes completed successfully');
  } catch (error) {
    console.error('Error in post-export fixes:', error);
    process.exit(1);
  }
}

main(); 