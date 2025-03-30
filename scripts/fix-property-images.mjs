/**
 * ES Module wrapper for fix-property-images.js
 * 
 * This allows the CommonJS script to be imported in an ES module.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

// Create a require function that can be used in an ES module
const require = createRequire(import.meta.url);

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the CommonJS module
const propertyImageFixer = require('./fix-property-images.js');

/**
 * Fix property images by updating the property page component
 */
export async function fixPropertyImages() {
  return propertyImageFixer.fixPropertyImages();
}

// If this module is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await fixPropertyImages();
  if (result) {
    console.log('✅ Successfully fixed property images from ES module wrapper');
  } else {
    console.error('❌ Failed to fix property images from ES module wrapper');
    process.exit(1);
  }
} 