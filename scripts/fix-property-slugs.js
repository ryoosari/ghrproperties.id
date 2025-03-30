#!/usr/bin/env node

/**
 * Fix Property Slugs Script
 * 
 * This script fixes inconsistent property slug formats across different data files,
 * ensuring they all use the same format to prevent duplicate property cards.
 * 
 * Usage:
 *   node scripts/fix-property-slugs.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_DIR = path.join(DATA_DIR, 'properties');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshot');

/**
 * Slugify text to create URL-friendly slugs with consistent format
 */
function slugify(text) {
  if (!text) return '';
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
    
  // Critical fix for numerical prefixes - ensure "3BR" becomes "3br" not "3-br"
  slug = slug.replace(/(\d+)-([a-z])/g, '$1$2');
  
  return slug;
}

/**
 * Main function to fix property slugs
 */
async function fixPropertySlugs() {
  console.log('🔧 Starting property slug fix operation...');
  
  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ Data directory not found:', DATA_DIR);
    return;
  }
  
  if (!fs.existsSync(PROPERTIES_DIR)) {
    fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
  }
  
  // Step 1: Load all property data files to find consolidated data
  const propertyFiles = [];
  
  // Check main properties.json first
  const mainPropertiesPath = path.join(DATA_DIR, 'properties.json');
  if (fs.existsSync(mainPropertiesPath)) {
    try {
      const properties = JSON.parse(fs.readFileSync(mainPropertiesPath, 'utf8'));
      console.log(`Loaded ${properties.length} properties from main properties.json`);
      
      propertyFiles.push({
        path: mainPropertiesPath,
        data: properties,
        isArray: true
      });
    } catch (error) {
      console.error('Error reading properties.json:', error.message);
    }
  }
  
  // Check processed-properties.json next
  const processedPropertiesPath = path.join(DATA_DIR, 'processed-properties.json');
  if (fs.existsSync(processedPropertiesPath)) {
    try {
      const properties = JSON.parse(fs.readFileSync(processedPropertiesPath, 'utf8'));
      console.log(`Loaded ${properties.length} properties from processed-properties.json`);
      
      propertyFiles.push({
        path: processedPropertiesPath,
        data: properties,
        isArray: true
      });
    } catch (error) {
      console.error('Error reading processed-properties.json:', error.message);
    }
  }
  
  // Check property-index.json
  const propertyIndexPath = path.join(DATA_DIR, 'property-index.json');
  if (fs.existsSync(propertyIndexPath)) {
    try {
      const propertyIndex = JSON.parse(fs.readFileSync(propertyIndexPath, 'utf8'));
      console.log(`Loaded ${propertyIndex.length} properties from property-index.json`);
      
      propertyFiles.push({
        path: propertyIndexPath,
        data: propertyIndex,
        isArray: true
      });
    } catch (error) {
      console.error('Error reading property-index.json:', error.message);
    }
  }
  
  // Check individual property files in data directory
  const dataFiles = fs.readdirSync(DATA_DIR).filter(file => 
    file.endsWith('.json') && 
    file !== 'properties.json' && 
    file !== 'processed-properties.json' && 
    file !== 'property-index.json' &&
    file !== 'last-updated.json' && 
    file !== 'metadata.json'
  );
  
  console.log(`Found ${dataFiles.length} individual property files in data directory`);
  
  for (const file of dataFiles) {
    const filePath = path.join(DATA_DIR, file);
    try {
      const property = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      propertyFiles.push({
        path: filePath,
        data: property,
        isArray: false
      });
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  // Check property files in properties directory
  if (fs.existsSync(PROPERTIES_DIR)) {
    const propDirFiles = fs.readdirSync(PROPERTIES_DIR).filter(file => file.endsWith('.json'));
    console.log(`Found ${propDirFiles.length} property files in properties directory`);
    
    for (const file of propDirFiles) {
      const filePath = path.join(PROPERTIES_DIR, file);
      try {
        const property = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        propertyFiles.push({
          path: filePath,
          data: property,
          isArray: false
        });
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
  }
  
  // Step 2: Process all property files to create a master map of properties by ID
  const propertiesById = new Map();
  
  for (const file of propertyFiles) {
    const data = file.isArray ? file.data : [file.data];
    
    for (const property of data) {
      const id = property.id;
      
      if (!id) {
        console.warn(`Skipping property without ID in ${file.path}`);
        continue;
      }
      
      // If this property ID doesn't exist in our map yet, add it
      if (!propertiesById.has(id)) {
        propertiesById.set(id, property);
      } else {
        // If we already have this property, merge in any missing data
        const existingProperty = propertiesById.get(id);
        
        // Prioritize full property data over minimal data
        const betterProperty = isBetterProperty(property, existingProperty) ? 
          property : existingProperty;
        
        propertiesById.set(id, betterProperty);
      }
    }
  }
  
  console.log(`Consolidated ${propertiesById.size} unique properties by ID`);
  
  // Step 3: Normalize slugs in all properties
  for (const [id, property] of propertiesById.entries()) {
    const title = property.Title || property.title || `Property ${id}`;
    const slug = slugify(title);
    
    // Set the normalized slug consistently across all fields
    if (property.Slug !== undefined) {
      property.Slug = slug;
    }
    
    if (property.slug !== undefined) {
      property.slug = slug;
    }
    
    if (property.attributes && property.attributes.slug !== undefined) {
      property.attributes.slug = slug;
    }
    
    console.log(`Normalized property #${id}: "${title}" -> slug: "${slug}"`);
  }
  
  // Step 4: Update all property files with normalized slugs
  console.log('\n📝 Updating property files with normalized slugs...');
  
  // Update main properties.json
  if (fs.existsSync(mainPropertiesPath)) {
    try {
      const properties = JSON.parse(fs.readFileSync(mainPropertiesPath, 'utf8'));
      
      for (let i = 0; i < properties.length; i++) {
        const id = properties[i].id;
        if (propertiesById.has(id)) {
          // Update only the slug field, preserve the rest of the data
          if (properties[i].Slug !== undefined) {
            properties[i].Slug = propertiesById.get(id).Slug || propertiesById.get(id).slug;
          }
          
          if (properties[i].slug !== undefined) {
            properties[i].slug = propertiesById.get(id).slug || propertiesById.get(id).Slug;
          }
        }
      }
      
      fs.writeFileSync(mainPropertiesPath, JSON.stringify(properties, null, 2));
      console.log(`✅ Updated properties.json with normalized slugs`);
    } catch (error) {
      console.error('Error updating properties.json:', error.message);
    }
  }
  
  // Update processed-properties.json
  if (fs.existsSync(processedPropertiesPath)) {
    try {
      const properties = JSON.parse(fs.readFileSync(processedPropertiesPath, 'utf8'));
      
      for (let i = 0; i < properties.length; i++) {
        const id = properties[i].id;
        if (propertiesById.has(id)) {
          // Update only the slug field, preserve the rest of the data
          if (properties[i].Slug !== undefined) {
            properties[i].Slug = propertiesById.get(id).Slug || propertiesById.get(id).slug;
          }
          
          if (properties[i].slug !== undefined) {
            properties[i].slug = propertiesById.get(id).slug || propertiesById.get(id).Slug;
          }
        }
      }
      
      fs.writeFileSync(processedPropertiesPath, JSON.stringify(properties, null, 2));
      console.log(`✅ Updated processed-properties.json with normalized slugs`);
    } catch (error) {
      console.error('Error updating processed-properties.json:', error.message);
    }
  }
  
  // Update property-index.json
  if (fs.existsSync(propertyIndexPath)) {
    try {
      const propertyIndex = JSON.parse(fs.readFileSync(propertyIndexPath, 'utf8'));
      
      for (let i = 0; i < propertyIndex.length; i++) {
        const id = propertyIndex[i].id;
        if (propertiesById.has(id) && propertyIndex[i].attributes) {
          propertyIndex[i].attributes.slug = propertiesById.get(id).Slug || 
                                            propertiesById.get(id).slug || 
                                            (propertiesById.get(id).attributes && propertiesById.get(id).attributes.slug);
        }
      }
      
      fs.writeFileSync(propertyIndexPath, JSON.stringify(propertyIndex, null, 2));
      console.log(`✅ Updated property-index.json with normalized slugs`);
    } catch (error) {
      console.error('Error updating property-index.json:', error.message);
    }
  }
  
  // Step 5: Remove all individual property files and recreate them with correct slugs
  console.log('\n🧹 Cleaning up and regenerating individual property files...');
  
  // Clean up old property files in data directory
  for (const file of dataFiles) {
    const filePath = path.join(DATA_DIR, file);
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Error removing file ${filePath}:`, error.message);
    }
  }
  
  // Clean up old property files in properties directory
  if (fs.existsSync(PROPERTIES_DIR)) {
    const propDirFiles = fs.readdirSync(PROPERTIES_DIR).filter(file => file.endsWith('.json'));
    for (const file of propDirFiles) {
      const filePath = path.join(PROPERTIES_DIR, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error removing file ${filePath}:`, error.message);
      }
    }
  }
  
  // Create new property files with normalized data
  for (const [id, property] of propertiesById.entries()) {
    const slug = property.Slug || property.slug || 
                (property.attributes && property.attributes.slug) || 
                `property-${id}`;
    
    // Create slug-based file in data directory
    const dataFilePath = path.join(DATA_DIR, `${slug}.json`);
    fs.writeFileSync(dataFilePath, JSON.stringify(property, null, 2));
    
    // Create slug-based file in properties directory
    const propDirFilePath = path.join(PROPERTIES_DIR, `${slug}.json`);
    fs.writeFileSync(propDirFilePath, JSON.stringify(property, null, 2));
    
    // Create ID-based file for backward compatibility
    const idFilePath = path.join(DATA_DIR, `properties-${id}.json`);
    fs.writeFileSync(idFilePath, JSON.stringify(property, null, 2));
  }
  
  console.log(`✅ Created ${propertiesById.size * 3} property files with consistent slugs`);
  console.log('🎉 Property slug fix operation completed successfully!');
}

/**
 * Determine if a property has more complete data than another
 */
function isBetterProperty(propertyA, propertyB) {
  // Calculate completeness score (higher is better)
  const scoreA = calculateCompletenessScore(propertyA);
  const scoreB = calculateCompletenessScore(propertyB);
  
  return scoreA > scoreB;
}

/**
 * Calculate a completeness score for a property (higher is better)
 */
function calculateCompletenessScore(property) {
  let score = 0;
  
  // Core property fields
  if (property.Title || property.title) score += 1;
  if (property.Description || property.description) score += 1;
  
  // Location
  if (property.Location || property.location) score += 1;
  
  // Specs
  if (property.Bedrooms || property.bedrooms) score += 2;
  if (property.Bathrooms || property.bathrooms) score += 2;
  if (property.Area || property.area) score += 1;
  
  // Amenities
  const hasAmenities = (property.Amenities && Array.isArray(property.Amenities) && property.Amenities.length > 0) || 
                      (property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0);
  
  if (hasAmenities) score += 3;
  
  // Images
  const hasImages = (property.Image && Array.isArray(property.Image) && property.Image.length > 0) ||
                    (property.images && Array.isArray(property.images) && property.images.length > 0);
  
  if (hasImages) score += 2;
  
  // Check for nested attributes
  if (property.attributes) {
    const attrs = property.attributes;
    
    if (attrs.title) score += 1;
    if (attrs.description) score += 1;
    if (attrs.location) score += 1;
    if (attrs.bedrooms) score += 2;
    if (attrs.bathrooms) score += 2;
    if (attrs.area) score += 1;
    
    const hasAttrsAmenities = (attrs.Amenities && Array.isArray(attrs.Amenities) && attrs.Amenities.length > 0) || 
                             (attrs.amenities && Array.isArray(attrs.amenities) && attrs.amenities.length > 0);
    
    if (hasAttrsAmenities) score += 3;
    
    if (attrs.featuredImage || attrs.images) score += 2;
  }
  
  return score;
}

// Run the fix operation
fixPropertySlugs()
  .then(() => {
    console.log('Slug fix operation completed successfully.');
  })
  .catch(error => {
    console.error('Error during slug fix operation:', error);
    process.exit(1);
  }); 