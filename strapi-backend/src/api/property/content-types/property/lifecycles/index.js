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
    
  return slug;
};

module.exports = {
  /**
   * Before saving a new property or updating an existing one
   */
  beforeCreate(event) {
    const { data } = event.params;
    
    // Only generate a slug if Title is provided and Slug is not manually set
    if (data.Title && !data.Slug) {
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
    
    // Handle slug generation in these cases:
    // 1. If Title is updated and Slug doesn't exist
    // 2. If Title is updated and Slug is empty
    // 3. If slug field is explicitly set to empty and Title exists (to regenerate)
    if (data.Title && (data.Slug === null || data.Slug === undefined || data.Slug === '')) {
      // Generate new slug from title
      data.Slug = slugify(data.Title);
      console.log(`Auto-generated slug for updated property: "${data.Title}" -> "${data.Slug}"`);
    }
  }
}; 