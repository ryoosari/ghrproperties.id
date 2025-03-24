<?php
// Debug script to show server information and file structure

// Set error reporting
error_reporting(E_ALL);
ini_set("display_errors", 1);

// Security check - simple password protection
if (!isset($_GET["token"]) || $_GET["token"] !== "debug123") {
    header("HTTP/1.0 403 Forbidden");
    echo "Access denied. Please use correct debug token.";
    exit;
}

// Function to safely display file contents
function safe_display_file($path) {
    if (file_exists($path)) {
        echo "<h3>Contents of " . htmlspecialchars($path) . ":</h3>";
        echo "<pre>";
        echo htmlspecialchars(file_get_contents($path));
        echo "</pre>";
    } else {
        echo "<p>File not found: " . htmlspecialchars($path) . "</p>";
    }
}

// Function to display directory contents
function list_directory($dir) {
    if (is_dir($dir)) {
        echo "<h3>Contents of " . htmlspecialchars($dir) . ":</h3>";
        echo "<ul>";
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $path = $dir . "/" . $file;
                $type = is_dir($path) ? "[DIR]" : "[FILE]";
                $size = is_file($path) ? " - " . filesize($path) . " bytes" : "";
                echo "<li>" . $type . " " . htmlspecialchars($file) . $size . "</li>";
            }
        }
        echo "</ul>";
    } else {
        echo "<p>Directory not found: " . htmlspecialchars($dir) . "</p>";
    }
}

// HTML header
echo "<!DOCTYPE html>
<html>
<head>
    <title>Site Debug Information</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        .section { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Site Debug Information</h1>";

// Server information
echo "<div class=\"section\">
    <h2>Server Information</h2>
    <pre>";
echo "Server Software: " . $_SERVER["SERVER_SOFTWARE"] . "\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Document Root: " . $_SERVER["DOCUMENT_ROOT"] . "\n";
echo "Current Script: " . $_SERVER["SCRIPT_FILENAME"] . "\n";
echo "Request URI: " . $_SERVER["REQUEST_URI"] . "\n";
echo "</pre>
</div>";

// Check htaccess
echo "<div class=\"section\">
    <h2>Critical Files Check</h2>";
safe_display_file(".htaccess");
safe_display_file("properties.html");
safe_display_file("properties.php");
safe_display_file("properties/index.php");
echo "</div>";

// Directory listings
echo "<div class=\"section\">
    <h2>Directory Structure</h2>";
list_directory(".");
list_directory("properties");
echo "</div>";

// HTML footer
echo "</body>
</html>";
?>
