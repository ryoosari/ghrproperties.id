import Link from 'next/link';
import Image from 'next/image';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaSearch, FaSwimmingPool, FaParking, FaWifi, FaUtensils, FaSnowflake, FaCheckCircle } from 'react-icons/fa';
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
  amenities?: string[]; // Array of amenity strings
  Amenities?: string[]; // Strapi field with capital A
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
    amenities?: string[];
    Amenities?: string[];
    [key: string]: any;
  };
  [key: string]: any; // Allow for other fields
}

interface PropertyCardProps {
  property: Property;
  className?: string;
}

// Function to get an icon for an amenity based on its name
function getAmenityIcon(name: string) {
  const iconMap: Record<string, any> = {
    "Swimming Pool": FaSwimmingPool,
    "Private Pool": FaSwimmingPool,
    "Shared Pool": FaSwimmingPool,
    "Parking": FaParking,
    "WiFi": FaWifi,
    "Kitchen": FaUtensils,
    "Air Conditioning": FaSnowflake,
    "Security Service": FaCheckCircle,
  };
  
  return iconMap[name] || FaCheckCircle;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  // First check if this is a normalized property with attributes
  const attrs = property.attributes || {};
  
  // Extract property fields with fallbacks between different naming conventions
  const title = attrs.title || property.Title || property.title || 'Unnamed Property';
  const location = attrs.location || property.Location || property.location || 'Location not specified';
  const price = attrs.price || property.Price || property.price || 0;
  // Use the new Strapi fields with fallbacks
  const bedrooms = attrs.bedrooms || property.Bedrooms || property.bedrooms || 0;
  const bathrooms = attrs.bathrooms || property.Bathrooms || property.bathrooms || 0;
  const area = attrs.area || property.Area || property.area || property.square_footage || 'N/A';
  const type = attrs.property_type || property.PropertyType || property.property_type || property.type || 'Property';
  // Prioritize the real slug and only fall back to ID format if nothing else is available
  const slug = attrs.slug || property.Slug || property.slug || `property-${property.id}`;
  
  // Extract amenities from component structure or direct array
  let amenities: any[] = [];
  
  // Handle amenities from attributes (normalized properties)
  if (attrs.Amenities && Array.isArray(attrs.Amenities)) {
    // For component-based amenities (new format)
    if (typeof attrs.Amenities[0] === 'object' && 'amenityName' in attrs.Amenities[0]) {
      amenities = attrs.Amenities.map((amenity: any) => amenity.amenityName || '')
        .filter(name => name !== '');
    } 
    // For direct string arrays (old format)
    else {
      amenities = attrs.Amenities as string[];
    }
  }
  // Fallback to lowercase attribute name
  else if (attrs.amenities && Array.isArray(attrs.amenities)) {
    amenities = attrs.amenities as string[];
  }
  // Handle amenities directly on property
  else if (property.Amenities && Array.isArray(property.Amenities)) {
    // For component-based amenities (new format)
    if (typeof property.Amenities[0] === 'object' && 'amenityName' in property.Amenities[0]) {
      amenities = property.Amenities.map((amenity: any) => amenity.amenityName || '')
        .filter(name => name !== '');
    } 
    // For direct string arrays (old format)
    else {
      amenities = property.Amenities as string[];
    }
  }
  // Fallback to lowercase property name
  else if (property.amenities && Array.isArray(property.amenities)) {
    amenities = property.amenities as string[];
  }
  
  // Priority list of amenities we want to show first (if available)
  const priorityAmenities = [
    "Swimming Pool", 
    "Private Pool", 
    "Ocean View", 
    "Beach Access", 
    "Mountain View",
    "Rice Field View",
    "WiFi",
    "Air Conditioning",
    "Security Service"
  ];
  
  // Get up to 3 important amenities to display on the card
  const displayAmenities = amenities.length > 0 
    ? amenities
        .slice()
        .sort((a, b) => {
          // Handle both string and object formats
          const nameA = typeof a === 'string' ? a : (a.amenityName || a.name || '');
          const nameB = typeof b === 'string' ? b : (b.amenityName || b.name || '');
          
          // Sort based on priority list
          const indexA = priorityAmenities.indexOf(nameA);
          const indexB = priorityAmenities.indexOf(nameB);
          
          // If both are in priority list, sort by their position in priority list
          if (indexA >= 0 && indexB >= 0) return indexA - indexB;
          // If only a is in priority list, it comes first
          if (indexA >= 0) return -1;
          // If only b is in priority list, it comes first
          if (indexB >= 0) return 1;
          // If neither is in priority list, maintain original order
          return 0;
        })
        .slice(0, 3)
    : [];
  
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
    // Check if this is already a local URL (starts with /property-images)
    if (attrs.featuredImage.url.startsWith('/property-images/')) {
      imageUrl = attrs.featuredImage.url;
      imageSourceType = 'from-local-attributes';
    } else {
      // If it's a remote URL, convert it to full URL
      imageUrl = attrs.featuredImage.url.startsWith('/') ? 
        `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${attrs.featuredImage.url}` : 
        attrs.featuredImage.url;
      imageSourceType = 'from-remote-attributes';
    }
  }
  // Check for MainImage first (new field)
  else if (property.MainImage) {
    // Use local image mapping for MainImage
    const propertySlug = slug;
    const mainImageUrl = property.MainImage.url;
    
    if (mainImageUrl) {
      const mainImageFilename = mainImageUrl.split('/').pop();
      if (mainImageFilename) {
        imageUrl = `/property-images/${propertySlug}/large-large_${mainImageFilename}`;
        imageSourceType = 'from-local-main-image';
      } else {
        // Fallback to Strapi URL if filename can't be extracted
        imageUrl = getStrapiMediaUrl(property.MainImage);
        imageSourceType = 'from-main-image';
      }
    } else {
      // Fallback to Strapi URL if no URL in MainImage
      imageUrl = getStrapiMediaUrl(property.MainImage);
      imageSourceType = 'from-main-image';
    }
  }
  // Then check other image formats
  else if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
    // Use local image mapping for Image array
    const propertySlug = slug;
    const firstImageUrl = property.Image[0].url;
    
    if (firstImageUrl) {
      const firstImageFilename = firstImageUrl.split('/').pop();
      if (firstImageFilename) {
        imageUrl = `/property-images/${propertySlug}/large-large_${firstImageFilename}`;
        imageSourceType = 'from-local-image-array';
      } else {
        // Fallback to Strapi URL if filename can't be extracted
        imageUrl = getStrapiMediaUrl(property.Image, 'medium');
        imageSourceType = 'from-array';
      }
    } else {
      // Fallback to Strapi URL if no URL in first image
      imageUrl = getStrapiMediaUrl(property.Image, 'medium');
      imageSourceType = 'from-array';
    }
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
          
          {/* Show important amenities if available */}
          {displayAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {displayAmenities.map((amenity: any, index: number) => {
                // Handle both string and object formats
                const amenityName = typeof amenity === 'string' 
                  ? amenity 
                  : (amenity.amenityName || amenity.name || 'Unnamed Amenity');
                
                const Icon = getAmenityIcon(amenityName);
                return (
                  <div 
                    key={`${amenityName}-${index}`} 
                    className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 flex items-center"
                  >
                    <Icon className="mr-1 text-primary" size={12} />
                    <span>{amenityName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}