import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PropertyCard from '@/components/property-card';
import { fetchAllProperties, mapPropertyToUIFormat } from '@/utils/api';
import { FaHome, FaFilter, FaSpinner } from 'react-icons/fa';
import { Property } from '@/utils/types';

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Properties | GHR Properties',
  description: 'Browse our extensive collection of premium properties available for sale and rent.',
  keywords: ['properties', 'real estate', 'houses', 'apartments', 'listings'],
};

// Mock property data for static generation
const mockProperties = [
  {
    id: 1,
    title: 'Luxury Villa in Seminyak',
    location: 'Seminyak, Bali',
    price: 'Rp5.000.000.000',
    bedrooms: 4,
    bathrooms: 5,
    area: '450 sq ft',
    image: '/images/property-1.jpg',
    type: 'Villa',
  },
  {
    id: 2,
    title: 'Modern Apartment in Jakarta',
    location: 'Jakarta Selatan',
    price: 'Rp2.500.000.000',
    bedrooms: 2,
    bathrooms: 2,
    area: '120 sq ft',
    image: '/images/property-2.jpg',
    type: 'Apartment',
  },
  {
    id: 3,
    title: 'Spacious Family Home',
    location: 'Bandung, West Java',
    price: 'Rp3.500.000.000',
    bedrooms: 4,
    bathrooms: 3,
    area: '350 sq ft',
    image: '/images/property-3.jpg',
    type: 'House',
  },
  {
    id: 4,
    title: 'Beachfront Villa',
    location: 'Uluwatu, Bali',
    price: 'Rp7.500.000.000',
    bedrooms: 5,
    bathrooms: 6,
    area: '600 sq ft',
    image: '/images/property-1.jpg',
    type: 'Villa',
  },
  {
    id: 5,
    title: 'City Center Apartment',
    location: 'Central Jakarta',
    price: 'Rp1.800.000.000',
    bedrooms: 1,
    bathrooms: 1,
    area: '85 sq ft',
    image: '/images/property-2.jpg',
    type: 'Apartment',
  },
  {
    id: 6,
    title: 'Mountain View Estate',
    location: 'Puncak, Bogor',
    price: 'Rp4.200.000.000',
    bedrooms: 3,
    bathrooms: 3,
    area: '300 sq ft',
    image: '/images/property-3.jpg',
    type: 'House',
  },
];

// Helper function to determine if we're in a static environment
const isStaticEnvironment = () => {
  // Check for static export indicators
  return (
    process.env.NEXT_PHASE === 'phase-production-build' || 
    process.env.NEXT_PHASE === 'phase-export' || 
    process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ||
    typeof window !== 'undefined' && window.location.protocol === 'file:'
  );
};

// Loading component for properties
function PropertyListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Properties component
async function PropertyListings() {
  // Check if we're in a static environment
  if (isStaticEnvironment()) {
    console.log('Using mock properties in static environment');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    );
  }

  try {
    // Fetch properties from the API
    const data = await fetchAllProperties(1, 12);
    const properties = data.properties.map(mapPropertyToUIFormat);

    return (
      <>
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any properties matching your criteria.</p>
            <Link href="/properties" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Fallback to mock data if API fails
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    );
  }
}

export default function PropertiesPage() {
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
          {/* Filters and Sorting (static for now) */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaFilter className="text-primary mr-2" />
              <span className="text-gray-700 font-medium">Filters:</span>
              <div className="ml-4 space-x-2">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white cursor-pointer transition-colors">All</span>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white cursor-pointer transition-colors">Villa</span>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white cursor-pointer transition-colors">Apartment</span>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary hover:text-white cursor-pointer transition-colors">House</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 font-medium mr-2">Sort by:</span>
              <select className="border rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {/* Property Listings */}
          <Suspense fallback={<PropertyListingsSkeleton />}>
            <PropertyListings />
          </Suspense>
          
          {/* Pagination (static for now) */}
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
          <Link href="/contact" className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 