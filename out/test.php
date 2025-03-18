<?php
// Display PHP information
echo "<h1>Server Information for ghrproperties.id</h1>";
echo "<h2>PHP Version: " . phpversion() . "</h2>";

// Check if mod_rewrite is enabled
echo "<h2>Apache Modules:</h2>";
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    echo "<p>mod_rewrite enabled: " . (in_array('mod_rewrite', $modules) ? 'Yes' : 'No') . "</p>";
} else {
    echo "<p>Unable to check Apache modules directly.</p>";
}

// Check .htaccess status
echo "<h2>.htaccess Status:</h2>";
$htaccess_path = __DIR__ . '/.htaccess';
if (file_exists($htaccess_path)) {
    echo "<p>.htaccess file exists</p>";
    echo "<p>File size: " . filesize($htaccess_path) . " bytes</p>";
    echo "<p>File permissions: " . substr(sprintf('%o', fileperms($htaccess_path)), -4) . "</p>";
} else {
    echo "<p>.htaccess file does not exist in the expected location</p>";
}

// Check for Next.js static files
echo "<h2>Next.js Static Files:</h2>";
$index_html = __DIR__ . '/index.html';
if (file_exists($index_html)) {
    echo "<p>index.html exists</p>";
} else {
    echo "<p>index.html does not exist in the root directory</p>";
}

// Directory structure
echo "<h2>Directory Structure:</h2>";
echo "<pre>";
$dir = new DirectoryIterator(__DIR__);
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        echo $fileinfo->getFilename() . " - " . 
             ($fileinfo->isDir() ? "Directory" : "File") . 
             " (" . $fileinfo->getSize() . " bytes)\n";
    }
}
echo "</pre>";

// Server variables
echo "<h2>Server Variables:</h2>";
echo "<pre>";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "SERVER_NAME: " . $_SERVER['SERVER_NAME'] . "\n";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "</pre>";
?> 