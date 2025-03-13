import Link from 'next/link';
import { FaBed, FaBath, FaRuler } from 'react-icons/fa';
import PropertyCard from '@/components/property-card';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  type: string;
}

interface FeaturedSectionProps {
  properties: Property[];
}

export function FeaturedSection({ properties }: FeaturedSectionProps) {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Featured <span className="text-primary">Properties</span>
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Explore our handpicked selection of premium properties that offer exceptional value and features.
            </p>
          </div>
          <Link
            href="/properties"
            className="mt-4 md:mt-0 inline-flex items-center text-primary hover:text-primary-700 font-medium"
          >
            View All Properties
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
} 