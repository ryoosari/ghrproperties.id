import axios from 'axios';
import qs from 'qs';

// Declare window interface for TypeScript
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.convertImageUrl = window.convertImageUrl || function(url) { return url; };
}

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
      
      // For 404 errors (no properties found), we should still return an empty array
      // This ensures the application can handle the case properly
      if (error.response.status === 404) {
        console.log('No properties found (404 response), returning empty data array');
        return { data: [], meta: { pagination: { total: 0 } } };
      }
    }
    
    // Return empty array for any error so the UI can properly show "no properties found"
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
    console.log(`Fetching property with slug: ${slug}`);
    
    // First try to check if we have this property locally in the data directory
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check in the properties directory
      const propertyPath = path.join(process.cwd(), 'data', 'properties', `${slug}.json`);
      
      if (fs.existsSync(propertyPath)) {
        console.log(`Found local property file: ${propertyPath}`);
        const propertyData = JSON.parse(fs.readFileSync(propertyPath, 'utf8'));
        
        // Return the property with attributes structure expected by the page component
        return {
          id: propertyData.id,
          ...propertyData
        };
      } else {
        console.log(`No local property file found at: ${propertyPath}`);
      }
    } catch (fsError) {
      console.error('Error checking for local property file:', fsError);
    }
    
    // If no local file is found, try the Strapi API
    const query = {
      filters: {
        Slug: {
          $eq: slug
        }
      },
      populate: '*'
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    console.log(`Strapi query: ${queryString}`);
    
    const response = await strapiClient.get(`/properties?${queryString}`);
    console.log(`Strapi response status: ${response.status}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log(`No property found with slug: ${slug}`);
      
      // Also try the snapshot directory as a last resort
      try {
        const fs = require('fs');
        const path = require('path');
        const snapshotPath = path.join(process.cwd(), 'data', 'snapshot', `${slug}.json`);
        
        if (fs.existsSync(snapshotPath)) {
          console.log(`Found snapshot property file: ${snapshotPath}`);
          const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
          
          // Return the property with attributes structure expected by the page component
          return {
            id: snapshotData.id,
            ...snapshotData
          };
        } else {
          console.log(`No snapshot property file found at: ${snapshotPath}`);
          return null;
        }
      } catch (snapshotError) {
        console.error('Error checking for snapshot property file:', snapshotError);
        return null;
      }
    }
    
    console.log(`Found property with slug: ${slug}, ID: ${response.data.data[0].id}`);
    
    // Log property images for debugging
    const property = response.data.data[0];
    if (property.attributes?.Image) {
      console.log(`Property has ${property.attributes.Image.data?.length || 0} images`);
    } else if (property.Image) {
      console.log(`Property has ${Array.isArray(property.Image) ? property.Image.length : 0} images`);
    } else {
      console.log('Property has no images');
    }
    
    if (property.attributes?.MainImage || property.MainImage) {
      console.log('Property has a MainImage');
    } else {
      console.log('Property has no MainImage');
    }
    
    // Return the property directly as it already has the correct structure
    return response.data.data[0];
  } catch (error) {
    console.error(`Error fetching property with slug ${slug}:`, error);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    
    // As a final fallback, try to load from the files
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Try the properties directory first, then snapshot if needed
      const propertyPath = path.join(process.cwd(), 'data', 'properties', `${slug}.json`);
      const snapshotPath = path.join(process.cwd(), 'data', 'snapshot', `${slug}.json`);
      
      if (fs.existsSync(propertyPath)) {
        console.log(`Fallback to local property file: ${propertyPath}`);
        const propertyData = JSON.parse(fs.readFileSync(propertyPath, 'utf8'));
        return {
          id: propertyData.id,
          ...propertyData
        };
      } else if (fs.existsSync(snapshotPath)) {
        console.log(`Fallback to snapshot property file: ${snapshotPath}`);
        const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
        return {
          id: snapshotData.id,
          ...snapshotData
        };
      }
    } catch (fallbackError) {
      console.error('Fallback to file also failed:', fallbackError);
    }
    
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
    return '/placeholder-property.jpg';
  }
  
  try {
    // Handle array of media objects (your Strapi structure)
    if (Array.isArray(media) && media.length > 0) {
      const imageObj = media[0];
      
      // Ensure we have a valid image object
      if (!imageObj || typeof imageObj !== 'object') {
        return '/placeholder-property.jpg';
      }
      
      // Check if we can use the client-side converter
      if (typeof window !== 'undefined' && window.convertImageUrl && imageObj.url) {
        const originalUrl = imageObj.url.startsWith('/') 
          ? `${STRAPI_URL}${imageObj.url}` 
          : imageObj.url;
          
        // Try to convert using the client-side converter
        const convertedUrl = window.convertImageUrl(originalUrl);
        if (convertedUrl !== originalUrl) {
          console.log(`Converted image URL using client-side converter: ${originalUrl} -> ${convertedUrl}`);
          return convertedUrl;
        }
      }
      
      // If format is specified and available, use it
      if (format && 
          imageObj.formats && 
          imageObj.formats[format] && 
          imageObj.formats[format].url) {
        
        // Check if this URL can be converted client-side
        if (typeof window !== 'undefined' && window.convertImageUrl) {
          const formatUrl = imageObj.formats[format].url;
          const fullUrl = formatUrl.startsWith('/') ? `${STRAPI_URL}${formatUrl}` : formatUrl;
          const convertedUrl = window.convertImageUrl(fullUrl);
          
          if (convertedUrl !== fullUrl) {
            console.log(`Converted format URL: ${fullUrl} -> ${convertedUrl}`);
            return convertedUrl;
          }
        }
        
        const formatUrl = imageObj.formats[format].url;
        const fullUrl = formatUrl.startsWith('/') ? `${STRAPI_URL}${formatUrl}` : formatUrl;
        return fullUrl;
      }
      
      // Otherwise use original image URL
      if (imageObj.url) {
        // Check if this URL can be converted client-side
        if (typeof window !== 'undefined' && window.convertImageUrl) {
          const originalUrl = imageObj.url.startsWith('/') 
            ? `${STRAPI_URL}${imageObj.url}` 
            : imageObj.url;
          const convertedUrl = window.convertImageUrl(originalUrl);
          
          if (convertedUrl !== originalUrl) {
            console.log(`Converted URL: ${originalUrl} -> ${convertedUrl}`);
            return convertedUrl;
          }
        }
        
        const fullUrl = imageObj.url.startsWith('/') ? `${STRAPI_URL}${imageObj.url}` : imageObj.url;
        return fullUrl;
      }
      
      return '/placeholder-property.jpg';
    }
    
    // Handle single media object
    if (media && typeof media === 'object') {
      // If it's a direct media object with url
      if (media.url) {
        // Check if this URL can be converted client-side
        if (typeof window !== 'undefined' && window.convertImageUrl) {
          const originalUrl = media.url.startsWith('/') 
            ? `${STRAPI_URL}${media.url}` 
            : media.url;
          const convertedUrl = window.convertImageUrl(originalUrl);
          
          if (convertedUrl !== originalUrl) {
            console.log(`Converted single URL: ${originalUrl} -> ${convertedUrl}`);
            return convertedUrl;
          }
        }
        
        const fullUrl = media.url.startsWith('/') ? `${STRAPI_URL}${media.url}` : media.url;
        return fullUrl;
      }
      
      // If format is specified and available, use it
      if (format && 
          media.formats && 
          media.formats[format] && 
          media.formats[format].url) {
          
        // Check if this URL can be converted client-side
        if (typeof window !== 'undefined' && window.convertImageUrl) {
          const formatUrl = media.formats[format].url;
          const fullUrl = formatUrl.startsWith('/') ? `${STRAPI_URL}${formatUrl}` : formatUrl;
          const convertedUrl = window.convertImageUrl(fullUrl);
          
          if (convertedUrl !== fullUrl) {
            console.log(`Converted format URL for single media: ${fullUrl} -> ${convertedUrl}`);
            return convertedUrl;
          }
        }
          
        const formatUrl = media.formats[format].url;
        const fullUrl = formatUrl.startsWith('/') ? `${STRAPI_URL}${formatUrl}` : formatUrl;
        return fullUrl;
      }
    }
    
    // Legacy structure with data property
    if (media.data) {
      // Handle array in data
      if (Array.isArray(media.data) && media.data.length > 0) {
        const dataObj = media.data[0];
        if (dataObj && dataObj.attributes && dataObj.attributes.url) {
          const { url } = dataObj.attributes;
          
          // Check if this URL can be converted client-side
          if (typeof window !== 'undefined' && window.convertImageUrl) {
            const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
            const convertedUrl = window.convertImageUrl(fullUrl);
            
            if (convertedUrl !== fullUrl) {
              console.log(`Converted legacy data URL: ${fullUrl} -> ${convertedUrl}`);
              return convertedUrl;
            }
          }
          
          const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
          return fullUrl;
        }
      }
      
      // Handle single object in data
      if (media.data.attributes && media.data.attributes.url) {
        const { url } = media.data.attributes;
        
        // Check if this URL can be converted client-side
        if (typeof window !== 'undefined' && window.convertImageUrl) {
          const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
          const convertedUrl = window.convertImageUrl(fullUrl);
          
          if (convertedUrl !== fullUrl) {
            console.log(`Converted legacy single data URL: ${fullUrl} -> ${convertedUrl}`);
            return convertedUrl;
          }
        }
        
        const fullUrl = url.startsWith('/') ? `${STRAPI_URL}${url}` : url;
        return fullUrl;
      }
    }
    
    return '/placeholder-property.jpg';
  } catch (error) {
    console.error('Error getting media URL:', error);
    return '/placeholder-property.jpg';
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