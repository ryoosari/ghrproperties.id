/**
 * Cache utility functions for handling browser cache refreshing
 */

/**
 * Forces the browser to reload all cached resources by appending a timestamp to URLs
 * This function can be called when navigating between pages or when the page refreshes
 */
export const refreshCache = (): void => {
  // Make sure we're in the browser and window is defined
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const timestamp = Date.now().toString();

    // Simple approach to add timestamp to images
    const images = document.querySelectorAll('img');
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        try {
          const img = images[i];
          if (img.src && !img.src.includes('data:')) {
            const urlObj = new URL(img.src, window.location.origin);
            urlObj.searchParams.set('_t', timestamp);
            img.src = urlObj.toString();
          }
        } catch (err) {
          // Silently continue if one image fails
        }
      }
    }

    // Only try to update stylesheets if they exist
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    if (stylesheets && stylesheets.length > 0) {
      for (let i = 0; i < stylesheets.length; i++) {
        try {
          const link = stylesheets[i] as HTMLLinkElement;
          if (link.href && !link.href.includes('data:')) {
            const urlObj = new URL(link.href, window.location.origin);
            urlObj.searchParams.set('_t', timestamp);
            
            // Create new link without removing old one immediately
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = urlObj.toString();
            
            // Only remove old link once new one has loaded
            if (link.parentNode) {
              newLink.onload = function() {
                setTimeout(function() {
                  try {
                    if (link.parentNode) {
                      link.parentNode.removeChild(link);
                    }
                  } catch (e) {
                    // Ignore errors on removal
                  }
                }, 0);
              };
              
              link.parentNode.insertBefore(newLink, link.nextSibling);
            }
          }
        } catch (err) {
          // Silently continue if one stylesheet fails
        }
      }
    }

    // More cautious approach with scripts - only refresh if needed
    const scripts = document.querySelectorAll('script[src]');
    if (scripts && scripts.length > 0) {
      for (let i = 0; i < scripts.length; i++) {
        try {
          const script = scripts[i] as HTMLScriptElement;
          // Skip critical scripts to avoid breaking the page
          if (script.src && 
              !script.src.includes('data:') && 
              !script.src.includes('webpack') && 
              !script.src.includes('chunk') &&
              !script.src.includes('main')) {
                
            const urlObj = new URL(script.src, window.location.origin);
            urlObj.searchParams.set('_t', timestamp);
            
            // Only replace non-essential scripts
            if (!script.id || !script.id.includes('__NEXT')) {
              const newScript = document.createElement('script');
              newScript.src = urlObj.toString();
              if (script.integrity) newScript.integrity = script.integrity;
              if (script.crossOrigin) newScript.crossOrigin = script.crossOrigin;
              newScript.async = script.async;
              newScript.defer = script.defer;
              
              if (script.parentNode) {
                script.parentNode.replaceChild(newScript, script);
              }
            }
          }
        } catch (err) {
          // Silently continue if one script fails
        }
      }
    }

    // Log success but not in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cache refreshed at:', new Date().toLocaleTimeString());
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error during cache refresh:', error);
    }
  }
}; 