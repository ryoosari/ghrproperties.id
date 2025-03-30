import { FaAward, FaHandshake, FaRegClock, FaShieldAlt, FaChartLine, FaRegLightbulb } from 'react-icons/fa';

const strengths = [
  {
    id: 1,
    title: "Industry Expertise",
    description: "With years of experience in the real estate market, our team has in-depth knowledge of property trends, pricing, and investment opportunities.",
    icon: <FaAward className="text-4xl text-primary" />
  },
  {
    id: 2,
    title: "Personalized Service",
    description: "We take the time to understand your unique needs and preferences, providing tailored solutions for your specific real estate goals.",
    icon: <FaHandshake className="text-4xl text-primary" />
  },
  {
    id: 3,
    title: "24/7 Support",
    description: "Our dedicated team is always available to address your questions and concerns, ensuring a smooth and stress-free experience.",
    icon: <FaRegClock className="text-4xl text-primary" />
  },
  {
    id: 4,
    title: "Trusted Partnerships",
    description: "We've built strong relationships with developers, financial institutions, and service providers to offer you comprehensive support.",
    icon: <FaShieldAlt className="text-4xl text-primary" />
  },
  {
    id: 5,
    title: "Market Insights",
    description: "Stay ahead with our regularly updated market analysis and property investment recommendations tailored to your portfolio goals.",
    icon: <FaChartLine className="text-4xl text-primary" />
  },
  {
    id: 6,
    title: "Innovative Solutions",
    description: "We leverage the latest technology and market strategies to optimize your property search, investment, or sale process.",
    icon: <FaRegLightbulb className="text-4xl text-primary" />
  }
];

export function TestimonialSection() {
  // We're keeping the component name the same to avoid having to update imports
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
          Why Choose <span className="text-primary">GHR Properties</span>
        </h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Discover the advantages of working with our experienced real estate team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {strengths.map((item) => (
            <div
              key={item.id}
              className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}