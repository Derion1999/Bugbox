export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SpIZNCp523mxPevudEUakJQ',
    name: '3 Month BugBox Subscription',
    description: 'Get 3 months of premium bug tracking with advanced features and priority support.',
    mode: 'subscription',
    price: 45.99,
    currency: 'USD',
  },
  {
    priceId: 'price_1SpIYsCp523mxPev5MMGFCOd',
    name: 'Monthly BugBox Subscription',
    description: 'Monthly subscription to BugBox with full access to all features.',
    mode: 'subscription',
    price: 19.99,
    currency: 'USD',
  },
];