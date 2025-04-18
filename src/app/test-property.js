import { getPropertyBySlug } from '@/lib/strapi';

export async function testPropertyRetrieval() {
  const slug = 'vero-selaras-villa-ubud-made-heng';
  console.log(`Testing property retrieval for slug: ${slug}`);
  
  try {
    const property = await getPropertyBySlug(slug);
    
    if (property) {
      console.log('✅ Property retrieved successfully!');
      console.log('Property ID:', property.id);
      console.log('Property Title:', property.Title || (property.attributes && property.attributes.Title));
      console.log('Property has images:', property.Image ? `Yes (${property.Image.length})` : 'No');
    } else {
      console.log('❌ Property not found!');
    }
    
    return property;
  } catch (error) {
    console.error('❌ Error retrieving property:', error);
    return null;
  }
}

// For direct execution in Node.js
if (typeof window === 'undefined') {
  testPropertyRetrieval()
    .then(result => {
      console.log('Test completed!');
      if (result) {
        console.log('Property details:', JSON.stringify({
          id: result.id,
          title: result.Title || (result.attributes && result.attributes.Title),
          slug: result.Slug || (result.attributes && result.attributes.Slug),
        }, null, 2));
      }
    })
    .catch(err => console.error('Test failed with error:', err));
}

export default function TestPropertyPage() {
  return (
    <div>
      <h1>Property Test Page</h1>
      <p>This page tests the property retrieval logic.</p>
      <p>Check the console for results.</p>
    </div>
  );
} 