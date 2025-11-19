import { ShoppingCart, Megaphone, LineChart, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react';

interface ServicesProps {
  onContactUs: () => void;
  onOpenChat: () => void;
}

export default function Services({ onContactUs, onOpenChat }: ServicesProps) {
  const services = [
    {
      icon: TrendingUp,
      title: 'AI Sales Lead Generation',
      description: 'Drive revenue and maximize profit with intelligent lead generation systems that identify and convert prospects.',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: MessageSquare,
      title: 'AI Customer Service',
      description: 'Deliver instant customer support, resolve issues faster, and improve satisfaction with AI-powered service agents available 24/7.',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: Lightbulb,
      title: 'AI Advisory and Consulting',
      description: 'Strategic guidance and expert consulting for custom AI solutions, workflow automation, and intelligent business process optimization tailored to your needs.',
      gradient: 'from-teal-500 to-slate-600',
    },
    {
      icon: ShoppingCart,
      title: 'AI eCommerce Services',
      description: 'Comprehensive eCommerce solutions including AI driven web enablement, Store Execution and SEO optimization to maximize your online presence.',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: Megaphone,
      title: 'AI Digital Marketing',
      description: 'Video and social media viral marketing strategies powered by AI to amplify your brand reach and engagement.',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: LineChart,
      title: 'AI Data and Analytics',
      description: 'Generate actionable insights from your data to drive informed decision-making and strategic planning.',
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <section id="services" className="py-20 px-6 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive AI solutions designed to transform your business operations and drive sustainable growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {service.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Interested in Our Services?
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Let's discuss how Monumentum's AI solutions can transform your business. Contact us today to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onOpenChat}
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:shadow-xl transition-all duration-300"
            >
              Chat for Immediate Support
            </button>
            <button
  onClick={() => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="px-8 py-4 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all duration-300"
>
  Email Us for More Info
</button>
          </div>
        </div>
      </div>
    </section>
  );
}