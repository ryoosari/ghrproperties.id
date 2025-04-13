/**
 * Utility functions for formatting different types of data
 */

/**
 * Format a number as a currency with the specified locale and currency code
 */
export function formatCurrency(amount: number, locale: string = 'id-ID', currency: string = 'IDR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a price with additional options like displaying as "Contact for Price" for 0 values
 */
export function formatPrice(price: number | string, showPrefix: boolean = true): string {
  if (!price || price === 0 || price === '0') {
    return 'Contact for Price';
  }
  
  const numericPrice = typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, ''), 10) : price;
  
  if (isNaN(numericPrice)) {
    return 'Contact for Price';
  }
  
  return showPrefix ? formatCurrency(numericPrice) : new Intl.NumberFormat('id-ID').format(numericPrice);
}

/**
 * Truncate text to a specific length and add ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Convert a Strapi media URL to a full URL
 */
export function getStrapiMediaUrl(url: string): string {
  if (!url) return '';
  
  // Check if the URL is already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, prepend the Strapi URL
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  return `${strapiUrl}${url}`;
} 