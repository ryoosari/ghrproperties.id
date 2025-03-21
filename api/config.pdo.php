<?php
// Alternative config file using PDO connection for better security

// Check if we're on Bluehost production or local development
if (file_exists('/home/avidityi/db-credentials.php')) {
    // We're on Bluehost production
    require_once '/home/avidityi/db-credentials.php';
} else {
    // We're in local development
    // Use default local dev settings
    $db_host = 'localhost';
    $db_user = 'root';
    $db_password = '';
    $db_name = 'ghrproperties_local';
}

// Database connection configuration
$db_config = [
    'host' => $db_host ?? 'localhost',
    'username' => $db_user ?? '',
    'password' => $db_password ?? '',
    'database' => $db_name ?? '',
    'charset' => 'utf8mb4'
];

// Enable CORS for API requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// If this is a preflight OPTIONS request, return only the headers and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create PDO database connection
function get_db_connection() {
    global $db_config;
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['database']};charset={$db_config['charset']}";
        
        // Configure PDO options for better security and performance
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,     // Throw exceptions on errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch as associative array
            PDO::ATTR_EMULATE_PREPARES => false,             // Use real prepared statements
            PDO::ATTR_PERSISTENT => true                     // Use persistent connections
        ];
        
        // Create new PDO instance
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $options);
        
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
    }
}

// Execute query and return results
function execute_query($sql, $params = []) {
    try {
        $pdo = get_db_connection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Query execution failed: ' . $e->getMessage()]));
    }
}

// Helper function to send JSON response
function send_json_response($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

// Helper function to handle errors
function send_error($message, $status_code = 400) {
    http_response_code($status_code);
    echo json_encode(['error' => $message]);
    exit();
} 