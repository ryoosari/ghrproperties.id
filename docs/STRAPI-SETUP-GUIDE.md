# Strapi Setup Guide for GHR Properties

This guide will help you set up Strapi to work with your Next.js application.

## Step 1: Create the Properties Content Type

1. Open the Strapi admin panel at http://localhost:1337/admin
2. Navigate to Content-Type Builder (the icon that looks like building blocks)
3. Click "Create new collection type"
4. Enter "Property" as the Display name (the API ID should automatically be set to "property")
5. Click "Continue"

### Add the required fields:

1. **Title** (Text field)
   - Type: Short text
   - Required field: Yes
   - Unique field: No

2. **Slug** (Text field)
   - Type: Short text
   - Required field: Yes
   - Unique field: Yes

3. **Status** (Enumeration field)
   - Values: draft, published, sold (one per line)
   - Default value: draft
   - Required field: Yes

4. **Price** (Number field)
   - Type: Decimal
   - Required field: Yes

5. **Description** (Rich Text field)
   - Required field: No

6. **PropertyType** (Enumeration field)
   - Values: apartment, house, villa, land, commercial
   - Default value: house
   - Required field: Yes

7. **Featured** (Boolean field)
   - Default value: false

8. **Images** (Media field)
   - Type: Multiple media
   - Required field: No

9. Add any other fields you need for your properties

10. Click "Save" to create the content type

## Step 2: Add Some Test Data

1. Navigate to Content Manager
2. Click on "Properties" on the left sidebar
3. Click "Create new entry"
4. Fill in the fields for a test property:
   - Title: "Test Property"
   - Slug: "test-property"
   - Status: "published"
   - Price: 500000
   - Description: Some sample description
   - Property Type: house
   - Featured: true
5. Click "Save" and then "Publish"
6. Create a few more test properties if desired

## Step 3: Configure API Permissions

1. Navigate to Settings → Roles
2. Click on "Public" (the role for unauthenticated users)
3. Scroll down to find "Property" under the Permissions section
4. Enable the following permissions:
   - find
   - findOne
5. Click "Save"

## Step 4: Create an API Token

1. Navigate to Settings → API Tokens
2. Click "Create new API token"
3. Fill in:
   - Name: "Next.js Frontend"
   - Description: "Token for frontend application"
   - Token duration: Unlimited (or set an expiration date)
   - Token type: Custom
4. Set permissions:
   - Under "Property" enable: find and findOne
5. Click "Save"
6. **Important**: Copy the displayed token—you won't be able to see it again!

## Step 5: Add API Token to Your Next.js App

1. Open the `.env.local` file in your Next.js project
2. Add or update the token value:
   ```
   NEXT_PUBLIC_STRAPI_API_TOKEN=your-token-here
   ```
3. Save the file

## Step 6: Verify Connection

Run the test script to verify everything is working:

```bash
npm run test-strapi
```

You should see output indicating a successful connection and retrieval of your test property data.

## Step 7: Start Your Next.js App

Start your Next.js app in development mode:

```bash
npm run dev
```

Now, when you add or update content in Strapi, it will automatically appear in your local development environment!

## Common Issues

- **404 Not Found**: Check if the "properties" content type exists and permissions are set correctly
- **403 Forbidden**: Check if your API token has the right permissions
- **Unable to connect**: Ensure Strapi is running and the URL is correct in your `.env.local`

For more detailed information, refer to the Strapi documentation: https://docs.strapi.io 