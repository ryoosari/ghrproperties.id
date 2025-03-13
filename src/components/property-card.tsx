import Link from 'next/link';
import Image from 'next/image';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import { cn } from '@/utils/cn';

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

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  return (
    <div className={cn("bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300", className)}>
      <div className="relative h-64">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            {property.type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FaMapMarkerAlt className="mr-1 text-primary" />
          <span>{property.location}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
          <Link href={`/properties/${property.id}`}>
            {property.title}
          </Link>
        </h3>
        <p className="text-primary text-xl font-bold mb-4">{property.price}</p>
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center">
            <FaBed className="mr-1" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center">
            <FaBath className="mr-1" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center">
            <FaRuler className="mr-1" />
            <span>{property.area}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 