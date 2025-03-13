import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Let us help you find the perfect property that meets all your requirements and preferences.
            Our expert team is ready to assist you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/properties" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-white text-primary hover:bg-white/90 h-11 px-8 w-full sm:w-auto"
            >
              Browse Properties
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-white text-white hover:bg-white/10 h-11 px-8 w-full sm:w-auto"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 