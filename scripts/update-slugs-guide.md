# How to Update Property Slugs in Strapi

Since we're getting access errors when trying to update properties via the API, the easiest way to fix the existing property slugs is to use the Strapi admin panel directly.

## Option 1: Update Manually in the Strapi Admin Panel

1. Go to the Strapi Admin Panel (usually at http://localhost:1337/admin)
2. Login with your admin credentials
3. Navigate to "Content Manager" > "Property"
4. For each property:
   - Click on the property to edit it
   - Delete the content of the "Slug" field (if it exists)
   - Type in a new value - Strapi will automatically generate a slug based on the Title field
   - Save the property

## Option 2: Use the Strapi Console

1. Open a terminal in the strapi-backend directory:
   ```bash
   cd strapi-backend
   ```

2. Start the Strapi console:
   ```bash
   npm run strapi console
   ```

3. Run the following code to update all property slugs:
   ```javascript
   // Get all properties
   const properties = await strapi.entityService.findMany('api::property.property');
   
   // Function to convert title to slug
   function slugify(text) {
     return text
       .toString()
       .toLowerCase()
       .trim()
       .replace(/\s+/g, '-')           // Replace spaces with -
       .replace(/&/g, '-and-')         // Replace & with 'and'
       .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
       .replace(/\-\-+/g, '-');        // Replace multiple - with single -
   }
   
   // Update each property
   for (const property of properties) {
     if (!property.Slug && property.Title) {
       const newSlug = slugify(property.Title);
       console.log(`Updating property #${property.id} "${property.Title}" -> slug: "${newSlug}"`);
       
       await strapi.entityService.update('api::property.property', property.id, {
         data: {
           Slug: newSlug
         }
       });
       
       console.log(`✅ Updated property #${property.id}`);
     }
   }
   
   console.log('All properties updated!');
   ```

4. After updating, restart your Strapi server:
   ```bash
   npm run develop
   ```

## Option 3: Use the Admin API

If you want to automate this, you can use the Admin API which requires admin credentials:

1. Create a file called `update-slugs-admin.js`:
   ```javascript
   const axios = require('axios');
   require('dotenv').config();
   
   // Strapi admin login info
   const STRAPI_URL = 'http://localhost:1337';
   const ADMIN_EMAIL = 'your-admin-email@example.com';  // Replace with your admin email
   const ADMIN_PASSWORD = 'your-admin-password';        // Replace with your admin password
   
   // Function to convert title to slug
   function slugify(text) {
     return text
       .toString()
       .toLowerCase()
       .trim()
       .replace(/\s+/g, '-')
       .replace(/&/g, '-and-')
       .replace(/[^\w\-]+/g, '')
       .replace(/\-\-+/g, '-');
   }
   
   async function updatePropertySlugs() {
     try {
       // First, login to get JWT token
       console.log('Logging in to Strapi Admin...');
       const loginResponse = await axios.post(`${STRAPI_URL}/admin/login`, {
         email: ADMIN_EMAIL,
         password: ADMIN_PASSWORD
       });
       
       const token = loginResponse.data.data.token;
       console.log('Successfully logged in, got JWT token');
       
       // Create authenticated client
       const adminClient = axios.create({
         baseURL: STRAPI_URL,
         headers: {
           Authorization: `Bearer ${token}`
         }
       });
       
       // Get all properties
       console.log('Fetching properties...');
       const response = await adminClient.get('/api/properties');
       const properties = response.data.data;
       
       console.log(`Found ${properties.length} properties`);
       
       // Update each property that doesn't have a slug
       for (const property of properties) {
         if (!property.Slug && property.Title) {
           const newSlug = slugify(property.Title);
           console.log(`Updating property #${property.id} "${property.Title}" -> slug: "${newSlug}"`);
           
           await adminClient.put(`/api/properties/${property.id}`, {
             data: {
               Slug: newSlug
             }
           });
           
           console.log(`✅ Updated property #${property.id}`);
         }
       }
       
       console.log('All properties updated!');
       
     } catch (error) {
       console.error('Error:', error.message);
       if (error.response) {
         console.error('Response data:', error.response.data);
       }
     }
   }
   
   updatePropertySlugs();
   ```

2. Replace the admin email and password with your Strapi admin credentials

3. Run the script:
   ```bash
   node update-slugs-admin.js
   ```

## After Updating

After updating the slugs in Strapi, run the export script to update your JSON files:

```bash
node scripts/export-strapi-data.mjs
```

This will export the updated properties with the proper slugs to your data directory, and the website will use these slugs in the URLs.