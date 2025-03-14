# Deploying Next.js to Bluehost

This guide will help you deploy your Next.js application to Bluehost's shared hosting environment.

## Prerequisites

1. A Bluehost account with cPanel access
2. Git repository access (which you already have)
3. Node.js and npm installed on your local machine

## Step 1: Build Your Next.js Application Locally

Before deploying, you need to create a production build of your Next.js application:

```bash
# Make sure you're in the project root
npm run build
```

This will create an optimized production build in the `.next` directory.

## Step 2: Prepare Your Files for Bluehost

Bluehost doesn't natively support running Node.js applications. Instead, we'll use a static export of your Next.js app:

1. Modify your `next.config.js` to add the output option:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // Add this line
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,  // Add this line for static export
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

2. Run the build again to generate static files:

```bash
npm run build
```

This will generate a static export in the `out` directory.

## Step 3: Upload Files to Bluehost

There are several ways to upload your files to Bluehost:

### Option 1: Using cPanel File Manager

1. Log in to your Bluehost cPanel account
2. Open the File Manager
3. Navigate to your domain's root directory (usually `public_html`)
4. Upload all the contents of the `out` directory

### Option 2: Using cPanel's Git Version Control (your current method)

1. Log in to your Bluehost cPanel account
2. Go to Git Version Control
3. Create or update your repository
4. Make sure to set the deployment directory to `public_html`
5. After pulling your repository, you need to build it on the server:
   - Access SSH or Terminal through cPanel
   - Navigate to your repository directory
   - Run `npm install && npm run build`
   - Move the contents of the `out` directory to `public_html`

## Step 4: Configure .htaccess

Make sure the `.htaccess` file is in your `public_html` directory (already created in this project).

## Step 5: Check Node.js Support

If you need server-side rendering or API routes, check if your Bluehost plan supports Node.js:

1. Log in to your Bluehost cPanel
2. Look for "Node.js" in the Software section
3. If available, you can set up your Node.js application

## Troubleshooting

### Blank Page Issue

If you're seeing a blank page:
- Check browser console for JavaScript errors
- Verify that all paths in your Next.js app are relative
- Make sure the `.htaccess` file is properly uploaded
- Check file permissions (files should be 644, directories 755)

### 404 Errors for Routes

If you're getting 404 errors when accessing routes:
- Check that your `.htaccess` file is correctly set up
- Verify that your Next.js export includes all necessary pages

### Other Issues

- Check Bluehost error logs through cPanel for specific error messages
- Verify all required files are uploaded to the correct location
- Ensure proper file permissions are set

## Alternative Hosting Solutions

If you continue to have issues with Bluehost, consider these alternatives that offer better Next.js support:
- Vercel (built specifically for Next.js)
- Netlify
- AWS Amplify
- DigitalOcean App Platform 