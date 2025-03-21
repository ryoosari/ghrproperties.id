<?php
// Database credentials file
// Place this file in /home/avidityi/ (outside the web root)
// Ensure this file is NOT accessible via web

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