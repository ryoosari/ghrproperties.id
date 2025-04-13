'use client';

import { useState } from 'react';

export default function SaveButton() {
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = () => {
    setIsSaved(prevState => !prevState);
  };

  return (
    <button 
      onClick={toggleSave}
      className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 mr-2 ${isSaved ? 'text-red-500 fill-current' : 'text-red-500'}`} 
        viewBox="0 0 20 20" 
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
          clipRule="evenodd" 
        />
      </svg>
      Save to Favorites
    </button>
  );
} 