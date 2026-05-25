import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.\n' +
      `Current: SUPABASE_URL=${supabaseUrl ? 'SET' : 'NOT SET'}, SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey ? 'SET' : 'NOT SET'}`
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}

/**
 * Server-side Supabase client with service role permissions
 * Used for admin operations like updating credits, processing payments
 * Lazily initialized to allow for runtime environment variable loading
 */
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop];
  },
});

/**
 * Get user's current credit balance from Supabase
 */
export async function getUserBalance(userId) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user balance:', error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  return data?.balance ?? 0;
}

/**
 * Get user's credit ledger/history
 */
export async function getCreditHistory(userId, limit = 20) {
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching credit history:', error);
    throw new Error(`Failed to fetch history: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Add credit transaction and update balance
 */
export async function addCreditTransaction(userId, amount, source, metadata) {
  // Get current balance
  const currentBalance = await getUserBalance(userId);
  const newBalance = currentBalance + amount;

  // Insert ledger entry
  const { error: ledgerError } = await supabase
    .from('credit_ledger')
    .insert({
      user_id: userId,
      amount,
      source,
      balance_after: newBalance,
      stripe_session_id: metadata?.stripe_session_id,
      generation_id: metadata?.generation_id,
      description: metadata?.description,
    });

  if (ledgerError) {
    throw new Error(`Failed to insert ledger: ${ledgerError.message}`);
  }

  // Update user credits
  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      balance: newBalance,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    throw new Error(`Failed to update balance: ${updateError.message}`);
  }

  return newBalance;
}

/**
 * Check if user has sufficient credits
 */
export async function hasEnoughCredits(userId, requiredAmount) {
  try {
    const balance = await getUserBalance(userId);
    return balance >= requiredAmount;
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
}
