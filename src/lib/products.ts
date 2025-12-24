export interface Product {
  id: string;
  name: string;
  price: number | null;
  priceId?: string;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  description: string;
  features: string[];
  stripeLink?: string;
  trialDays?: number;
  monthlyEmailLimit?: number | null;
  purchaseType?: 'checkout' | 'contact';
}

export const PRODUCTS: Product[] = [
  {
    id: 'inbound_sales_agent',
    name: 'Inbound Sales and Lead Capture Agent',
    price: 9.99,
    priceId: 'price_1SSLNYHNpNXABf4qcoC3efFV',
    billingCycle: 'monthly',
    description: 'Streamline customer interactions and fully automate lead capture',
    features: [
      '24/7 automated lead capture',
      'Intelligent conversation flows',
      'CRM integration',
      'Customized branding / AI interactions',
      'Multi-channel support (web / mobile)',
      'Advanced analytics dashboard',
      'Native multi-language support'
    ],
    stripeLink: 'https://buy.stripe.com/6oU3cv8oi1icbg41OBdby00',
    trialDays: 30,
    purchaseType: 'checkout'
  },
  {
    id: 'customer_service_agent',
    name: 'Inbound Customer Service Agent',
    price: 12.99,
    priceId: 'price_1SSLOZHNpNXABf4qEN2Fe9uU',
    billingCycle: 'monthly',
    description: 'Answer customer questions instantly and set up appointments automatically',
    features: [
      'Instant response system',
      'Automated appointment scheduling',
      'Knowledge base integration',
      'Customized branding / AI interactions',
      'Multi-channel support (web / mobile)',
      'Ticket management',
      'Customer satisfaction tracking',
      'Native multi-language support'
    ],
    stripeLink: 'https://buy.stripe.com/fZu8wPgUO8KE6ZO1OBdby01',
    trialDays: 30,
    purchaseType: 'checkout'
  },
  {
 id: 'integrated_agent',
  name: 'Integrated Inbound Sales, Lead Capture and Customer Service Agent',
  price: 15.99,
  priceId: 'price_1SVJvtHNpNXABf4q5RrmEK04',  // ← NEW
  billingCycle: 'monthly',
  description: 'Complete solution combining sales, lead capture, and customer service',
    features: [
      'All Sales Agent features',
      'All Customer Service features',
      'Unified customer interactions',
      'Seamless handoff between sales & support',
      'Customized branding / AI interactions',
      'Multi-channel support (web / mobile)',
      'Comprehensive analytics',
      'Native multi-language support'
    ],
    stripeLink: 'https://buy.stripe.com/9B6bJ16ga6Cwesg1OBdby03'  // ← NEW
  },
  {
    id: 'outbound_sales_starter',
    name: 'Outbound Sales Agent - Starter',
    price: 39.99,
    priceId: 'price_outbound_starter_placeholder',
    billingCycle: 'monthly',
    description: 'Human-in-the-loop outbound sales with 750 emails per month',
    features: [
      'AI personalization with human approval',
      'Outbound email sequences',
      'Prospect enrichment',
      'Campaign review queue',
      'Email tracking',
      '750 emails per month'
    ],
    stripeLink: '',
    trialDays: 30,
    monthlyEmailLimit: 750,
    purchaseType: 'checkout'
  },
  {
    id: 'outbound_sales_pro',
    name: 'Outbound Sales Agent - Pro',
    price: 59.99,
    priceId: 'price_outbound_pro_placeholder',
    billingCycle: 'monthly',
    description: 'Higher volume outbound sales with 2,500 emails per month',
    features: [
      'Everything in Starter',
      'Advanced targeting filters',
      'Expanded campaign analytics',
      'Team collaboration',
      'Priority support',
      '2,500 emails per month'
    ],
    stripeLink: '',
    trialDays: 30,
    monthlyEmailLimit: 2500,
    purchaseType: 'checkout'
  },
  {
    id: 'outbound_sales_enterprise',
    name: 'Outbound Sales Agent - Enterprise',
    price: null,
    billingCycle: 'custom',
    description: 'Unlimited volume with custom limits and dedicated support',
    features: [
      'Unlimited monthly emails',
      'Custom integrations',
      'Dedicated deliverability support',
      'Team-wide analytics',
      'Custom onboarding',
      'Service-level agreements'
    ],
    trialDays: 30,
    monthlyEmailLimit: null,
    purchaseType: 'contact'
  }
];

export const CHECKOUT_PRODUCTS = PRODUCTS.filter(
  (product) => product.purchaseType !== 'contact'
);

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return PRODUCTS.find(p => p.priceId === priceId);
}

export function productRequiresPolicy(productId: string): boolean {
  return productId === 'customer_service_agent' || productId === 'integrated_agent';
}
