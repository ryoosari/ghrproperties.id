<?php
// Fallback PHP handling for /properties URL
// This file will serve the properties.html content when the rewrite rules fail

// Define the path to the HTML file
$html_file = __DIR__ . "/properties.html";

// Check if the properties.html file exists
if (file_exists($html_file)) {
    // Set the content type to HTML
    header("Content-Type: text/html");
    
    // Output the file contents
    readfile($html_file);
    exit;
} else {
    // If the file does not exist, redirect to the homepage
    header("Location: /");
    exit;
}
?>
