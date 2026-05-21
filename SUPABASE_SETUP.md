# Setup: Supabase Credit System

## ✅ Backend Implemented

- ✅ Created `api/supabaseClient.js` with credit functions
- ✅ Updated `/api/user/credits` endpoint with real Supabase queries
- ✅ Updated `/api/user/credits/history` endpoint with real Supabase queries
- ✅ Updated Stripe webhook to add credits to user account
- ✅ Created migration SQL file with all tables and RLS policies

## 🔧 Manual Setup Steps

### Step 1: Create Tables in Supabase

Go to your Supabase project → SQL Editor → New Query

Copy and paste the entire content from `supabase/migrations/001_create_credit_system.sql`:

```sql
-- Run all the SQL from that file
```

Or run each table creation command one by one.

### Step 2: Verify Tables Created

Go to Supabase → Database → Tables and verify:
- ✅ `user_credits` (with user_id, balance, plan_tier)
- ✅ `credit_ledger` (with transaction history)
- ✅ `subscriptions` (for future subscription tracking)

### Step 3: Verify RLS Policies

Go to Supabase → Database → Tables → Select table → RLS

Confirm:
- ✅ RLS is enabled on all 3 tables
- ✅ Policies for SELECT/INSERT/UPDATE are set

### Step 4: Create a Test User

```sql
-- In Supabase SQL Editor, run:
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('test-user-id', 'test@example.com', '{"name": "Test User"}')
ON CONFLICT DO NOTHING;
```

This will trigger the `initialize_user_credits` function and create an entry in `user_credits` table with 10 free credits.

### Step 5: Test the API

Get your JWT token from login, then:

```bash
# Test getting balance
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5178/api/user/credits

# Expected response:
# { "credits": 10, "userId": "test-user-id" }

# Test getting history (should be empty)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5178/api/user/credits/history

# Expected response:
# []
```

### Step 6: Test Credit Purchase (Stripe Webhook)

In development with Stripe CLI:

```bash
# In another terminal, forward webhook events
stripe listen --forward-to localhost:5178/api/stripe/webhook

# You'll get a signing secret - add to your .env:
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

Then test a payment:
```bash
# Create a checkout session (you'll need test Stripe keys too)
curl -X POST http://localhost:5178/api/stripe/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creditsPackage": "starter"}'
```

## 🚀 Production Deployment

When deploying to production:

1. **Run migrations on production database**
   - Use Supabase's migration system or run SQL directly
   - Ensure all tables and RLS policies are created

2. **Verify environment variables**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

3. **Test webhook in production**
   - Set up Stripe webhook endpoint to production URL
   - Update `STRIPE_WEBHOOK_SECRET` in production .env

4. **Monitor credit system**
   - Check Supabase Dashboard → Database → Tables
   - Monitor `credit_ledger` for all transactions
   - Monitor `user_credits` for balance accuracy

## 📊 Database Schema

### user_credits Table
- `id` (uuid): Primary key
- `user_id` (uuid): Link to auth.users
- `balance` (int): Current credit count
- `monthly_limit` (int): Max credits per month
- `plan_tier` (text): 'free', 'pro', or 'enterprise'
- `last_updated` (timestamp): Last balance change
- `created_at` (timestamp): Creation time
- **Unique constraint**: One row per user

### credit_ledger Table
- `id` (uuid): Primary key
- `user_id` (uuid): Link to auth.users
- `amount` (int): Credit change (positive or negative)
- `source` (text): 'stripe_payment', 'generation', 'admin_grant', 'monthly_reset'
- `balance_after` (int): Balance after transaction
- `generation_id` (uuid): Link to generation (optional)
- `stripe_session_id` (text): Stripe session ID (optional)
- `stripe_payment_intent_id` (text): Payment intent ID (optional)
- `description` (text): Human-readable description
- `metadata` (jsonb): Extra data
- `created_at` (timestamp): Transaction timestamp

### subscriptions Table
- For future enhancement
- Links users to their active subscription plans
- Tracks Stripe subscription IDs

## 🐛 Troubleshooting

### "Missing Supabase configuration" error
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in .env
- Check they're not wrapped in quotes

### "Failed to fetch balance: relation does not exist"
- Tables haven't been created yet
- Run the SQL migration from Step 1

### Webhook not updating credits
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check server logs for errors
- Ensure Stripe event type is `checkout.session.completed`

### RLS denying access
- Verify JWT token is valid
- Check RLS policies allow the user's role
- Service role policies may need adjustment

## ✅ Verification Checklist

- [ ] Tables created in Supabase
- [ ] RLS enabled on all tables
- [ ] Test user created with 10 free credits
- [ ] `/api/user/credits` returns correct balance
- [ ] `/api/user/credits/history` returns empty array initially
- [ ] Stripe webhook setup (dev or prod)
- [ ] Environment variables configured
- [ ] Build passes without errors

---

**Next Step**: Integrate credit deduction into the generation flow
