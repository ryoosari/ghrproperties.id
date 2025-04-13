'use client';

import { useState } from 'react';

interface CopyLinkButtonProps {
  className?: string;
}

export default function CopyLinkButton({ className = '' }: CopyLinkButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setIsCopied(true);
          
          // Create a temporary element for a non-intrusive notification
          const notification = document.createElement('div');
          notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
          notification.textContent = 'Link copied to clipboard!';
          document.body.appendChild(notification);
          
          // Remove the notification after 2 seconds
          setTimeout(() => {
            notification.remove();
            // Reset copy state after a bit longer
            setTimeout(() => setIsCopied(false), 1000);
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy link: ', err);
        });
    }
  };

  return (
    <div className="relative group">
      <button 
        onClick={copyToClipboard}
        className={`p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ${className}`}
        aria-label="Copy link to clipboard"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
        Copy link
      </span>
    </div>
  );
} 