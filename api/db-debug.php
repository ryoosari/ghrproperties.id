<?php
// Simple diagnostic script - DELETE AFTER TESTING

// Output as plain text for easier reading
header('Content-Type: text/plain');

echo "API Database Connection Diagnostic\n";
echo "=================================\n\n";

// Get current values (without revealing actual passwords)
echo "Current Configuration:\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Extensions Loaded: " . (extension_loaded('mysqli') ? 'mysqli ✓' : 'mysqli ✗') . "\n";

// Include config carefully to detect parse errors
echo "\nTesting config.php inclusion:\n";
try {
    // Capture output to prevent header already sent errors
    ob_start();
    require_once 'config.php';
    ob_end_clean();
    echo "✓ config.php was loaded successfully\n";
} catch (Throwable $e) {
    echo "✗ Error loading config.php: " . $e->getMessage() . "\n";
    exit;
}

// Show database connection variables (without passwords)
echo "\nDatabase connection settings:\n";
echo "DB_HOST: " . (isset($db_host) ? $db_host : 'Not defined') . "\n";
echo "DB_USER: " . (isset($db_user) ? $db_user : 'Not defined') . "\n";
echo "DB_NAME: " . (isset($db_name) ? $db_name : 'Not defined') . "\n";
echo "DB_PASSWORD: " . (isset($db_password) ? '[HIDDEN]' : 'Not defined') . "\n";

// Test actual connection
echo "\nConnection test:\n";
try {
    // Don't use the get_db_connection function to test direct connection
    $conn = new mysqli($db_host, $db_user, $db_password, $db_name);
    
    if ($conn->connect_error) {
        echo "✗ Connection failed: " . $conn->connect_error . "\n";
    } else {
        echo "✓ Connected successfully to the database\n";
        
        // Test a simple query
        $result = $conn->query("SHOW TABLES");
        
        if ($result) {
            $tableCount = $result->num_rows;
            echo "✓ Found $tableCount tables in database\n";
            
            if ($tableCount > 0) {
                echo "\nTables in database:\n";
                while ($row = $result->fetch_array(MYSQLI_NUM)) {
                    echo "- " . $row[0] . "\n";
                }
            } else {
                echo "✗ No tables found in database. This might be why properties.php returns nothing.\n";
            }
        } else {
            echo "✗ Query failed: " . $conn->error . "\n";
        }
        
        $conn->close();
    }
} catch (Throwable $e) {
    echo "✗ Exception occurred: " . $e->getMessage() . "\n";
}

// Check properties.php for what table it's querying
echo "\nAnalyzing properties.php:\n";
$properties_file = file_get_contents('properties.php');
if ($properties_file) {
    // Extract table name from SQL queries (simple regex)
    preg_match_all('/FROM\s+([a-zA-Z0-9_]+)/i', $properties_file, $matches);
    
    if (isset($matches[1]) && count($matches[1]) > 0) {
        $tables = array_unique($matches[1]);
        echo "Properties.php likely queries these tables: " . implode(', ', $tables) . "\n";
        echo "Check if these tables exist in your database.\n";
    } else {
        echo "Could not determine which tables are used by properties.php\n";
    }
} else {
    echo "Could not read properties.php file\n";
}

echo "\n=================================\n";
echo "IMPORTANT: DELETE THIS FILE AFTER TESTING FOR SECURITY REASONS\n";
?> 