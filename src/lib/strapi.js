import axios from 'axios';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Create a configured axios instance for Strapi
const strapiClient = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: STRAPI_API_TOKEN 
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    : {}
});

/**
 * Fetch all properties from Strapi
 * 
 * @param {Object} options - Query options for the request
 * @returns {Promise<Object>} API response with data and meta properties
 */
export async function getProperties(options = {}) {
  try {
    // Set up default params with population
    const query = {
      populate: '*',
      sort: ['createdAt:desc'],
      ...options
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const response = await strapiClient.get(`/properties?${queryString}`);
    
    console.log('Raw Strapi response:', response.data);
    
    // Return the data directly as it already has the correct structure
    // Fields are directly on the data objects, not in attributes
    return response.data;
  } catch (error) {
    console.error('Error fetching properties from Strapi:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}

/**
 * Fetch a single property by slug
 * 
 * @param {string} slug - The property slug
 * @returns {Promise<Object>} Property object
 */
export async function getPropertyBySlug(slug) {
  try {
    const query = {
      filters: {
        Slug: {
          $eq: slug
        }
      },
      populate: '*'
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const response = await strapiClient.get(`/properties?${queryString}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }
    
    // Return the property directly as it already has the correct structure
    return response.data.data[0];
  } catch (error) {
    console.error(`Error fetching property with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch a property by ID
 * 
 * @param {number|string} id - The property ID
 * @returns {Promise<Object>} Property object
 */
export async function getPropertyById(id) {
  try {
    const query = {
      populate: '*'
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    
    // First try with direct ID endpoint
    try {
      const response = await strapiClient.get(`/properties/${id}?${queryString}`);
      
      // Return the property directly
      return response.data.data;
    } catch (directError) {
      // If direct ID endpoint fails, try with filters
      const filterQuery = {
        filters: {
          id: {
            $eq: id
          }
        },
        populate: '*'
      };
      
      const filterQueryString = qs.stringify(filterQuery, { encodeValuesOnly: true });
      const response = await strapiClient.get(`/properties?${filterQueryString}`);
      
      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }
      
      // Return the property directly
      return response.data.data[0];
    }
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    return null;
  }
}

/**
 * Helper function to get the URL for a Strapi media
 * 
 * @param {Object|Array} media - Strapi media object or array
 * @param {string} format - Optional format (thumbnail, small, medium, large)
 * @returns {string} Full URL to the media
 */
export function getStrapiMediaUrl(media, format = '') {
  if (!media) {
    return '';
  }
  
  try {
    // Handle array of media objects (your Strapi structure)
    if (Array.isArray(media) && media.length > 0) {
      const imageObj = media[0];
      
      // If format is specified and available, use it
      if (format && 
          imageObj.formats && 
          imageObj.formats[format] && 
          imageObj.formats[format].url) {
        const formatUrl = imageObj.formats[format].url;
        const fullUrl = formatUrl.startsWith('/') ? `${STRAPI_URL}${formatUrl}` : formatUrl;
        return fullUrl;
      }
      
      // Otherwise use original image URL
      if (imageObj.url) {
        const fullUrl = imageObj.url.startsWith('/') ? `${STRAPI_URL}${imageObj.url}` : imageObj.url;
        return fullUrl;
      }
    }
    
    // Legacy structure with data property
    if (media.data) {
      // Handle array in data
      if (Array.isArray(media.data) && media.data.length > 0) {
        const { url } = media.data[0].attributes;
        const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
        return fullUrl;
      }
      
      // Handle single object in data
      if (media.data.attributes && media.data.attributes.url) {
        const { url } = media.data.attributes;
        const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
        return fullUrl;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error getting media URL:', error);
    return '';
  }
}

/**
 * Fetch featured properties from Strapi
 * 
 * @param {number} limit - Number of featured properties to fetch
 * @returns {Promise<Array>} Array of featured property objects
 */
export async function getFeaturedProperties(limit = 6) {
  try {
    const query = {
      filters: {
        featured: {
          $eq: true
        }
      },
      populate: '*',
      pagination: {
        limit
      }
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const response = await strapiClient.get(`/properties?${queryString}`);
    
    // Process the data to match the structure expected by the components
    const processedData = response.data.data.map(item => ({
      id: item.id,
      ...item.attributes
    }));
    
    return processedData;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

/**
 * Generic method to fetch any content type
 * 
 * @param {string} contentType - The content type to fetch
 * @param {Object} options - Query options
 * @returns {Promise<Object>} API response
 */
export async function getContent(contentType, options = {}) {
  try {
    const query = {
      populate: '*',
      ...options
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const response = await strapiClient.get(`/${contentType}?${queryString}`);
    
    // Process the data to match the structure expected by the components
    if (response.data.data) {
      const processedData = Array.isArray(response.data.data) 
        ? response.data.data.map(item => ({
            id: item.id,
            ...item.attributes
          }))
        : {
            id: response.data.data.id,
            ...response.data.data.attributes
          };
      
      return {
        data: processedData,
        meta: response.data.meta
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType} from Strapi:`, error);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}

export default {
  getProperties,
  getPropertyBySlug,
  getPropertyById,
  getStrapiMediaUrl,
  getFeaturedProperties,
  getContent
}; 