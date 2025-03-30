'use strict';

/**
 * property service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

/**
 * Generate a proper slug from a string
 */
const slugify = (text) => {
  if (!text) return '';
  
  // Convert to lowercase and trim
  let slug = text.toString().toLowerCase().trim();
  
  // Replace non-word characters with hyphens
  slug = slug
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
    
  return slug;
};

/**
 * Check if a slug needs to be regenerated
 */
const shouldRegenerateSlug = (slug, id) => {
  if (!slug || slug === '' || slug === null) return true;
  if (slug === 'property' || slug === `property-${id}`) return true;
  return false;
};

module.exports = createCoreService('api::property.property', ({ strapi }) => ({
  /**
   * Fix all properties with generic or missing slugs
   */
  async fixPropertySlugs() {
    try {
      // Get all properties
      const properties = await strapi.entityService.findMany('api::property.property', {
        populate: ['Title', 'Slug'],
      });
      
      console.log(`Found ${properties.length} properties to check for slug issues`);
      
      const updates = [];
      
      // Check each property
      for (const property of properties) {
        if (property.Title && shouldRegenerateSlug(property.Slug, property.id)) {
          const newSlug = slugify(property.Title);
          console.log(`Fixing slug for property #${property.id}: "${property.Slug || 'MISSING'}" -> "${newSlug}"`);
          
          // Update the property
          const updated = await strapi.entityService.update('api::property.property', property.id, {
            data: {
              Slug: newSlug
            },
          });
          
          updates.push({
            id: property.id,
            title: property.Title,
            oldSlug: property.Slug,
            newSlug
          });
        }
      }
      
      return {
        success: true,
        message: `Fixed ${updates.length} properties with generic or missing slugs`,
        updates
      };
    } catch (error) {
      console.error('Error fixing property slugs:', error);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }
})); 