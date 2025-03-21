<?php
// Include PDO config file
require_once 'config.pdo.php';

// Try to get a database connection
try {
    $pdo = get_db_connection();
    echo "<h1>Database Connection Test (PDO)</h1>";
    echo "<p>Connection successful!</p>";
    
    // Try to list tables
    $stmt = $pdo->query("SHOW TABLES");
    
    if ($stmt) {
        echo "<h2>Tables in Database</h2>";
        echo "<ul>";
        
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($tables) > 0) {
            foreach ($tables as $table) {
                echo "<li>" . htmlspecialchars($table) . "</li>";
            }
        } else {
            echo "<li>No tables found</li>";
        }
        
        echo "</ul>";
        
        // Count records in properties table if it exists
        if (in_array('properties', $tables)) {
            $stmt = $pdo->query("SELECT COUNT(*) FROM properties");
            $count = $stmt->fetchColumn();
            echo "<p>Number of properties in database: " . $count . "</p>";
        }
    } else {
        echo "<p>Error listing tables.</p>";
    }
    
    // Connection is automatically closed when script ends
} catch (Exception $e) {
    echo "<h1>Database Connection Error</h1>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    
    echo "<h2>Troubleshooting Steps</h2>";
    echo "<ol>";
    echo "<li>Check that your database credentials in db-credentials.php are correct</li>";
    echo "<li>Verify that the database exists</li>";
    echo "<li>Ensure your database user has proper permissions</li>";
    echo "<li>Check MySQL error logs in cPanel</li>";
    echo "</ol>";
}
?> 