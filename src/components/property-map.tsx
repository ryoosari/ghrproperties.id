'use client';

import React, { useEffect, useRef, useState } from 'react';

// Bali location database - approximate coordinates for common areas
const BALI_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  // Main Regions
  'Seminyak': { lat: -8.6913, lng: 115.1682 },
  'Kuta': { lat: -8.7214, lng: 115.1722 },
  'Ubud': { lat: -8.5069, lng: 115.2625 },
  'Canggu': { lat: -8.6478, lng: 115.1385 },
  'Sanur': { lat: -8.6788, lng: 115.2636 },
  'Denpasar': { lat: -8.6705, lng: 115.2126 },
  'Nusa Dua': { lat: -8.8008, lng: 115.2317 },
  'Jimbaran': { lat: -8.7908, lng: 115.1576 },
  'Legian': { lat: -8.7052, lng: 115.1710 },
  'Uluwatu': { lat: -8.8291, lng: 115.0849 },
  'Tabanan': { lat: -8.5446, lng: 115.1321 },
  'Amed': { lat: -8.3297, lng: 115.6374 },
  'Lovina': { lat: -8.1566, lng: 115.0255 },
  'Candidasa': { lat: -8.5012, lng: 115.5570 },
  'Padang Bai': { lat: -8.5308, lng: 115.5126 },
  // Default center of Bali
  'Bali': { lat: -8.3405, lng: 115.0920 }
};

interface PropertyMapProps {
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

// Function to get better approximate coordinates from location string
function getApproximateCoordinates(location: string | undefined): { lat: number; lng: number } {
  if (!location) return BALI_LOCATIONS['Bali']; // Default to Bali center
  
  // Clean up location string
  const cleanLocation = location.trim();
  
  // Check for exact matches
  for (const [key, coords] of Object.entries(BALI_LOCATIONS)) {
    if (cleanLocation.includes(key)) {
      return coords;
    }
  }
  
  // Handle compound location strings (e.g., "Villa in Seminyak, Bali")
  for (const [key, coords] of Object.entries(BALI_LOCATIONS)) {
    if (cleanLocation.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }
  
  // Default to Bali center if no match found
  return BALI_LOCATIONS['Bali'];
}

export default function PropertyMap({ 
  propertyData, 
  height = '400px',
  estimateRadius = 300
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log("PropertyMap component received data:", JSON.stringify(propertyData, null, 2));
  }, [propertyData]);
  
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Clear any previous content
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
    
    // Use Google Maps for reliability
    if (mapRef.current) {
      try {
        // Determine if we have exact coordinates
        const hasExactCoordinates = 
          propertyData.latitude != null && 
          propertyData.longitude != null && 
          !isNaN(propertyData.latitude) && 
          !isNaN(propertyData.longitude) &&
          // Additional check to ensure we're not getting zero values
          (propertyData.latitude !== 0 && propertyData.longitude !== 0);
        
        // Get coordinates - either exact or approximated
        let latitude: number;
        let longitude: number;
        
        // Special case for specific properties with known coordinates
        const knownProperties: Record<string, { lat: number; lng: number }> = {
          "Vero Selaras": { lat: -8.555088, lng: 115.270384 }
        };
        
        // Check if this is a property with known coordinates
        const propertyTitle = propertyData.title || '';
        const knownProperty = Object.keys(knownProperties).find(key => 
          propertyTitle.includes(key)
        );
        
        if (knownProperty) {
          // Use the known coordinates for this property
          latitude = knownProperties[knownProperty].lat;
          longitude = knownProperties[knownProperty].lng;
          console.log(`Using known coordinates for ${knownProperty}: ${latitude}, ${longitude}`);
        } else if (hasExactCoordinates) {
          // Use the exact coordinates provided
          latitude = propertyData.latitude as number;
          longitude = propertyData.longitude as number;
          console.log(`Using exact coordinates: ${latitude}, ${longitude}`);
        } else {
          // Get approximate coordinates from location
          const approximateCoords = getApproximateCoordinates(propertyData.location || propertyData.address);
          latitude = approximateCoords.lat;
          longitude = approximateCoords.lng;
          console.log(`Using approximate coordinates from location: ${latitude}, ${longitude}`);
        }
        
        console.log(`Final coordinates used for map: ${latitude}, ${longitude}`);
        
        // Create iframe with Google Maps
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.setAttribute('allowfullscreen', 'true');
        
        // Set the source URL for Google Maps
        const zoom = (hasExactCoordinates || knownProperty) ? 15 : 13;
        iframe.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
        console.log("Map iframe source:", iframe.src);
        
        // Add iframe to container
        mapRef.current.appendChild(iframe);
        setMapLoaded(true);
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please try again later.');
      }
    }
  }, [propertyData, height, estimateRadius]);
  
  return (
    <div style={{ width: '100%', height, position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
        {/* Map will be inserted here */}
      </div>
      {mapError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <p style={{ color: '#e53e3e', marginBottom: '8px' }}>{mapError}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Please try refreshing the page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
