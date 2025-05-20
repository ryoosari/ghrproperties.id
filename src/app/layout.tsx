import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
// Leaflet CSS will be loaded in the map component directly to avoid SSR issues
import { ThemeProvider } from '@/components/theme-provider';
import CacheRefresher from '@/components/CacheRefresher';
import { NoHydration } from '@/components/NoHydration';
import dynamic from 'next/dynamic';

// Import the ImageConverter component dynamically with no SSR
const ImageConverter = dynamic(() => import('@/components/ImageConverter'), { ssr: false });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'GHR Properties | Premium Real Estate Agency',
  description: 'Find your dream property with GHR Properties, your trusted real estate partner.',
  keywords: ['real estate', 'property', 'homes', 'apartments', 'land', 'GHR Properties'],
  authors: [{ name: 'GHR Properties' }],
  creator: 'GHR Properties',
  publisher: 'GHR Properties',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add the image converter script */}
        <script src="/image-converter.js" defer></script>
      </head>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <ThemeProvider>
          {/* Use NoHydration for maximum protection against hydration errors */}
          <NoHydration>
            <CacheRefresher />
          </NoHydration>
          
          {/* Add the ImageConverter component to fix image URLs client-side */}
          <ImageConverter />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
} 