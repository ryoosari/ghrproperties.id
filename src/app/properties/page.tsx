import React from 'react';
import Link from 'next/link';
import { FaHome, FaFilter, FaSearch } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getAllProperties } from '@/utils/snapshot';

// This is a static page that will be pre-rendered at build time
export const dynamic = 'force-static';

export default function PropertiesPage() {
  // Get properties directly from snapshot
  const properties = getAllProperties({
    status: 'published',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

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
          {properties.length === 0 ? (
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
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative pb-[60%]">
                    {property.attributes.featured_image?.data?.attributes?.url ? (
                      <img 
                        src={property.attributes.featured_image.data.attributes.url} 
                        alt={property.attributes.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {property.attributes.property_type || 'Property'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 bg-primary text-white px-3 py-1">
                      {property.attributes.status === 'published' ? 'For Sale' : property.attributes.status}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 truncate">
                      {property.attributes.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-2 truncate">
                      {property.attributes.location}
                    </p>
                    
                    <div className="text-lg font-bold text-primary mb-3">
                      {typeof property.attributes.price === 'number' 
                        ? `$${property.attributes.price.toLocaleString()}` 
                        : property.attributes.price}
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                      <span>{property.attributes.bedrooms} Beds</span>
                      <span>{property.attributes.bathrooms} Baths</span>
                      <span>{property.attributes.square_footage} sq ft</span>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4">
                    <Link 
                      href={`/properties/${property.attributes.slug}`}
                      className="block w-full text-center bg-primary hover:bg-primary-dark text-white py-2 rounded transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination (static for now) */}
          {properties.length > 0 && (
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