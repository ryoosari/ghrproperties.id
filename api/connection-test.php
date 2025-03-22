<?php
// Prevent direct access to this file
if (count(get_included_files()) == 1) {
    // This file was accessed directly (not included)
    http_response_code(403);
    exit('Access denied');
}

// Simple connection test script

// Include the configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/home3/avidityi/private/db-config.php';

// Set content type to HTML 
header("Content-Type: text/html; charset=UTF-8");

// Try to connect to the database
$connected = false;
$error_message = "";

try {
    $conn = get_db_connection();
    $connected = true;
    
    // Try a simple query to verify full access
    $result = $conn->query("SHOW TABLES");
    $table_count = $result ? $result->num_rows : 0;
    
    // Close the connection
    $conn->close();
} catch (Exception $e) {
    $error_message = $e->getMessage();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Database Connection Test</h1>
    
    <?php if ($connected): ?>
        <div class="success">
            <strong>Connection successful!</strong>
            <p>Successfully connected to the MySQL database.</p>
            <p>Found <?php echo $table_count; ?> tables in the database.</p>
        </div>
    <?php else: ?>
        <div class="error">
            <strong>Connection failed!</strong>
            <p>Error: <?php echo htmlspecialchars($error_message); ?></p>
        </div>
    <?php endif; ?>
    
    <h2>Next Steps</h2>
    <ul>
        <li>View <a href="db-test.php">detailed database test</a> for more information</li>
        <li>Test the <a href="properties.php">properties API endpoint</a></li>
    </ul>
</body>
</html> 