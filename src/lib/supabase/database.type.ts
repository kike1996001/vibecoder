export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
      };
      generated_files: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          path: string;
          content: string;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          path: string;
          content: string;
          language: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          path?: string;
          content?: string;
          language?: string;
          created_at?: string;
        };
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          monthly_limit: number;
          plan_tier: 'free' | 'pro' | 'enterprise';
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          monthly_limit?: number;
          plan_tier?: 'free' | 'pro' | 'enterprise';
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          monthly_limit?: number;
          plan_tier?: 'free' | 'pro' | 'enterprise';
          last_updated?: string;
          created_at?: string;
        };
      };
      credit_ledger: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: 'stripe_payment' | 'generation' | 'admin_grant' | 'monthly_reset';
          balance_after: number;
          generation_id?: string;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string;
          description?: string;
          metadata?: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source: 'stripe_payment' | 'generation' | 'admin_grant' | 'monthly_reset';
          balance_after: number;
          generation_id?: string;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string;
          description?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          source?: 'stripe_payment' | 'generation' | 'admin_grant' | 'monthly_reset';
          balance_after?: number;
          generation_id?: string;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string;
          description?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_tier: 'free' | 'pro' | 'enterprise';
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'trialing';
          monthly_credit_allowance: number;
          current_period_start?: string;
          current_period_end?: string;
          started_at: string;
          ends_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_tier: 'free' | 'pro' | 'enterprise';
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'trialing';
          monthly_credit_allowance?: number;
          current_period_start?: string;
          current_period_end?: string;
          started_at?: string;
          ends_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_tier?: 'free' | 'pro' | 'enterprise';
          stripe_subscription_id?: string;
          stripe_customer_id?: string;
          status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'trialing';
          monthly_credit_allowance?: number;
          current_period_start?: string;
          current_period_end?: string;
          started_at?: string;
          ends_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

