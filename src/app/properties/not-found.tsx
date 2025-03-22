import Link from 'next/link';
import { FaHome, FaSearch } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function PropertyNotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      <section className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-primary/10 p-6 rounded-full inline-flex justify-center items-center mb-8">
            <FaHome className="text-primary text-5xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Property Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            We couldn't find the property you're looking for. It may have been removed or the URL might be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/properties" 
              className="bg-primary text-white py-3 px-8 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Browse Properties
            </Link>
            <Link 
              href="/" 
              className="bg-white border border-gray-300 text-gray-700 py-3 px-8 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 