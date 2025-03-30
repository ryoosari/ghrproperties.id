'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    // Dynamically load Leaflet and initialize map
    if (mapRef.current && !mapInstanceRef.current) {
      // Fix Leaflet icon paths
      // This is needed because Leaflet's CSS assumes these icons are in the same directory as the CSS
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      
      // Determine if we have exact coordinates
      const hasExactCoordinates = 
        propertyData.latitude != null && 
        propertyData.longitude != null && 
        !isNaN(propertyData.latitude) && 
        !isNaN(propertyData.longitude);
      
      // Get coordinates - either exact or approximated
      let latitude: number;
      let longitude: number;
      
      if (hasExactCoordinates) {
        latitude = propertyData.latitude as number;
        longitude = propertyData.longitude as number;
      } else {
        // Get approximate coordinates from location
        const approximateCoords = getApproximateCoordinates(propertyData.location || propertyData.address);
        latitude = approximateCoords.lat;
        longitude = approximateCoords.lng;
      }
      
      // Create map
      const map = L.map(mapRef.current).setView([latitude, longitude], hasExactCoordinates ? 15 : 13);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      if (hasExactCoordinates) {
        // Add marker for exact location
        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(`<b>${propertyData.title}</b><br>${propertyData.address || propertyData.location || 'Unknown location'}`)
          .openPopup();
      } else {
        // Add circle for approximate location
        L.circle([latitude, longitude], {
          color: 'rgba(66, 133, 244, 0.6)',
          fillColor: 'rgba(66, 133, 244, 0.2)',
          fillOpacity: 0.5,
          radius: estimateRadius
        }).addTo(map);
        
        // Add popup for approximate location
        L.popup()
          .setLatLng([latitude, longitude])
          .setContent(`<b>${propertyData.title}</b><br>Approximate location: ${propertyData.address || propertyData.location || 'Unknown location'}<br><i>Contact agent for exact location</i>`)
          .openOn(map);
      }
      
      mapInstanceRef.current = map;
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertyData, height, estimateRadius]);
  
  return (
    <div style={{ width: '100%', height, position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}