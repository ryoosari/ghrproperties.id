import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  properties: [
    { name: 'Residential', href: '/properties?type=residential' },
    { name: 'Commercial', href: '/properties?type=commercial' },
    { name: 'Luxury', href: '/properties?type=luxury' },
    { name: 'New Developments', href: '/properties?type=new-developments' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/about#team' },
    { name: 'Careers', href: '/careers' },
    { name: 'Testimonials', href: '/testimonials' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: FaFacebook,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: FaTwitter,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: FaInstagram,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: FaLinkedin,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
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
            <p className="text-gray-300 text-base">
              Your trusted partner in finding exceptional properties and making informed real estate decisions.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Properties</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.properties.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Company</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Location</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <div className="text-base text-gray-300 flex items-start">
                      <FaMapMarkerAlt className="h-5 w-5 mr-2 text-gray-400 mt-1" />
                      <span>123 Property Street<br />Real Estate City, 12345<br />Country</span>
                    </div>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-primary hover:text-primary-light">
                      Visit our Contact page
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} GHR Properties. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 