#!/usr/bin/env node

/**
 * Update Property Page to Use Local Images
 * 
 * This script directly modifies the property detail page component 
 * to use the local images we've downloaded instead of remote Strapi images.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PAGE_FILE_PATH = path.join(process.cwd(), 'src', 'app', 'properties', '[slug]', 'page.tsx');

// Make sure the file exists
if (!fs.existsSync(PAGE_FILE_PATH)) {
  console.error(`❌ Property page file not found: ${PAGE_FILE_PATH}`);
  process.exit(1);
}

// Read the file
console.log(`Reading file: ${PAGE_FILE_PATH}`);
let content = fs.readFileSync(PAGE_FILE_PATH, 'utf8');

// Update the normalizePropertyData function to use local images
const originalNormalizeFunction = content.match(/function normalizePropertyData\(property: any\) \{[\s\S]+?\}/s);

if (!originalNormalizeFunction) {
  console.error('❌ Could not find normalizePropertyData function in the file');
  process.exit(1);
}

console.log('Found normalizePropertyData function, updating...');

// Create the updated function with local image paths
const updatedFunction = `function normalizePropertyData(property: any) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  
  // Map for storing image mappings for this property
  const propertySlug = property.attributes?.slug || property.Slug || property.slug || \`property-\${property.id}\`;
  const localImageBasePath = \`/property-images/\${propertySlug}\`;
  
  // If it's a static property (with attributes), normalize it
  if (property.attributes) {
    const { attributes } = property;
    
    // Extract featured image URL - use local path
    let featuredImageUrl: string | null = null;
    
    // For simplicitly, just use the first property image from local storage
    featuredImageUrl = \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg\`;
    
    // Extract gallery images - use local paths 
    const galleryImages: string[] = [
      \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg\`,
      \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg\`,
      \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg\`,
      \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg\`
    ];
    
    // Extract amenities if they exist - handle component structure
    let amenities: any[] = [];
    
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
  // Extract featured image - use local path
  let featuredImageUrl: string | null = null;
  
  // For simplicitly, just use the first property image from local storage
  featuredImageUrl = \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg\`;
  
  // Extract gallery images - use local paths
  const galleryImages: string[] = [
    \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg\`,
    \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg\`,
    \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg\`,
    \`\${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg\`
  ];
  
  // Extract amenities from Strapi format - handle component structure
  let amenities: any[] = [];
  
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

// Replace the original function with our updated version
const updatedContent = content.replace(originalNormalizeFunction[0], updatedFunction);

// Write the updated file
console.log('Writing updated file...');
fs.writeFileSync(PAGE_FILE_PATH, updatedContent);

console.log('✅ Successfully updated property page to use local images');
console.log('Restart your development server to see the changes'); 