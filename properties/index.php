<?php
// Fallback PHP handling for /properties/ directory
// This file serves the properties.html content when the rewrite rules fail

// Define the path to the HTML file
$html_file = dirname(__DIR__) . '/properties.html';

// Check if the properties.html file exists
if (file_exists($html_file)) {
    // Set the content type to HTML
    header('Content-Type: text/html');
    
    // Output the file contents
    readfile($html_file);
    exit;
} else {
    // If the file doesn't exist, redirect to the homepage
    header('Location: /');
    exit;
}
?> 