import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Monumentum AI?',
      answer:
        'Monumentum AI is an enterprise-grade artificial intelligence platform that helps businesses of all sizes leverage the power of AI to automate sales and customer service processes, gain insights from data, and enhance customer experiences. Our platform combines cutting-edge AI technology with practical business applications to deliver measurable results.',
    },
    {
      question: 'How does Monumentum work?',
      answer:
        'Monumentum uses advanced machine learning models and natural language processing to understand customer interactions, capture qualified leads, and resolve support issues. Simply install our widget on your site, configure your preferences, and our AI will handle customer conversations automatically. No coding or technical expertise required.',
    },
    {
      question: 'Is my data secure with Monumentum?',
      answer:
        'Absolutely. We take data security extremely seriously. All data is encrypted in transit and at rest using industry-standard encryption protocols. We\'re compliant with GDPR, SOC 2, and other major security frameworks. Your data is never shared with third parties, and you maintain full control and ownership of your information at all times.',
    },
    {
      question: 'How can I get started with Monumentum?',
      answer:
        'Getting started is simple! Sign up for a free 30-day trial to explore our platform. You can have our AI agent running on your site in minutes. Our self-serve plans include everything you need to capture leads and support customers automatically. For custom solutions or enterprise needs, contact our sales team for a personalized demo.',
    },
    {
      question: 'What integrations are available?',
      answer:
        'Monumentum integrates with major CRM platforms (HubSpot, Pipedrive, Salesforce), ecommerce platforms (Shopify, WooCommerce), and other business tools. We can also build custom integrations for your specific systems. Our custom tier includes full integration support.',
    },
    {
      question: 'Can I customize the AI agent?',
      answer:
        'Yes! All our plans include customization of the AI agent to match your brand voice, tone, and business processes. You can adjust conversation flows, set custom fields to capture, and configure follow-up actions. Our custom tier offers unlimited customization and white-label options.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600">
            Find answers to common questions about Monumentum
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden transition-all duration-300 hover:border-teal-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left transition-all hover:bg-slate-50"
              >
                <h3 className="text-lg font-bold text-slate-900 pr-8">{faq.question}</h3>
                <ChevronDown
                  className={`w-6 h-6 text-teal-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-8 pb-6 bg-slate-50">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-teal-50 rounded-2xl border-2 border-teal-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Still have questions?</h3>
          <p className="text-slate-600 mb-6">
            Our team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              contactSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}