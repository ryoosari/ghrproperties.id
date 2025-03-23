# Strapi Backend for GHR Properties

This directory contains the Strapi CMS backend for the GHR Properties website. Below are instructions on how to use and integrate it with the Next.js frontend.

## Getting Started

### Running the Strapi server

```bash
# Navigate to the strapi-backend directory
cd strapi-backend

# Start the development server
npm run develop
```

The admin panel will be available at: http://localhost:1337/admin

### Initial Setup

1. When you first access the admin panel, you'll need to create an admin user
2. After logging in, you can start creating content types and adding content

## Integration with Next.js

### API Consumption

To fetch data from Strapi in your Next.js application, you can use the existing axios setup:

```javascript
import axios from 'axios';

// Fetch data from Strapi
const fetchProperties = async () => {
  try {
    const response = await axios.get('http://localhost:1337/api/properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Strapi:', error);
    return null;
  }
};
```

### Environment Variables

Add the following to your `.env.local` file in the root of your Next.js project:

```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your_api_token_here
```

You'll need to generate an API token in the Strapi admin panel under Settings > API Tokens.

## Content Export

Your project already has an `export-data` script in package.json for exporting Strapi data. You can use this to create static exports:

```bash
npm run export-data
```

## Deployment Considerations

For production, you'll want to:

1. Use a more robust database like PostgreSQL or MySQL instead of SQLite
2. Set up proper environment variables for production
3. Consider deploying Strapi to a service like Heroku, DigitalOcean, or a VPS

## Available Commands

- `npm run develop` - Start the development server
- `npm run start` - Start the production server
- `npm run build` - Build the admin panel for production
- `npm run strapi` - Display all available commands

## Learn More

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Tutorials](https://strapi.io/tutorials)
- [Strapi Blog](https://strapi.io/blog)
- [Strapi Forum](https://forum.strapi.io) 