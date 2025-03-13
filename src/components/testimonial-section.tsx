import Image from 'next/image';
import { FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    content:
      "GHR Properties helped me find my dream home in just two weeks. Their team was professional, knowledgeable, and truly cared about my needs. I couldn't be happier with my new home!",
    author: "Sarah Johnson",
    position: "Homeowner",
    image: "/images/testimonial-1.jpg",
  },
  {
    id: 2,
    content:
      "As an investor, I've worked with many real estate agencies, but GHR Properties stands out for their market expertise and personalized service. They've helped me secure multiple high-performing properties.",
    author: "Michael Chen",
    position: "Real Estate Investor",
    image: "/images/testimonial-2.jpg",
  },
  {
    id: 3,
    content:
      "Selling our family home was an emotional process, but the team at GHR Properties guided us with compassion and professionalism. They secured a great price and made the transition smooth.",
    author: "Emily & David Rodriguez",
    position: "Property Sellers",
    image: "/images/testimonial-3.jpg",
  },
];

export function TestimonialSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
          What Our <span className="text-primary">Clients Say</span>
        </h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Hear from our satisfied clients about their experience working with GHR Properties.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-lg shadow-md relative"
            >
              <div className="absolute -top-4 left-8 text-primary opacity-20">
                <FaQuoteLeft size={48} />
              </div>
              <p className="text-gray-600 mb-6 relative z-10">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 relative rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 