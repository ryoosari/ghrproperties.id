import React from 'react';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getAllProperties } from '@/utils/snapshot';
import { getProperties } from '@/lib/strapi';
import PropertyCard from '@/components/property-card';
import QuickFilters from '@/components/quick-filters';
import AdvancedFilters from '@/components/advanced-filters';
import path from 'path';
import fs from 'fs';
import type { Metadata } from 'next';
import { normalizeProperty } from '@/lib/property-normalizer';

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
  MainImage?: StrapiImage;
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
  bedrooms?: number;
  bathrooms?: number;
  area?: string | number;
  property_type?: string;
  amenities?: any[];
  Amenities?: any[];
  [key: string]: any; // Allow for other dynamic properties
}

interface NormalizedProperty {
  id: number | string;
  attributes: PropertyAttributes;
}

// Remove dynamic mode, but keep revalidation
// export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

// Set metadata for the page
export const metadata: Metadata = {
  title: 'Properties | GHR Properties',
  description: 'Browse our curated selection of premium properties available for sale and rent across Bali, Indonesia.',
};

export default async function PropertiesPage() {
  // Get all properties from snapshot and Strapi
  
  // First try snapshot properties (static)
  let snapshotProperties: any[] = [];
  try {
    snapshotProperties = getAllProperties({
      status: 'published'
    });
    console.log(`Loaded ${snapshotProperties.length} snapshot properties`);
  } catch (error) {
    console.error('Error loading snapshot properties:', error);
  }
  
  // Then try to get Strapi properties
  let strapiProperties: StrapiProperty[] = [];
  
  // Check if we're in a static export build
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // Try to load from pre-exported data for static export
    try {
      const dataPath = path.join(process.cwd(), 'data', 'processed-properties.json');
      if (fs.existsSync(dataPath)) {
        const processedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        if (Array.isArray(processedData)) {
          strapiProperties = processedData;
          console.log(`Loaded ${strapiProperties.length} Strapi properties from pre-exported data`);
        } else {
          console.error('Processed properties is not an array, type:', typeof processedData);
        }
      } else {
        console.log('No processed-properties.json file found');
      }
    } catch (error) {
      console.error('Error loading pre-exported Strapi properties:', error);
    }
  } else {
    // Fetch from API directly for dynamic build
    try {
      const result = await getProperties();
      
      // Check if result has the expected format
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
  
  // Normalize all properties to have consistent structure using the utility
  const normalizedProperties: NormalizedProperty[] = [
    ...strapiProperties.map(normalizeProperty).filter(Boolean) as NormalizedProperty[],
    ...snapshotProperties.map(prop => {
      // For snapshot properties, use the original structure if it already has attributes
      if (prop.attributes) {
        return {
          ...prop,
          attributes: {
            ...prop.attributes,
            status: prop.attributes.status || 'published',
            title: prop.attributes.title || 'Untitled Property',
            // Use the slug with fallback to property-id format
            slug: prop.attributes.slug || `property-${prop.id}`,
            price: prop.attributes.price || 0
          }
        };
      }
      // Otherwise normalize it with the utility
      return normalizeProperty(prop);
    }).filter(Boolean) as NormalizedProperty[]
  ];
  
  // Log normalized properties
  console.log('Normalized properties count:', normalizedProperties.length);
  
  // Remove duplicates by slug, preferring the most complete record
  const uniquePropertyMap = new Map();
  
  // First pass: collect all properties by slug
  normalizedProperties.forEach(prop => {
    const slug = prop.attributes?.slug;
    if (!slug) return;
    
    if (!uniquePropertyMap.has(slug)) {
      uniquePropertyMap.set(slug, []);
    }
    uniquePropertyMap.get(slug).push(prop);
  });
  
  // Second pass: select the most complete property for each slug
  const combinedProperties = Array.from(uniquePropertyMap.values()).map(propArray => {
    // If only one property, use it
    if (propArray.length === 1) return propArray[0];
    
    // Otherwise, score each property based on completeness
    return propArray.reduce((best: NormalizedProperty, current: NormalizedProperty) => {
      const bestAttrs = best.attributes || {};
      const currentAttrs = current.attributes || {};
      
      // Calculate completeness score (higher is better)
      const bestScore = 
        (bestAttrs.bedrooms ? 2 : 0) + 
        (bestAttrs.bathrooms ? 2 : 0) + 
        ((bestAttrs.amenities?.length || 0) > 0 || (bestAttrs.Amenities?.length || 0) > 0 ? 3 : 0) +
        (bestAttrs.featuredImage ? 1 : 0) +
        ((bestAttrs.images?.length || 0) > 0 ? 1 : 0) +
        (bestAttrs.description?.length > 20 ? 1 : 0);
        
      const currentScore = 
        (currentAttrs.bedrooms ? 2 : 0) + 
        (currentAttrs.bathrooms ? 2 : 0) + 
        ((currentAttrs.amenities?.length || 0) > 0 || (currentAttrs.Amenities?.length || 0) > 0 ? 3 : 0) +
        (currentAttrs.featuredImage ? 1 : 0) +
        ((currentAttrs.images?.length || 0) > 0 ? 1 : 0) +
        (currentAttrs.description?.length > 20 ? 1 : 0);
      
      // Choose the property with the higher completeness score
      return currentScore > bestScore ? current : best;
    }, propArray[0]);
  });
  
  // Log the final combined properties
  console.log('Final combined properties count:', combinedProperties.length);
  if (combinedProperties.length > 0) {
    console.log('First combined property:', {
      id: combinedProperties[0].id,
      title: combinedProperties[0].attributes?.title,
      hasAttributes: Boolean(combinedProperties[0].attributes),
      bedrooms: combinedProperties[0].attributes?.bedrooms || 'none',
      bathrooms: combinedProperties[0].attributes?.bathrooms || 'none',
      hasAmenities: Boolean(combinedProperties[0].attributes?.amenities?.length > 0 || 
                           combinedProperties[0].attributes?.Amenities?.length > 0)
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
          <QuickFilters availableLocations={availableLocations} />
          
          {/* Advanced Filters - Hidden by Default */}
          <AdvancedFilters availableLocations={availableLocations} />
          
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