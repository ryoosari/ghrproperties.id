'use client';

import { useState, useEffect } from 'react';
import { getProperties, getStrapiMediaUrl } from '@/lib/strapi';
import { formatPrice, formatWithUnit, truncateText } from '@/lib/formatters';
import Link from 'next/link';
import Image from 'next/image';

export default function StrapiPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const result = await getProperties();
        console.log('Strapi properties response:', result);
        
        // Handle different response structures
        if (result && result.data) {
          setProperties(result.data);
        } else if (Array.isArray(result)) {
          setProperties(result);
        } else {
          setProperties([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties from Strapi');
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Properties from Strapi</h1>
        <div className="text-center py-12">
          <div className="animate-pulse">Loading properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Properties from Strapi</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <p className="mt-2">
            Make sure your Strapi server is running at {process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Properties from Strapi</h1>
      
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">No properties found in Strapi.</p>
          <p className="mt-2 text-gray-500">
            Add some properties in the Strapi admin panel at{' '}
            <a 
              href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }) {
  console.log('Property data:', property); // Debugging log
  
  // Property now directly contains the fields, not nested in attributes
  
  // Extract fields with fallbacks for missing data
  const title = property.Title || 'No Title';
  const description = property.Description || '';
  const price = property.Price || 0;
  const location = property.Location || 'No Location';
  const bedrooms = property.Bedrooms || 0;
  const bathrooms = property.Bathrooms || 0;
  const area = property.Area || 0;
  const status = property.Status || 'unlisted';
  const slug = property.Slug || property.id;
  
  // Handle the Image array structure
  const images = property.Image || [];
  console.log('Image data:', images); // Debugging log
  
  const imageUrl = images.length > 0 
    ? getStrapiMediaUrl(images, 'medium') 
    : '/placeholder-property.jpg';
  
  console.log('Image URL:', imageUrl); // Debugging log

  const statusColors = {
    for_sale: 'bg-green-100 text-green-800',
    for_rent: 'bg-blue-100 text-blue-800',
    sold: 'bg-red-100 text-red-800',
    rented: 'bg-purple-100 text-purple-800'
  };

  const statusLabels = {
    for_sale: 'For Sale',
    for_rent: 'For Rent',
    sold: 'Sold',
    rented: 'Rented'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-64 w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
          {statusLabels[status] || status || 'Status N/A'}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-500 mb-4">{location}</p>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-bold text-primary">
            {formatPrice(price)}
          </p>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">🛏️</span>
            <span>{formatWithUnit(bedrooms, 'Bed')}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🚿</span>
            <span>{formatWithUnit(bathrooms, 'Bath')}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">📏</span>
            <span>{formatWithUnit(area, 'm²')}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <Link href={`/property/${slug || property.id}`} className="block w-full bg-primary text-white text-center py-2 rounded hover:bg-primary-dark transition">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 