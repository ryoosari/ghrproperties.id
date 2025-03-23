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
      // Build API URL with query parameters
      const queryParams = new URLSearchParams();
      
      if (options.limit) {
        queryParams.append('pagination[limit]', options.limit.toString());
      }
      
      if (options.status) {
        queryParams.append('filters[status][$eq]', options.status);
      }
      
      if (options.sortBy) {
        const sortDir = options.sortOrder || 'desc';
        queryParams.append('sort', `${options.sortBy}:${sortDir}`);
      }
      
      // This would be your actual API call
      // const response = await fetch(`/api/properties?${queryParams.toString()}`);
      // const data = await response.json();
      // return data;
      
      // For now, just return empty array until API is implemented
      console.log('Would fetch properties from API with params:', queryParams.toString());
      return [] as Property[];
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
      // This would be your actual API call
      // const response = await fetch(`/api/properties/${id}`);
      // const data = await response.json();
      // return data;
      
      // For now, just return null until API is implemented
      console.log(`Would fetch property with ID ${id} from API`);
      return null;
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
      // This would be your actual API call
      // const response = await fetch(`/api/properties?filters[slug][$eq]=${slug}`);
      // const data = await response.json();
      // return data.data[0] || null;
      
      // For now, just return null until API is implemented
      console.log(`Would fetch property with slug ${slug} from API`);
      return null;
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
    .filter(property => property.id !== propertyId)
    .slice(0, limit);
} 