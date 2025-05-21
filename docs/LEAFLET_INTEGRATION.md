# Leaflet Map Integration for Property Locations

This document explains how the property location mapping system works in this application.

## Overview

The application uses Leaflet with OpenStreetMap tiles to display property locations. This approach provides:

1. Interactive map features (zoom, pan, click)
2. No API key requirements
3. Consistent visual styling across all environments
4. Ability to display both exact and approximate locations

## Location Determination Logic

The system determines the property location using this hierarchy:

1. **Exact Coordinates**: If a property has explicit latitude and longitude values, the map centers on these coordinates and displays a marker with popup information.

2. **Location String Matching**: If coordinates are not available, the system approximates the location based on the property's location string (e.g., "Seminyak, Bali") using the location database defined in `src/components/property-map.tsx`.

3. **Fallback**: If no location information is available, a default center point of Bali is used.

## Location Database

The location database includes coordinates for:
- Main regions of Bali (Seminyak, Kuta, Ubud, Canggu, etc.)
- Key tourist areas and neighborhoods
- Default fallback center point

## User Experience

For properties with exact coordinates:
- A marker is shown at the exact location
- A popup displays the property title and address
- The map is zoomed in closer (zoom level 15)
- The UI indicates "Exact coordinates available"

For properties with approximate locations:
- A blue circle shows the general area
- A popup informs users that the location is approximate
- The text "For exact location, please contact our agents" is displayed
- The map is zoomed out slightly (zoom level 13)
- The UI displays a warning that the location is approximate

## Technical Implementation

The map component is implemented with the following considerations:

1. **Client-Side Rendering**: The map is loaded only on the client side using Next.js dynamic imports with `{ ssr: false }` to avoid server-side rendering issues.

2. **Icon Path Fixes**: Leaflet icon paths are manually specified to ensure markers display correctly.

3. **Cleanup**: The component includes proper cleanup to remove map instances when the component unmounts.

4. **Responsive Design**: The map container adapts to various screen sizes.

## Static Export Considerations

When using static export with Next.js:

- The map will initially be invisible until JavaScript loads
- A placeholder might be shown temporarily
- The map will become interactive once the page is hydrated

## Dependencies

This implementation relies on:
- `leaflet`: ^1.9.4
- `react-leaflet`: ^4.2.1

## Maintenance

To add new locations to the database:
1. Open `src/components/property-map.tsx`
2. Locate the `BALI_LOCATIONS` constant
3. Add new entries following the existing format:
   ```ts
   'LocationName': { lat: -8.1234, lng: 115.1234 }
   ```