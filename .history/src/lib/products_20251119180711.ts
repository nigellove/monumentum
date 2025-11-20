export interface Product {
  id: string;
  name: string;
  price: number;
  priceId: string;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  stripeLink: string;
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
    stripeLink: 'https://buy.stripe.com/6oU3cv8oi1icbg41OBdby00'
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
    stripeLink: 'https://buy.stripe.com/fZu8wPgUO8KE6ZO1OBdby01'
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
  }
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return PRODUCTS.find(p => p.priceId === priceId);
}

export function productRequiresPolicy(productId: string): boolean {
  return productId === 'customer_service_agent' || productId === 'integrated_agent';
}