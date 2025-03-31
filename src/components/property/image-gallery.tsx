'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

interface ImageGalleryProps {
  featuredImage: string;
  galleryImages: string[];
  propertyTitle: string;
}

export default function PropertyImageGallery({ 
  featuredImage, 
  galleryImages, 
  propertyTitle 
}: ImageGalleryProps) {
  const allImages = [featuredImage, ...galleryImages.filter(img => img !== featuredImage)];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset refs array when images change
  useEffect(() => {
    thumbnailRefs.current = thumbnailRefs.current.slice(0, allImages.length);
  }, [allImages.length]);

  // Function to navigate to previous image
  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Function to navigate to next image
  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Function to handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Function to handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Function to handle touch end
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left, go to next
      nextImage();
    }
    
    if (touchStart - touchEnd < -50) {
      // Swipe right, go to previous
      prevImage();
    }
  };

  // Function to handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    scrollToThumbnail(index);
  };

  // Function to scroll thumbnails to keep active one visible
  const scrollToThumbnail = (index: number) => {
    if (thumbnailContainerRef.current && thumbnailRefs.current[index]) {
      const container = thumbnailContainerRef.current;
      const thumbnail = thumbnailRefs.current[index];
      if (thumbnail) {
        const scrollLeft = thumbnail.offsetLeft - container.offsetWidth / 2 + thumbnail.offsetWidth / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  // Scroll active thumbnail into view when current index changes
  useEffect(() => {
    scrollToThumbnail(currentIndex);
  }, [currentIndex]);

  // Function to toggle fullscreen lightbox
  const toggleLightbox = () => {
    setLightboxOpen(prev => !prev);
  };

  // Handle keydown events for navigation and closing lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <div className="relative">
      {/* Main Gallery View */}
      <div 
        className="relative h-[500px] overflow-hidden bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Image */}
        <div 
          className="w-full h-full flex items-center justify-center bg-black relative"
        >
          <img 
            src={allImages[currentIndex]} 
            alt={`${propertyTitle} - Image ${currentIndex + 1}`}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}
          />
          
          {/* Image Count Badge */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
          
          {/* Fullscreen Button */}
          <button 
            onClick={toggleLightbox}
            className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
            aria-label="View fullscreen"
          >
            <FaExpand />
          </button>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
          aria-label="Previous image"
        >
          <FaChevronLeft className="text-xl" />
        </button>
        
        <button 
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
          aria-label="Next image"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div 
        ref={thumbnailContainerRef}
        className="flex overflow-x-auto py-4 px-6 space-x-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hide-scrollbar"
      >
        {allImages.map((image, index) => (
          <div
            key={index}
            ref={(el) => {
              thumbnailRefs.current[index] = el;
              return undefined;
            }}
            onClick={() => handleThumbnailClick(index)}
            className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
              index === currentIndex 
                ? 'border-2 border-primary ring-2 ring-primary ring-opacity-50 transform scale-105' 
                : 'border border-gray-200 opacity-70 hover:opacity-100'
            }`}
            style={{ width: '100px', height: '80px' }}
          >
            <img 
              src={image} 
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button 
            onClick={toggleLightbox}
            className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Close fullscreen"
          >
            <span className="text-2xl font-thin">×</span>
          </button>
          
          <img 
            src={allImages[currentIndex]} 
            alt={`${propertyTitle} - Image ${currentIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <FaChevronLeft className="text-2xl" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-colors"
            aria-label="Next image"
          >
            <FaChevronRight className="text-2xl" />
          </button>
          
          {/* Thumbnails in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-[80vw]">
            {allImages.map((image, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-16 h-12 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-2 border-white opacity-100' 
                    : 'border border-white/50 opacity-60 hover:opacity-80'
                }`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add CSS for hiding scrollbar in modern browsers while keeping functionality */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
} 