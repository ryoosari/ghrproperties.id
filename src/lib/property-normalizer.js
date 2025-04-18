/**
 * Utility functions for normalizing property data consistently across the site
 */

/**
 * Generates a consistent local image URL from a Strapi image URL and property slug
 * 
 * @param {string} url - The original Strapi image URL
 * @param {string} propertySlug - The property slug to use in the path
 * @returns {string} The local image URL
 */
export function generateLocalImageUrl(url, propertySlug) {
  if (!url) return '/placeholder-property.jpg';
  
  try {
    const filename = url.split('/').pop();
    if (!filename) return '/placeholder-property.jpg';
    
    return `/property-images/${propertySlug}/large-large_${filename}`;
  } catch (error) {
    console.error('Error generating local image URL:', error);
    return '/placeholder-property.jpg';
  }
}

/**
 * Normalizes a Strapi property object to have a consistent structure
 * 
 * @param {Object} property - The property object from Strapi
 * @returns {Object} A normalized property object with consistent structure
 */
export function normalizeProperty(property) {
  if (!property) return null;
  
  // Extract commonly used fields with fallbacks
  const id = property.id;
  const title = property.Title || property.title || 'Untitled Property';
  const slug = property.Slug || property.slug || `property-${id}`;
  const price = property.Price || property.price || 0;
  const description = property.Description || property.description || '';
  const location = property.Location || property.location || '';
  const isFeatured = property.IsFeatured || property.isFeatured || false;
  const createdAt = property.createdAt || new Date().toISOString();
  const updatedAt = property.updatedAt || new Date().toISOString();
  
  // Handle the featured image, prioritizing MainImage
  let featuredImage = null;
  if (property.MainImage) {
    featuredImage = {
      url: generateLocalImageUrl(property.MainImage.url, slug),
      alternativeText: property.MainImage.alternativeText || title,
      width: property.MainImage.width || 800,
      height: property.MainImage.height || 600
    };
  } else if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
    featuredImage = {
      url: generateLocalImageUrl(property.Image[0].url, slug),
      alternativeText: property.Image[0].alternativeText || title,
      width: property.Image[0].width || 800,
      height: property.Image[0].height || 600
    };
  }
  
  // Handle all images from the Image array
  const images = property.Image && Array.isArray(property.Image) 
    ? property.Image.map(img => ({
        url: generateLocalImageUrl(img.url, slug),
        alternativeText: img.alternativeText || title,
        width: img.width || 800,
        height: img.height || 600
      }))
    : [];
  
  // Return the normalized property with attributes structure
  return {
    id,
    attributes: {
      title,
      slug,
      price,
      description,
      location,
      isFeatured,
      createdAt,
      updatedAt,
      featuredImage,
      images,
      // Copy other fields that might be needed
      bedrooms: property.Bedrooms || property.bedrooms || 0,
      bathrooms: property.Bathrooms || property.bathrooms || 0,
      area: property.Area || property.area || property.square_footage || 'N/A',
      property_type: property.PropertyType || property.property_type || property.type || 'Property',
      status: property.Status || property.status || 'published',
      // Handle amenities from different formats
      amenities: property.Amenities || property.amenities || []
    }
  };
} 