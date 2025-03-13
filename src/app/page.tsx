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

// Mock data for featured properties
const featuredProperties = [
  {
    id: 1,
    title: 'Luxury Villa with Pool',
    location: 'Palm Jumeirah, Dubai',
    price: '$2,500,000',
    bedrooms: 5,
    bathrooms: 6,
    area: '6,500 sq ft',
    image: '/images/property-1.jpg',
    type: 'Villa',
  },
  {
    id: 2,
    title: 'Modern Apartment with Sea View',
    location: 'Marina, Dubai',
    price: '$850,000',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200 sq ft',
    image: '/images/property-2.jpg',
    type: 'Apartment',
  },
  {
    id: 3,
    title: 'Spacious Family Home',
    location: 'Arabian Ranches, Dubai',
    price: '$1,750,000',
    bedrooms: 4,
    bathrooms: 4,
    area: '3,800 sq ft',
    image: '/images/property-3.jpg',
    type: 'House',
  },
];

export default function Home() {
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