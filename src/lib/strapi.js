import axios from 'axios';

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
 * @returns {Promise<Array>} Array of property objects
 */
export async function getProperties(options = {}) {
  try {
    const params = {
      populate: '*',
      ...options
    };
    
    const response = await strapiClient.get('/properties', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties from Strapi:', error);
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
    const response = await strapiClient.get('/properties', {
      params: {
        filters: {
          slug: {
            $eq: slug
          }
        },
        populate: '*'
      }
    });
    
    const { data } = response.data;
    return data && data.length > 0 ? data[0] : null;
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
    const response = await strapiClient.get(`/properties/${id}`, {
      params: {
        populate: '*'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    return null;
  }
}

/**
 * Helper function to get the URL for a Strapi media
 * 
 * @param {Object} media - Strapi media object
 * @returns {string} Full URL to the media
 */
export function getStrapiMediaUrl(media) {
  if (!media || !media.data) return '';
  
  const { url } = media.data.attributes;
  return url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
}

/**
 * Fetch featured properties from Strapi
 * 
 * @param {number} limit - Number of featured properties to fetch
 * @returns {Promise<Array>} Array of featured property objects
 */
export async function getFeaturedProperties(limit = 6) {
  try {
    const response = await strapiClient.get('/properties', {
      params: {
        filters: {
          featured: {
            $eq: true
          }
        },
        populate: '*',
        pagination: {
          limit
        }
      }
    });
    
    const { data } = response.data;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

export default {
  getProperties,
  getPropertyBySlug,
  getPropertyById,
  getStrapiMediaUrl,
  getFeaturedProperties
}; 