#!/usr/bin/env node

/**
 * Ensure Image Mappings
 * 
 * This script ensures that all images have proper mappings during the static export process.
 * It scans property data to find all image URLs and creates a comprehensive mapping file
 * that converts Strapi URLs to local static paths.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
try {
  dotenv.config({ path: '.env.local' });
  console.log('Loaded .env.local');
} catch (e) {
  console.log('No .env.local file found');
}

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUT_DIR = path.join(process.cwd(), 'out');
const DATA_DIR = path.join(process.cwd(), 'data');

// Image formats we want to handle
const IMAGE_FORMATS = ['large', 'medium', 'small', 'thumbnail', 'original'];

// Find all property data files
function findPropertyFiles() {
  try {
    // Look for individual property files in the data directory
    const propertyFiles = fs.readdirSync(DATA_DIR)
      .filter(file => 
        file.endsWith('.json') && 
        file !== 'properties.json' && 
        file !== 'processed-properties.json' && 
        file !== 'property-index.json' &&
        file !== 'last-updated.json' && 
        file !== 'metadata.json' &&
        file !== 'summary.json'
      );
    
    return propertyFiles.map(file => path.join(DATA_DIR, file));
  } catch (error) {
    console.error('Error finding property files:', error.message);
    return [];
  }
}

// Extract all image URLs from a property
function extractImageUrls(property) {
  const images = [];
  
  try {
    // Handle the Image array
    if (property.Image && Array.isArray(property.Image)) {
      property.Image.forEach(img => {
        if (img.url) {
          images.push({
            originalUrl: img.url,
            formats: {}
          });
        }
        
        // Handle formats
        if (img.formats) {
          IMAGE_FORMATS.forEach(format => {
            if (img.formats[format] && img.formats[format].url) {
              images[images.length - 1].formats[format] = img.formats[format].url;
            }
          });
        }
      });
    }
    
    // Handle MainImage
    if (property.MainImage && property.MainImage.url) {
      images.push({
        originalUrl: property.MainImage.url,
        formats: {}
      });
      
      // Handle formats
      if (property.MainImage.formats) {
        IMAGE_FORMATS.forEach(format => {
          if (property.MainImage.formats[format] && property.MainImage.formats[format].url) {
            images[images.length - 1].formats[format] = property.MainImage.formats[format].url;
          }
        });
      }
    }
    
    return images;
  } catch (error) {
    console.error('Error extracting image URLs:', error.message);
    return [];
  }
}

// Generate static path mapping for an image URL
function generateStaticPath(url, propertySlug) {
  if (!url) return null;
  
  try {
    // If it's already a static path, return it as is
    if (url.startsWith('/property-images/')) {
      return url;
    }
    
    // If it's a full Strapi URL with uploads path
    if (url.includes('/uploads/')) {
      let filename;
      
      // Extract the filename from the URL
      if (url.includes(STRAPI_URL)) {
        // For full URLs like http://localhost:1337/uploads/large_image.jpg
        const uploadMatch = url.match(/\/uploads\/(.+)$/);
        if (uploadMatch && uploadMatch[1]) {
          filename = uploadMatch[1];
        }
      } else if (url.startsWith('/uploads/')) {
        // For relative URLs like /uploads/large_image.jpg
        filename = url.substring('/uploads/'.length);
      }
      
      if (filename) {
        // Check if the filename has a format prefix
        const formatMatch = filename.match(/^(large|medium|small|thumbnail)_(.+)$/);
        const format = formatMatch ? formatMatch[1] : 'large';
        
        // Generate the static path
        return `/property-images/${propertySlug}/${format}-${filename}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating static path:', error.message);
    return null;
  }
}

// Create image mappings from property data
function createImageMappings(propertyFiles) {
  const mappings = {};
  
  for (const filePath of propertyFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const property = JSON.parse(fileContent);
      
      // Get property slug
      const propertySlug = property.Slug || property.slug;
      if (!propertySlug) {
        console.warn(`Property without slug in file: ${filePath}`);
        continue;
      }
      
      console.log(`Processing property: ${propertySlug}`);
      
      // Extract image URLs
      const images = extractImageUrls(property);
      
      // Create mappings for each image and its formats
      images.forEach(image => {
        // Handle original URL
        const originalUrl = image.originalUrl;
        if (originalUrl) {
          // Ensure the URL is absolute
          const absoluteUrl = originalUrl.startsWith('/') 
            ? `${STRAPI_URL}${originalUrl}` 
            : originalUrl;
          
          // Generate static path
          const staticPath = generateStaticPath(originalUrl, propertySlug);
          if (staticPath) {
            mappings[absoluteUrl] = staticPath;
            console.log(`  Mapped: ${absoluteUrl} → ${staticPath}`);
          }
        }
        
        // Handle formats
        Object.entries(image.formats).forEach(([format, formatUrl]) => {
          if (formatUrl) {
            // Ensure the URL is absolute
            const absoluteUrl = formatUrl.startsWith('/') 
              ? `${STRAPI_URL}${formatUrl}` 
              : formatUrl;
            
            // Generate static path
            const staticPath = generateStaticPath(formatUrl, propertySlug);
            if (staticPath) {
              mappings[absoluteUrl] = staticPath;
              console.log(`  Mapped: ${absoluteUrl} → ${staticPath}`);
            }
          }
        });
      });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
    }
  }
  
  return mappings;
}

// Create the image-converter.js script
function createImageConverterScript(mappings) {
  const scriptContent = `
/**
 * Image URL Converter
 * 
 * This script converts Strapi image URLs to local URLs based on the mappings.
 * Include this script in your HTML to use the convertImageUrl function.
 */
window.imageUrlMappings = ${JSON.stringify(mappings, null, 2)};

/**
 * Convert a Strapi image URL to a local URL
 * @param {string} originalUrl - The original Strapi URL
 * @returns {string} - The local URL or the original URL if no mapping exists
 */
window.convertImageUrl = function(originalUrl) {
  // If the URL is already local, return it as is
  if (originalUrl && (originalUrl.startsWith('/property-images/') || !originalUrl.includes('${STRAPI_URL}'))) {
    return originalUrl;
  }
  
  // Check if there's a mapping for this URL
  const localUrl = window.imageUrlMappings[originalUrl];
  
  // Return the local URL if it exists, otherwise return the original URL
  return localUrl || originalUrl;
};

// Automatically convert all image sources on the page
window.addEventListener('load', function() {
  document.querySelectorAll('img').forEach(img => {
    const originalSrc = img.getAttribute('src');
    if (originalSrc) {
      const newSrc = window.convertImageUrl(originalSrc);
      if (newSrc !== originalSrc) {
        img.setAttribute('src', newSrc);
      }
    }
  });
});
`;

  // Write the script to both public and out directories
  fs.writeFileSync(path.join(PUBLIC_DIR, 'image-converter.js'), scriptContent);
  console.log(`Created image converter script in ${PUBLIC_DIR}`);
  
  // Also write to the out directory if it exists
  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(path.join(OUT_DIR, 'image-converter.js'), scriptContent);
    console.log(`Created image converter script in ${OUT_DIR}`);
  }
  
  // Save mappings as JSON for reference
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'image-mappings.json'), 
    JSON.stringify(mappings, null, 2)
  );
  console.log(`Created image mappings JSON in ${PUBLIC_DIR}`);
  
  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(
      path.join(OUT_DIR, 'image-mappings.json'), 
      JSON.stringify(mappings, null, 2)
    );
    console.log(`Created image mappings JSON in ${OUT_DIR}`);
  }
}

// Main function
async function main() {
  console.log('🔍 Starting ensure-image-mappings process...');
  
  // Find property files
  const propertyFiles = findPropertyFiles();
  console.log(`Found ${propertyFiles.length} property files`);
  
  // Create image mappings
  const mappings = createImageMappings(propertyFiles);
  console.log(`Created ${Object.keys(mappings).length} image mappings`);
  
  // Create image converter script
  createImageConverterScript(mappings);
  
  console.log('✅ ensure-image-mappings process completed successfully');
}

main().catch(error => {
  console.error('Error in ensure-image-mappings process:', error);
  process.exit(1);
}); 