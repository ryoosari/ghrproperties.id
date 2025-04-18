const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Create a configured axios instance for Strapi
const strapiClient = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: STRAPI_API_TOKEN 
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    : {}
});

async function testGetPropertyBySlug(slug) {
  try {
    console.log(`Testing getPropertyBySlug with slug: ${slug}`);
    console.log(`Using Strapi URL: ${STRAPI_URL}`);
    
    // Test with uppercase Slug
    const queryUpper = {
      filters: {
        Slug: {
          $eq: slug
        }
      },
      populate: '*'
    };
    
    const queryStringUpper = qs.stringify(queryUpper, { encodeValuesOnly: true });
    console.log(`Strapi query with uppercase Slug: ${queryStringUpper}`);
    
    try {
      const responseUpper = await strapiClient.get(`/properties?${queryStringUpper}`);
      console.log(`Upper Slug Query Status: ${responseUpper.status}`);
      console.log(`Upper Slug Query Found: ${responseUpper.data.data && responseUpper.data.data.length > 0}`);
      if (responseUpper.data.data && responseUpper.data.data.length > 0) {
        console.log(`Found property with ID: ${responseUpper.data.data[0].id}`);
        console.log(`Found property with Title: ${responseUpper.data.data[0].attributes?.Title || 'unknown'}`);
      }
    } catch (error) {
      console.error(`Error with uppercase Slug query: ${error.message}`);
    }
    
    // Test with lowercase slug
    const queryLower = {
      filters: {
        slug: {
          $eq: slug
        }
      },
      populate: '*'
    };
    
    const queryStringLower = qs.stringify(queryLower, { encodeValuesOnly: true });
    console.log(`Strapi query with lowercase slug: ${queryStringLower}`);
    
    try {
      const responseLower = await strapiClient.get(`/properties?${queryStringLower}`);
      console.log(`Lower slug Query Status: ${responseLower.status}`);
      console.log(`Lower slug Query Found: ${responseLower.data.data && responseLower.data.data.length > 0}`);
      if (responseLower.data.data && responseLower.data.data.length > 0) {
        console.log(`Found property with ID: ${responseLower.data.data[0].id}`);
        console.log(`Found property with Title: ${responseLower.data.data[0].attributes?.Title || 'unknown'}`);
      }
    } catch (error) {
      console.error(`Error with lowercase slug query: ${error.message}`);
    }
    
    // Test with both Slug and slug
    const queryBoth = {
      filters: {
        $or: [
          {
            Slug: {
              $eq: slug
            }
          },
          {
            slug: {
              $eq: slug
            }
          }
        ]
      },
      populate: '*'
    };
    
    const queryStringBoth = qs.stringify(queryBoth, { encodeValuesOnly: true });
    console.log(`Strapi query with both slug variations: ${queryStringBoth}`);
    
    try {
      const responseBoth = await strapiClient.get(`/properties?${queryStringBoth}`);
      console.log(`Both slug Query Status: ${responseBoth.status}`);
      console.log(`Both slug Query Found: ${responseBoth.data.data && responseBoth.data.data.length > 0}`);
      if (responseBoth.data.data && responseBoth.data.data.length > 0) {
        console.log(`Found property with ID: ${responseBoth.data.data[0].id}`);
        console.log(`Found property with Title: ${responseBoth.data.data[0].attributes?.Title || 'unknown'}`);
      }
    } catch (error) {
      console.error(`Error with both slug query: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in testGetPropertyBySlug:', error);
  }
}

// Test with the specific slug
testGetPropertyBySlug('vero-selaras-villa-ubud-made-heng')
  .then(() => console.log('Tests completed'))
  .catch(err => console.error('Test failed:', err)); 