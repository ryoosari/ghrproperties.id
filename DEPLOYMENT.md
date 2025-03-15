# Deploying to Bluehost via GitHub

This guide explains how to deploy your Next.js application to Bluehost using GitHub as the deployment method.

## Prerequisites

1. Your Next.js project is configured with `output: 'export'` in next.config.js
2. Bluehost is set up to pull from your GitHub repository
3. The `.htaccess` file is properly configured

## Deployment Process

### Option 1: Manual Build and Commit

1. Make your changes to the codebase
2. Run the build script:
   ```bash
   chmod +x build-and-commit.sh
   ./build-and-commit.sh
   ```
3. Commit your changes:
   ```bash
   git commit -m "Your commit message"
   ```
4. Push to GitHub:
   ```bash
   git push
   ```
5. Bluehost will automatically pull the changes from GitHub

### Option 2: GitHub Actions (Automated Build)

If you've set up the GitHub Actions workflow (.github/workflows/build.yml):

1. Make your changes to the codebase
2. Commit your changes (without building):
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. Push to GitHub:
   ```bash
   git push
   ```
4. GitHub Actions will automatically build the project and commit the build files
5. Bluehost will pull the updated repository with the build files

## Important Notes

### Directory Structure

Your test.php shows that files are in a subdirectory:
```
DOCUMENT_ROOT: /home3/avidityi/public_html/ghrproperties.id
```

To fix this, you have two options:

1. **Configure Bluehost to deploy to the root directory**:
   - In cPanel, update the Git Version Control settings to deploy to `/public_html` instead of `/public_html/ghrproperties.id`

2. **Configure your domain to point to the subdirectory**:
   - In cPanel, go to "Domains" > "Redirects" or "Domain Manager"
   - Set up your domain to point to the subdirectory

### Verifying Deployment

After deployment:

1. Visit your website to check if it loads correctly
2. Check the diagnostic files:
   - http://ghrproperties.id/test.html
   - http://ghrproperties.id/test.php
3. Verify that index.html exists in the correct directory

## Troubleshooting

If your site doesn't load after deployment:

1. Check if the build files were properly committed to GitHub
2. Verify that Bluehost pulled the latest changes
3. Check if the `.htaccess` file is in the correct location
4. Ensure file permissions are correct (files: 644, directories: 755)
5. Check Bluehost error logs in cPanel 