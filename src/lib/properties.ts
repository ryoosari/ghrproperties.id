/**
 * Property Service
 * 
 * This service handles fetching property data from either:
 * - JSON snapshot files in static export mode
 * - Strapi API in dynamic mode
 */

import { 
  isStaticExport, 
  loadCollection, 
  loadItem, 
  getPropertyBySlug,
  getAllProperties
} from '../utils/snapshot';

// Define property interface
interface Property {
  id: string | number;
  attributes: {
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    location?: string;
    amenities?: string[];
    Amenities?: string[];
    [key: string]: any;
  };
}

/**
 * Get all properties, with optional filtering
 */
export async function getProperties(options: {
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  if (isStaticExport()) {
    // Static mode: load from snapshot files
    return getAllProperties(options);
  } else {
    // Dynamic mode: fetch from API
    try {
      // Import strapi client
      const strapiClient = require('./strapi').default;
      
      // Build API params for Strapi
      const params: Record<string, any> = {
        populate: '*'
      };
      
      if (options.limit) {
        params.pagination = {
          ...(params.pagination || {}),
          limit: options.limit
        };
      }
      
      if (options.status) {
        params.filters = {
          ...(params.filters || {}),
          status: {
            $eq: options.status
          }
        };
      }
      
      if (options.sortBy) {
        const sortDir = options.sortOrder || 'desc';
        params.sort = [`${options.sortBy}:${sortDir}`];
      }
      
      // Fetch from Strapi API
      const response = await strapiClient.getProperties(params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [] as Property[];
    }
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: number | string) {
  if (isStaticExport()) {
    // Static mode: load from snapshot file
    return loadItem<Property>('properties', id);
  } else {
    // Dynamic mode: fetch from API
    try {
      // Import strapi client
      const strapiClient = require('./strapi').default;
      
      // Fetch from Strapi API
      const response = await strapiClient.getPropertyById(id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      return null;
    }
  }
}

/**
 * Get a property by its slug
 */
export async function getPropertyBySlugHandler(slug: string) {
  if (isStaticExport()) {
    // Static mode: load from snapshot file
    return getPropertyBySlug(slug);
  } else {
    // Dynamic mode: fetch from API
    try {
      // Import strapi client
      const strapiClient = require('./strapi').default;
      
      // Fetch from Strapi API
      const response = await strapiClient.getPropertyBySlug(slug);
      return response || null;
    } catch (error) {
      console.error(`Error fetching property with slug ${slug}:`, error);
      return null;
    }
  }
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit = 4) {
  return getProperties({
    status: 'published',
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
}

/**
 * Get related properties (same category, location, etc.)
 */
export async function getRelatedProperties(propertyId: string | number, limit = 3) {
  // In a real implementation, you'd look up properties by category or location
  // For now, just return the latest properties excluding the current one
  const allProperties = await getProperties({
    status: 'published',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  return allProperties
    .filter((property: Property) => property.id !== propertyId)
    .slice(0, limit);
} 