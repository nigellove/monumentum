import { Award, Globe, Target, Users, BookOpen, Play, Zap } from "lucide-react";
import { useState } from "react";

export default function About() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "We believe AI should be a force for positive change, enabling organizations to work smarter, make better decisions, and create meaningful impact in their industries. We are committed to democratizing AI technology and making it accessible to businesses of all sizes.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We maintain the highest standards in AI development, ensuring quality, security, and reliability in every solution we deliver.",
    },
    {
      icon: Users,
      title: "Client-Centric",
      description:
        "Your success is our success. We partner closely with clients to understand and exceed their expectations.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description:
        "We stay at the forefront of AI research and technology, constantly evolving our solutions.",
    },
  ];

  const industries = [
    {
      name: "Ecommerce",
      description: "AI sales and customer service agents for online stores to increase conversions and reduce support costs.",
      subitems: ["Online Retail Stores", "Digital Products", "Marketplace Sellers", "Subscription Services"],
    },
    {
      name: "Healthcare & Wellness",
      description: "Appointment booking and customer inquiry automation for clinics, spas, and wellness providers.",
      subitems: ["Medical Clinics & Practices", "Dental Offices", "Spas & Salons", "Hair Care Services", "Massage Therapy", "Wellness Centers"],
    },
    {
      name: "Home & Repair Services",
      description: "Lead capture and service scheduling for contractors, plumbers, electricians, and home service businesses.",
      subitems: ["Plumbing Services", "HVAC & AC Repair", "Electrical Services", "Lawn Care & Landscaping", "Auto Repair & Garages", "General Contracting", "Home Maintenance"],
    },
    {
      name: "Hospitality",
      description: "Reservation management and customer service automation for hotels, restaurants, and entertainment venues.",
      subitems: ["Restaurants & Cafes", "Hotels & Accommodations", "Golf Clubs", "Event Venues", "Entertainment Venues", "Bars & Lounges"],
    },
    {
      name: "Professional Services",
      description: "Lead qualification and client engagement for law firms, consulting, and B2B service providers.",
      subitems: ["Law Firms", "Consulting Firms", "Accounting Services", "Management Consulting", "Insurance Agencies", "Real Estate", "Enterprise Organizations"],
    },
  ];

  const [enlargedImage, setEnlargedImage] = useState(false);

  return (
    <section id="about" className="py-20 px-6 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="max-w-7xl mx-auto">
        {/* Centered heading */}
        <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-12 text-center">
          Harnessing the Generative AI Revolution
        </h3>

        {/* Two-column intro with feature cards */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: text */}
          <div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
              <p>
                At <strong>Monumentum</strong>, we combine three decades of global
                strategy leadership with modern AI to move clients beyond pilots
                and into measurable results. Our purpose is simple: turn
                generative intelligence into competitive advantage.
              </p>
              <p>
                We blend business insight with Generative AI, Machine Learning,
                and analytics to tackle complex problems—from workflow
                automation and cost optimization to better customer engagement
                and new growth.
              </p>
              <p>
                We deliver practical, scalable solutions with clear ownership,
                fast time-to-value, and production-grade reliability.
              </p>
            </div>
          </div>

          {/* Right: four feature cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-teal-50 rounded-xl border-l-4 border-teal-500 
                hover:-translate-y-1 hover:shadow-md 
                transition-all duration-300 ease-out">
              <div className="text-lg font-bold text-teal-600 mb-1">
                Latest Proven
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Technologies
              </div>
              <div className="text-xs text-slate-500 mt-2">
                We deploy only production-ready, industry-tested AI platforms—no gimmicks, just real business impact.
              </div>
            </div>
            <div className="p-6 bg-teal-50 rounded-xl border-l-4 border-teal-500 
                hover:-translate-y-1 hover:shadow-md 
                transition-all duration-300 ease-out">
              <div className="text-lg font-bold text-teal-600 mb-1">Value</div>
              <div className="text-sm text-slate-600 font-medium">Delivery</div>
              <div className="text-xs text-slate-500 mt-2">
                Every solution is built around helping our customers. We tie success to your revenue, efficiency, and customer outcomes—not experiments.
              </div>
            </div>
            <div className="p-6 bg-teal-50 rounded-xl border-l-4 border-teal-500 
                hover:-translate-y-1 hover:shadow-md 
                transition-all duration-300 ease-out">
              <div className="text-lg font-bold text-teal-600 mb-1">
                Low Maintenance
              </div>
              <div className="text-sm text-slate-600 font-medium">Reliable</div>
              <div className="text-xs text-slate-500 mt-2">Our solutions run quietly in the background with minimal upkeep, lowering total cost of ownership and freeing teams to focus on growth.</div>
            </div>
            <div className="p-6 bg-teal-50 rounded-xl border-l-4 border-teal-500 
                hover:-translate-y-1 hover:shadow-md 
                transition-all duration-300 ease-out">
              <div className="text-lg font-bold text-teal-600 mb-1">Secure</div>
              <div className="text-sm text-slate-600 font-medium">
                Solutions
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Security is embedded from day one—data privacy, access control, and compliance baked into every layer of our stack.
              </div>
            </div>
          </div>
        </div>

        {/* Resources section with 2 modal boxes - set to 3 when adding back demo */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Learn More
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Featured Industries */}
            <button
              onClick={() => setSelectedResource('industries')}
              className="text-left bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-teal-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-teal-600">FEATURED</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Featured Industries</h4>
              <p className="text-slate-600 mb-4">Explore the industries we serve and how Monumentum solves their unique challenges.</p>
              <span className="inline-flex items-center text-teal-600 font-semibold">
                View Industries <span className="ml-2">→</span>
              </span>
            </button>

            {/* How Monumentum Works */}
            <button
              onClick={() => setSelectedResource('how-it-works')}
              className="text-left bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-teal-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-teal-600">GUIDE</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">How Monumentum Works</h4>
              <p className="text-slate-600 mb-4">See the complete flow from customer inquiry through lead capture, issue resolution, and real-time analytics.</p>
              <span className="inline-flex items-center text-teal-600 font-semibold">
                Learn More <span className="ml-2">→</span>
              </span>
            </button>

            {/* Video Demo -- to be added later.*/}
            {/* 
            <button
              onClick={() => setSelectedResource('video-demo')}
              className="text-left bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-teal-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-teal-600">DEMO</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Video Demo</h4>
              <p className="text-slate-600 mb-4">Watch Monumentum in action. See how our AI agents capture leads and resolve customer issues in real-time.</p>
              <span className="inline-flex items-center text-teal-600 font-semibold">
                Watch Demo <span className="ml-2">→</span>
              </span>
            </button>
            */}
          </div>
        </div>

        {/* Values grid */}
        <div>
          <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-12 text-center">
            Our Values
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {value.title}
                  </h4>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Featured Industries */}
      {selectedResource === 'industries' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold text-2xl">Featured Industries</h3>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-8">
                {industries.map((industry, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-8 last:border-0">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{industry.name}</h4>
                    <p className="text-slate-600 mb-4">{industry.description}</p>
                    <div className="ml-4 space-y-2">
                      {industry.subitems.map((subitem, sidx) => (
                        <div key={sidx} className="flex items-start gap-3">
                          <span className="text-teal-500 font-bold mt-1">•</span>
                          <span className="text-slate-700">{subitem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    {/* Modal for How Monumentum Works */}
      {selectedResource === 'how-it-works' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold text-2xl">How Monumentum Works</h3>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <button
                onClick={() => setEnlargedImage(true)}
                className="w-full rounded-lg mb-6 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img 
                  src="/Screenshot 2025-11-18 143250.png" 
                  alt="Monumentum Workflow"
                  className="w-full rounded-lg hover:shadow-lg transition-shadow"
                />
                <p className="text-xs text-slate-500 text-center mt-2">Click to enlarge</p>
              </button>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">1. Customer Interaction</h4>
                  <p className="text-slate-600">A customer visits your website and engages with your Monumentum AI agent.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">2. Intelligent Conversation</h4>
                  <p className="text-slate-600">The AI agent understands customer needs, answers questions, and collects information through natural conversation.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">3. Lead Capture & Issue Resolution</h4>
                  <p className="text-slate-600">For sales: qualified leads are captured and sent to your CRM. For support: issues are logged and tracked.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">4. Real-Time Analytics</h4>
                  <p className="text-slate-600">You get instant visibility into conversations, customer sentiment, pain points, and conversion metrics.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">5. Continuous Improvement</h4>
                  <p className="text-slate-600">Our insights help you optimize your pitch, improve conversion rates, and enhance customer experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(false)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src="/Screenshot 2025-11-18 143250.png" 
              alt="Monumentum Workflow - Enlarged"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setEnlargedImage(false)}
              className="absolute top-4 right-4 bg-white hover:bg-slate-100 rounded-full p-2 shadow-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal for Video Demo -- To be added later 
      
      {selectedResource === 'video-demo' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold text-2xl">Video Demo</h3>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">
              <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Play className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-center text-slate-600 mb-4">Demo video coming soon. Check back for a live walkthrough of Monumentum in action.</p>
              <p className="text-sm text-slate-500 text-center">In the meantime, reach out to schedule a personalized demo with our team.</p>
            </div>
          </div>
        </div>
      )}
      
      */}
    </section>
  );
}