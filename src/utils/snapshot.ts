/**
 * Content Snapshot Utility
 * 
 * This utility provides functions to load content from JSON snapshot files
 * instead of fetching from an API at runtime.
 */

import fs from 'fs';
import path from 'path';

// Types
export interface SnapshotMetadata {
  exportedAt: string;
  stats: Record<string, number>;
  source: string;
}

// Define property interface
export interface Property {
  id: string | number;
  attributes: {
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
}

// Paths
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Check if we're using static export mode
 */
export function isStaticExport(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
}

/**
 * Load a content snapshot file
 */
export function loadSnapshotFile<T>(filename: string): T | null {
  try {
    const filePath = path.join(DATA_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Snapshot file not found: ${filePath}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error loading snapshot file ${filename}:`, error);
    return null;
  }
}

/**
 * Get metadata about the snapshot
 */
export function getSnapshotMetadata(): SnapshotMetadata | null {
  return loadSnapshotFile<SnapshotMetadata>('metadata.json');
}

/**
 * Load a collection
 */
export function loadCollection<T>(contentType: string): T[] {
  const data = loadSnapshotFile<T[]>(`${contentType}.json`);
  return data || [];
}

/**
 * Load a single item by ID
 */
export function loadItem<T>(contentType: string, id: number | string): T | null {
  // Try direct file first (this is the normal pattern for static snapshots)
  let data = loadSnapshotFile<T>(`${contentType}/${id}.json`);
  
  // If not found, try the legacy pattern
  if (!data) {
    data = loadSnapshotFile<T>(`${contentType}-${id}.json`);
  }
  
  return data;
}

/**
 * Load property index (optimized for quick access)
 */
export function loadPropertyIndex(): Property[] {
  // First try to load from property-index.json
  const indexData = loadSnapshotFile<Property[]>('property-index.json');
  if (indexData && indexData.length > 0) {
    console.log(`Loaded ${indexData.length} properties from property-index.json`);
    return indexData;
  } else {
    console.log('No properties found in property-index.json or file does not exist');
  }
  
  // If property-index.json is empty or doesn't exist but exists and is explicitly empty,
  // respect that and return an empty array
  if (fs.existsSync(path.join(DATA_DIR, 'property-index.json'))) {
    try {
      const fileContent = fs.readFileSync(path.join(DATA_DIR, 'property-index.json'), 'utf8');
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length === 0) {
        console.log('property-index.json exists but is explicitly empty, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error parsing property-index.json:', error);
    }
  }
  
  // If no property index is found, try to build one from individual files
  try {
    const propertiesDir = path.join(DATA_DIR, 'properties');
    if (fs.existsSync(propertiesDir)) {
      const propertyFiles = fs.readdirSync(propertiesDir)
        .filter(file => file.endsWith('.json'));
      
      if (propertyFiles.length > 0) {
        console.log(`Found ${propertyFiles.length} property files in properties directory`);
        return propertyFiles.map(file => {
          const id = file.replace('.json', '');
          const property = loadItem<any>('properties', id);
          
          if (!property) return null;
          
          // Convert to the expected Property format
          return {
            id: property.id || id,
            attributes: {
              title: property.title || property.Title || 'Untitled Property',
              slug: property.slug || property.Slug || `property-${id}`,
              status: property.status || 'published',
              createdAt: property.createdAt || new Date().toISOString(),
              updatedAt: property.updatedAt || new Date().toISOString(),
              // Additional fields
              price: property.price || property.Price || 0,
              location: property.location || property.Location || '',
              // Add other fields as needed
            }
          };
        }).filter(Boolean) as Property[];
      } else {
        console.log('No property files found in properties directory');
      }
    } else {
      console.log('Properties directory does not exist');
    }
  } catch (error) {
    console.error('Error building property index from files:', error);
  }
  
  // If still no index, try extracting from a direct properties.json file
  const allProperties = loadCollection<any>('properties');
  if (allProperties && allProperties.length > 0) {
    console.log(`Loaded ${allProperties.length} properties from properties.json`);
    return allProperties.map(prop => ({
      id: prop.id,
      attributes: {
        title: prop.Title || prop.title || 'Untitled Property',
        slug: prop.Slug || prop.slug || `property-${prop.id}`,
        status: 'published',
        createdAt: prop.createdAt || new Date().toISOString(),
        updatedAt: prop.updatedAt || new Date().toISOString(),
        price: prop.Price || prop.price || 0,
        propertyType: prop.PropertyType || prop.property_type || 'Property',
        image: prop.Image && Array.isArray(prop.Image) && prop.Image.length > 0 ? 
          prop.Image[0].url : null,
        location: prop.Location || prop.location || '',
        bedrooms: prop.Bedrooms || prop.bedrooms || 0,
        bathrooms: prop.Bathrooms || prop.bathrooms || 0,
        area: prop.Area || prop.area || 0
      }
    }));
  } else {
    console.log('No properties found in properties.json or file does not exist');
  }
  
  console.log('No properties found in any data source');
  return [];
}

/**
 * Load a property by its slug
 */
export function getPropertyBySlug(slug: string): Property | null {
  // First check the index for the ID
  const index = loadPropertyIndex();
  const property = index.find(p => p.attributes.slug === slug);
  
  if (!property) {
    return null;
  }
  
  // Then try to load the full property data
  let fullProperty = loadItem<any>('properties', property.id);
  
  // If we didn't find a property file, convert the index entry to a full property
  if (!fullProperty) {
    return {
      id: property.id,
      attributes: {
        ...property.attributes,
        // Add any additional processing here if needed
      }
    };
  }
  
  // Convert the loaded property to the expected format
  return {
    id: fullProperty.id || property.id,
    attributes: {
      title: fullProperty.Title || fullProperty.title || property.attributes.title,
      slug: fullProperty.Slug || fullProperty.slug || property.attributes.slug,
      status: 'published',
      createdAt: fullProperty.createdAt || property.attributes.createdAt,
      updatedAt: fullProperty.updatedAt || property.attributes.updatedAt,
      description: fullProperty.Description || fullProperty.description || '',
      price: fullProperty.Price || fullProperty.price || 0,
      location: fullProperty.Location || fullProperty.location || '',
      // Handle images
      featuredImage: fullProperty.Image && Array.isArray(fullProperty.Image) && fullProperty.Image.length > 0 ? {
        url: fullProperty.Image[0].url,
        alternativeText: fullProperty.Image[0].alternativeText || fullProperty.Title || '',
        width: fullProperty.Image[0].width || 800,
        height: fullProperty.Image[0].height || 600
      } : null,
      // Other fields
      bedrooms: fullProperty.Bedrooms || fullProperty.bedrooms || 0,
      bathrooms: fullProperty.Bathrooms || fullProperty.bathrooms || 0,
      area: fullProperty.Area || fullProperty.area || 'N/A',
      property_type: fullProperty.PropertyType || fullProperty.property_type || 'Property',
      amenities: fullProperty.Amenities || fullProperty.amenities || []
    }
  };
}

/**
 * Get all properties with optional filtering
 */
export function getAllProperties(options: {
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Property[] {
  // First try to use a combined file (if it exists)
  let properties: Property[] = [];
  
  const allProperties = loadCollection<any>('properties');
  if (allProperties && allProperties.length > 0) {
    // Convert to the standardized Property format
    properties = allProperties.map(prop => ({
      id: prop.id,
      attributes: {
        title: prop.Title || prop.title || 'Untitled Property',
        slug: prop.Slug || prop.slug || `property-${prop.id}`,
        status: 'published',
        createdAt: prop.createdAt || new Date().toISOString(),
        updatedAt: prop.updatedAt || new Date().toISOString(),
        description: prop.Description || prop.description || '',
        price: prop.Price || prop.price || 0,
        location: prop.Location || prop.location || '',
        // Handle images
        featuredImage: prop.Image && Array.isArray(prop.Image) && prop.Image.length > 0 ? {
          url: prop.Image[0].url,
          alternativeText: prop.Image[0].alternativeText || prop.Title || '',
          width: prop.Image[0].width || 800,
          height: prop.Image[0].height || 600
        } : null,
        // Other fields
        bedrooms: prop.Bedrooms || prop.bedrooms || 0,
        bathrooms: prop.Bathrooms || prop.bathrooms || 0,
        area: prop.Area || prop.area || 'N/A',
        property_type: prop.PropertyType || prop.property_type || 'Property',
        amenities: prop.Amenities || prop.amenities || []
      }
    }));
  } else {
    // If no combined file, try using the property index
    try {
      properties = loadPropertyIndex();
      
      // If properties is an empty array, that means there are no properties in the data
      // This is expected behavior when Strapi has no properties or when the export failed
      if (properties.length === 0) {
        console.log('No properties found in the property index, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error loading property index:', error);
      return []; // Return empty array when there's an error
    }
  }
  
  // If we have no properties at this point, return empty array
  if (!properties || properties.length === 0) {
    console.log('No properties found in any data source, returning empty array');
    return [];
  }
  
  // Filter by status if provided
  let filtered = properties;
  if (options.status) {
    filtered = properties.filter(p => 
      p.attributes.status === options.status
    );
  }
  
  // Sort properties
  const sortBy = options.sortBy || 'updatedAt';
  const sortOrder = options.sortOrder || 'desc';
  
  const sorted = [...filtered].sort((a, b) => {
    const aValue = a.attributes[sortBy];
    const bValue = b.attributes[sortBy];
    
    // Handle numeric vs string sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Default to string comparison
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Apply limit if provided
  if (options.limit && options.limit > 0) {
    return sorted.slice(0, options.limit);
  }
  
  return sorted;
}

/**
 * Get site settings
 */
export function getSiteSettings() {
  const settings = loadCollection<any>('settings');
  return settings[0] || null;
}

/**
 * Get page by slug
 */
export function getPageBySlug(slug: string) {
  const pages = loadCollection<any>('pages');
  return pages.find(p => p.attributes.slug === slug) || null;
}

/**
 * Universal fetch function that works in both static and dynamic modes
 * In static mode, it loads from snapshot files
 * In dynamic mode, it fetches from the API
 */
export async function fetchContent<T>(
  contentType: string,
  options: {
    id?: string | number;
    slug?: string;
    params?: Record<string, any>;
    apiEndpoint?: string;
  } = {}
): Promise<T | null> {
  // In static export mode, load from snapshot files
  if (isStaticExport()) {
    if (options.id) {
      return loadItem<T>(contentType, options.id);
    }
    
    if (options.slug) {
      if (contentType === 'properties') {
        return getPropertyBySlug(options.slug) as unknown as T;
      } else if (contentType === 'pages') {
        return getPageBySlug(options.slug) as unknown as T;
      }
    }
    
    return loadCollection<T>(contentType)[0] || null;
  }
  
  // In dynamic mode, fetch from API
  try {
    // Import strapi client
    const strapiClient = require('../lib/strapi').default;
    
    // Handle different content types
    if (contentType === 'properties') {
      if (options.id) {
        const response = await strapiClient.getPropertyById(options.id);
        return response.data as unknown as T || null;
      }
      
      if (options.slug) {
        const response = await strapiClient.getPropertyBySlug(options.slug);
        return response as unknown as T || null;
      }
      
      const response = await strapiClient.getProperties(options.params || {});
      return (response.data?.[0] || null) as unknown as T;
    }
    
    // Default API call for other content types
    console.log(`Fetching from API: ${contentType}`);
    return null;
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
}