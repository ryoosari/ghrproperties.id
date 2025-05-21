<?php
// Use mysqli configuration
require_once 'config.php';

// Determine the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different API endpoints
if ($method === 'GET') {
    // Get property by ID
    if (isset($_GET['id'])) {
        $property_id = (int)$_GET['id'];
        
        // Get database connection
        $conn = get_db_connection();
        
        // Prepare SQL statement to get property details
        $stmt = $conn->prepare("SELECT * FROM properties WHERE property_id = ? AND status = 'active'");
        $stmt->bind_param("i", $property_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $property = $row;
            
            // Get property images
            $images_stmt = $conn->prepare("SELECT image_path FROM property_images WHERE property_id = ? ORDER BY display_order");
            $images_stmt->bind_param("i", $property_id);
            $images_stmt->execute();
            $images_result = $images_stmt->get_result();
            
            $images = [];
            while ($image = $images_result->fetch_assoc()) {
                $images[] = $image['image_path'];
            }
            
            $property['images'] = $images;
            
            // Get property amenities
            $amenities_stmt = $conn->prepare(
                "SELECT a.name FROM amenities a 
                 JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
                 WHERE pa.property_id = ?"
            );
            $amenities_stmt->bind_param("i", $property_id);
            $amenities_stmt->execute();
            $amenities_result = $amenities_stmt->get_result();
            
            $amenities = [];
            while ($amenity = $amenities_result->fetch_assoc()) {
                $amenities[] = $amenity['name'];
            }
            
            $property['amenities'] = $amenities;
            
            send_json_response($property);
        } else {
            send_error("Property not found", 404);
        }
        
        $stmt->close();
        $conn->close();
    } 
    // Search properties
    else {
        $conn = get_db_connection();
        
        $query = "SELECT * FROM properties WHERE status = 'active'";
        $params = [];
        $types = "";
        
        // Apply filters if provided
        if (isset($_GET['keyword']) && !empty($_GET['keyword'])) {
            $keyword = "%" . $_GET['keyword'] . "%";
            $query .= " AND (title LIKE ? OR description LIKE ? OR keywords LIKE ? OR location LIKE ?)";
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
            $types .= "ssss";
        }
        
        if (isset($_GET['location']) && !empty($_GET['location'])) {
            $location = "%" . $_GET['location'] . "%";
            $query .= " AND location LIKE ?";
            $params[] = $location;
            $types .= "s";
        }
        
        if (isset($_GET['property_type']) && !empty($_GET['property_type']) && $_GET['property_type'] !== 'all') {
            $query .= " AND property_type = ?";
            $params[] = $_GET['property_type'];
            $types .= "s";
        }
        
        if (isset($_GET['min_price']) && !empty($_GET['min_price'])) {
            $query .= " AND price >= ?";
            $params[] = (float)$_GET['min_price'];
            $types .= "d";
        }
        
        if (isset($_GET['max_price']) && !empty($_GET['max_price'])) {
            $query .= " AND price <= ?";
            $params[] = (float)$_GET['max_price'];
            $types .= "d";
        }
        
        if (isset($_GET['bedrooms']) && !empty($_GET['bedrooms'])) {
            $query .= " AND bedrooms >= ?";
            $params[] = (int)$_GET['bedrooms'];
            $types .= "i";
        }
        
        if (isset($_GET['bathrooms']) && !empty($_GET['bathrooms'])) {
            $query .= " AND bathrooms >= ?";
            $params[] = (float)$_GET['bathrooms'];
            $types .= "d";
        }
        
        // Pagination
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $per_page = isset($_GET['per_page']) ? min(50, max(1, (int)$_GET['per_page'])) : 10;
        $offset = ($page - 1) * $per_page;
        
        // Get total count for pagination
        $count_query = str_replace("SELECT *", "SELECT COUNT(*) as count", $query);
        $count_stmt = $conn->prepare($count_query);
        
        if (!empty($params)) {
            $count_stmt->bind_param($types, ...$params);
        }
        
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $total = $count_result->fetch_assoc()['count'];
        
        // Add sorting and pagination
        $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $per_page;
        $params[] = $offset;
        $types .= "ii";
        
        // Execute query
        $stmt = $conn->prepare($query);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $properties = [];
        while ($property = $result->fetch_assoc()) {
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
        
        $stmt->close();
        $conn->close();
    }
} else {
    // Method not supported
    send_error("Method not allowed", 405);
} 