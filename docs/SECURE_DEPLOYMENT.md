# Secure Deployment Guide for GHR Properties API (MySQLi Version)

This guide explains how to securely deploy the GHR Properties API with MySQLi database connection on Bluehost.

## Approach 1: Simple FTP Deployment (No SSH Required)

This approach uses direct connection with database credentials stored in the config file. It's simpler to deploy but requires careful configuration to maintain security.

### Step 1: Set Up the Directory Structure

On your Bluehost server, your directory structure should look like this:

```
/home/avidityi/public_html/       (web root)
├── ghrproperties.id/             (your domain directory)
│   ├── api/                      (API directory)
│   │   ├── config.php            (uses MySQLi connection)
│   │   ├── properties.php
│   │   ├── db-test.php
│   │   └── .htaccess
│   └── ... (other website files)
```

### Step 2: Deploy API Files

1. Connect to your server using FTP or File Manager in cPanel
2. Navigate to your web root directory (`public_html/ghrproperties.id/`)
3. Create an `api` directory if it doesn't exist
4. Upload all API files to this directory:
   - `config.php`
   - `properties.php`
   - `db-test.php`
   - `.htaccess`

### Step 3: Verify the Configuration

Test the connection by visiting: `https://ghrproperties.id/api/db-test.php`

This test script should display:
- Connection status (success or error)
- List of tables in the database
- Number of properties in the database (if the properties table exists)

## Security Considerations for MySQLi Approach

1. **Secure Database User**: Ensure your MySQL user has only the necessary permissions (SELECT, INSERT, UPDATE for required tables).
   
2. **Protected API Endpoints**: Ensure your `.htaccess` file restricts access appropriately.

3. **Error Handling**: The API includes error handling to prevent exposing sensitive information.

4. **Input Validation**: All user inputs are properly validated and sanitized before use in queries.

5. **Prepared Statements**: All queries use prepared statements to prevent SQL injection.

## Troubleshooting

If you encounter connection issues:

1. Verify your database credentials in `config.php` are correct
2. Make sure your database user has the necessary permissions
3. Check PHP error logs in cPanel for specific errors
4. Ensure the MySQL extension is enabled in your PHP configuration

## Local Development Setup

For local development:
1. Edit the `config.php` file to use your local database credentials
2. Make sure your local MySQL server is running
3. Test with your local development server (e.g., XAMPP, MAMP)

## Migration to Production

When migrating from development to production:
1. Update database credentials in `config.php` to match your Bluehost settings
2. Upload all API files via FTP or File Manager
3. Test the connection using the `db-test.php` script 