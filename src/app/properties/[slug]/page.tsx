import React from 'react';
import Link from 'next/link';
import { getPropertyBySlug as getStaticPropertyBySlug, getAllProperties } from '@/utils/snapshot';
import { getPropertyBySlug as getStrapiPropertyBySlug, getStrapiMediaUrl } from '@/lib/strapi';
import { getRelatedProperties } from '@/lib/properties';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FaArrowLeft, FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaRegHeart, 
         FaSwimmingPool, FaParking, FaWifi, FaUtensils, FaSnowflake, FaCheckCircle,
         FaMap, FaMapMarkedAlt, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { formatPrice } from '@/lib/formatters';
import { FaCalendarAlt, FaHeart, FaEnvelope, FaPhone } from 'react-icons/fa';
import { AiOutlineShareAlt } from 'react-icons/ai';
import CopyLinkButton from '@/components/CopyLinkButton';
import SaveButton from '@/components/SaveButton';
import PrintButton from '@/components/PrintButton';
import PropertyGallerySection from '@/components/PropertyGallerySection';
import PropertyCard from '@/components/property-card';

// Import the map component dynamically
const DynamicMap = dynamic(() => import('@/components/dynamic-map'), { ssr: false });

// Remove dynamic mode
// export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

// Define property types
interface PropertySlug {
  slug: string;
}

// Add interface for the property data from Strapi
interface StrapiProperty {
  id: string | number;
  Title?: string;
  Description?: string;
  Location?: string;
  Price?: number;
  Bedrooms?: number;
  Bathrooms?: number;
  Area?: number;
  PropertyType?: string;
  Status?: string;
  Kitchens?: number;
  LivingRooms?: number;
  Image?: Array<{
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  }>;
  MainImage?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  VideoURL?: string;
  YearBuilt?: number;
  Availability?: string;
  LandSize?: number;
  Furnishing?: string;
  DesignStyle?: string;
  Connectivity?: string;
  EnergyFeatures?: string;
  SecurityFeatures?: string;
  OutdoorFeatures?: string;
  LocationHighlights?: string;
  propertyLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  Amenities?: Array<any>;
  amenities?: Array<string>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// Define the normalized property structure
interface NormalizedProperty {
  id: any;
  title: any;
  description: any;
  location: any;
  price: any;
  bedrooms: any;
  bathrooms: any;
  area: any;
  property_type: any;
  status: any;
  kitchen: any;
  living_room: any;
  featured_image: string;
  gallery_images: string[];
  latitude: number | null;
  longitude: number | null;
  // Add missing properties
  video_url?: any;
  year_built?: any;
  availability?: any;
  land_size?: any;
  furnishing?: any;
  view?: any;
  design_style?: any;
  connectivity?: any;
  energy_features?: any;
  security_features?: any;
  outdoor_features?: any;
  location_highlights?: any;
  neighborhood?: any;
  address?: any;
  amenities: any[];
  special_features?: any;
  slug?: string;
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
          // Import getProperties from correct location
          const { getProperties } = require('@/lib/strapi');
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
  
  console.log(`Rendering property page for slug: ${slug}`);
  
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
  
  // Get property data from Strapi API
  let property;
  try {
    property = await getStrapiPropertyBySlug(slug);
    console.log(`Property data fetched successfully: ${property ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error(`Error fetching property data for slug "${slug}":`, error);
    property = null;
  }
  
  // If property not found, show 404
  if (!property) {
    console.log(`Property not found for slug: ${slug}, showing 404`);
    notFound();
  }
  
  // Cast to StrapiProperty type to fix TypeScript errors
  const strapiProperty = property as StrapiProperty;
  
  // Prepare image URLs for the gallery
  let featuredImageUrl = '/placeholder-property.jpg';
  let galleryImages: string[] = [];
  
  try {
    if (strapiProperty.MainImage && strapiProperty.MainImage.url) {
      // Use MainImage as the featured image if available
      featuredImageUrl = getStrapiMediaUrl(strapiProperty.MainImage);
    } 
    else if (strapiProperty.Image && Array.isArray(strapiProperty.Image) && strapiProperty.Image.length > 0 && strapiProperty.Image[0].url) {
      // Use the first image from the Image array as featured
      featuredImageUrl = getStrapiMediaUrl(strapiProperty.Image[0]);
    }
    
    // Add all images from the Image array to the gallery
    if (strapiProperty.Image && Array.isArray(strapiProperty.Image)) {
      galleryImages = strapiProperty.Image
        .filter((img: any) => img && img.url)
        .map((img: any) => getStrapiMediaUrl(img));
    }
  } catch (error) {
    console.error('Error processing property images:', error);
    // Keep default values if there's an error
  }
  
  // Extract amenities from Strapi format
  let amenities: any[] = [];
  
  // Handle component-based amenities (new format)
  if (strapiProperty.Amenities && Array.isArray(strapiProperty.Amenities)) {
    amenities = strapiProperty.Amenities;
  } 
  // Handle old format (direct string array)
  else if (strapiProperty.amenities && Array.isArray(strapiProperty.amenities)) {
    amenities = strapiProperty.amenities;
  }
  
  // Normalize the raw property to have consistent structure for display
  const normalizedProperty: NormalizedProperty = {
    id: strapiProperty.id ? String(strapiProperty.id) : `property-${Date.now()}`,
    title: strapiProperty.Title || 'Property Details',
    description: strapiProperty.Description || '',
    location: strapiProperty.Location || '',
    price: strapiProperty.Price || 0,
    bedrooms: strapiProperty.Bedrooms || 0,
    bathrooms: strapiProperty.Bathrooms || 0,
    area: strapiProperty.Area || 0,
    property_type: strapiProperty.PropertyType || 'Villa',
    status: strapiProperty.Status || 'For Sale',
    kitchen: 1, // Default value since Kitchens field is removed
    living_room: 1, // Default value since LivingRooms field is removed
    featured_image: featuredImageUrl || '/placeholder-property.jpg',
    gallery_images: galleryImages || [],
    latitude: strapiProperty.propertyLocation?.latitude ? parseFloat(String(strapiProperty.propertyLocation.latitude)) : null,
    longitude: strapiProperty.propertyLocation?.longitude ? parseFloat(String(strapiProperty.propertyLocation.longitude)) : null,
    video_url: '', // Default value since VideoURL field is removed
    year_built: strapiProperty.YearBuilt || '',
    availability: strapiProperty.Availability || '',
    land_size: strapiProperty.LandSize || 0,
    furnishing: strapiProperty.Furnishing || '',
    view: '', // Default value since View field is removed
    design_style: '', // Default value since DesignStyle field is removed
    connectivity: '', // Default value since Connectivity field is removed
    energy_features: '', // Default value since EnergyFeatures field is removed
    security_features: '', // Default value since SecurityFeatures field is removed
    outdoor_features: '', // Default value since OutdoorFeatures field is removed
    location_highlights: '', // Default value since LocationHighlights field is removed
    neighborhood: '', // Default value since Neighborhood field is removed
    address: strapiProperty.propertyLocation?.address || '',
    amenities: amenities || [],
    special_features: '', // Default value since SpecialFeatures field is removed
    slug: strapiProperty.Slug || strapiProperty.slug || `property-${strapiProperty.id ? String(strapiProperty.id) : Date.now()}`
  };
  
  // Fetch similar properties
  let similarProperties = [];
  try {
    const related = await getRelatedProperties(normalizedProperty.id, 3);
    
    // Make sure we're getting properly formatted property objects
    similarProperties = related
      .filter((property: any) => property && (property.id || property.attributes))
      .map((property: any) => {
        // If it's already a normalized property, use it directly
        if (property.title && property.featured_image) {
          return property;
        }
        
        // Otherwise normalize it
        return normalizePropertyData(property);
      });
      
    console.log(`Found ${similarProperties.length} similar properties`);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    // Keep empty array if there's an error
  }

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
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(normalizedProperty.price)}
                  </div>
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

              {/* Share Property Options */}
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600 mb-2">Share this property:</p>
                  <div className="flex space-x-3">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this property: ${normalizedProperty.title}`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${normalizedProperty.title} ${typeof window !== 'undefined' ? window.location.href : ''}`)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M21.105 4.603C18.928 2.359 15.9 1.074 12.7 1.074c-6.75 0-12.25 5.5-12.25 12.25 0 2.177.567 4.293 1.633 6.156L1 24.074l4.763-1.237c1.788.974 3.81 1.487 5.867 1.487h.004c6.75 0 12.25-5.5 12.25-12.25 0-3.232-1.283-6.266-3.53-8.422zm-8.406 18.806h-.004c-1.828 0-3.623-.493-5.187-1.42l-.375-.22-3.83 1.008.958-3.55-.233-.384c-1.03-1.638-1.575-3.535-1.575-5.5 0-5.894 4.807-10.613 10.638-10.613 2.812 0 5.453 1.086 7.43 3.05 1.998 1.986 3.096 4.624 3.096 7.428 0 5.894-4.75 10.613-10.625 10.613l-.008-.004z" clipRule="evenodd"></path>
                        <path fillRule="evenodd" d="M12.6 5.074c-5.144 0-9.137 4.125-9.137 9.275 0 2.032.662 3.995 1.905 5.629l.294.456-.832 3.022 3.109-.807.44.26c1.544.906 3.29 1.382 5.066 1.382h.005c5.137 0 9.13-4.125 9.13-9.276s-4.3-9.275-9.138-9.275h-.005zm4.882 11.806c-.244.117-1.4.688-1.618.75-.216.075-.375.1-.531-.075-.156-.165-.619-.63-1.188-1.163-.438-.413-.731-.55-.894-.462-.162.087-.162.637-.162.637s-.244 1.01-.35 1.135c-.106.124-.22.143-.406.05-.188-.1-.788-.281-1.5-.9-.557-.482-.931-1.081-1.038-1.259-.106-.182-.012-.275.081-.363.081-.081.187-.212.281-.318.094-.106.125-.181.187-.3.063-.124.032-.23-.015-.322-.05-.093-.532-1.232-.713-1.69-.182-.45-.369-.382-.5-.381-.131.006-.282.006-.425.006-.15 0-.394.06-.6.293-.207.232-.787.756-.787 1.845 0 1.088.813 2.138.925 2.288.112.15 1.582 2.362 3.832 3.312.532.224.95.359 1.275.457.536.169 1.025.144 1.413.088.431-.065 1.326-.53 1.52-1.041.187-.512.187-.951.131-1.043-.056-.093-.206-.144-.438-.238l.003-.003z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a 
                      href={`mailto:?subject=${encodeURIComponent(`Property Listing: ${normalizedProperty.title}`)}&body=${encodeURIComponent(`Check out this property: ${normalizedProperty.title} ${typeof window !== 'undefined' ? window.location.href : ''}`)}`} 
                      className="p-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </a>
                    <CopyLinkButton />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <PrintButton />
                  <SaveButton />
                </div>
              </div>
            </div>
            
            {/* Property Images */}
            <PropertyGallerySection 
              featuredImage={normalizedProperty.featured_image}
              galleryImages={normalizedProperty.gallery_images}
              propertyTitle={normalizedProperty.title}
            />
            
            {/* Property Description */}
            <div className="p-8 border-b">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Description
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {normalizedProperty.description ? (
                  <>
                    {normalizedProperty.description.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <p className="text-gray-500">No detailed description provided for this property.</p>
                    <p className="text-sm text-gray-400 mt-2">Contact us for more information.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Property Details - Expanded */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-6">
                    <h3 className="font-semibold mb-4 text-primary flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Property ID:</span> 
                        <span className="text-gray-800">{normalizedProperty.id}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Property Type:</span> 
                        <span className="text-gray-800">{normalizedProperty.property_type}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Status:</span> 
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">{normalizedProperty.status}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Year Built:</span> 
                        <span className="text-gray-800">{normalizedProperty.year_built || 'Not specified'}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Availability:</span> 
                        <span className="text-gray-800">{normalizedProperty.availability}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Furnishing:</span> 
                        <span className="text-gray-800">{normalizedProperty.furnishing || 'Not specified'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-6">
                    <h3 className="font-semibold mb-4 text-primary flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      Size & Layout
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Building Area:</span> 
                        <span className="text-gray-800">{normalizedProperty.area} m²</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Land Size:</span> 
                        <span className="text-gray-800">{normalizedProperty.land_size} m²</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Bedrooms:</span> 
                        <span className="text-gray-800 flex items-center">
                          <FaBed className="text-primary mr-1" />
                          {normalizedProperty.bedrooms}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Bathrooms:</span> 
                        <span className="text-gray-800 flex items-center">
                          <FaBath className="text-primary mr-1" />
                          {normalizedProperty.bathrooms}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Kitchen:</span> 
                        <span className="text-gray-800">{normalizedProperty.kitchen || 1}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium w-32 text-gray-600">Living Room:</span> 
                        <span className="text-gray-800">{normalizedProperty.living_room || 1}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {normalizedProperty.special_features && (
                    <div className="bg-primary/5 p-5 rounded-lg border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-4 text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Special Features
                      </h3>
                      <p className="text-gray-700">{normalizedProperty.special_features}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Nearby Attractions - REMOVED */}
            
            {/* Property Highlights - REMOVED */}
            
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
                    {normalizedProperty.location || 'Location details not available'}
                  </span>
                </p>
                
                {normalizedProperty.latitude && normalizedProperty.longitude ? (
                  <div className="flex items-center mt-2 text-green-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.414-1.414l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
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
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>
                    Note: Maps are provided by Leaflet with OpenStreetMap tiles. For static builds, the map will only appear after JavaScript loads.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Amenities & Features */}
            {normalizedProperty.amenities && normalizedProperty.amenities.length > 0 && (
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Amenities & Features
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {normalizedProperty.amenities.map((amenity: any, index: number) => {
                    // Handle all possible formats for amenity name
                    const amenityName = typeof amenity === 'object' 
                      ? (amenity.amenityName || amenity.name || amenity.Name || '') 
                      : amenity;
                    
                    if (!amenityName) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                      >
                        <div className="mr-3 text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-800">{amenityName}</span>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={`/contact?property=${normalizedProperty.slug}&propertyName=${encodeURIComponent(normalizedProperty.title)}`}
                className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Request a Viewing
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center bg-white border-2 border-primary hover:bg-primary/5 text-primary px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Contact Agent
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Similar Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Similar Properties You May Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties && similarProperties.length > 0 ? (
              similarProperties.map((property: any) => (
                <PropertyCard 
                  key={property.id || `similar-${Math.random().toString(36).substring(7)}`} 
                  property={property} 
                />
              ))
            ) : (
              <div className="md:col-span-3 p-8 bg-white rounded-lg shadow text-center">
                <p className="text-gray-500">No similar properties found at this time.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/properties" 
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              View All Properties
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
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
    
    // Extract featured image URL - prioritize MainImage if available
    let featuredImageUrl = '/placeholder-property.jpg';
    let galleryImages: string[] = [];
    
    // Use MainImage as featured image if available
    if (attributes.MainImage && attributes.MainImage.url) {
      const mainImageUrl = attributes.MainImage.url;
      const mainImageFilename = mainImageUrl.split('/').pop();
      
      if (mainImageFilename) {
        featuredImageUrl = `${localImageBasePath}/large-large_${mainImageFilename}`;
      }
    } 
    // Fall back to first image from Image array
    else if (attributes.Image && Array.isArray(attributes.Image) && attributes.Image.length > 0) {
      const firstImage = attributes.Image[0];
      if (firstImage && firstImage.url) {
        const firstImageUrl = firstImage.url;
        const firstImageFilename = firstImageUrl.split('/').pop();
        
        if (firstImageFilename) {
          featuredImageUrl = `${localImageBasePath}/large-large_${firstImageFilename}`;
        }
      }
    }
    
    // Extract gallery images from Image array
    if (attributes.Image && Array.isArray(attributes.Image)) {
      galleryImages = attributes.Image
        .filter(img => img && img.url)
        .map(img => {
          const imgUrl = img.url;
          const imgFilename = imgUrl.split('/').pop();
          return `${localImageBasePath}/large-large_${imgFilename}`;
        });
    }
    
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
  // Extract featured image - prioritize MainImage if available
  let featuredImageUrl = '/placeholder-property.jpg';
  let galleryImages: string[] = [];
  
  // Use MainImage as featured image if available
  if (property.MainImage && property.MainImage.url) {
    const mainImageUrl = property.MainImage.url;
    const mainImageFilename = mainImageUrl.split('/').pop();
    
    if (mainImageFilename) {
      featuredImageUrl = `${localImageBasePath}/large-large_${mainImageFilename}`;
    }
  } 
  // Fall back to first image from Image array
  else if (property.Image && Array.isArray(property.Image) && property.Image.length > 0) {
    const firstImage = property.Image[0];
    if (firstImage && firstImage.url) {
      const firstImageUrl = firstImage.url;
      const firstImageFilename = firstImageUrl.split('/').pop();
      
      if (firstImageFilename) {
        featuredImageUrl = `${localImageBasePath}/large-large_${firstImageFilename}`;
      }
    }
  }
  
  // Extract gallery images from Image array
  if (property.Image && Array.isArray(property.Image)) {
    galleryImages = property.Image
      .filter(img => img && img.url)
      .map(img => {
        const imgUrl = img.url;
        const imgFilename = imgUrl.split('/').pop();
        return `${localImageBasePath}/large-large_${imgFilename}`;
      });
  }
  
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