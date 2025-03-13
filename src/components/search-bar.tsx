"use client";

import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const propertyTypes = [
  { id: 'all', name: 'All Properties' },
  { id: 'house', name: 'House' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'villa', name: 'Villa' },
  { id: 'land', name: 'Land' },
  { id: 'commercial', name: 'Commercial' },
];

const priceRanges = [
  { id: 'any', name: 'Any Price' },
  { id: '0-100000', name: 'Up to $100,000' },
  { id: '100000-300000', name: 'Up to $300,000' },
  { id: '300000-500000', name: 'Up to $500,000' },
  { id: '500000-1000000', name: 'Up to $1,000,000' },
  { id: '1000000+', name: 'Above $1,000,000' },
];

const bedroomOptions = [
  { value: '', label: 'Beds' },
  { value: '1', label: '1+ Beds' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
];

const bathroomOptions = [
  { value: '', label: 'Baths' },
  { value: '1', label: '1+ Baths' },
  { value: '2', label: '2+ Baths' },
  { value: '3', label: '3+ Baths' },
  { value: '4', label: '4+ Baths' },
  { value: '5', label: '5+ Baths' },
];

export function SearchBar() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('any');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would navigate to search results
    console.log({
      location,
      propertyType,
      priceRange,
      bedrooms,
      bathrooms,
    });
  };

  // Helper function to render icons safely
  const renderIcon = (Icon: any, className: string) => {
    return <span className={className}>{Icon && <Icon />}</span>;
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {renderIcon(FaMapMarkerAlt, "h-4 w-4 text-gray-400")}
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent dark:border-gray-700 dark:text-gray-200"
          />
        </div>

        <div className="relative">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent dark:border-gray-700 dark:text-gray-200 appearance-none"
            aria-label="Property Type"
          >
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent dark:border-gray-700 dark:text-gray-200 appearance-none"
            aria-label="Price Range"
          >
            {priceRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="block w-full pl-3 pr-6 py-2 text-sm border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent dark:border-gray-700 dark:text-gray-200 appearance-none"
              aria-label="Bedrooms"
            >
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="block w-full pl-3 pr-6 py-2 text-sm border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent dark:border-gray-700 dark:text-gray-200 appearance-none"
              aria-label="Bathrooms"
            >
              <option value="">Baths</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition-colors">
          {renderIcon(FaSearch, "mr-2 h-3.5 w-3.5")}
          Search
        </button>
      </div>
    </form>
  );
} 