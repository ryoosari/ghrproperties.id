<?php
// Include config file
require_once 'config.php';

// Try to get a database connection
try {
    $conn = get_db_connection();
    echo "<h1>Database Connection Test</h1>";
    echo "<p>Connection successful!</p>";
    
    // Try to list tables
    $result = $conn->query("SHOW TABLES");
    
    if ($result) {
        echo "<h2>Tables in Database</h2>";
        echo "<ul>";
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_row()) {
                echo "<li>" . htmlspecialchars($row[0]) . "</li>";
            }
        } else {
            echo "<li>No tables found</li>";
        }
        
        echo "</ul>";
    } else {
        echo "<p>Error listing tables: " . $conn->error . "</p>";
    }
    
    // Close connection
    $conn->close();
} catch (Exception $e) {
    echo "<h1>Database Connection Error</h1>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    
    echo "<h2>Troubleshooting Steps</h2>";
    echo "<ol>";
    echo "<li>Check that your database credentials in config.php are correct</li>";
    echo "<li>Verify that the database exists</li>";
    echo "<li>Ensure your database user has proper permissions</li>";
    echo "<li>Check MySQL error logs in cPanel</li>";
    echo "</ol>";
}
?> 