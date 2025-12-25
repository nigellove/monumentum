import { Check, Zap } from 'lucide-react';

interface PricingProps {
  onSignUp: (productId: string) => void;
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
              onClick={() => onSignUp('inbound_sales_agent')}
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
              onClick={() => onSignUp('customer_service_agent')}
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
              onClick={() => onSignUp('integrated_agent')}
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

        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">
            Outbound Sales Agent
          </h3>
          <p className="text-lg text-slate-600">
            Human-in-the-loop outbound with a 30-day free trial.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-slate-900">Starter</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full">
                30-Day Trial
              </span>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Human-in-the-loop outbound sales for growing teams.
            </p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">$39.99</span>
                <span className="text-slate-600">/mo</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">750 emails per month</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">AI personalization with human approval</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Prospect enrichment and routing</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Email tracking and analytics</span>
              </li>
            </ul>

            <button
              onClick={() => onSignUp('outbound_sales_starter')}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
            >
              Start 30 Day Free Trial
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-teal-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              Best Value
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-slate-900">Pro</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full">
                30-Day Trial
              </span>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Scale outbound with &gt;3X Outbound Sales Leads
            </p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">$59.99</span>
                <span className="text-slate-600">/mo</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">2,500 emails per month</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Everything in Starter</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">2500 emails per month</span>
              </li>
            </ul>

            <button
              onClick={() => onSignUp('outbound_sales_pro')}
              className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-semibold transition-all"
            >
              Start 30 Day Free Trial
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full">
                30-Day Trial
              </span>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Unlimited volume, advanced support, and custom integrations.
            </p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">Contact Us</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">Custom limits and pricing</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Unlimited monthly emails</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Dedicated deliverability support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">Custom onboarding and integrations</span>
              </li>
            </ul>

            <button
              onClick={onContactUs}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
