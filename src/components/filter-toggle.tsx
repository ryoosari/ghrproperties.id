'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FilterToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilters = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Toggle the visibility of advanced filters
    const advancedFilters = document.getElementById('advanced-filters');
    if (advancedFilters) {
      if (!newState) {
        advancedFilters.classList.add('hidden');
      } else {
        advancedFilters.classList.remove('hidden');
      }
    }
  };

  return (
    <button 
      className="inline-flex items-center px-4 py-2 border border-primary bg-white text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
      onClick={toggleFilters}
      aria-expanded={isOpen}
      aria-controls="advanced-filters"
    >
      <span className="text-sm font-medium mr-1">Advanced Filters</span>
      {isOpen ? (
        <FaChevronUp className="h-4 w-4" />
      ) : (
        <FaChevronDown className="h-4 w-4" />
      )}
    </button>
  );
}