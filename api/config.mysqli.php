<?php
// Use Bluehost's include path for secure credential storage
// This file will be stored outside the web root but accessible via PHP include path

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

// Database connection configuration using variables from included file
$db_config = [
    'host' => $db_host ?? 'localhost',
    'username' => $db_user ?? '',
    'password' => $db_password ?? '',
    'database' => $db_name ?? ''
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

// Create database connection
function get_db_connection() {
    global $db_config;
    
    $conn = new mysqli(
        $db_config['host'],
        $db_config['username'],
        $db_config['password'],
        $db_config['database']
    );
    
    // Check connection
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
    }
    
    // Set character set
    $conn->set_charset("utf8mb4");
    
    return $conn;
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