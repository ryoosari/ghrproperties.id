'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Define the props interface
interface DynamicMapProps {
  propertyData: {
    title: string;
    latitude?: number | null;
    longitude?: number | null;
    location?: string;
    address?: string;
  };
  height?: string;
  estimateRadius?: number;
}

// Dynamically import the PropertyMap component with SSR disabled
// This is necessary because Mapbox GL JS requires browser APIs
const PropertyMap = dynamic(() => import('./property-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '400px' }}>
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function DynamicMap(props: DynamicMapProps) {
  return <PropertyMap {...props} />;
}