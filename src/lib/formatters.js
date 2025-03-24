/**
 * Formatting utilities for different data types
 */

/**
 * Format a price value to currency
 * 
 * @param {number|string} price - Price value to format
 * @param {string} currency - Currency code (default: 'IDR')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = 'IDR') {
  if (!price && price !== 0) return 'Price on request';
  
  try {
    const numPrice = Number(price);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(numPrice);
  } catch (error) {
    console.error('Error formatting price:', error);
    return String(price);
  }
}

/**
 * Format a date string to a readable format
 * 
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, locale = 'en-US') {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Truncate text to a maximum length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format a number with units (e.g. for square footage)
 * 
 * @param {number|string} value - Value to format
 * @param {string} unit - Unit to append (e.g. 'm²')
 * @returns {string} Formatted value with unit
 */
export function formatWithUnit(value, unit = '') {
  if (!value && value !== 0) return 'N/A';
  
  return `${value} ${unit}`.trim();
}

/**
 * Safe getter for nested object properties
 * 
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot notation path to property
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} Property value or default
 */
export function getProp(obj, path, defaultValue = null) {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
} 