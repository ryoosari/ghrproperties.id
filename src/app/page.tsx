import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaHome, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PropertyCard from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search-bar';
import { FeaturedSection } from '@/components/featured-section';
import { TestimonialSection } from '@/components/testimonial-section';
import { CTASection } from '@/components/cta-section';
import { getAllProperties } from '@/utils/snapshot';
import { getProperties } from '@/lib/strapi';
import path from 'path';
import fs from 'fs';

// Set revalidation period
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Get properties using the same approach as in the Properties page
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
  
  // Fetch Strapi properties
  let strapiProperties: any[] = [];
  
  // Check if we're running in a static export or production build
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // Try to load from pre-exported data
    try {
      const dataPath = path.join(process.cwd(), 'data', 'processed-properties.json');
      if (fs.existsSync(dataPath)) {
        const processedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        strapiProperties = processedData || [];
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
      }
    } catch (error) {
      console.error('Error fetching Strapi properties:', error);
    }
  }
  
  // Normalize all properties to have consistent structure
  const normalizedProperties = [
    ...strapiProperties.map((prop: any) => {
      // The Strapi properties have the fields directly on the object, not nested in attributes
      return {
        id: prop.id,
        attributes: {
          title: prop.Title || 'Untitled Property',
          slug: prop.Slug || `property-${prop.id}`,
          status: 'published', // Default to published
          price: prop.Price || 0,
          description: prop.Description || '',
          isFeatured: prop.IsFeatured || false, // Check for the featured flag
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
            prop.Image.map((img: any) => ({
              url: img.url || '',
              alternativeText: img.alternativeText || prop.Title || '',
              width: img.width || 800,
              height: img.height || 600
            })) : []
        }
      };
    }),
    ...snapshotProperties.map((prop: any) => {
      // For snapshot properties, ensure they have the right attributes and check for featured flag
      if (prop.attributes) {
        return {
          ...prop,
          attributes: {
            ...prop.attributes,
            status: prop.attributes.status || 'published',
            title: prop.attributes.title || 'Untitled Property',
            slug: prop.attributes.slug || `property-${prop.id}`,
            price: prop.attributes.price || 0,
            isFeatured: prop.attributes.isFeatured || false
          }
        };
      }
      return prop;
    })
  ];
  
  // Remove duplicates by slug
  const uniqueSlugs = new Set();
  const combinedProperties = normalizedProperties.filter(prop => {
    const slug = prop.attributes?.slug;
    if (!slug || uniqueSlugs.has(slug)) return false;
    uniqueSlugs.add(slug);
    return true;
  });

  // Get featured properties:
  // 1. First try to find properties explicitly marked as featured
  let featuredProperties = combinedProperties.filter(prop => prop.attributes?.isFeatured === true);
  
  // 2. If no properties are explicitly marked as featured, use the most recent properties
  if (featuredProperties.length === 0) {
    // Sort by createdAt date in descending order (newest first)
    const sortedProperties = [...combinedProperties].sort((a, b) => {
      const dateA = new Date(a.attributes?.createdAt || 0).getTime();
      const dateB = new Date(b.attributes?.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    // Take the 3 most recent properties
    featuredProperties = sortedProperties.slice(0, 3);
  } else if (featuredProperties.length > 3) {
    // If there are more than 3 featured properties, take the 3 most recent ones
    featuredProperties = featuredProperties.slice(0, 3);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-image.jpg"
            alt="Luxury Real Estate"
            fill
            priority
            className="object-cover brightness-[0.7]"
          />
        </div>
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 animate-fade-in-down">
            Find Your Dream Property
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in">
            Discover exceptional properties with GHR Properties, your trusted real estate partner.
          </p>
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-4 rounded-lg animate-fade-in-up">
            <SearchBar />
          </div>
        </div>
      </section>
      
      {/* Featured Properties Section */}
      <FeaturedSection properties={featuredProperties} />
      
      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            Our <span className="text-primary">Services</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Residential Properties</h3>
              <p className="text-gray-600">
                Find your perfect home from our extensive collection of residential properties.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Commercial Properties</h3>
              <p className="text-gray-600">
                Discover prime commercial spaces for your business needs and investment opportunities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Property Management</h3>
              <p className="text-gray-600">
                Let us handle the management of your property with our professional services.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <TestimonialSection />
      
      {/* CTA Section */}
      <CTASection />
      
      <Footer />
    </main>
  );
} 