<?php
// Include mysqli config file
require_once 'config.php';

// Try to get a database connection
$conn = get_db_connection();
echo "<h1>Database Connection Test (MySQLi)</h1>";
echo "<p>Connection successful!</p>";

// Try to list tables
$result = $conn->query("SHOW TABLES");

if ($result) {
    echo "<h2>Tables in Database</h2>";
    echo "<ul>";
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_array(MYSQLI_NUM)) {
            echo "<li>" . htmlspecialchars($row[0]) . "</li>";
        }
    } else {
        echo "<li>No tables found</li>";
    }
    
    echo "</ul>";
    
    // Count records in properties table
    $tables = [];
    $result->data_seek(0);
    while ($row = $result->fetch_array(MYSQLI_NUM)) {
        $tables[] = $row[0];
    }
    
    if (in_array('properties', $tables)) {
        $count_result = $conn->query("SELECT COUNT(*) FROM properties");
        if ($count_result) {
            $count = $count_result->fetch_row()[0];
            echo "<p>Number of properties in database: " . $count . "</p>";
        }
    }
} else {
    echo "<p>Error listing tables: " . $conn->error . "</p>";
}

// Close connection
$conn->close();

echo "<h2>Troubleshooting Steps</h2>";
echo "<ol>";
echo "<li>Check that your database credentials in config.php are correct</li>";
echo "<li>Verify that the database exists</li>";
echo "<li>Ensure your database user has proper permissions</li>";
echo "<li>Check MySQL error logs in cPanel</li>";
echo "</ol>";
?> 