import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import CacheRefresher from '@/components/CacheRefresher';
import { NoHydration } from '@/components/NoHydration';

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
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {/* Use NoHydration for maximum protection against hydration errors */}
          <NoHydration>
            <CacheRefresher />
          </NoHydration>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
} 