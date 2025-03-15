<?php
// Check if index.html exists and redirect to it
if (file_exists(__DIR__ . '/index.html')) {
    header('Location: /index.html');
    exit;
}

// If we're in a subdirectory and need to redirect to the main site
$document_root = $_SERVER['DOCUMENT_ROOT'];
$current_dir = __DIR__;

// If we're in public_html/ghrproperties.id but the site should be at public_html
if (strpos($current_dir, $document_root . '/ghrproperties.id') !== false) {
    // We're in a subdirectory, check if index.html exists in parent
    if (file_exists(dirname($current_dir) . '/index.html')) {
        header('Location: /index.html');
        exit;
    }
}

// If we get here, we need to show an error or placeholder
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GHR Properties - Site Setup Required</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        code {
            background: #f8f9fa;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>GHR Properties - Site Setup Required</h1>
    
    <div class="error">
        <p><strong>Setup Required:</strong> The Next.js static export files are not properly deployed.</p>
    </div>
    
    <h2>Missing Files</h2>
    <p>The <code>index.html</code> file is missing from the root directory. This file is essential for your Next.js application to work.</p>
    
    <h2>How to Fix</h2>
    <ol>
        <li>Build your Next.js application locally with <code>npm run build</code></li>
        <li>Upload the contents of the <code>out</code> directory to this server</li>
        <li>Make sure the <code>.htaccess</code> file is also uploaded</li>
        <li>Check file permissions (files: 644, directories: 755)</li>
    </ol>
    
    <h2>Directory Information</h2>
    <p>Current directory: <code><?php echo __DIR__; ?></code></p>
    <p>Document root: <code><?php echo $_SERVER['DOCUMENT_ROOT']; ?></code></p>
    
    <p>For more detailed instructions, please refer to the <code>BLUEHOST_DEPLOYMENT.md</code> file in your project.</p>
    
    <p><a href="/test.php">View Server Information</a> | <a href="/test.html">Test Static HTML</a></p>
</body>
</html> 