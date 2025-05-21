<?php
// Prevent direct access to this file
if (count(get_included_files()) == 1) {
    // This file was accessed directly
    exit('Access denied');
}

// Database connection information
// Local development uses placeholders, GitHub Actions will inject real values
$db_host = 'localhost';
$db_user = 'DB_USER_PLACEHOLDER';
$db_password = 'DB_PASSWORD_PLACEHOLDER';
$db_name = 'DB_NAME_PLACEHOLDER';

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
    global $db_host, $db_user, $db_password, $db_name;
    
    $conn = new mysqli($db_host, $db_user, $db_password, $db_name);
    
    // Check connection
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed']));
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