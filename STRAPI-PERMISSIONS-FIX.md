# Fixing Strapi Permissions

Based on our testing, the issue is with permissions in your Strapi instance. Follow these steps to fix it:

## Step 1: Check Your API Token Permissions

1. Log in to your Strapi admin panel at http://localhost:1337/admin
2. Go to Settings → API Tokens
3. Find your existing token in the list and click on it
4. Under "Permissions," look for the "Property" section
5. Make sure the "find" and "findOne" permissions are checked
6. Click "Save" to apply the changes

## Step 2: Configure Public Role Permissions

1. While still in the Strapi admin panel, go to Settings → Roles
2. Click on the "Public" role
3. Scroll down to find the "Property" section
4. Check the boxes for "find" and "findOne" permissions
5. Click "Save" to apply the changes

## Step 3: Verify Your API Token

If the token shown in the `.env.local` file doesn't match the actual token in Strapi:

1. Go to Settings → API Tokens
2. Click "Create new API token"
3. Fill in:
   - Name: "Next.js Frontend"
   - Description: "Token for frontend application"
   - Token duration: Unlimited (or set an expiration date)
   - Token type: Custom
4. Set permissions:
   - Under "Property" enable: find and findOne
5. Click "Save"
6. Copy the displayed token
7. Replace the token in your `.env.local` file:
   ```
   NEXT_PUBLIC_STRAPI_API_TOKEN=your-new-token-here
   ```

## Step 4: Restart Servers

1. Restart your Strapi server (Ctrl+C and run `npm run develop` again)
2. In your Next.js project directory, run the test script again:
   ```
   npm run test-strapi
   ```

## Step 5: Verify Connection

If everything is set up correctly, you should now see successful connection messages and your property data.

## Common Issues and Solutions

### Token Issues
- Make sure there are no spaces, quotes, or line breaks in your token string
- Copy the token directly from Strapi without modifying it

### API Routes
- The API route should be `/api/properties` (plural) not `/api/property` (singular)
- Check that you're using the correct API ID in Strapi

### Content Type Structure
- Ensure your content type has all the required fields (title, slug, etc.)
- Add at least one published property to test with 