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

This will create a static export in the `out` directory (since we've configured `output: 'export'` in next.config.js).

## Step 2: Verify Your Static Export

Before uploading to Bluehost, verify your static export:

1. Check that the `out` directory contains:
   - `index.html` file
   - All necessary assets in `_next` directory
   - Any other static files your site needs

2. Test locally by opening the `index.html` file in your browser or using a simple HTTP server:
   ```bash
   npx serve out
   ```

## Step 3: Upload Files to Bluehost

### Option 1: Using cPanel File Manager (Recommended for First-Time Setup)

1. Log in to your Bluehost cPanel account
2. Open the File Manager
3. Navigate to your domain's root directory (usually `public_html`)
4. **Important:** First upload the `.htaccess` file to ensure proper routing
5. Upload all the contents of the `out` directory (not the directory itself)
6. Verify file permissions:
   - HTML/CSS/JS files: 644 (rw-r--r--)
   - Directories: 755 (rwxr-xr-x)
   - .htaccess file: 644 (rw-r--r--)

### Option 2: Using cPanel's Git Version Control

1. Log in to your Bluehost cPanel account
2. Go to Git Version Control
3. Create or update your repository
4. Make sure to set the deployment directory to `public_html`
5. **Important:** After pulling your repository, you need to:
   - Verify the `.htaccess` file is in the root directory
   - If you need to build on the server, use SSH Terminal:
     ```bash
     cd ~/repository-directory
     npm install
     npm run build
     cp -r out/* /home/username/public_html/
     cp .htaccess /home/username/public_html/
     ```

## Step 4: Test Your Deployment

1. Visit your domain (http://ghrproperties.id)
2. Check for any visible errors
3. Test the diagnostic files:
   - http://ghrproperties.id/test.html
   - http://ghrproperties.id/test.php
4. Check browser console for JavaScript errors

## Step 5: Troubleshooting Common Issues

### Blank Page or 500 Error

1. Check Bluehost error logs in cPanel
2. Verify .htaccess file is properly uploaded and has correct permissions
3. Check if mod_rewrite is enabled in Apache (test.php will show this)
4. Try temporarily renaming .htaccess to disable it and see if site loads

### 404 Errors for Routes

1. Make sure your Next.js export generated HTML files for all routes
2. Check that the .htaccess rewrite rules are working correctly
3. Verify that all files have been uploaded to the correct location

### Missing Assets (CSS/JS)

1. Check if paths in HTML files are correct (should be relative)
2. Verify that the _next directory and its contents are uploaded
3. Check browser console for specific 404 errors on assets

### Specific Bluehost Configuration

1. PHP Version: Set to PHP 8.0+ in cPanel's "PHP Version Manager"
2. Memory Limit: Increase if needed in cPanel's "MultiPHP INI Editor"
3. Disable any Bluehost caching temporarily for testing

## Step 6: Optimizing for Production

Once your site is working:

1. Enable Bluehost's built-in caching
2. Set up a CDN if available in your Bluehost plan
3. Configure SSL/HTTPS in cPanel if not already done

## Alternative Deployment Method: Direct Upload of Static Files

If you continue to have issues with Git deployment, try this simplified approach:

1. Build your Next.js app locally: `npm run build`
2. Zip the contents of the `out` directory (not the directory itself)
3. Upload and extract the zip file to your `public_html` directory
4. Upload the `.htaccess` file separately to ensure it's not overwritten

## Testing Tools

Two test files have been created to help diagnose issues:

1. `test.html` - A simple HTML file to verify static file serving
2. `test.php` - A PHP script that displays server configuration and file status

Visit these files on your domain to help troubleshoot any issues. 