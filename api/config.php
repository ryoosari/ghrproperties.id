<?php
// Use mysqli connection approach 
// No SSH access required for this approach

// Database connection information
// NOTE: For production, replace these with your actual Bluehost credentials
$db_host = 'localhost';
$db_user = 'avidityi_ryoosari';  // Your Bluehost database username
$db_password = 'Ockerse24!';     // Your Bluehost database password
$db_name = 'avidityi_ghrproperties.id'; // Your Bluehost database name

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