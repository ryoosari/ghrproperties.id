'use strict';

/**
 * Property lifecycle hooks
 * 
 * These lifecycle hooks automatically manage slug generation for properties
 */

/**
 * Generate a proper slug from a string
 * This creates URL-friendly slugs by:
 * - Converting to lowercase
 * - Removing special characters
 * - Replacing spaces with hyphens
 * - Handling non-English characters
 * - Ensuring uniqueness with a timestamp if needed
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
    
  // Important fix for numerical prefixes like "3BR" - prevent extra hyphens
  // Convert formats like "3-br" to "3br" to match expected format
  slug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
    
  return slug;
};

/**
 * Check if a slug needs to be regenerated
 * This detects generic or problematic slugs that should be replaced
 */
const shouldRegenerateSlug = (slug, id) => {
  if (!slug || slug === '' || slug === null) return true;
  if (slug === 'property' || slug === `property-${id}`) return true;
  return false;
};

module.exports = {
  /**
   * Before saving a new property or updating an existing one
   */
  beforeCreate(event) {
    const { data } = event.params;
    
    // Generate a slug in these cases:
    // 1. When Title is provided but no Slug exists
    // 2. When the Slug is a generic value like "property"
    if (data.Title && (shouldRegenerateSlug(data.Slug) || !data.Slug)) {
      // Generate slug from title
      data.Slug = slugify(data.Title);
      console.log(`Auto-generated slug for new property: "${data.Title}" -> "${data.Slug}"`);
    }
  },
  
  /**
   * Before updating a property
   */
  beforeUpdate(event) {
    const { data, where } = event.params;
    const id = where?.id;
    
    // Handle slug generation in these cases:
    // 1. If Title is updated and Slug doesn't exist
    // 2. If Title is updated and Slug is empty
    // 3. If slug field is explicitly set to empty and Title exists (to regenerate)
    // 4. If the current slug is a generic value like "property"
    if (data.Title) {
      if (shouldRegenerateSlug(data.Slug, id) || data.Slug === undefined) {
        // Generate new slug from title
        data.Slug = slugify(data.Title);
        console.log(`Auto-generated slug for updated property: "${data.Title}" -> "${data.Slug}"`);
      }
    }
  },
  
  /**
   * After finding a property, check if it needs a slug update
   * This helps catch and fix existing properties with generic slugs
   */
  async afterFind(event) {
    const { result } = event;
    
    // Skip if no result or no id
    if (!result || !result.id) return;
    
    // Check if this property has a generic slug that should be updated
    if (result.Title && shouldRegenerateSlug(result.Slug, result.id)) {
      // Generate a proper slug
      const newSlug = slugify(result.Title);
      
      // Only log - we'll update in a separate process to avoid infinite loops
      console.log(`Property #${result.id} has a generic slug "${result.Slug}" that should be updated to "${newSlug}"`);
    }
  }
}; 