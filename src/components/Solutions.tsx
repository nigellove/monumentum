import { Bot, Headphones, Users, PhoneIncoming, UserCog, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface SolutionsProps {
  onContactUs: () => void;
  onOpenChat: () => void;
  onSignUp: () => void;
}

export default function Solutions({ onContactUs, onOpenChat, onSignUp }: SolutionsProps) {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

  const offTheShelfSolutions = [
    {
      icon: Bot,
      title: 'Inbound Sales and Lead Capture Agent',
      description: 'Streamline customer interactions and fully automate lead capture. Convert more prospects into customers 24/7.',
      price: 'Starting at $299/mo',
      available: true,
      features: [
        '24/7 automated lead capture',
        'Intelligent conversation flows',
        'CRM integration',
        'Customized branding / AI interactions',
        'Multi-channel support (web / mobile)',
        'Advanced analytics dashboard',
        'Native multi-language support',
      ],
    },
    {
      icon: Headphones,
      title: 'Inbound Customer Service Agent',
      description: 'Answer customer questions instantly and set up appointments automatically. Enhance satisfaction and reduce response times.',
      price: 'Starting at $249/mo',
      available: true,
      features: [
        'Instant response system',
        'Automated appointment scheduling',
        'Knowledge base integration',
        'Customized branding / AI interactions',
        'Multi-channel support (web / mobile)',
        'Ticket management',
        'Customer satisfaction tracking',
        'Native multi-language support',
      ],
    },
    {
      icon: Users,
      title: 'Integrated Inbound Sales, Lead Capture and Customer Service Agent',
      description: 'Complete solution combining sales, lead capture, and customer service in one powerful AI agent. Maximize efficiency and customer satisfaction.',
      price: 'Starting at $399/mo',
      available: true,
      features: [
        'All Sales Agent features',
        'All Customer Service features',
        'Unified customer interactions',
        'Seamless handoff between sales & support',
        'Customized branding / AI interactions',
        'Multi-channel support (web / mobile)',
        'Comprehensive analytics',
        'Native multi-language support',
      ],
    },
  ];

  const comingSoonSolutions = [
    {
      icon: PhoneIncoming,
      title: 'Outbound Sales Agent',
    },
    {
      icon: UserCog,
      title: 'Employee Support Agent',
    },
    {
      icon: GraduationCap,
      title: 'Business Training Agent',
    },
  ];

  return (
    <section id="solutions" className="py-20 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Supercharge your business with AI-Powered Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Ready-to-deploy AI agents and custom solutions with integrated advanced analytics tailored to your business needs
          </p>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 max-w-4xl mx-auto">
            <p className="text-lg text-slate-700 mb-4">
              <span className="font-bold text-teal-700">Fully Configurable & Customizable:</span> All solutions are completely configurable and customizable to your specific policies, sales practices, and branding right out of the box.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offTheShelfSolutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-slate-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <solution.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {solution.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                {solution.description}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedSolution(solution.title)}
                  className="w-full px-6 py-3 border-2 border-teal-500 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all"
                >
                  What's Included
                </button>
                {solution.available ? (
                  <button
                    onClick={onSignUp}
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all"
                  >
                    Sign Up
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-slate-300 text-slate-500 rounded-full font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Box - Combined */}
        <div className="mb-12 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Coming Soon</h3>
            <span className="bg-amber-500 text-white text-sm font-bold px-4 py-1 rounded-full">
              COMING SOON
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonSolutions.map((solution, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <solution.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{solution.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Solutions CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Custom AI Solutions
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Need something specific? We build custom AI solutions tailored to your unique business requirements and workflows.
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

      {/* Features Modal */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold text-2xl">{selectedSolution} - Features</h3>
              <button
                onClick={() => setSelectedSolution(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <h4 className="text-xl font-bold text-slate-900 mb-4">Included Features</h4>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Feature</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Included</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {offTheShelfSolutions.find(s => s.title === selectedSolution)?.features.map((feature, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-medium">{feature}</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-6 h-6 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}