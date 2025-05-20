'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Client-side image component that can handle loading errors
 */
export default function ClientImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={true}
      className={className}
      onError={() => {
        console.error('Image failed to load:', src);
        setError(true);
      }}
    />
  );
} 