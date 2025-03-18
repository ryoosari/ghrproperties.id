<?php
// Document Root Checker
header('Content-Type: text/plain');

echo "Document Root Check\n";
echo "==================\n\n";

echo "Server Variables:\n";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "SCRIPT_FILENAME: " . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
echo "Current Directory: " . __DIR__ . "\n\n";

echo "File Structure:\n";
echo "Parent directory exists: " . (file_exists(dirname(__DIR__)) ? 'Yes' : 'No') . "\n";
echo "Index.html in current dir: " . (file_exists(__DIR__ . '/index.html') ? 'Yes' : 'No') . "\n";
echo "Index.html in parent dir: " . (file_exists(dirname(__DIR__) . '/index.html') ? 'Yes' : 'No') . "\n\n";

echo "Deployment Configuration:\n";
echo ".htaccess exists: " . (file_exists(__DIR__ . '/.htaccess') ? 'Yes' : 'No') . "\n";
if (file_exists(__DIR__ . '/.htaccess')) {
    $content = file_get_contents(__DIR__ . '/.htaccess');
    preg_match('/DOCUMENT_ROOT: (.+)$/', $content, $matches);
    if (!empty($matches[1])) {
        echo ".htaccess DOCUMENT_ROOT: " . $matches[1] . "\n";
    }
}

echo "\nDirectory Listing:\n";
$dir = opendir(__DIR__);
while ($file = readdir($dir)) {
    echo $file . "\n";
}
closedir($dir);
?> 