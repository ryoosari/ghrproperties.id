
/**
 * Image URL Converter
 * 
 * This script converts Strapi image URLs to local URLs based on the mappings.
 * Include this script in your HTML to use the convertImageUrl function.
 */
window.imageUrlMappings = {"http://localhost:1337/uploads/large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg":"/property-images/3br-villa-in-seminyak/large-large_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg","http://localhost:1337/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg":"/property-images/3br-villa-in-seminyak/medium-medium_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg","http://localhost:1337/uploads/small_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg":"/property-images/3br-villa-in-seminyak/small-small_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg","http://localhost:1337/uploads/thumbnail_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg":"/property-images/3br-villa-in-seminyak/thumbnail-thumbnail_Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg","http://localhost:1337/uploads/Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg":"/property-images/3br-villa-in-seminyak/original-Whats_App_Image_2025_03_07_at_12_21_31_1_c23417a133.jpeg","http://localhost:1337/uploads/large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg":"/property-images/3br-villa-in-seminyak/large-large_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg","http://localhost:1337/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg":"/property-images/3br-villa-in-seminyak/medium-medium_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg","http://localhost:1337/uploads/small_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg":"/property-images/3br-villa-in-seminyak/small-small_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg","http://localhost:1337/uploads/thumbnail_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg":"/property-images/3br-villa-in-seminyak/thumbnail-thumbnail_Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg","http://localhost:1337/uploads/Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg":"/property-images/3br-villa-in-seminyak/original-Whats_App_Image_2025_03_07_at_12_21_30_b6edab17a8.jpeg","http://localhost:1337/uploads/large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg":"/property-images/3br-villa-in-seminyak/large-large_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg","http://localhost:1337/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg":"/property-images/3br-villa-in-seminyak/medium-medium_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg","http://localhost:1337/uploads/small_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg":"/property-images/3br-villa-in-seminyak/small-small_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg","http://localhost:1337/uploads/thumbnail_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg":"/property-images/3br-villa-in-seminyak/thumbnail-thumbnail_Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg","http://localhost:1337/uploads/Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg":"/property-images/3br-villa-in-seminyak/original-Whats_App_Image_2025_03_07_at_12_21_29_e9f78a50ac.jpeg","http://localhost:1337/uploads/large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg":"/property-images/3br-villa-in-seminyak/large-large_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg","http://localhost:1337/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg":"/property-images/3br-villa-in-seminyak/medium-medium_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg","http://localhost:1337/uploads/small_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg":"/property-images/3br-villa-in-seminyak/small-small_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg","http://localhost:1337/uploads/thumbnail_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg":"/property-images/3br-villa-in-seminyak/thumbnail-thumbnail_Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg","http://localhost:1337/uploads/Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg":"/property-images/3br-villa-in-seminyak/original-Whats_App_Image_2025_03_07_at_12_21_30_1_d38d7f4414.jpeg","http://localhost:1337/uploads/large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg":"/property-images/3br-villa-in-seminyak/large-large_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg","http://localhost:1337/uploads/medium_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg":"/property-images/3br-villa-in-seminyak/medium-medium_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg","http://localhost:1337/uploads/small_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg":"/property-images/3br-villa-in-seminyak/small-small_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg","http://localhost:1337/uploads/thumbnail_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg":"/property-images/3br-villa-in-seminyak/thumbnail-thumbnail_Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg","http://localhost:1337/uploads/Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg":"/property-images/3br-villa-in-seminyak/original-Whats_App_Image_2025_03_07_at_12_21_31_f93b813cd5.jpeg"};

/**
 * Convert a Strapi image URL to a local URL
 * @param {string} originalUrl - The original Strapi URL
 * @returns {string} - The local URL or the original URL if no mapping exists
 */
window.convertImageUrl = function(originalUrl) {
  // If the URL is already local, return it as is
  if (originalUrl && (originalUrl.startsWith('/property-images/') || !originalUrl.includes('http://localhost:1337'))) {
    return originalUrl;
  }
  
  // Check if there's a mapping for this URL
  const localUrl = window.imageUrlMappings[originalUrl];
  
  // Return the local URL if it exists, otherwise return the original URL
  return localUrl || originalUrl;
};

// Automatically convert all image sources on the page
window.addEventListener('load', function() {
  document.querySelectorAll('img').forEach(img => {
    const originalSrc = img.getAttribute('src');
    if (originalSrc) {
      const newSrc = window.convertImageUrl(originalSrc);
      if (newSrc !== originalSrc) {
        img.setAttribute('src', newSrc);
      }
    }
  });
});
  