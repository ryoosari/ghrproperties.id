# Database Setup for GHR Properties

This guide explains how to set up the database for the GHR Properties website on Bluehost.

## 1. Create MySQL Database in cPanel

1. Log in to your Bluehost cPanel account
2. In the "Databases" section, click on "MySQL Databases"
3. Create a new database:
   - Enter a name for your database (e.g., `ghrproperties_db`)
   - Click "Create Database"
4. Create a new database user:
   - Enter a username (e.g., `ghrproperties_user`)
   - Enter a strong password (use the password generator for security)
   - Click "Create User"
5. Add the user to the database:
   - Select your database from the dropdown
   - Select your user from the dropdown
   - Grant ALL PRIVILEGES to the user
   - Click "Add"

## 2. Create Database Tables

1. In cPanel, go to "phpMyAdmin" in the "Databases" section
2. Select your newly created database from the left sidebar
3. Click on the "SQL" tab
4. Copy the contents of the `db-schema.sql` file
5. Paste the SQL into the query window
6. Click "Go" to execute the SQL and create your tables

Alternatively, you can use the "Import" tab to upload and import the `db-schema.sql` file directly.

## 3. Configure API Connection

1. Upload the entire `api` directory to your Bluehost account (public_html or a subdirectory)
2. Edit the `api/config.php` file to update your database connection details:
   ```php
   $db_config = [
       'host' => 'localhost', // Usually localhost on cPanel
       'username' => 'your_database_username', // e.g., ghrproperties_user
       'password' => 'your_database_password',
       'database' => 'your_database_name' // e.g., ghrproperties_db
   ];
   ```

## 4. Test the Database Connection

1. Navigate to `https://ghrproperties.id/api/db-test.php` in your browser
2. You should see a success message and a list of your database tables
3. If you see an error, check your database credentials and ensure the user has proper permissions

## 5. Configure the Frontend

1. Create a `.env.local` file in your Next.js project root with:
   ```
   NEXT_PUBLIC_API_URL=https://ghrproperties.id/api
   ```
2. Rebuild and redeploy your Next.js application

## Database Schema

The database includes the following tables:

1. `properties`: Main table for property listings
2. `property_images`: Table for additional property images
3. `amenities`: Table for available amenities
4. `property_amenities`: Junction table for property-amenity relationships

## API Endpoints

The following endpoints are available:

1. `/api/properties.php` - Get all properties or search with filters
   - Parameters: `keyword`, `location`, `property_type`, `min_price`, `max_price`, `bedrooms`, `bathrooms`, `page`, `per_page`

2. `/api/properties.php?id=123` - Get a specific property by ID

## Troubleshooting

### Database Connection Issues
- Check that your database credentials are correct
- Ensure the database exists
- Verify the database user has proper permissions
- Check MySQL error logs in cPanel

### API Request Issues
- Check browser console for CORS errors
- Verify that the API URL is correct
- Ensure .htaccess is properly configured

### Permission Issues
- Check file permissions: PHP files should be 644
- Directory permissions should be 755
- .htaccess file should be 644 