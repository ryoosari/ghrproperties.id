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

// Use dynamic import with no SSR to avoid Leaflet's window dependency
const PropertyMapWithNoSSR = dynamic(
  () => import('./property-map'),
  { ssr: false }
);

export default function DynamicMap(props: DynamicMapProps) {
  return <PropertyMapWithNoSSR {...props} />;
}