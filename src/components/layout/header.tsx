"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaPhone, FaEnvelope } from 'react-icons/fa';
import { cn } from '@/utils/cn';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Properties', href: '/properties' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 relative mr-2">
              <Image 
                src="/images/logo.png" 
                alt="GHR Properties Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={cn(
              "font-heading font-bold text-xl transition-colors",
              isScrolled ? "text-gray-900 dark:text-white" : "text-white"
            )}>
              GHR Properties
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? isScrolled
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'bg-white/20 text-white font-semibold backdrop-blur-sm shadow-sm'
                  : isScrolled
                  ? 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pl-4">
            <ThemeToggle />
          </div>
        </nav>

        {/* Contact Info */}
        <div className="hidden lg:flex items-center space-x-4">
          <a 
            href="tel:+1234567890" 
            className={cn(
              "flex items-center text-sm transition-colors",
              isScrolled ? "text-gray-700 dark:text-gray-200" : "text-white/90"
            )}
          >
            <FaPhone className="mr-2" />
            <span>+1 (234) 567-890</span>
          </a>
          <a 
            href="mailto:info@ghrproperties.id" 
            className={cn(
              "flex items-center text-sm transition-colors",
              isScrolled ? "text-gray-700 dark:text-gray-200" : "text-white/90"
            )}
          >
            <FaEnvelope className="mr-2" />
            <span>info@ghrproperties.id</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isMobileMenuOpen ? (
            <FaTimes className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <FaBars 
              className={cn(
                "block h-6 w-6", 
                isScrolled ? "text-gray-900 dark:text-white" : "text-white"
              )} 
              aria-hidden="true" 
            />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md transform transition-transform ease-in-out duration-300',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-6 border-b border-gray-700">
          <Link href="/" className="relative z-10" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center">
              <div className="w-10 h-10 relative mr-2">
                <Image 
                  src="/images/logo.png" 
                  alt="GHR Properties Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                GHR Properties
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <FaTimes className="block h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="px-4 pt-6 pb-8 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block px-4 py-3 rounded-md text-base font-medium transition-colors',
                pathname === item.href
                  ? 'bg-gray-800/80 text-primary-300 border-l-4 border-primary-500'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex justify-between items-center px-4">
            <ThemeToggle />
            <div className="flex flex-col space-y-2">
              <a href="tel:+1234567890" className="flex items-center text-sm text-gray-300">
                <FaPhone className="mr-2" />
                <span>+1 (234) 567-890</span>
              </a>
              <a href="mailto:info@ghrproperties.id" className="flex items-center text-sm text-gray-300">
                <FaEnvelope className="mr-2" />
                <span>info@ghrproperties.id</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
} 