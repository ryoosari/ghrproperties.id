import mysql from 'mysql2/promise';
import { Property } from './types';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute queries
export async function executeQuery<T>({ query, values }: { query: string; values?: any[] }): Promise<T> {
  try {
    const [results] = await pool.execute(query, values);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Function to get a single connection from the pool
export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
}

// Function to get all properties
export async function getAllProperties(): Promise<Property[]> {
  return executeQuery<Property[]>({
    query: 'SELECT * FROM properties WHERE status = "active" ORDER BY created_at DESC',
  });
}

// Function to get a single property by ID
export async function getPropertyById(id: number): Promise<Property | null> {
  const properties = await executeQuery<Property[]>({
    query: 'SELECT * FROM properties WHERE property_id = ?',
    values: [id],
  });
  
  return properties.length > 0 ? properties[0] : null;
}

// Function to search properties
export async function searchProperties({
  keyword,
  location,
  propertyType,
  minPrice,
  maxPrice,
  bedrooms,
  bathrooms,
}: {
  keyword?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}): Promise<Property[]> {
  let query = 'SELECT * FROM properties WHERE status = "active"';
  const values: any[] = [];

  if (keyword) {
    query += ' AND (title LIKE ? OR description LIKE ? OR keywords LIKE ?)';
    const keywordParam = `%${keyword}%`;
    values.push(keywordParam, keywordParam, keywordParam);
  }

  if (location) {
    query += ' AND location LIKE ?';
    values.push(`%${location}%`);
  }

  if (propertyType && propertyType !== 'all') {
    query += ' AND property_type = ?';
    values.push(propertyType);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    values.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    values.push(maxPrice);
  }

  if (bedrooms) {
    query += ' AND bedrooms >= ?';
    values.push(bedrooms);
  }

  if (bathrooms) {
    query += ' AND bathrooms >= ?';
    values.push(bathrooms);
  }

  query += ' ORDER BY created_at DESC';

  return executeQuery<Property[]>({ query, values });
} 