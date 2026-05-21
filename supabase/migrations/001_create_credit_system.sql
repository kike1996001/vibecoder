-- ============================================
-- SUPABASE MIGRATIONS: Credit System
-- ============================================

-- 1. User Credits Table (current balance)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 0 CHECK (balance >= 0),
  monthly_limit int DEFAULT 100,
  plan_tier text DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 2. Credit Ledger (transaction history)
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount int NOT NULL,
  source text NOT NULL CHECK (source IN ('stripe_payment', 'generation', 'admin_grant', 'monthly_reset')),
  balance_after int NOT NULL,
  generation_id uuid,
  stripe_session_id text,
  stripe_payment_intent_id text,
  description text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Subscriptions Table (plan tracking)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier text NOT NULL CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'unpaid', 'canceled', 'trialing')),
  monthly_credit_allowance int DEFAULT 100,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at ON public.credit_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Users can only see their own data
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ledger" 
  ON public.credit_ledger FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- 7. Service Role can insert/update (for backend operations)
CREATE POLICY "Service role can manage credits" 
  ON public.user_credits FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage ledger" 
  ON public.credit_ledger FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage subscriptions" 
  ON public.subscriptions FOR ALL 
  USING (auth.role() = 'service_role');

-- 8. Create initial credits record for new users (trigger)
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance, monthly_limit, plan_tier)
  VALUES (NEW.id, 10, 100, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();
