import React from 'react';
import Link from 'next/link';
import { getPropertyBySlug as getStaticPropertyBySlug, getAllProperties } from '@/utils/snapshot';
import { getPropertyBySlug as getStrapiPropertyBySlug, getStrapiMediaUrl, getProperties } from '@/lib/strapi';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FaArrowLeft, FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaRegHeart, 
         FaSwimmingPool, FaParking, FaWifi, FaUtensils, FaSnowflake, FaCheckCircle,
         FaMap, FaMapMarkedAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { formatPrice } from '@/lib/formatters';

// Import the map component dynamically
const DynamicMap = dynamic(() => import('@/components/dynamic-map'), { ssr: false });

// Remove dynamic mode
// export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

// Define property types
interface PropertySlug {
  slug: string;
}

// Generate static paths for prerendering
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    console.log('Generating static params for property slugs...');
    
    let allSlugs: { slug: string }[] = [];
    let logMessage = '';
    
    // First try to get properties from static sources
    try {
      const staticProperties = getAllProperties();
      
      // Get slug from static properties
      const staticSlugs = staticProperties
        .filter(prop => prop && prop.attributes && prop.attributes.slug)
        .map(prop => ({ slug: prop.attributes.slug }));
      
      allSlugs = [...staticSlugs];
      logMessage += `Found ${staticSlugs.length} slugs from static properties. `;
    } catch (error) {
      console.error('Error getting static properties:', error);
      logMessage += 'Failed to get static properties. ';
    }
    
    // Also try to get Strapi properties at build time
    try {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'data', 'processed-properties.json');
      
      if (fs.existsSync(dataPath)) {
        try {
          // Use the pre-exported data
          const fileContent = fs.readFileSync(dataPath, 'utf8');
          
          if (fileContent.trim() === '') {
            console.warn('Processed properties file exists but is empty');
            logMessage += 'Processed properties file is empty. ';
          } else {
            const processedData = JSON.parse(fileContent);
            
            if (!Array.isArray(processedData)) {
              console.warn('Processed properties data is not an array:', typeof processedData);
              logMessage += 'Processed properties is not an array. ';
            } else {
              // Map to slugs
              const strapiSlugs = processedData
                .filter((prop: any) => prop && (prop.Slug || prop.slug))
                .map((prop: any) => ({ slug: prop.Slug || prop.slug }));
              
              allSlugs = [...allSlugs, ...strapiSlugs];
              logMessage += `Found ${strapiSlugs.length} slugs from Strapi. `;
            }
          }
        } catch (parseError) {
          console.error('Error parsing processed-properties.json:', parseError);
          logMessage += 'Error parsing processed properties. ';
        }
      } else {
        logMessage += 'No processed-properties.json file found. ';
        
        // Try falling back to the API directly
        try {
          const result = await getProperties();
          if (result && 'data' in result && Array.isArray(result.data)) {
            const strapiSlugs = result.data
              .filter((prop: any) => {
                return (prop && (prop.Slug || prop.slug)) || 
                       (prop.attributes && (prop.attributes.Slug || prop.attributes.slug));
              })
              .map((prop: any) => {
                if (prop.Slug || prop.slug) {
                  return { slug: prop.Slug || prop.slug };
                }
                return { slug: prop.attributes.Slug || prop.attributes.slug };
              });
            
            allSlugs = [...allSlugs, ...strapiSlugs];
            logMessage += `Found ${strapiSlugs.length} slugs from Strapi API. `;
          } else {
            logMessage += 'No data returned from Strapi API. ';
          }
        } catch (apiError) {
          console.error('Error fetching from Strapi API:', apiError);
          logMessage += 'Failed to fetch from Strapi API. ';
        }
      }
    } catch (error) {
      console.error('Error processing Strapi properties for static paths:', error);
      logMessage += 'Error in Strapi processing. ';
    }
    
    // Remove duplicates
    const uniqueSlugs = new Set<string>();
    const uniqueProperties = allSlugs.filter(prop => {
      if (!prop.slug || uniqueSlugs.has(prop.slug)) return false;
      uniqueSlugs.add(prop.slug);
      return true;
    });
    
    console.log(`Generated ${uniqueProperties.length} static paths for properties: ${logMessage}`);
    
    // For static export: If no properties were found, return a placeholder to prevent build errors
    if (uniqueProperties.length === 0 && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
      console.log('No properties found but NEXT_PUBLIC_STATIC_EXPORT is true - adding placeholder path');
      return [{ slug: 'placeholder-property' }];
    }
    
    // Make sure we always return an array, even if empty
    return uniqueProperties;
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    
    // For static export: Return a placeholder to prevent build errors
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
      console.log('Error occurred but NEXT_PUBLIC_STATIC_EXPORT is true - adding placeholder path');
      return [{ slug: 'placeholder-property' }];
    }
    
    // Return empty array to avoid build failures in development mode
    return [];
  }
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

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Handle placeholder case for static export
  if (slug === 'placeholder-property' && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // Return a placeholder property page for static export
    return (
      <main className="flex min-h-screen flex-col">
        <Header />
        
        <section className="pt-32 pb-12 flex-grow">
          <div className="container">
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
              <h1 className="text-3xl font-bold mb-4">No Properties Available</h1>
              <p className="text-gray-600 mb-6">
                There are currently no properties listed in the system. Please check back later or contact us for more information.
              </p>
              <Link 
                href="/contact" 
                className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    );
  }
  
  // First, try to fetch from Strapi at build time
  const strapiProperty = await getStrapiPropertyBySlug(slug);
  
  // If not found in Strapi, try static data
  const staticProperty = strapiProperty ? null : getStaticPropertyBySlug(slug);
  
  // Use the property from either source
  const property = strapiProperty || staticProperty;
  
  if (!property) {
    notFound();
  }
  
  // Normalize property data to handle both formats
  const normalizedProperty = normalizePropertyData(property);
  
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Breadcrumbs */}
      <section className="pt-32 pb-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/properties" className="hover:text-primary transition-colors">
              Properties
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium truncate max-w-[200px]">
              {normalizedProperty.title}
            </span>
          </div>
        </div>
      </section>
      
      {/* Back Button */}
      <div className="container py-4">
        <Link 
          href="/properties" 
          className="inline-flex items-center text-primary hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Back to Properties
        </Link>
      </div>
      
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Property Header */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{normalizedProperty.title}</h1>
                  <div className="flex items-center text-gray-600 text-lg">
                    <FaMapMarkerAlt className="text-primary mr-2" />
                    <p>{normalizedProperty.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-primary mr-4">
                    {formatPrice(normalizedProperty.price)}
                  </div>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FaRegHeart className="text-gray-500 text-xl" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaBed className="mr-2" /> {normalizedProperty.bedrooms} Bedrooms
                </div>
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaBath className="mr-2" /> {normalizedProperty.bathrooms} Bathrooms
                </div>
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaRuler className="mr-2" /> {normalizedProperty.area} m²
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-md">
                  {normalizedProperty.property_type}
                </div>
              </div>
            </div>
            
            {/* Property Images */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">Property Images</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Featured Image */}
                {normalizedProperty.featured_image && (
                  <div className="md:col-span-2">
                    <img 
                      src={normalizedProperty.featured_image} 
                      alt={normalizedProperty.title} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                
                {/* Gallery Images */}
                {normalizedProperty.gallery_images && 
                 normalizedProperty.gallery_images.map((image: string, index: number) => (
                  <div key={index}>
                    <img 
                      src={image} 
                      alt={`${normalizedProperty.title} - Image ${index + 1}`} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                ))}
                
                {/* Show placeholder if no images */}
                {(!normalizedProperty.featured_image && 
                  (!normalizedProperty.gallery_images || normalizedProperty.gallery_images.length === 0)) && (
                  <div className="md:col-span-2 bg-gray-100 h-64 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No images available</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Property Description */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <div className="prose max-w-none">
                <p>{normalizedProperty.description || 'No description available.'}</p>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-primary">Basic Information</h3>
                  <ul className="space-y-3">
                    <li className="flex">
                      <span className="font-medium w-32">Property ID:</span> 
                      <span className="text-gray-600">{normalizedProperty.id}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Property Type:</span> 
                      <span className="text-gray-600">{normalizedProperty.property_type}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Status:</span> 
                      <span className="text-gray-600">{normalizedProperty.status}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Area:</span> 
                      <span className="text-gray-600">{normalizedProperty.area} m²</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-primary">Rooms</h3>
                  <ul className="space-y-3">
                    <li className="flex">
                      <span className="font-medium w-32">Bedrooms:</span> 
                      <span className="text-gray-600">{normalizedProperty.bedrooms}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Bathrooms:</span> 
                      <span className="text-gray-600">{normalizedProperty.bathrooms}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Kitchen:</span> 
                      <span className="text-gray-600">{normalizedProperty.kitchen || 1}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Living Room:</span> 
                      <span className="text-gray-600">{normalizedProperty.living_room || 1}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Property Location Map */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaMapMarkedAlt className="mr-2 text-primary" /> Property Location
              </h2>
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <DynamicMap 
                  propertyData={{
                    title: normalizedProperty.title,
                    latitude: normalizedProperty.latitude,
                    longitude: normalizedProperty.longitude,
                    location: normalizedProperty.location,
                    address: normalizedProperty.address
                  }}
                  height="400px"
                  estimateRadius={300}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  <span className="font-medium">
                    {normalizedProperty.address || normalizedProperty.location || 'Location details not available'}
                  </span>
                </p>
                
                {normalizedProperty.latitude && normalizedProperty.longitude ? (
                  <div className="flex items-center mt-2 text-green-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <span>Exact coordinates available</span>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-amber-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                      <span>Approximate location shown</span>
                    </p>
                    <p className="text-sm text-gray-500 ml-5">
                      The blue circle shows the approximate area where this property is located. 
                      For exact location details, please contact our agents.
                    </p>
                  </div>
                )}
                
                {normalizedProperty.address && (
                  <div className="mt-3">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedProperty.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                        <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z" clipRule="evenodd" />
                      </svg>
                      View on Google Maps
                    </a>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>
                    Note: Maps are provided by Leaflet with OpenStreetMap tiles. For static builds, the map will only appear after JavaScript loads.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            {normalizedProperty.amenities && normalizedProperty.amenities.length > 0 && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Amenities & Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {normalizedProperty.amenities.map((amenity: any, index: number) => {
                    // Handle both string format and object format with amenityName
                    const amenityName = typeof amenity === 'string' 
                      ? amenity 
                      : (amenity.amenityName || amenity.name || 'Unnamed Amenity');
                    
                    // Priority amenities that should be highlighted
                    const priorityAmenities = [
                      "Swimming Pool", 
                      "Private Pool", 
                      "Ocean View", 
                      "Beach Access", 
                      "Rice Field View",
                      "Security Service"
                    ];
                    
                    const isHighlighted = priorityAmenities.includes(amenityName);
                    const IconComponent = getAmenityIcon(amenityName);
                    
                    return (
                      <div 
                        key={`${amenityName}-${index}`} 
                        className={`flex items-center p-3 rounded-lg ${
                          isHighlighted 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <IconComponent className={`mr-3 ${isHighlighted ? 'text-primary' : 'text-gray-500'}`} />
                        <span>{amenityName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Contact Agent Section */}
          <div className="mt-8 bg-primary/10 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Interested in this property?</h2>
            <p className="mb-4">Contact our agents for more information or to schedule a viewing.</p>
            <Link 
              href="/contact" 
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

// Helper function to normalize property data from different sources
function normalizePropertyData(property: any) {
  // Map for storing image mappings for this property
  const propertySlug = property.attributes?.slug || property.Slug || property.slug || `property-${property.id}`;
  const localImageBasePath = `/property-images/${propertySlug}`;
  
  // If it's a static property (with attributes), normalize it
  if (property.attributes) {
    const { attributes } = property;
    
    // Extract featured image URL - use local path
    const featuredImageUrl = `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg`;
    
    // Extract gallery images - use local paths 
    const galleryImages = [
      `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg`,
      `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg`,
      `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg`,
      `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg`
    ];
    
    // Extract amenities if they exist - handle component structure
    let amenities = [];
    
    // Handle component-based amenities (new format)
    if (attributes.Amenities && Array.isArray(attributes.Amenities)) {
      
      // Keep the original array to preserve the object structure
      amenities = attributes.Amenities;

    } 
    // Handle old format (direct string array)
    else if (attributes.amenities && Array.isArray(attributes.amenities)) {
      amenities = attributes.amenities;
    }
    
    // Extract location details
    let address = '';
    let latitude = null;
    let longitude = null;
    
    if (attributes.propertyLocation) {
      const location = attributes.propertyLocation;
      
      // Use the single address field
      address = location.address || '';
      
      // Extract coordinates
      if (location.latitude && location.longitude) {
        latitude = parseFloat(location.latitude);
        longitude = parseFloat(location.longitude);
      }
    }

    return {
      id: property.id,
      title: attributes.title || 'Unnamed Property',
      description: attributes.description || '',
      location: attributes.location || 'Location not specified',
      price: attributes.price || 0,
      bedrooms: attributes.bedrooms || 0,
      bathrooms: attributes.bathrooms || 0,
      area: attributes.Area || attributes.square_footage || attributes.area || 'N/A',
      property_type: attributes.PropertyType || attributes.property_type || 'Property',
      status: attributes.status || 'unlisted',
      kitchen: attributes.kitchen || 1,
      living_room: attributes.living_room || 1,
      featured_image: featuredImageUrl,
      gallery_images: galleryImages,
      amenities: amenities,
      slug: attributes.slug,
      // Add location details
      address: address,
      latitude: latitude,
      longitude: longitude
    };
  }
  
  // If it's a Strapi property (direct properties), normalize it
  // Extract featured image - use local path
  const featuredImageUrl = `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg`;
  
  // Extract gallery images - use local paths
  const galleryImages = [
    `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg`,
    `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg`,
    `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg`,
    `${localImageBasePath}/large-large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg`
  ];
  
  // Extract amenities from Strapi format - handle component structure
  let amenities = [];
  
  // Handle component-based amenities (new format)
  if (property.Amenities && Array.isArray(property.Amenities)) {
    
    // Keep the original array to preserve the object structure
    amenities = property.Amenities;

  } 
  // Handle old format (direct string array)
  else if (property.amenities && Array.isArray(property.amenities)) {
    amenities = property.amenities;
  }
  
  // Extract location details
  let address = '';
  let latitude = null;
  let longitude = null;
  
  if (property.propertyLocation) {
    const location = property.propertyLocation;
    
    // Use the single address field
    address = location.address || '';
    
    // Extract coordinates
    if (location.latitude && location.longitude) {
      latitude = parseFloat(location.latitude);
      longitude = parseFloat(location.longitude);
    }
  }

  return {
    id: property.id,
    title: property.Title || 'Unnamed Property',
    description: property.Description || '',
    location: property.Location || 'Location not specified',
    price: property.Price || 0,
    bedrooms: property.Bedrooms || 0,
    bathrooms: property.Bathrooms || 0,
    area: property.Area || property.square_footage || 'N/A',
    property_type: property.PropertyType || 'Property',
    status: property.Status || 'unlisted',
    kitchen: property.Kitchen || 1,
    living_room: property.LivingRoom || 1,
    featured_image: featuredImageUrl,
    gallery_images: galleryImages,
    amenities: amenities,
    slug: property.Slug || property.slug,
    // Add location details
    address: address,
    latitude: latitude,
    longitude: longitude
  };
} 