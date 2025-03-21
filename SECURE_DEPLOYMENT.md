# Secure Deployment Guide for GHR Properties API (PDO Version)

This guide explains how to securely deploy the GHR Properties API with PDO database connection on Bluehost.

## Securing Database Credentials on Bluehost

For security reasons, we don't store database credentials directly in PHP files that could potentially be accessed from the web. Instead, we use a separate PHP file stored outside the web root and connect using PDO for enhanced security.

### Step 1: Set Up the Directory Structure

On your Bluehost server, your directory structure should look like this:

```
/home/avidityi/                (your Bluehost user home directory)
├── db-credentials.php         (secure file with credentials OUTSIDE web root)
├── public_html/               (web root)
│   ├── ghrproperties.id/      (your domain directory)
│   │   ├── api/               (API directory)
│   │   │   ├── config.php     (uses PDO connection)
│   │   │   ├── properties.php
│   │   │   ├── db-test.php
│   │   │   └── .htaccess
│   │   └── ... (other website files)
```

### Step 2: Create the Credentials File

1. Connect to your server using SSH or FTP
2. Navigate to your home directory (one level above public_html)
3. Create a `db-credentials.php` file with the following content:

```php
<?php
// Database credentials file
// Place this file in /home/avidityi/ (outside the web root)

// Database connection information
$db_host = 'localhost';
$db_user = 'avidityi_ryoosari';
$db_password = 'Ockerse24!';
$db_name = 'avidityi_ghrproperties.id';

// Additional security: prevent direct access
if (count(get_included_files()) == 1) {
    // This file was accessed directly (not included)
    header('HTTP/1.0 403 Forbidden');
    exit('Direct access to this file is not allowed.');
}
```

4. Set secure permissions:
```
chmod 600 db-credentials.php
```

### Step 3: Verify the Configuration

Test the connection by visiting: `https://ghrproperties.id/api/db-test.php`

This test script should display:
- Connection status (success or error)
- List of tables in the database
- Number of properties in the database (if the properties table exists)

## Security Advantages of the PDO Approach

Using PDO (PHP Data Objects) provides several security advantages:

1. **Prepared Statements**: PDO uses real prepared statements that separate SQL from data, preventing SQL injection attacks
2. **Error Handling**: Better error handling with try/catch blocks for graceful failure
3. **Connection Options**: Fine-tuned connection options for better security
4. **Type Handling**: Data types are handled automatically without needing to specify types for each parameter
5. **Credentials Outside Web Root**: Database credentials are stored outside web-accessible directories

## Performance Benefits

1. **Persistent Connections**: Uses connection pooling to improve performance
2. **Optimized Queries**: PDO can be more efficient with database resources
3. **Fewer Roundtrips**: Prepared statements are more efficient when reused

## Troubleshooting

If you encounter connection issues:

1. Check that the `db-credentials.php` file is in the correct location (`/home/avidityi/`)
2. Make sure PHP PDO extension is enabled in your PHP configuration (usually enabled by default)
3. Verify file permissions are set correctly
4. Check PHP error logs in cPanel for specific errors
5. Verify your database credentials are correct
6. Ensure your database user has the necessary permissions

## Local Development Setup

For local development:
1. The code automatically detects if you're on the production server or local environment
2. If not on Bluehost, it uses local development credentials (localhost, root, etc.)
3. You can override this by creating the same credentials file in your local environment 