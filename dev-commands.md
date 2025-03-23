# Development Commands for GHR Properties

## Starting the Strapi Backend
```bash
cd strapi-backend && npm run develop
```
This command:
1. Changes directory to the strapi-backend folder
2. Starts the Strapi development server
3. Makes the admin panel available at http://localhost:1337/admin

## Starting the Next.js Frontend
```bash
npm run dev
```
This command:
1. Starts the Next.js development server
2. Makes the website available at http://localhost:3000

## Notes
- The Strapi command must be run from the project root
- The Next.js command must be run from the project root
- You can keep both servers running simultaneously in different terminal windows
- Changes to your code will automatically reload in development mode

## Useful Strapi Commands
- `cd strapi-backend && npm run build` - Build the Strapi admin panel
- `cd strapi-backend && npm run start` - Start Strapi in production mode

## Useful Next.js Commands
- `npm run build` - Build the Next.js application for production
- `npm run start` - Start the Next.js application in production mode 