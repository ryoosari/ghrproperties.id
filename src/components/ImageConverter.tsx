'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Declare global window interface for TypeScript
declare global {
  interface Window {
    convertImageUrl?: (url: string) => string;
    imageUrlMappings?: Record<string, string>;
  }
}

/**
 * Client-side component that loads and initializes the image converter
 * This ensures the image-converter.js script is properly loaded and initialized
 */
export default function ImageConverter() {
  // Helper function to safely convert image URLs
  const safelyConvertImage = (originalSrc: string): string => {
    if (typeof window !== 'undefined' && window.convertImageUrl && originalSrc) {
      return window.convertImageUrl(originalSrc);
    }
    return originalSrc;
  };

  useEffect(() => {
    // This function will run only on the client after hydration
    if (typeof window !== 'undefined') {
      // Check if image-converter.js script is already loaded
      if (!window.convertImageUrl) {
        console.log('Image converter not loaded yet, initializing manually');
        
        // Try to manually load the script if it's not already loaded
        const script = document.createElement('script');
        script.src = '/image-converter.js';
        script.async = true;
        document.body.appendChild(script);
        
        // Apply conversion to all images after script loads
        script.onload = () => {
          console.log('Image converter script loaded manually');
          
          if (window.convertImageUrl) {
            document.querySelectorAll('img').forEach(img => {
              const originalSrc = img.getAttribute('src');
              if (originalSrc && originalSrc.includes('localhost:1337/uploads/')) {
                const newSrc = safelyConvertImage(originalSrc);
                if (newSrc !== originalSrc) {
                  console.log('Converting image:', originalSrc, 'to', newSrc);
                  img.setAttribute('src', newSrc);
                }
              }
            });
          }
        };
      } else {
        console.log('Image converter already loaded, applying to all images');
        
        // Apply conversion to all images
        document.querySelectorAll('img').forEach(img => {
          const originalSrc = img.getAttribute('src');
          if (originalSrc && originalSrc.includes('localhost:1337/uploads/')) {
            const newSrc = safelyConvertImage(originalSrc);
            if (newSrc !== originalSrc) {
              console.log('Converting image:', originalSrc, 'to', newSrc);
              img.setAttribute('src', newSrc);
            }
          }
        });
      }
    }
  }, []);

  return (
    <>
      {/* Use Next.js Script component for better loading */}
      <Script 
        src="/image-converter.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Image converter script loaded via Next.js Script');
          
          if (typeof window !== 'undefined') {
            // Apply conversion to all images after script loads
            document.querySelectorAll('img').forEach(img => {
              const originalSrc = img.getAttribute('src');
              if (originalSrc && originalSrc.includes('localhost:1337/uploads/')) {
                const newSrc = safelyConvertImage(originalSrc);
                if (newSrc !== originalSrc) {
                  console.log('Converting image (via Next.js Script):', originalSrc, 'to', newSrc);
                  img.setAttribute('src', newSrc);
                }
              }
            });
          }
        }}
      />
    </>
  );
} 