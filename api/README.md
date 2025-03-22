# API Configuration Instructions

After deployment, you need to manually update your database credentials in `config.php`.

1. Log in to cPanel
2. Navigate to File Manager
3. Go to `/public_html/ghrproperties.id/api/`
4. Edit `config.php`
5. Replace the placeholder values with your actual database credentials:
   - DB_USER_PLACEHOLDER
   - DB_PASSWORD_PLACEHOLDER
   - DB_NAME_PLACEHOLDER
6. Save the file

For additional security, consider adding a directory above the web root containing
credentials and modifying the config.php to include that file instead.
