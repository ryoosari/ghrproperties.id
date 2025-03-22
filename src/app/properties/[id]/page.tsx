import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaTag, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { fetchProperty, formatCurrency } from '@/utils/api';
import { Property } from '@/utils/types';

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const property = await fetchProperty(parseInt(params.id));
    
    return {
      title: `${property.title} | GHR Properties`,
      description: property.description.substring(0, 160),
      keywords: property.keywords?.split(',') || ['property', 'real estate'],
    };
  } catch (error) {
    return {
      title: 'Property Not Found | GHR Properties',
      description: 'The requested property could not be found.',
    };
  }
}

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  // Fetch property data
  try {
    const property = await fetchProperty(parseInt(params.id));
    
    // Format property data for display
    const formattedProperty = {
      id: property.property_id,
      title: property.title,
      description: property.description,
      price: formatCurrency(property.price),
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: `${property.square_footage.toLocaleString()} sq ft`,
      type: property.property_type,
      status: property.status,
      created: new Date(property.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      images: property.images || [property.featured_image],
      amenities: property.amenities || [],
    };
    
    // If featured image wasn't included in the images array, add it
    if (property.featured_image && !formattedProperty.images.includes(property.featured_image)) {
      formattedProperty.images.unshift(property.featured_image);
    }
    
    return (
      <main className="flex min-h-screen flex-col">
        <Header />
        
        {/* Breadcrumbs */}
        <div className="bg-gray-50 pt-32 pb-4">
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
              <span className="text-primary font-medium">{formattedProperty.title}</span>
            </div>
          </div>
        </div>
        
        {/* Property Images Gallery */}
        <section className="py-8 bg-gray-50">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Image */}
              <div className="md:col-span-2 relative h-96 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={formattedProperty.images[0] || '/images/property-placeholder.jpg'}
                  alt={formattedProperty.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {formattedProperty.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {formattedProperty.status}
                  </span>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-2 gap-4 h-96 overflow-y-auto p-1">
                {formattedProperty.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="relative h-44 rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={image}
                      alt={`${formattedProperty.title} - Image ${index + 2}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Property Details */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaMapMarkerAlt className="mr-1 text-primary" />
                    <span>{formattedProperty.location}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                    {formattedProperty.title}
                  </h1>
                  <p className="text-primary text-3xl font-bold mb-6">{formattedProperty.price}</p>
                  
                  <div className="flex justify-between text-gray-600 border-t border-b py-4 mb-6">
                    <div className="flex items-center">
                      <FaBed className="mr-2 text-lg text-primary" />
                      <div>
                        <span className="block font-semibold">{formattedProperty.bedrooms}</span>
                        <span className="text-sm">Bedrooms</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaBath className="mr-2 text-lg text-primary" />
                      <div>
                        <span className="block font-semibold">{formattedProperty.bathrooms}</span>
                        <span className="text-sm">Bathrooms</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaRuler className="mr-2 text-lg text-primary" />
                      <div>
                        <span className="block font-semibold">{formattedProperty.area}</span>
                        <span className="text-sm">Area</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-10">
                  <h2 className="text-2xl font-heading font-semibold mb-4">Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">{formattedProperty.description}</p>
                  </div>
                </div>
                
                {/* Amenities */}
                {formattedProperty.amenities.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-heading font-semibold mb-4">Amenities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formattedProperty.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <FaCheck className="text-primary mr-2" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Location Map Placeholder */}
                <div className="mb-10">
                  <h2 className="text-2xl font-heading font-semibold mb-4">Location</h2>
                  <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <p className="text-gray-500">Interactive map would be displayed here</p>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Agent Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4">
                      <Image
                        src="/images/agent.jpg"
                        alt="Real Estate Agent"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">Jane Doe</h3>
                    <p className="text-gray-500">Senior Property Consultant</p>
                  </div>
                  <div className="border-t pt-4">
                    <Link 
                      href="/contact" 
                      className="block w-full bg-primary text-white text-center py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors mb-3"
                    >
                      Contact Agent
                    </Link>
                    <Link 
                      href="tel:+123456789" 
                      className="block w-full bg-white border border-primary text-primary text-center py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                    >
                      +1 (234) 567-89
                    </Link>
                  </div>
                </div>
                
                {/* Property Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <FaTag className="text-primary mr-2" />
                        <span className="text-gray-600">Property Type</span>
                      </div>
                      <span className="font-medium">{formattedProperty.type}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-primary mr-2" />
                        <span className="text-gray-600">Listed On</span>
                      </div>
                      <span className="font-medium">{formattedProperty.created}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <FaBed className="text-primary mr-2" />
                        <span className="text-gray-600">Bedrooms</span>
                      </div>
                      <span className="font-medium">{formattedProperty.bedrooms}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <FaBath className="text-primary mr-2" />
                        <span className="text-gray-600">Bathrooms</span>
                      </div>
                      <span className="font-medium">{formattedProperty.bathrooms}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaRuler className="text-primary mr-2" />
                        <span className="text-gray-600">Property Size</span>
                      </div>
                      <span className="font-medium">{formattedProperty.area}</span>
                    </li>
                  </ul>
                </div>
                
                {/* CTA Card */}
                <div className="bg-primary rounded-lg shadow-md p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Interested in this property?</h3>
                  <p className="text-white/80 mb-4">Schedule a viewing or request more information.</p>
                  <Link 
                    href="/contact" 
                    className="block w-full bg-white text-primary text-center py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    );
  } catch (error) {
    // If property not found or other error
    notFound();
  }
} 