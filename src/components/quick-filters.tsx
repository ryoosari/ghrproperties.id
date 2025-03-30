'use client';

import React from 'react';
import { FaFilter, FaSearch } from 'react-icons/fa';
import FilterToggle from './filter-toggle';

interface QuickFiltersProps {
  availableLocations: string[];
}

export default function QuickFilters({ availableLocations }: QuickFiltersProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const formValues: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      formValues[key] = value;
    });
    
    console.log('Quick filters applied:', formValues);
    
    // Here you would normally update a state or redirect with query params
    // For now, we'll just log the filters that would be applied
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <FaFilter className="text-primary mr-2" />
            <span className="text-gray-700 font-medium">Quick Filters</span>
          </div>
          
          {/* Basic Filters Row */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Property Type Quick Filter */}
            <div>
              <select 
                name="quick_property_type"
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Property Types</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            {/* Location Quick Filter */}
            <div>
              <select 
                name="quick_location"
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Locations</option>
                {availableLocations.length > 0 ? (
                  availableLocations.map((location) => (
                    <option key={location} value={location.toLowerCase()}>
                      {location}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No locations available</option>
                )}
              </select>
            </div>
            
            {/* Price Quick Filter */}
            <div>
              <select 
                name="quick_price_range"
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Price</option>
                <option value="0-500000000">Under 500M IDR</option>
                <option value="500000000-1000000000">500M - 1B IDR</option>
                <option value="1000000000-2000000000">1B - 2B IDR</option>
                <option value="2000000000">Over 2B IDR</option>
              </select>
            </div>
            
            {/* Sort by Dropdown */}
            <div>
              <select 
                name="quick_sort_by"
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-primary bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              <FaSearch className="mr-2 h-3 w-3" />
              <span className="text-sm font-medium">Search</span>
            </button>
            
            {/* Advanced Filters Toggle Button */}
            <FilterToggle />
          </div>
        </div>
      </form>
    </div>
  );
}