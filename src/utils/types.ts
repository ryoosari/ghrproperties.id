/**
 * Property interface representing a real estate property
 */
export interface Property {
  property_id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  property_type: string;
  featured_image: string;
  keywords: string;
  status: 'active' | 'pending' | 'sold';
  created_at: string;
  updated_at: string;
  images?: string[]; // Optional array of additional images
  amenities?: string[]; // Optional array of amenities
}

/**
 * Property type options
 */
export const propertyTypes = [
  { id: 'all', name: 'All Properties' },
  { id: 'house', name: 'House' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'villa', name: 'Villa' },
  { id: 'land', name: 'Land' },
  { id: 'commercial', name: 'Commercial' },
];

/**
 * Price range options
 */
export const priceRanges = [
  { id: 'any', name: 'Any Price', min: 0, max: 0 },
  { id: '0-100000000', name: 'Up to Rp100M', min: 0, max: 100000000 },
  { id: '100000000-500000000', name: 'Rp100M - Rp500M', min: 100000000, max: 500000000 },
  { id: '500000000-1000000000', name: 'Rp500M - Rp1B', min: 500000000, max: 1000000000 },
  { id: '1000000000-5000000000', name: 'Rp1B - Rp5B', min: 1000000000, max: 5000000000 },
  { id: '5000000000+', name: 'Above Rp5B', min: 5000000000, max: 0 },
];

/**
 * Bedroom options
 */
export const bedroomOptions = [
  { value: '', label: 'Beds' },
  { value: '1', label: '1+ Bed' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
];

/**
 * Bathroom options
 */
export const bathroomOptions = [
  { value: '', label: 'Baths' },
  { value: '1', label: '1+ Bath' },
  { value: '2', label: '2+ Baths' },
  { value: '3', label: '3+ Baths' },
  { value: '4', label: '4+ Baths' },
  { value: '5', label: '5+ Baths' },
]; 