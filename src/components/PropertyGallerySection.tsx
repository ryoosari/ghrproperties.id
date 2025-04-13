'use client';

import dynamic from 'next/dynamic';

// Import image gallery component dynamically
const PropertyImageGallery = dynamic(() => import('@/components/property/image-gallery'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] md:h-[500px] lg:h-[550px] bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm text-gray-500 animate-pulse">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading image gallery...</span>
        </div>
      </div>
    </div>
  )
});

interface PropertyGallerySectionProps {
  featuredImage: string;
  galleryImages: string[];
  propertyTitle: string;
}

export default function PropertyGallerySection({ 
  featuredImage, 
  galleryImages, 
  propertyTitle 
}: PropertyGallerySectionProps) {
  if (!featuredImage && (!galleryImages || galleryImages.length === 0)) {
    return (
      <div className="p-6 border-b">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Property Images</h2>
          <div className="bg-gray-50 h-[400px] flex flex-col items-center justify-center rounded-lg border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400 text-lg">No images available</span>
            <p className="text-gray-400 text-sm mt-2 max-w-sm text-center">
              Please contact our agents for more visual information about this property.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 border-b">
      <PropertyImageGallery 
        featuredImage={featuredImage}
        galleryImages={galleryImages}
        propertyTitle={propertyTitle}
      />
    </div>
  );
} 