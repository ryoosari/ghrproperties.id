import React from 'react';
import Link from 'next/link';
import { FaHome, FaFilter, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getAllProperties } from '@/utils/snapshot';
import { getProperties } from '@/lib/strapi';
import PropertyCard from '@/components/property-card';
import path from 'path';
import fs from 'fs';

// Define types for our property structures
interface StrapiImage {
  id: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: any;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  url: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface StrapiProperty {
  id: number;
  documentId?: string;
  Title: string;
  Description?: string;
  Price?: number;
  Slug?: string;
  Location?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  Image?: StrapiImage[];
}

interface PropertyAttributes {
  title: string;
  slug: string;
  status: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  featuredImage?: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
  images?: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  }[];
}

interface NormalizedProperty {
  id: number | string;
  attributes: PropertyAttributes;
}

// Remove dynamic mode, but keep revalidation
// export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export default async function PropertiesPage() {
  // Get properties from both sources
  let snapshotProperties: any[] = [];
  try {
    snapshotProperties = getAllProperties({
      status: 'published',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  } catch (error) {
    console.error('Error loading snapshot properties:', error);
  }
  
  // Fetch Strapi properties at build time
  let strapiProperties: StrapiProperty[] = [];
  
  // Check if we're running in a static export or production build
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // Try to load from pre-exported data
    try {
      const dataPath = path.join(process.cwd(), 'data', 'processed-properties.json');
      if (fs.existsSync(dataPath)) {
        const processedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        strapiProperties = processedData || [];
        console.log(`Loaded ${strapiProperties.length} properties from exported data`);
      }
    } catch (error) {
      console.error('Error loading pre-exported Strapi properties:', error);
    }
  } else {
    // Fetch from Strapi API directly for dynamic builds
    try {
      const result = await getProperties();
      // Check if result has data property and it's an array
      if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
        strapiProperties = result.data;
        console.log('Loaded Strapi properties successfully:', strapiProperties.length);
        
        // Log the first Strapi property for debugging
        if (strapiProperties.length > 0) {
          console.log('First Strapi property:', {
            id: strapiProperties[0].id,
            Title: strapiProperties[0].Title,
            hasImage: Array.isArray(strapiProperties[0].Image) && strapiProperties[0].Image.length > 0
          });
        }
      } else {
        console.error('Invalid response format from getProperties():', result);
      }
    } catch (error) {
      console.error('Error fetching Strapi properties:', error);
    }
  }
  
  // Normalize all properties to have consistent structure
  const normalizedProperties: NormalizedProperty[] = [
    ...strapiProperties.map((prop: StrapiProperty) => {
      // The Strapi properties have the fields directly on the object, not nested in attributes
      const normalized = {
        id: prop.id,
        attributes: {
          title: prop.Title || 'Untitled Property',
          slug: prop.Slug || `property-${prop.id}`,
          status: 'published', // Default to published
          price: prop.Price || 0,
          location: prop.Location || '',
          description: prop.Description || '',
          createdAt: prop.createdAt || new Date().toISOString(),
          updatedAt: prop.updatedAt || new Date().toISOString(),
          // Handle images
          featuredImage: prop.Image && prop.Image.length > 0 ? {
            url: prop.Image[0].url || '',
            alternativeText: prop.Image[0].alternativeText || prop.Title || '',
            width: prop.Image[0].width || 800,
            height: prop.Image[0].height || 600
          } : null,
          images: prop.Image && Array.isArray(prop.Image) ? 
            prop.Image.map((img: StrapiImage) => ({
              url: img.url || '',
              alternativeText: img.alternativeText || prop.Title || '',
              width: img.width || 800,
              height: img.height || 600
            })) : []
        }
      };
      
      // Log the first normalized property for debugging
      if (prop.id === strapiProperties[0]?.id) {
        console.log('Normalized first Strapi property:', {
          id: normalized.id,
          title: normalized.attributes.title,
          price: normalized.attributes.price,
          slug: normalized.attributes.slug,
          hasFeaturedImage: Boolean(normalized.attributes.featuredImage)
        });
      }
      
      return normalized;
    }),
    ...snapshotProperties.map((prop: any) => {
      // For snapshot properties, ensure they have the right attributes
      if (prop.attributes) {
        return {
          ...prop,
          attributes: {
            ...prop.attributes,
            status: prop.attributes.status || 'published',
            title: prop.attributes.title || 'Untitled Property',
            slug: prop.attributes.slug || `property-${prop.id}`,
            price: prop.attributes.price || 0
          }
        };
      }
      return prop;
    })
  ];
  
  // Log normalized properties
  console.log('Normalized properties count:', normalizedProperties.length);
  
  // Remove duplicates by slug
  const uniqueSlugs = new Set();
  const combinedProperties = normalizedProperties.filter(prop => {
    const slug = prop.attributes?.slug;
    if (!slug || uniqueSlugs.has(slug)) return false;
    uniqueSlugs.add(slug);
    return true;
  });
  
  // Log the final combined properties
  console.log('Final combined properties count:', combinedProperties.length);
  if (combinedProperties.length > 0) {
    console.log('First combined property:', {
      id: combinedProperties[0].id,
      title: combinedProperties[0].attributes?.title,
      hasAttributes: Boolean(combinedProperties[0].attributes)
    });
  }
  
  // Extract unique locations from properties
  const uniqueLocations = new Set<string>();
  combinedProperties.forEach(property => {
    const location = property.attributes?.location;
    if (location && location.trim() !== '') {
      uniqueLocations.add(location.trim());
    }
  });
  
  // Convert to sorted array
  const availableLocations = Array.from(uniqueLocations).sort();

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Our <span className="text-primary">Properties</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse our extensive collection of premium properties available for sale and rent.
              Find your perfect home or investment opportunity today.
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">Properties</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          {/* Quick Filter Bar - Always Visible */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <FaFilter className="text-primary mr-2" />
                <span className="text-gray-700 font-medium">Quick Filters</span>
              </div>
              
              {/* Basic Filters Row */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Property Type Quick Filter */}
                <div>
                  <select className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">All Property Types</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                
                {/* Location Quick Filter */}
                <div>
                  <select className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">All Locations</option>
                    {availableLocations.length > 0 ? (
                      availableLocations.map((location) => (
                        <option key={location} value={location.toLowerCase()}>
                          {location}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No locations available</option>
                    )}
                  </select>
                </div>
                
                {/* Price Quick Filter */}
                <div>
                  <select className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Any Price</option>
                    <option value="0-500000000">Under 500M IDR</option>
                    <option value="500000000-1000000000">500M - 1B IDR</option>
                    <option value="1000000000-2000000000">1B - 2B IDR</option>
                    <option value="2000000000">Over 2B IDR</option>
                  </select>
                </div>
                
                {/* Sort by Dropdown */}
                <div>
                  <select className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Popular</option>
                  </select>
                </div>
                
                {/* Advanced Filters Toggle Button */}
                <button 
                  className="inline-flex items-center px-4 py-2 border border-primary bg-white text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                  id="advanced-filters-toggle"
                >
                  <span className="text-sm font-medium mr-1">Advanced Filters</span>
                  <FaChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters - Hidden by Default */}
          <div id="advanced-filters" className="bg-white p-6 rounded-lg shadow-sm mb-8 hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type Filter */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Property Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="type-all" className="mr-2 h-4 w-4 accent-primary" defaultChecked />
                    <label htmlFor="type-all" className="text-sm">All Types</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="type-villa" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="type-villa" className="text-sm">Villa</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="type-apartment" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="type-apartment" className="text-sm">Apartment</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="type-house" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="type-house" className="text-sm">House</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="type-commercial" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="type-commercial" className="text-sm">Commercial</label>
                  </div>
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="min-price" className="text-sm text-gray-600 block mb-1">Min Price (IDR)</label>
                    <input 
                      type="number" 
                      id="min-price" 
                      placeholder="Min Price" 
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="text-sm text-gray-600 block mb-1">Max Price (IDR)</label>
                    <input 
                      type="number" 
                      id="max-price" 
                      placeholder="Max Price" 
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Bedrooms & Bathrooms */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Bedrooms & Bathrooms</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bedrooms" className="text-sm text-gray-600 block mb-1">Bedrooms</label>
                    <select id="bedrooms" className="w-full border rounded p-2 text-sm">
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bathrooms" className="text-sm text-gray-600 block mb-1">Bathrooms</label>
                    <select id="bathrooms" className="w-full border rounded p-2 text-sm">
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Location</h3>
                <select id="advanced-location" className="w-full border rounded p-2 text-sm">
                  <option value="">All Locations</option>
                  {availableLocations.length > 0 ? (
                    availableLocations.map((location) => (
                      <option key={location} value={location.toLowerCase()}>
                        {location}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No locations available</option>
                  )}
                </select>
              </div>
              
              {/* Amenities */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="amenity-pool" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="amenity-pool" className="text-sm">Swimming Pool</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="amenity-parking" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="amenity-parking" className="text-sm">Parking</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="amenity-garden" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="amenity-garden" className="text-sm">Garden</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="amenity-security" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="amenity-security" className="text-sm">24/7 Security</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="amenity-gym" className="mr-2 h-4 w-4 accent-primary" />
                    <label htmlFor="amenity-gym" className="text-sm">Gym</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2 hover:bg-gray-300 transition-colors">
                Clear Filters
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Property Listings */}
          {combinedProperties.length === 0 ? (
            <div className="text-center py-16">
              <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Properties Found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any properties matching your criteria.</p>
              <Link 
                href="/properties" 
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {combinedProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                />
              ))}
            </div>
          )}
          
          {/* Pagination (static for now) */}
          {combinedProperties.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-md text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 border-t border-b border-gray-300 bg-primary text-white text-sm font-medium">
                  1
                </button>
                <button className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-md text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-3xl mx-auto">
            Our property portfolio is constantly updated. Contact us to discuss your requirements
            and we'll help you find your perfect property.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 