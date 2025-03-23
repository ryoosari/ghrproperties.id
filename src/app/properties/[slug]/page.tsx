import React from 'react';
import Link from 'next/link';
import { getPropertyBySlug, getAllProperties } from '@/utils/snapshot';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FaArrowLeft, FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaRegHeart } from 'react-icons/fa';

// Force static rendering
export const dynamic = 'force-static';

// Generate static paths
export async function generateStaticParams() {
  const properties = getAllProperties();
  
  return properties.map((property) => ({
    slug: property.attributes.slug,
  }));
}

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const property = getPropertyBySlug(slug);
  
  if (!property) {
    notFound();
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
              {property.attributes.title}
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
                  <h1 className="text-3xl font-bold mb-2">{property.attributes.title}</h1>
                  <div className="flex items-center text-gray-600 text-lg">
                    <FaMapMarkerAlt className="text-primary mr-2" />
                    <p>{property.attributes.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-primary mr-4">
                    {typeof property.attributes.price === 'number' 
                      ? `$${property.attributes.price.toLocaleString()}` 
                      : property.attributes.price}
                  </div>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FaRegHeart className="text-gray-500 text-xl" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaBed className="mr-2" /> {property.attributes.bedrooms} Bedrooms
                </div>
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaBath className="mr-2" /> {property.attributes.bathrooms} Bathrooms
                </div>
                <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <FaRuler className="mr-2" /> {property.attributes.square_footage} sq ft
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-md">
                  {property.attributes.property_type}
                </div>
              </div>
            </div>
            
            {/* Property Images */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">Property Images</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Featured Image */}
                {property.attributes.featured_image?.data?.attributes?.url && (
                  <div className="md:col-span-2">
                    <img 
                      src={property.attributes.featured_image.data.attributes.url} 
                      alt={property.attributes.title} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                
                {/* Gallery Images */}
                {property.attributes.images?.data && 
                 property.attributes.images.data.map((image: any, index: number) => (
                  <div key={index}>
                    <img 
                      src={image.attributes.url} 
                      alt={`${property.attributes.title} - Image ${index + 1}`} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                ))}
                
                {/* Show placeholder if no images */}
                {(!property.attributes.featured_image?.data && 
                  (!property.attributes.images?.data || property.attributes.images.data.length === 0)) && (
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
                <p>{property.attributes.description || 'No description available.'}</p>
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
                      <span className="text-gray-600">{property.id}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Property Type:</span> 
                      <span className="text-gray-600">{property.attributes.property_type}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Status:</span> 
                      <span className="text-gray-600">{property.attributes.status}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Area:</span> 
                      <span className="text-gray-600">{property.attributes.square_footage} sq ft</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-primary">Rooms</h3>
                  <ul className="space-y-3">
                    <li className="flex">
                      <span className="font-medium w-32">Bedrooms:</span> 
                      <span className="text-gray-600">{property.attributes.bedrooms}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Bathrooms:</span> 
                      <span className="text-gray-600">{property.attributes.bathrooms}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Kitchen:</span> 
                      <span className="text-gray-600">{property.attributes.kitchen || 1}</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-32">Living Room:</span> 
                      <span className="text-gray-600">{property.attributes.living_room || 1}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            {property.attributes.amenities && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.isArray(property.attributes.amenities.data) ? 
                    property.attributes.amenities.data.map((amenity: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        <span>{amenity.attributes.name}</span>
                      </div>
                    )) : (
                      <p>No amenities listed</p>
                    )
                  }
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