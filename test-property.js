// Test script to check if the property can be retrieved correctly
const path = require('path');
const fs = require('fs');

// Function to load a property from JSON file
function loadPropertyFromFile(slug) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'properties', `${slug}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading property file: ${error.message}`);
    return null;
  }
}

// Mock the fetch function to simulate Strapi API call
async function mockFetchFromStrapi(slug) {
  try {
    // Simulate Strapi API call with filter for uppercase "Slug"
    console.log(`Simulating Strapi API call with filter[Slug]=${slug}`);
    
    // Check if we can find property in local JSON
    const property = loadPropertyFromFile(slug);
    if (!property) {
      console.log('Property not found in local JSON');
      return null;
    }
    
    // Simulate API response structure
    return {
      data: [property]
    };
  } catch (error) {
    console.error(`Error in mock fetch: ${error.message}`);
    return null;
  }
}

// Test retrieving the property
async function testPropertyRetrieval() {
  const slug = 'vero-selaras-villa-ubud-made-heng';
  console.log(`Testing property retrieval for slug: ${slug}`);
  
  try {
    // Test loading directly from file
    console.log("\nTesting local file loading:");
    const propertyFromFile = loadPropertyFromFile(slug);
    console.log(`Property found in file: ${propertyFromFile ? 'Yes' : 'No'}`);
    if (propertyFromFile) {
      console.log(`- ID: ${propertyFromFile.id}`);
      console.log(`- Title: ${propertyFromFile.Title}`);
      console.log(`- Slug field value: ${propertyFromFile.Slug}`);
      console.log(`- Images: ${propertyFromFile.Images ? propertyFromFile.Images.length : 0}`);
    }
    
    // Test mocked Strapi API call
    console.log("\nTesting mocked Strapi API call:");
    const response = await mockFetchFromStrapi(slug);
    if (response && response.data && response.data.length > 0) {
      const propertyFromAPI = response.data[0];
      console.log(`Property found in API: Yes`);
      console.log(`- ID: ${propertyFromAPI.id}`);
      console.log(`- Title: ${propertyFromAPI.Title}`);
      console.log(`- Slug field value: ${propertyFromAPI.Slug}`);
    } else {
      console.log(`Property not found in API response`);
    }
    
  } catch (error) {
    console.error(`Error in test: ${error.message}`);
  }
}

// Execute the test
testPropertyRetrieval(); 