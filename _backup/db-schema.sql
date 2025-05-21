-- Database Schema for GHR Properties

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INT NOT NULL DEFAULT 0,
    bathrooms DECIMAL(3,1) NOT NULL DEFAULT 0,
    square_footage INT,
    property_type VARCHAR(50) NOT NULL,
    featured_image VARCHAR(255),
    keywords VARCHAR(255),
    status ENUM('active', 'pending', 'sold') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Junction Table for Property-Amenity Relationships
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id) ON DELETE CASCADE
);

-- Initial Amenities Data
INSERT INTO amenities (name) VALUES 
('Swimming Pool'),
('Garden'),
('Garage'),
('Balcony'),
('Air Conditioning'),
('Furnished'),
('Security System'),
('Home Office'),
('Gym'),
('Pet Friendly');

-- INDEX for faster search
CREATE INDEX idx_property_status ON properties(status);
CREATE INDEX idx_property_type ON properties(property_type);
CREATE INDEX idx_property_location ON properties(location);
CREATE INDEX idx_property_price ON properties(price);
CREATE INDEX idx_property_bedrooms ON properties(bedrooms);
CREATE INDEX idx_property_bathrooms ON properties(bathrooms);
CREATE FULLTEXT INDEX idx_property_search ON properties(title, description, keywords, location); 