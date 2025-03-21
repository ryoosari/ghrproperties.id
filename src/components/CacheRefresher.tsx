'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { refreshCache } from '@/utils/cache';

/**
 * Component that refreshes the browser cache when:
 * 1. A user navigates to a different page
 * 2. The browser is refreshed
 */
export default function CacheRefresher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRenderRef = useRef(true);
  const previousPath = useRef<string | null>(null);

  // Handle navigation between pages
  useEffect(() => {
    // Create a string representation of the current URL (path + query params)
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Skip the first render as this is the initial page load
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      previousPath.current = currentUrl;
      return;
    }
    
    // If the path has changed (navigation occurred), refresh the cache
    if (previousPath.current !== currentUrl) {
      refreshCache();
      previousPath.current = currentUrl;
    }
  }, [pathname, searchParams]);

  // Handle browser refresh
  useEffect(() => {
    // Function to run when the page is being refreshed or unloaded
    const handleBeforeUnload = () => {
      try {
        // Store a timestamp in session storage to detect page refresh
        sessionStorage.setItem('page_refresh_time', Date.now().toString());
      } catch (error) {
        console.error('Error setting session storage:', error);
      }
    };

    // Function to check if this is a page refresh
    const checkPageRefresh = () => {
      try {
        const refreshTime = sessionStorage.getItem('page_refresh_time');
        if (refreshTime) {
          // Clear the timestamp
          sessionStorage.removeItem('page_refresh_time');
          
          // If the timestamp exists and is recent (within the last 3 seconds),
          // this is considered a page refresh
          const timeDiff = Date.now() - parseInt(refreshTime, 10);
          if (timeDiff < 3000) {
            refreshCache();
          }
        }
      } catch (error) {
        console.error('Error checking page refresh:', error);
      }
    };

    // Add event listener for page unload/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if this page load is a refresh
    checkPageRefresh();

    // Clean up event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
} 