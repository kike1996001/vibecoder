import { BACKEND_API } from './aiService';

export interface CreditPackage {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 999,
    description: 'Perfect for trying out',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 3999,
    description: 'Most popular choice',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000,
    price: 11999,
    description: 'For power users',
  },
];

/**
 * Calculate credits needed for a generation based on template and provider
 */
export function calculateCreditsNeeded(template: string, provider: string, appType: string): number {
  const baseCredits: Record<string, number> = {
    landing: 5,
    saas: 10,
    ecommerce: 15,
    admin: 8,
  };

  const providerMultiplier: Record<string, number> = {
    anthropic: 1.2, // Higher cost
    gemini: 1.0,
    together: 0.8, // Lower cost
  };

  const appTypeMultiplier: Record<string, number> = {
    web: 1.0,
    mobile: 1.5, // Mobile costs more
  };

  const base = baseCredits[template] || 5;
  const providerCost = base * (providerMultiplier[provider] || 1);
  const totalCost = providerCost * (appTypeMultiplier[appType] || 1);

  return Math.ceil(totalCost);
}

/**
 * Start Stripe checkout for credit purchase
 */
export async function startStripeCheckout(
  creditsPackage: 'starter' | 'pro' | 'enterprise',
  authToken: string
): Promise<{ sessionUrl: string }> {
  const response = await fetch(`${BACKEND_API}/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      creditsPackage,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Get user's current credit balance
 */
export async function getUserCreditsBalance(authToken: string): Promise<number> {
  const response = await fetch(`${BACKEND_API}/user/credits`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }

  const data = await response.json();
  return data.credits;
}

/**
 * Get user's credit usage history
 */
export async function getCreditHistory(authToken: string, limit = 20) {
  const response = await fetch(`${BACKEND_API}/user/credits/history?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch credit history');
  }

  return response.json();
}
