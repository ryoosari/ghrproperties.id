<?php
// Use PDO configuration
require_once 'config.pdo.php';

// Determine the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different API endpoints
if ($method === 'GET') {
    // Get property by ID
    if (isset($_GET['id'])) {
        $property_id = (int)$_GET['id'];
        
        try {
            // Prepare SQL statement to get property details
            $stmt = execute_query(
                "SELECT * FROM properties WHERE property_id = ? AND status = 'active'",
                [$property_id]
            );
            
            if ($row = $stmt->fetch()) {
                $property = $row;
                
                // Get property images
                $images_stmt = execute_query(
                    "SELECT image_path FROM property_images WHERE property_id = ? ORDER BY display_order",
                    [$property_id]
                );
                
                $images = [];
                while ($image = $images_stmt->fetch()) {
                    $images[] = $image['image_path'];
                }
                
                $property['images'] = $images;
                
                // Get property amenities
                $amenities_stmt = execute_query(
                    "SELECT a.name FROM amenities a 
                     JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
                     WHERE pa.property_id = ?",
                    [$property_id]
                );
                
                $amenities = [];
                while ($amenity = $amenities_stmt->fetch()) {
                    $amenities[] = $amenity['name'];
                }
                
                $property['amenities'] = $amenities;
                
                send_json_response($property);
            } else {
                send_error("Property not found", 404);
            }
        } catch (PDOException $e) {
            send_error("Database error: " . $e->getMessage(), 500);
        }
    }
    // Search properties
    else {
        $query = "SELECT * FROM properties WHERE status = 'active'";
        $params = [];
        
        // Apply filters if provided
        if (isset($_GET['keyword']) && !empty($_GET['keyword'])) {
            $keyword = "%" . $_GET['keyword'] . "%";
            $query .= " AND (title LIKE ? OR description LIKE ? OR keywords LIKE ? OR location LIKE ?)";
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
        }
        
        if (isset($_GET['location']) && !empty($_GET['location'])) {
            $location = "%" . $_GET['location'] . "%";
            $query .= " AND location LIKE ?";
            $params[] = $location;
        }
        
        if (isset($_GET['property_type']) && !empty($_GET['property_type']) && $_GET['property_type'] !== 'all') {
            $query .= " AND property_type = ?";
            $params[] = $_GET['property_type'];
        }
        
        if (isset($_GET['min_price']) && !empty($_GET['min_price'])) {
            $query .= " AND price >= ?";
            $params[] = (float)$_GET['min_price'];
        }
        
        if (isset($_GET['max_price']) && !empty($_GET['max_price'])) {
            $query .= " AND price <= ?";
            $params[] = (float)$_GET['max_price'];
        }
        
        if (isset($_GET['bedrooms']) && !empty($_GET['bedrooms'])) {
            $query .= " AND bedrooms >= ?";
            $params[] = (int)$_GET['bedrooms'];
        }
        
        if (isset($_GET['bathrooms']) && !empty($_GET['bathrooms'])) {
            $query .= " AND bathrooms >= ?";
            $params[] = (float)$_GET['bathrooms'];
        }
        
        try {
            // Pagination
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $per_page = isset($_GET['per_page']) ? min(50, max(1, (int)$_GET['per_page'])) : 10;
            $offset = ($page - 1) * $per_page;
            
            // Get total count for pagination
            $count_query = str_replace("SELECT *", "SELECT COUNT(*) as count", $query);
            $count_stmt = execute_query($count_query, $params);
            $total = $count_stmt->fetchColumn();
            
            // Add sorting and pagination
            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $per_page;
            $params[] = $offset;
            
            // Execute query
            $stmt = execute_query($query, $params);
            
            $properties = [];
            while ($property = $stmt->fetch()) {
                $properties[] = $property;
            }
            
            // Return response with pagination info
            send_json_response([
                'properties' => $properties,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $per_page,
                    'total_pages' => ceil($total / $per_page)
                ]
            ]);
        } catch (PDOException $e) {
            send_error("Database error: " . $e->getMessage(), 500);
        }
    }
} else {
    // Method not supported
    send_error("Method not allowed", 405);
} 