#!/usr/bin/env node

/**
 * Download Property Images
 * 
 * This script downloads all property images from Strapi to the local public folder
 * so they can be served directly from Next.js, avoiding CORS and connectivity issues.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DIR, 'property-images');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

// Function to download a file
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Choose the appropriate protocol
    const client = url.startsWith('https') ? https : http;
    
    // Start the download
    const req = client.get(url, (response) => {
      // Check if the response is successful
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
      }
      
      // Create a write stream
      const fileStream = fs.createWriteStream(outputPath);
      
      // Pipe the response to the file
      response.pipe(fileStream);
      
      // When the file is finished
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      
      // Handle errors
      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file
        reject(err);
      });
    });
    
    // Handle request errors
    req.on('error', (err) => {
      reject(err);
    });
    
    // Set a timeout
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Function to process a property and download its images
async function processProperty(property) {
  try {
    console.log(`Processing property: ${property.Title || property.title || `ID: ${property.id}`}`);
    
    // Skip if no images
    if (!property.Image || !Array.isArray(property.Image) || property.Image.length === 0) {
      console.log('  No images found for this property');
      return [];
    }
    
    const propertyId = property.id;
    const propertySlug = property.Slug || property.slug || `property-${propertyId}`;
    
    // Create a folder for this property's images
    const propertyImagesDir = path.join(PUBLIC_IMAGES_DIR, propertySlug);
    if (!fs.existsSync(propertyImagesDir)) {
      fs.mkdirSync(propertyImagesDir, { recursive: true });
    }
    
    // Process each image
    const imageResults = [];
    
    for (let i = 0; i < property.Image.length; i++) {
      const image = property.Image[i];
      
      // Try to get image formats (large, medium, small, thumbnail)
      const formats = [
        { name: 'large', obj: image.formats?.large },
        { name: 'medium', obj: image.formats?.medium },
        { name: 'small', obj: image.formats?.small },
        { name: 'thumbnail', obj: image.formats?.thumbnail },
        { name: 'original', obj: { url: image.url } } // Original as fallback
      ];
      
      // Download each format that exists
      for (const format of formats) {
        if (format.obj && format.obj.url) {
          const url = format.obj.url;
          const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
          
          // Extract filename from the URL
          const urlPath = new URL(fullUrl).pathname;
          const filename = path.basename(urlPath);
          const outputPath = path.join(propertyImagesDir, `${format.name}-${filename}`);
          
          try {
            console.log(`  Downloading ${format.name} image: ${filename}`);
            await downloadFile(fullUrl, outputPath);
            
            imageResults.push({
              propertyId,
              propertySlug,
              originalUrl: fullUrl,
              localPath: `/property-images/${propertySlug}/${format.name}-${filename}`,
              format: format.name
            });
            
            console.log(`  ✅ Downloaded to ${outputPath}`);
          } catch (error) {
            console.error(`  ❌ Error downloading ${format.name} image:`, error.message);
          }
        }
      }
    }
    
    return imageResults;
  } catch (error) {
    console.error(`Error processing property ${property.id}:`, error.message);
    return [];
  }
}

// Main function
async function main() {
  console.log('🔍 Scanning property data files...');
  
  // Load property data
  const dataDir = path.join(process.cwd(), 'data');
  
  // Look for individual property files
  const propertyFiles = fs.readdirSync(dataDir).filter(file => 
    file.endsWith('.json') && 
    file !== 'properties.json' && 
    file !== 'processed-properties.json' && 
    file !== 'property-index.json' &&
    file !== 'last-updated.json' && 
    file !== 'metadata.json'
  );
  
  console.log(`Found ${propertyFiles.length} property files`);
  
  // Process each property file
  const allImageResults = [];
  
  for (const file of propertyFiles) {
    const filePath = path.join(dataDir, file);
    try {
      const propertyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const imageResults = await processProperty(propertyData);
      allImageResults.push(...imageResults);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  }
  
  // Create a mapping file that maps Strapi URLs to local URLs
  const imageMappings = {};
  
  allImageResults.forEach(result => {
    // Use the original URL as the key, and the local path as the value
    imageMappings[result.originalUrl] = result.localPath;
  });
  
  // Save the mappings to a JSON file
  const mappingsPath = path.join(PUBLIC_DIR, 'image-mappings.json');
  fs.writeFileSync(mappingsPath, JSON.stringify(imageMappings, null, 2));
  
  console.log(`\n✅ Downloaded ${allImageResults.length} images`);
  console.log(`Created image mappings file at ${mappingsPath}`);
  
  // Create a utility script that can be used in the browser
  const utilScriptPath = path.join(PUBLIC_DIR, 'image-converter.js');
  const utilScript = `
/**
 * Image URL Converter
 * 
 * This script converts Strapi image URLs to local URLs based on the mappings.
 * Include this script in your HTML to use the convertImageUrl function.
 */
window.imageUrlMappings = ${JSON.stringify(imageMappings)};

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
  
  fs.writeFileSync(utilScriptPath, utilScript);
  console.log(`Created image converter utility script at ${utilScriptPath}`);
}

// Run the main function
main()
  .then(() => {
    console.log('Script completed successfully');
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 