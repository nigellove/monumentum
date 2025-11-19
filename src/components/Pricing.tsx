import { Check, Zap } from 'lucide-react';

interface PricingProps {
  onSignUp: () => void;
  onContactUs: () => void;
}

export default function Pricing({ onSignUp, onContactUs }: PricingProps) {
  return (
    <section id="pricing" className="py-20 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Choose the perfect plan for your team's needs. No hidden fees, ever.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Inbound Sales Agent</h3>
            <p className="text-slate-600 mb-6 text-sm">Never miss an Inbound Sales Opportunity again, improve conversion and increase revenue</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">$9.99</span>
                <span className="text-slate-600">/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Completely Tailored to your Business and Brand</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Simple Integration to your Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Full AI Insights + Email Reports</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Multilingual Support Standard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Support for One Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm"><b>ZERO RISK TRIAL</b></span>
              </li>
            </ul>

            <button
              onClick={onSignUp}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
            >
              Start 30 Day Free Trial
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Customer Service Agent</h3>
            <p className="text-slate-600 mb-6 text-sm">Improve your end-to-end Customer Service, reduce costs and simplify your customer support interactions</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">$12.99</span>
                <span className="text-slate-600">/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Completely Tailored to your Business and Brand</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Simple Integration to your Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Full AI Insights + Email Reports</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Multilingual Support Standard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Support for One Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm"><b>ZERO RISK TRIAL</b></span>
              </li>
            </ul>

            <button
              onClick={onSignUp}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
            >
              Start 30 Day Free Trial
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-teal-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Integrated Agent</h3>
            <p className="text-slate-600 mb-6 text-sm">Complete Inbound Sales & Customer Service Coverage to increase sales and customer satisfaction</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">$15.99</span>
                <span className="text-slate-600">/mo <b>SAVE 35%</b></span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Completely Tailored to your Business and Brand</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Simple Integration to your Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Full AI Insights + Email Reports</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Multilingual Support Standard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Support for One Site</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm"><b>ZERO RISK TRIAL</b></span>
              </li>
            </ul>

            <button
              onClick={onSignUp}
              className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-semibold transition-all"
            >
              Start 30 Day Free Trial
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-teal-500" />
              Custom AI Agent
            </h3>
            <p className="text-slate-600 mb-6 text-sm">Fully custom AI agents built to your exact specifications with enterprise integrations</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">Custom</span>
              </div>
              <p className="text-slate-600 text-sm mt-2">Pricing based on requirements</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Custom Integration to Shopify / WooCommerce / WordPress</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">CRM Tool Integrations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Full Alignment to Your Business & Branding</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Dedicated Support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Advanced Analytics & Reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Multi-Site Support</span>
              </li>
            </ul>

            <button
              onClick={onContactUs}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}