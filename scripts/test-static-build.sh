#!/bin/bash

# Test Static Build Process
# This script tests the static export process with both empty and sample data

echo "🧪 Testing static build process..."

# Step 1: Ensure we have directories
mkdir -p data/properties data/snapshot

# Step 2: Create test property for manual testing
cat > data/properties/test-property.json << EOF
{
  "id": 999,
  "Title": "Test Property",
  "Description": "This is a test property to verify the static export process",
  "Price": 500000,
  "Slug": "test-property",
  "Location": "Canggu, Bali",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "Bedrooms": 3,
  "Bathrooms": 2,
  "Area": 150,
  "PropertyType": "Villa"
}
EOF

# Step 3: Create property index with the test property
cat > data/property-index.json << EOF
[
  {
    "id": 999,
    "attributes": {
      "title": "Test Property",
      "slug": "test-property",
      "status": "published",
      "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "price": 500000,
      "location": "Canggu, Bali",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 150
    }
  }
]
EOF

# Step 4: Create processed properties with the test property
cat > data/processed-properties.json << EOF
[
  {
    "id": 999,
    "Title": "Test Property",
    "Description": "This is a test property to verify the static export process",
    "Price": 500000,
    "Slug": "test-property",
    "Location": "Canggu, Bali",
    "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "Bedrooms": 3,
    "Bathrooms": 2,
    "Area": 150,
    "PropertyType": "Villa"
  }
]
EOF

# Step 5: Create properties.json with the test property
cat > data/properties.json << EOF
{
  "data": [
    {
      "id": 999,
      "attributes": {
        "Title": "Test Property",
        "Description": "This is a test property to verify the static export process",
        "Price": 500000,
        "Slug": "test-property",
        "Location": "Canggu, Bali",
        "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
        "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
        "Bedrooms": 3,
        "Bathrooms": 2,
        "Area": 150,
        "PropertyType": "Villa"
      }
    }
  ],
  "meta": { "pagination": { "total": 1 } }
}
EOF

# Step 6: Create snapshot version for static generation
mkdir -p data/snapshot
cat > data/snapshot/properties.json << EOF
[
  {
    "id": 999,
    "attributes": {
      "title": "Test Property",
      "slug": "test-property", 
      "description": "This is a test property to verify the static export process",
      "status": "published",
      "price": 500000,
      "property_type": "Villa",
      "location": "Canggu, Bali",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 150,
      "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "amenities": ["Pool", "WiFi", "Garden"],
      "featuredImage": null
    }
  }
]
EOF

cat > data/snapshot/test-property.json << EOF
{
  "id": 999,
  "attributes": {
    "title": "Test Property",
    "slug": "test-property", 
    "description": "This is a test property to verify the static export process",
    "status": "published",
    "price": 500000,
    "property_type": "Villa",
    "location": "Canggu, Bali",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 150,
    "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "amenities": ["Pool", "WiFi", "Garden"],
    "featuredImage": null
  }
}
EOF

# Create last-updated.json and metadata.json
echo "{\"lastUpdated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > data/last-updated.json
echo "{\"exportedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"stats\": {\"properties\": 1}, \"source\": \"test-script\"}" > data/metadata.json

echo "✅ Test data created successfully"
echo "🔍 Now run: NEXT_PUBLIC_STATIC_EXPORT=true npm run build"
echo "   to test the static build with the sample property"