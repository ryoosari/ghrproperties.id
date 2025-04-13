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
  const [lastTapTime, setLastTapTime] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainImageRef = useRef<HTMLImageElement>(null);

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

  // Function to handle double tap on the main image
  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      // Double tap detected
      toggleLightbox();
    }
    
    setLastTapTime(now);
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
      // Always enable arrow navigation regardless of lightbox state
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      
      // Lightbox specific controls
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
      } else {
        // When lightbox is closed but focused on main image
        if (e.key === 'Enter' && document.activeElement === mainImageRef.current) {
          toggleLightbox();
        }
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

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    const preloadImages = () => {
      const nextIdx = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
      const prevIdx = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
      
      [nextIdx, prevIdx].forEach(idx => {
        const img = new Image();
        img.src = allImages[idx];
      });
    };
    
    preloadImages();
  }, [currentIndex, allImages]);
  
  return (
    <div className="relative">
      {/* Main Gallery View */}
      <div 
        className="relative h-[450px] md:h-[500px] lg:h-[550px] overflow-hidden bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Image with Background Blur */}
        <div className="absolute inset-0 z-0" style={{ 
          backgroundImage: `url(${allImages[currentIndex]})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(15px)',
          opacity: 0.25,
          transform: 'scale(1.1)'
        }}></div>
        
        {/* Current Image */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          <img 
            ref={mainImageRef}
            src={allImages[currentIndex]} 
            alt={`${propertyTitle} - Image ${currentIndex + 1}`}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}
            onClick={handleImageTap}
            onKeyDown={(e) => e.key === 'Enter' && toggleLightbox()}
            tabIndex={0}
            role="button"
            aria-label={`View ${propertyTitle} image ${currentIndex + 1} of ${allImages.length}. Press Enter to view fullscreen`}
          />
          
          {/* Image Count Badge */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
          
          {/* Fullscreen Button */}
          <button 
            onClick={toggleLightbox}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-gray-800 p-2 rounded-full hover:bg-white/90 transition-colors shadow-sm"
            aria-label="View fullscreen"
          >
            <FaExpand />
          </button>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-800 p-3 rounded-full transition-colors z-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Previous image"
        >
          <FaChevronLeft className="text-xl" />
        </button>
        
        <button 
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-800 p-3 rounded-full transition-colors z-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Next image"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div 
        ref={thumbnailContainerRef}
        className="flex overflow-x-auto py-4 px-6 space-x-3 hide-scrollbar bg-white border-t border-gray-100"
        role="tablist"
        aria-label="Property image thumbnails"
      >
        {allImages.map((image, index) => (
          <div
            key={index}
            ref={(el) => {
              thumbnailRefs.current[index] = el;
              return undefined;
            }}
            onClick={() => handleThumbnailClick(index)}
            onKeyDown={(e) => e.key === 'Enter' && handleThumbnailClick(index)}
            className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
              index === currentIndex 
                ? 'border-2 border-primary ring-2 ring-primary ring-opacity-50 shadow-md transform translate-y-[-4px]' 
                : 'border border-gray-200 opacity-70 hover:opacity-100 hover:shadow-sm'
            }`}
            style={{ width: '100px', height: '70px' }}
            role="tab"
            tabIndex={0}
            aria-selected={index === currentIndex}
            aria-label={`Thumbnail ${index + 1} of ${allImages.length}`}
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
        <div 
          className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image gallery"
        >
          {/* Blurred background of current image */}
          <div className="absolute inset-0 z-0 opacity-20" style={{ 
            backgroundImage: `url(${allImages[currentIndex]})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px)',
            transform: 'scale(1.2)'
          }}></div>
          
          <button 
            onClick={toggleLightbox}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close fullscreen"
          >
            <span className="text-2xl font-thin">×</span>
          </button>
          
          <div className="relative z-10 flex items-center justify-center w-full h-full max-w-7xl mx-auto px-4">
            <img 
              src={allImages[currentIndex]} 
              alt={`${propertyTitle} - Image ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
          
          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <FaChevronLeft className="text-2xl" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <FaChevronRight className="text-2xl" />
          </button>
          
          {/* Thumbnails in lightbox */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-[90vw] py-2 px-4 bg-black/40 backdrop-blur-md rounded-full"
            role="tablist"
            aria-label="Property image thumbnails in fullscreen view"
          >
            {allImages.map((image, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                onKeyDown={(e) => e.key === 'Enter' && handleThumbnailClick(index)}
                className={`w-12 h-12 rounded-full flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-2 border-white opacity-100 scale-110' 
                    : 'border border-white/40 opacity-60 hover:opacity-90 hover:scale-105'
                }`}
                role="tab"
                tabIndex={0}
                aria-selected={index === currentIndex}
                aria-label={`Thumbnail ${index + 1} of ${allImages.length}`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            ))}
          </div>
          
          {/* Image count in lightbox */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allImages.length}
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