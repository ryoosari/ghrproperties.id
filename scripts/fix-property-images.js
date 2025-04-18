#!/usr/bin/env node

/**
 * Fix Property Images
 * 
 * This script directly modifies the property detail page to use local images
 * instead of Strapi images, avoiding CORS and connectivity issues.
 * 
 * Can be used both as a standalone script or imported as a module in an ES module.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PAGE_FILE_PATH = path.join(process.cwd(), 'src', 'app', 'properties', '[slug]', 'page.tsx');

// Execute the function to fix the property images
function fixPropertyImages() {
  console.log('🔧 Updating property page to use local images...');
  
  // Make sure the file exists
  if (!fs.existsSync(PAGE_FILE_PATH)) {
    console.error(`❌ Property page file not found: ${PAGE_FILE_PATH}`);
    return false;
  }
  
  // Read the file
  console.log(`Reading file: ${PAGE_FILE_PATH}`);
  let content = fs.readFileSync(PAGE_FILE_PATH, 'utf8');
  
  // Create a simple function to replace
  const simpleNormalizeFunction = `function normalizePropertyData(property: any) {
  // Map for storing image mappings for this property
  const propertySlug = property.attributes?.slug || property.Slug || property.slug || \`property-\${property.id}\`;
  const localImageBasePath = \`/property-images/\${propertySlug}\`;
  
  // If it's a static property (with attributes), normalize it
  if (property.attributes) {
    const { attributes } = property;
    
    // Extract featured image URL - prioritize MainImage if available
    let featuredImageUrl = '/placeholder-property.jpg';
    let galleryImages: string[] = [];
    
    // Use MainImage as featured image if available
    if (attributes.MainImage && attributes.MainImage.url) {
      const mainImageUrl = attributes.MainImage.url;
      const mainImageFilename = mainImageUrl.split('/').pop();
      
      if (mainImageFilename) {
        featuredImageUrl = \`\${localImageBasePath}/large-large_\${mainImageFilename}\`;
      }
    } 
    // Fall back to first image from Image array
    else if (attributes.Image && Array.isArray(attributes.Image) && attributes.Image.length > 0) {
      const firstImage = attributes.Image[0];
      if (firstImage && firstImage.url) {
        const firstImageUrl = firstImage.url;
        const firstImageFilename = firstImageUrl.split('/').pop();
        
        if (firstImageFilename) {
          featuredImageUrl = \`\${localImageBasePath}/large-large_\${firstImageFilename}\`;
        }
      }
    }
    
    // Extract gallery images from Image array
    if (attributes.Image && Array.isArray(attributes.Image)) {
      galleryImages = attributes.Image
        .filter(img => img && img.url)
        .map(img => {
          const imgUrl = img.url;
          const imgFilename = imgUrl.split('/').pop();
          return \`\${localImageBasePath}/large-large_\${imgFilename}\`;
        });
    }
    
    // Extract amenities if they exist - handle component structure
    let amenities = [];
    
    // Handle component-based amenities (new format)
    if (attributes.Amenities && Array.isArray(attributes.Amenities)) {
      
      // Keep the original array to preserve the object structure
      amenities = attributes.Amenities;

    } 
    // Handle old format (direct string array)
    else if (attributes.amenities && Array.isArray(attributes.amenities)) {
      amenities = attributes.amenities;
    }
    
    // Extract location details
    let address = '';
    let latitude = null;
    let longitude = null;
    
    if (attributes.propertyLocation) {
      const location = attributes.propertyLocation;
      
      // Use the single address field
      address = location.address || '';
      
      // Extract coordinates
      if (location.latitude && location.longitude) {
        latitude = parseFloat(location.latitude);
        longitude = parseFloat(location.longitude);
      }
    }

    return {
      id: property.id,
      title: attributes.title || 'Unnamed Property',
      description: attributes.description || '',
      location: attributes.location || 'Location not specified',
      price: attributes.price || 0,
      bedrooms: attributes.bedrooms || 0,
      bathrooms: attributes.bathrooms || 0,
      area: attributes.Area || attributes.square_footage || attributes.area || 'N/A',
      property_type: attributes.PropertyType || attributes.property_type || 'Property',
      status: attributes.status || 'unlisted',
      kitchen: attributes.kitchen || 1,
      living_room: attributes.living_room || 1,
      featured_image: featuredImageUrl,
      gallery_images: galleryImages,
      amenities: amenities,
      slug: attributes.slug,
      // Add location details
      address: address,
      latitude: latitude,
      longitude: longitude
    };
  }
  
  // If it's a Strapi property (direct properties), normalize it
  // Extract featured image - prioritize MainImage if available
  let featuredImageUrl = '/placeholder-property.jpg';
  let galleryImages: string[] = [];
  
  // Use MainImage as featured image if available
  if (property.MainImage && property.MainImage.url) {
    const mainImageUrl = property.MainImage.url;
    const mainImageFilename = mainImageUrl.split('/').pop();
    
    if (mainImageFilename) {
      featuredImageUrl = \`\${localImageBasePath}/large-large_\${mainImageFilename}\`;
    }
  } 
  // Fall back to first image from Image array
  else if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
    const firstImage = property.Image[0];
    if (firstImage && firstImage.url) {
      const firstImageUrl = firstImage.url;
      const firstImageFilename = firstImageUrl.split('/').pop();
      
      if (firstImageFilename) {
        featuredImageUrl = \`\${localImageBasePath}/large-large_\${firstImageFilename}\`;
      }
    }
  }
  
  // Extract gallery images from Image array
  if (property.Image && Array.isArray(property.Image)) {
    galleryImages = property.Image
      .filter(img => img && img.url)
      .map(img => {
        const imgUrl = img.url;
        const imgFilename = imgUrl.split('/').pop();
        return \`\${localImageBasePath}/large-large_\${imgFilename}\`;
      });
  }
  
  // Extract amenities from Strapi format - handle component structure
  let amenities = [];
  
  // Handle component-based amenities (new format)
  if (property.Amenities && Array.isArray(property.Amenities)) {
    
    // Keep the original array to preserve the object structure
    amenities = property.Amenities;

  } 
  // Handle old format (direct string array)
  else if (property.amenities && Array.isArray(property.amenities)) {
    amenities = property.amenities;
  }
  
  // Extract location details
  let address = '';
  let latitude = null;
  let longitude = null;
  
  if (property.propertyLocation) {
    const location = property.propertyLocation;
    
    // Use the single address field
    address = location.address || '';
    
    // Extract coordinates
    if (location.latitude && location.longitude) {
      latitude = parseFloat(location.latitude);
      longitude = parseFloat(location.longitude);
    }
  }

  return {
    id: property.id,
    title: property.Title || 'Unnamed Property',
    description: property.Description || '',
    location: property.Location || 'Location not specified',
    price: property.Price || 0,
    bedrooms: property.Bedrooms || 0,
    bathrooms: property.Bathrooms || 0,
    area: property.Area || property.square_footage || 'N/A',
    property_type: property.PropertyType || 'Property',
    status: property.Status || 'unlisted',
    kitchen: property.Kitchen || 1,
    living_room: property.LivingRoom || 1,
    featured_image: featuredImageUrl,
    gallery_images: galleryImages,
    amenities: amenities,
    slug: property.Slug || property.slug,
    // Add location details
    address: address,
    latitude: latitude,
    longitude: longitude
  };
}`;
  
  // Find and replace the normalizePropertyData function
  const functionRegex = /function normalizePropertyData\(property: any\) \{[\s\S]+?^}/ms;
  
  if (!functionRegex.test(content)) {
    console.error('❌ Could not find normalizePropertyData function in the file');
    return false;
  }
  
  // Replace the function
  const updatedContent = content.replace(functionRegex, simpleNormalizeFunction);
  
  // Write the updated file
  console.log('Writing updated file...');
  fs.writeFileSync(PAGE_FILE_PATH, updatedContent);
  
  console.log('✅ Successfully updated property page to use local images');
  return true;
}

// When run directly as a script
if (require.main === module) {
  if (fixPropertyImages()) {
    console.log('✅ Successfully fixed property images');
  } else {
    console.error('❌ Failed to fix property images');
    process.exit(1);
  }
}

// For ESM compatibility - export the function
module.exports = {
  fixPropertyImages
}; 