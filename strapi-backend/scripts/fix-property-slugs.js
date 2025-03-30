/**
 * Script to fix property slugs in Strapi
 * 
 * This script helps fix any properties with generic or missing slugs by
 * regenerating them based on the property titles.
 * 
 * Usage:
 *   node scripts/fix-property-slugs.js
 */

const Strapi = require('@strapi/strapi');

async function fixPropertySlugs() {
  console.log('🔧 Starting script to fix property slugs...');
  
  try {
    // Initialize Strapi
    console.log('Initializing Strapi...');
    const strapi = await Strapi().load();
    
    console.log('Strapi initialized. Fixing property slugs...');
    
    // Get the property service
    const service = strapi.service('api::property.property');
    
    if (!service || !service.fixPropertySlugs) {
      console.error('❌ Property service or fixPropertySlugs method not found!');
      process.exit(1);
    }
    
    // Call the service method to fix slugs
    const result = await service.fixPropertySlugs();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      
      if (result.updates && result.updates.length > 0) {
        console.log('\nUpdated properties:');
        result.updates.forEach(update => {
          console.log(`  - #${update.id} "${update.title}": "${update.oldSlug || 'MISSING'}" -> "${update.newSlug}"`);
        });
      } else {
        console.log('No properties needed slug updates.');
      }
    } else {
      console.error(`❌ Failed to fix slugs: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Exit the process
  process.exit(0);
}

// Run the script
fixPropertySlugs(); 