import Link from 'next/link';
import Image from 'next/image';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { cn } from '@/utils/cn';
import { getStrapiMediaUrl } from '@/lib/strapi';
import { formatPrice } from '@/lib/formatters';

// Define a more flexible property interface that can handle both static and Strapi data
interface Property {
  id: number | string;
  title?: string;
  Title?: string; // Strapi field
  location?: string;
  Location?: string; // Strapi field
  price?: number | string;
  Price?: number | string; // Strapi field
  bedrooms?: number;
  Bedrooms?: number; // Strapi field
  bathrooms?: number;
  Bathrooms?: number; // Strapi field
  area?: string | number;
  Area?: string | number; // Strapi field
  square_footage?: string | number;
  image?: string;
  Image?: any[]; // Strapi field (array of image objects)
  images?: any;
  type?: string;
  property_type?: string;
  slug?: string;
  Slug?: string; // Strapi field
  status?: string;
  Status?: string; // Strapi field
  attributes?: { // For normalized properties
    title?: string;
    location?: string;
    price?: number | string;
    bedrooms?: number;
    bathrooms?: number;
    area?: string | number;
    property_type?: string;
    slug?: string;
    status?: string;
    featuredImage?: any;
    images?: any[];
    [key: string]: any;
  };
  [key: string]: any; // Allow for other fields
}

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  // First check if this is a normalized property with attributes
  const attrs = property.attributes || {};
  
  // Extract property fields with fallbacks between different naming conventions
  const title = attrs.title || property.Title || property.title || 'Unnamed Property';
  const location = attrs.location || property.Location || property.location || 'Location not specified';
  const price = attrs.price || property.Price || property.price || 0;
  const bedrooms = attrs.bedrooms || property.Bedrooms || property.bedrooms || 0;
  const bathrooms = attrs.bathrooms || property.Bathrooms || property.bathrooms || 0;
  const area = attrs.area || property.Area || property.area || property.square_footage || 'N/A';
  const type = attrs.property_type || property.property_type || property.type || 'Property';
  const slug = attrs.slug || property.Slug || property.slug || property.id;
  
  // Log for debugging - remove in production
  if (typeof window !== 'undefined') {
    console.log('PropertyCard receiving:', { 
      property_id: property.id,
      hasAttributes: Boolean(property.attributes),
      attrs_title: attrs.title,
      direct_Title: property.Title,
      resolved_title: title
    });
  }
  
  // Handle image from different sources
  let imageUrl = '/placeholder-property.jpg';
  let imageSourceType = 'placeholder';
  
  // Check for image in attributes
  if (attrs.featuredImage?.url) {
    imageUrl = attrs.featuredImage.url.startsWith('/') ? 
      `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${attrs.featuredImage.url}` : 
      attrs.featuredImage.url;
    imageSourceType = 'from-attributes';
  }
  // Then check other image formats
  else if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
    // Strapi image array format
    imageUrl = getStrapiMediaUrl(property.Image, 'medium');
    imageSourceType = 'from-array';
  } else if (property.images && property.images.data) {
    // Legacy Strapi format
    imageUrl = getStrapiMediaUrl(property.images);
    imageSourceType = 'from-legacy';
  } else if (property.image) {
    // Static format
    imageUrl = property.image;
    imageSourceType = 'from-static';
  } else if (property.featured_image && property.featured_image.data) {
    // Another possible format
    imageUrl = getStrapiMediaUrl(property.featured_image);
    imageSourceType = 'from-featured';
  }

  // Log image info - remove in production
  if (typeof window !== 'undefined') {
    console.log('PropertyCard image:', { 
      imageSourceType,
      imageUrl: imageUrl.substring(0, 100) + (imageUrl.length > 100 ? '...' : '')
    });
  }

  return (
    <Link href={`/properties/${slug}`} className="block">
      <div className={cn("bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300", className)}>
        <div className="relative h-64 overflow-hidden group">
          {/* Use next/image if it's a valid URL, otherwise fall back to img tag */}
          {imageUrl.startsWith('http') || imageUrl.startsWith('/') ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
              {type}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
              <FaSearch className="mr-2" />
              View Details
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FaMapMarkerAlt className="mr-1 text-primary" />
            <span>{location}</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-primary text-xl font-bold mb-4">{formatPrice(price)}</p>
          <div className="flex justify-between text-gray-600 border-t pt-4">
            <div className="flex items-center">
              <FaBed className="mr-1" />
              <span>{bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <FaBath className="mr-1" />
              <span>{bathrooms} Baths</span>
            </div>
            <div className="flex items-center">
              <FaRuler className="mr-1" />
              <span>{typeof area === 'number' ? `${area} m²` : area}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}