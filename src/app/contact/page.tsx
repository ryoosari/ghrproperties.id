import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaFacebookSquare, FaLinkedin } from 'react-icons/fa';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact Us | GHR Properties',
  description: 'Get in touch with GHR Properties for all your real estate needs. Our team is ready to assist you with finding your dream property.',
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We're here to help you with all your real estate needs. Reach out to our team
              and we'll get back to you as soon as possible.
            </p>
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">Contact</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Whether you're looking to buy, sell, or rent a property, our team of real estate experts
                is ready to assist you every step of the way. Reach out to us through any of the following channels.
              </p>
              
              <div className="space-y-6">
                {/* Primary Contact Method - WhatsApp */}
                <div className="flex items-start bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 text-white">
                    <FaWhatsapp className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">WhatsApp (Primary Contact)</h3>
                    <div className="bg-white p-2 rounded">
                      <p className="font-medium">Gland</p>
                      <a href="https://wa.me/6285222228182" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center">
                        +62 852-2222-8182
                      </a>
                    </div>
                    <p className="text-gray-600 mt-2">Quick response during business hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <FaPhone className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Phone</h3>
                    <p className="text-gray-600">Same as WhatsApp numbers above</p>
                    <p className="text-gray-600">Monday - Friday, 9am - 5pm WIB</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <FaEnvelope className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email</h3>
                    <p className="text-gray-600">info@ghrproperties.id</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Office</h3>
                    <p className="text-gray-600">
                      Jl. Example Street No. 123<br />
                      Jakarta Selatan, 12345<br />
                      Indonesia
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-bold mb-3">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://www.instagram.com/ghrproperties" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                      <FaInstagram />
                    </a>
                    <a href="https://www.facebook.com/ghrproperties" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <FaFacebookSquare />
                    </a>
                    <a href="https://www.linkedin.com/company/ghrproperties" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <FaLinkedin />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick WhatsApp Contact */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-green-200">
              <h2 className="text-2xl font-heading font-bold mb-4">Contact Us via WhatsApp</h2>
              <p className="text-gray-600 mb-6">
                For the fastest response, contact our agents directly through WhatsApp. 
                Simply click on one of the buttons below to start a conversation.
              </p>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FaWhatsapp className="text-green-500 mr-2" size={24} />
                    <h3 className="text-lg font-bold">Contact Gland</h3>
                  </div>
                  <p className="text-gray-600 mb-3">Property advisor for all your real estate needs</p>
                  <a 
                    href="https://wa.me/6285222228182?text=Hello%2C%20I'm%20interested%20in%20a%20property%20from%20GHR%20Properties%20website." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md transition-colors"
                  >
                    <FaWhatsapp className="mr-2" />
                    WhatsApp: +62 852-2222-8182
                  </a>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-4">Email Contact Form</h3>
                <p className="text-gray-600 mb-4">If you prefer email, fill out this form and we'll get back to you:</p>
                
                <form>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name*
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject*
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="buy">I want to buy a property</option>
                      <option value="sell">I want to sell a property</option>
                      <option value="rent">I want to rent a property</option>
                      <option value="invest">I'm interested in investment opportunities</option>
                      <option value="other">Other inquiry</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    By submitting this form, you agree to our{' '}
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Find Our Office</h2>
          <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
            {/* Replace with actual Google Maps embed */}
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <p className="text-gray-600">Google Maps will be embedded here</p>
              {/* To add a Google Map, replace the div above with:
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!....YOUR_EMBED_URL_HERE" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe> */}
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Find quick answers to common questions about our services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">How do I schedule a property viewing?</h3>
              <p className="text-gray-600">
                You can schedule a property viewing by contacting us through our contact form, giving us a call, 
                or sending us an email with your preferred date and time. Our team will get back to you promptly 
                to confirm the appointment.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">What documents do I need to buy a property?</h3>
              <p className="text-gray-600">
                The required documents typically include identification (KTP/passport), Tax ID (NPWP), 
                proof of income, and marriage certificate (if applicable). Our team will guide you through 
                the specific requirements based on your situation.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">Do you handle property management?</h3>
              <p className="text-gray-600">
                Yes, we offer comprehensive property management services including tenant screening, 
                rent collection, maintenance coordination, and regular property inspections. Contact us 
                for a customized property management plan.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">What areas do you cover?</h3>
              <p className="text-gray-600">
                We currently focus on properties in Jakarta, Bandung, Surabaya, and Bali. However, 
                we can also assist with properties in other major cities in Indonesia through our 
                network of partners.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}