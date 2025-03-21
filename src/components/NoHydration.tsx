'use client';

import { useEffect, useState, ReactNode } from 'react';

interface NoHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that skips hydration completely and only renders children on the client side.
 * This is a more aggressive approach than ClientOnly for components that absolutely cannot be hydrated.
 */
export function NoHydration({ children, fallback = null }: NoHydrationProps) {
  const [mounted, setMounted] = useState(false);

  // Only show children after component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Never attempt to hydrate this component content
  // This leverages React's ability to suppress hydration warnings
  if (!mounted) {
    return (
      <div suppressHydrationWarning style={{ display: 'none' }}>
        {fallback}
      </div>
    );
  }
  
  return <>{children}</>;
} 