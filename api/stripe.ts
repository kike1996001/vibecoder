import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

/**
 * Create a Stripe checkout session for credit purchase
 */
export async function createCheckoutSession(
  customerId: string,
  creditsPackage: 'starter' | 'pro' | 'enterprise',
  userEmail: string,
  userId: string
) {
  const packages: Record<
    'starter' | 'pro' | 'enterprise',
    { credits: number; priceId: string; price: number }
  > = {
    starter: {
      credits: 100,
      priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      price: 999, // $9.99
    },
    pro: {
      credits: 500,
      priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
      price: 3999, // $39.99
    },
    enterprise: {
      credits: 2000,
      priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
      price: 11999, // $119.99
    },
  };

  const pkg = packages[creditsPackage];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: pkg.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/billing?status=success&credits=${pkg.credits}`,
    cancel_url: `${process.env.FRONTEND_URL}/billing?status=cancelled`,
    metadata: {
      userId,
      creditsPackage,
      credits: pkg.credits.toString(),
    },
  });

  return session;
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(userId: string, email: string) {
  // TODO: Store Stripe customer ID in user metadata or separate table
  // For now, create on-demand (in production, cache this)

  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  return stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
}

/**
 * Handle successful payment webhook
 */
export async function handlePaymentSuccess(
  sessionId: string,
  supabase: any // Supabase client
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  if (!session.client_reference_id) {
    throw new Error('Missing userId in session');
  }

  const userId = session.client_reference_id;
  const credits = parseInt(session.metadata?.credits || '0');

  if (credits <= 0) {
    throw new Error('Invalid credit amount');
  }

  // Add credits to user
  const { error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      amount: credits,
      source: 'stripe_payment',
      stripe_session_id: sessionId,
      created_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }

  return { userId, credits };
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('amount')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  const totalCredits = data?.reduce((sum: number, row: any) => sum + row.amount, 0) || 0;
  return totalCredits;
}

/**
 * Deduct credits for a generation
 */
export async function deductCredits(
  userId: string,
  amount: number,
  generationId: string,
  supabase: any
) {
  // Check balance
  const balance = await getUserCredits(userId, supabase);

  if (balance < amount) {
    throw new Error(`Insufficient credits: ${balance}/${amount}`);
  }

  // Deduct credits
  const { error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      amount: -amount, // Negative = deduction
      source: 'generation',
      generation_id: generationId,
      created_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }

  return balance - amount;
}

export default stripe;
