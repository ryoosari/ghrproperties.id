const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Check if http-proxy is installed
try {
  require.resolve('http-proxy');
} catch (e) {
  console.error('The http-proxy module is not installed. Please install it with:');
  console.error('npm install http-proxy');
  process.exit(1);
}

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Log errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error');
});

// Create a server to handle the requests
const server = http.createServer(function(req, res) {
  // Handle special case for the test image page
  if (req.url === '/test-image-proxy') {
    const htmlPath = path.join(__dirname, '..', 'public', 'test-image-proxy.html');
    
    // Create the test HTML file if it doesn't exist
    if (!fs.existsSync(htmlPath)) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Property Image Proxy Test</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                .image-container {
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 5px;
                }
                .image-container h2 {
                    margin-top: 0;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin-bottom: 10px;
                }
                .url {
                    font-family: monospace;
                    background-color: #f5f5f5;
                    padding: 8px;
                    border-radius: 4px;
                    word-break: break-all;
                    margin: 10px 0;
                }
                .success {
                    color: green;
                    font-weight: bold;
                }
                .error {
                    color: red;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Property Image Proxy Test</h1>
            <p>This page tests if the property images can be displayed through the local proxy.</p>
            
            <div class="image-container">
                <h2>Proxied URL</h2>
                <div class="url">http://localhost:3030/uploads/large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg</div>
                <img src="http://localhost:3030/uploads/large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg" 
                    alt="Property Image" 
                    onerror="this.onerror=null; this.parentNode.innerHTML += '<p class=\\'error\\'>❌ Failed to load image through proxy</p>';"
                    onload="this.parentNode.innerHTML += '<p class=\\'success\\'>✅ Image loaded successfully through proxy</p>';">
            </div>
            
            <div class="image-container">
                <h2>Proxied Medium Format URL</h2>
                <div class="url">http://localhost:3030/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg</div>
                <img src="http://localhost:3030/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg" 
                    alt="Property Image - Medium Format" 
                    onerror="this.onerror=null; this.parentNode.innerHTML += '<p class=\\'error\\'>❌ Failed to load medium image through proxy</p>';"
                    onload="this.parentNode.innerHTML += '<p class=\\'success\\'>✅ Medium image loaded successfully through proxy</p>';">
            </div>
            
            <script>
                // Add a message about the test results
                window.onload = function() {
                    const successElements = document.querySelectorAll('.success');
                    const errorElements = document.querySelectorAll('.error');
                    
                    const resultsDiv = document.createElement('div');
                    resultsDiv.innerHTML = \`
                        <h2>Test Results</h2>
                        <p>Images loaded successfully: \${successElements.length}</p>
                        <p>Images failed to load: \${errorElements.length}</p>
                    \`;
                    
                    document.body.appendChild(resultsDiv);
                };
            </script>
        </body>
        </html>
      `;
      
      fs.writeFileSync(htmlPath, html);
    }
    
    // Serve the test HTML file
    fs.readFile(htmlPath, function(err, data) {
      if (err) {
        res.writeHead(500);
        res.end('Error loading test page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // For all other requests, proxy to Strapi
  proxy.web(req, res, {
    target: 'http://localhost:1337',
    changeOrigin: true
  });
});

const PORT = 3030;

server.listen(PORT, function() {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log('Forwarding requests to http://localhost:1337');
  console.log('');
  console.log('Test the proxy with these URLs:');
  console.log('1. Test image page: http://localhost:3030/test-image-proxy');
  console.log('2. Example image: http://localhost:3030/uploads/large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
}); 