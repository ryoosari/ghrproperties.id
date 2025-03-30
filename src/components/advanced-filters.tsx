'use client';

import React from 'react';

interface AdvancedFiltersProps {
  availableLocations: string[];
}

export default function AdvancedFilters({ availableLocations }: AdvancedFiltersProps) {
  const clearFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    // Reset all form elements in the advanced filters section
    const form = document.getElementById('advanced-filters-form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
  };

  const applyFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    // This would usually submit form data or update a query
    // In this static implementation, we'll just log what would be submitted
    
    const formData = new FormData(document.getElementById('advanced-filters-form') as HTMLFormElement);
    const formValues: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      if (formValues[key]) {
        if (!Array.isArray(formValues[key])) {
          formValues[key] = [formValues[key]];
        }
        formValues[key].push(value);
      } else {
        formValues[key] = value;
      }
    });

    console.log('Applied filters:', formValues);
    
    // Here you would normally update a state or redirect with query params
    // For now, we'll just log the filters that would be applied
  };

  return (
    <div id="advanced-filters" className="bg-white p-6 rounded-lg shadow-sm mb-8 hidden">
      <form id="advanced-filters-form">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Property Type Filter */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Property Type</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="type-all" 
                  name="property_type" 
                  value="all"
                  className="mr-2 h-4 w-4 accent-primary" 
                  defaultChecked 
                />
                <label htmlFor="type-all" className="text-sm">All Types</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="type-villa" 
                  name="property_type" 
                  value="villa"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="type-villa" className="text-sm">Villa</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="type-apartment" 
                  name="property_type" 
                  value="apartment"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="type-apartment" className="text-sm">Apartment</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="type-house" 
                  name="property_type" 
                  value="house"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="type-house" className="text-sm">House</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="type-commercial" 
                  name="property_type" 
                  value="commercial"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="type-commercial" className="text-sm">Commercial</label>
              </div>
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="min-price" className="text-sm text-gray-600 block mb-1">Min Price (IDR)</label>
                <input 
                  type="number" 
                  id="min-price" 
                  name="min_price"
                  placeholder="Min Price" 
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="text-sm text-gray-600 block mb-1">Max Price (IDR)</label>
                <input 
                  type="number" 
                  id="max-price" 
                  name="max_price"
                  placeholder="Max Price" 
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Bedrooms & Bathrooms */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Bedrooms & Bathrooms</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="bedrooms" className="text-sm text-gray-600 block mb-1">Bedrooms</label>
                <select id="bedrooms" name="bedrooms" className="w-full border rounded p-2 text-sm">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label htmlFor="bathrooms" className="text-sm text-gray-600 block mb-1">Bathrooms</label>
                <select id="bathrooms" name="bathrooms" className="w-full border rounded p-2 text-sm">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Location Filter */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Location</h3>
            <select id="advanced-location" name="location" className="w-full border rounded p-2 text-sm">
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
          
          {/* Amenities */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="amenity-pool" 
                  name="amenities" 
                  value="pool"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="amenity-pool" className="text-sm">Swimming Pool</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="amenity-parking" 
                  name="amenities" 
                  value="parking"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="amenity-parking" className="text-sm">Parking</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="amenity-garden" 
                  name="amenities" 
                  value="garden"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="amenity-garden" className="text-sm">Garden</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="amenity-security" 
                  name="amenities" 
                  value="security"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="amenity-security" className="text-sm">24/7 Security</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="amenity-gym" 
                  name="amenities" 
                  value="gym"
                  className="mr-2 h-4 w-4 accent-primary" 
                />
                <label htmlFor="amenity-gym" className="text-sm">Gym</label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Actions */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <button 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2 hover:bg-gray-300 transition-colors"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}