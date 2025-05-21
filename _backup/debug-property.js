const fs = require('fs');
const path = require('path');

// Load the property JSON
const propertyPath = path.join(process.cwd(), 'data', 'properties', 'vero-selaras-villa-ubud-made-heng.json');
const property = JSON.parse(fs.readFileSync(propertyPath, 'utf8'));

console.log('Property data loaded from file:');
console.log('ID:', property.id);
console.log('Title:', property.Title);
console.log('Slug:', property.Slug);
console.log('Status:', property.Status);
console.log('Has Images:', Array.isArray(property.Image) && property.Image.length > 0);
console.log('Image Count:', Array.isArray(property.Image) ? property.Image.length : 0);

// Check if we have a MainImage
console.log('Has MainImage:', !!property.MainImage);

// Check for proper slug capitalization
console.log('Has lowercase slug property:', 'slug' in property);
console.log('Has uppercase slug property:', 'Slug' in property);

// Check if processed-properties.json exists and contains this property
try {
  const processedPath = path.join(process.cwd(), 'data', 'processed-properties.json');
  if (fs.existsSync(processedPath)) {
    const processed = JSON.parse(fs.readFileSync(processedPath, 'utf8'));
    if (Array.isArray(processed)) {
      const foundProperty = processed.find(p => p.Slug === property.Slug || p.slug === property.Slug);
      console.log('Found in processed-properties.json:', !!foundProperty);
      if (foundProperty) {
        console.log('Processed property ID:', foundProperty.id);
        console.log('Processed property slug field:', foundProperty.Slug ? 'Slug' : (foundProperty.slug ? 'slug' : 'none'));
      }
    }
  } else {
    console.log('processed-properties.json not found');
  }
} catch (error) {
  console.error('Error checking processed-properties.json:', error.message);
}

// Check property-index.json
try {
  const indexPath = path.join(process.cwd(), 'data', 'property-index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (Array.isArray(index)) {
      const foundProperty = index.find(p => 
        p.attributes && (p.attributes.slug === property.Slug || p.attributes.Slug === property.Slug)
      );
      console.log('Found in property-index.json:', !!foundProperty);
      if (foundProperty) {
        console.log('Index property ID:', foundProperty.id);
        console.log('Index property slug:', foundProperty.attributes.slug);
      }
    }
  } else {
    console.log('property-index.json not found');
  }
} catch (error) {
  console.error('Error checking property-index.json:', error.message);
}

// Check for snapshot directory
try {
  const snapshotPath = path.join(process.cwd(), 'data', 'snapshot', 'vero-selaras-villa-ubud-made-heng.json');
  if (fs.existsSync(snapshotPath)) {
    const snapshotProp = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log('Snapshot property exists:', true);
    console.log('Snapshot property ID:', snapshotProp.id);
    console.log('Snapshot property Slug:', snapshotProp.Slug || snapshotProp.slug || 'none');
  } else {
    console.log('Snapshot property file not found');
  }
} catch (error) {
  console.error('Error checking snapshot property:', error.message);
} 