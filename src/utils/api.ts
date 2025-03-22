import { Property } from './types';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Interface for search parameters
export interface PropertySearchParams {
  keyword?: string;
  location?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  per_page?: number;
}

// Interface for search results
export interface PropertySearchResults {
  properties: Property[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// API utility functions

interface Property {
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
  status: 'active' | 'pending' | 'sold';
  created_at: string;
  updated_at: string;
}

interface PropertiesResponse {
  properties: Property[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface PropertyResponse extends Property {
  images: string[];
  amenities: string[];
}

/**
 * Fetch a single property by ID
 */
export async function fetchProperty(id: number): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties.php?id=${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch property');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

/**
 * Search for properties with filters
 */
export async function searchProperties(params: PropertySearchParams = {}): Promise<PropertySearchResults> {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/properties.php?${queryParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search properties');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
}

/**
 * Fetch all properties (with optional pagination)
 */
export async function fetchAllProperties(page = 1, perPage = 10): Promise<PropertySearchResults> {
  return searchProperties({ page, per_page: perPage });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Fetches all properties with optional filter parameters
 */
export async function getProperties(params: Record<string, string> = {}): Promise<PropertiesResponse> {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`/api/properties.php${queryParams ? `?${queryParams}` : ''}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetches a single property by ID
 */
export async function getProperty(id: number): Promise<PropertyResponse> {
  const response = await fetch(`/api/properties.php?id=${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.status}`);
  }
  
  return response.json();
}

// Helper function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Helper function to convert property data from API to UI format for property cards
 */
export function mapPropertyToUIFormat(property: Property) {
  return {
    id: property.property_id,
    title: property.title,
    location: property.location,
    price: formatCurrency(property.price),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: `${property.square_footage.toLocaleString()} sq ft`,
    image: property.featured_image || '/images/property-placeholder.jpg',
    type: property.property_type
  };
} 