/**
 * Content Snapshot Utility
 * 
 * This utility provides functions to load content from JSON snapshot files
 * instead of fetching from an API at runtime.
 */

import fs from 'fs';
import path from 'path';

// Types
export interface SnapshotMetadata {
  exportedAt: string;
  stats: Record<string, number>;
  source: string;
}

// Define property interface
export interface Property {
  id: string | number;
  attributes: {
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
}

// Paths
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Check if we're using static export mode
 */
export function isStaticExport(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
}

/**
 * Load a content snapshot file
 */
export function loadSnapshotFile<T>(filename: string): T | null {
  try {
    const filePath = path.join(DATA_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Snapshot file not found: ${filePath}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error loading snapshot file ${filename}:`, error);
    return null;
  }
}

/**
 * Get metadata about the snapshot
 */
export function getSnapshotMetadata(): SnapshotMetadata | null {
  return loadSnapshotFile<SnapshotMetadata>('metadata.json');
}

/**
 * Load a collection
 */
export function loadCollection<T>(contentType: string): T[] {
  const data = loadSnapshotFile<T[]>(`${contentType}.json`);
  return data || [];
}

/**
 * Load a single item by ID
 */
export function loadItem<T>(contentType: string, id: number | string): T | null {
  return loadSnapshotFile<T>(`${contentType}-${id}.json`);
}

/**
 * Load property index (optimized for quick access)
 */
export function loadPropertyIndex(): Property[] {
  return loadSnapshotFile<Property[]>('property-index.json') || [];
}

/**
 * Load a property by its slug
 */
export function getPropertyBySlug(slug: string): Property | null {
  // First check the index for the ID
  const index = loadPropertyIndex();
  const property = index.find(p => p.attributes.slug === slug);
  
  if (!property) {
    return null;
  }
  
  // Then load the full property data
  return loadItem<Property>('properties', property.id);
}

/**
 * Get all properties with optional filtering
 */
export function getAllProperties(options: {
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Property[] {
  const properties = loadCollection<Property>('properties');
  
  // Filter by status if provided
  let filtered = properties;
  if (options.status) {
    filtered = properties.filter(p => 
      p.attributes.status === options.status
    );
  }
  
  // Sort properties
  const sortBy = options.sortBy || 'updatedAt';
  const sortOrder = options.sortOrder || 'desc';
  
  const sorted = [...filtered].sort((a, b) => {
    const aValue = a.attributes[sortBy];
    const bValue = b.attributes[sortBy];
    
    // Handle numeric vs string sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Default to string comparison
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Apply limit if provided
  if (options.limit && options.limit > 0) {
    return sorted.slice(0, options.limit);
  }
  
  return sorted;
}

/**
 * Get site settings
 */
export function getSiteSettings() {
  const settings = loadCollection<any>('settings');
  return settings[0] || null;
}

/**
 * Get page by slug
 */
export function getPageBySlug(slug: string) {
  const pages = loadCollection<any>('pages');
  return pages.find(p => p.attributes.slug === slug) || null;
}

/**
 * Universal fetch function that works in both static and dynamic modes
 * In static mode, it loads from snapshot files
 * In dynamic mode, it fetches from the API
 */
export async function fetchContent<T>(
  contentType: string,
  options: {
    id?: string | number;
    slug?: string;
    params?: Record<string, any>;
    apiEndpoint?: string;
  } = {}
): Promise<T | null> {
  // In static export mode, load from snapshot files
  if (isStaticExport()) {
    if (options.id) {
      return loadItem<T>(contentType, options.id);
    }
    
    if (options.slug) {
      if (contentType === 'properties') {
        return getPropertyBySlug(options.slug) as unknown as T;
      } else if (contentType === 'pages') {
        return getPageBySlug(options.slug) as unknown as T;
      }
    }
    
    return loadCollection<T>(contentType)[0] || null;
  }
  
  // In dynamic mode, fetch from API
  // You'll need to implement your API fetch logic here
  // This is just a placeholder
  try {
    const apiUrl = options.apiEndpoint || `/api/${contentType}`;
    // Implement your API fetch logic here
    
    // This is a placeholder that would be replaced with actual API calls
    console.log(`Would fetch from API: ${apiUrl}`);
    return null;
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
} 