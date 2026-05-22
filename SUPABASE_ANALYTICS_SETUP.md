# ⚡ Supabase Analytics Setup Instructions

## Quick Setup (2 minutes)

To enable analytics tracking for VibeCoder, you need to create one table in Supabase. Follow these steps:

### Step 1: Open Supabase Dashboard
- Go to https://app.supabase.com
- Select project: **vibecoder**

### Step 2: Run SQL Migration

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the SQL from below
4. Click **Run** (or press Ctrl+Enter)

### SQL Migration

```sql
-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'generation', 'interaction', 'error', 'conversion', 'page_view'
  data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics
CREATE POLICY "Users can only view their own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own analytics
CREATE POLICY "Users can only insert their own analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can access all (for admin queries)
CREATE POLICY "Service role can access all analytics"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');
```

### Step 3: Verify Creation

After running the SQL:

1. Go to **Table Editor** in the left sidebar
2. Look for **analytics_events** table
3. You should see 0 rows initially (table is empty until tracking begins)

### What This Creates

✅ **analytics_events table** - Stores all user tracking events:
- User page views
- App generation completions
- User interactions (button clicks, etc.)
- Errors encountered
- Payment conversions
- Custom events

### How It Works

Once the table is created:

1. **Frontend** (`src/hooks/useAnalytics.ts`):
   - Tracks page views when user navigates
   - Tracks generation events after successful app builds
   - Tracks user interactions

2. **Backend** (`server.js`):
   - POST `/api/analytics/track` - Logs events to Supabase
   - GET `/api/analytics/summary` - Retrieves aggregated analytics

3. **Data** is stored in Supabase in real-time with full RLS security

### Testing

After creation, the analytics will automatically:

1. **Track page views** when users navigate
2. **Track generations** when users create apps
3. **Display in Dashboard** (future enhancement)

### Troubleshooting

**Table not appearing?**
- Check that you ran the entire SQL block
- Try refreshing the page (F5)
- Check the SQL Editor for error messages in red

**Permission denied errors?**
- Make sure you're logged into Supabase as the project owner
- Check that the service role key is correct in server.js

**No events being recorded?**
- Check browser console for JavaScript errors
- Verify the JWT token is being sent correctly
- Check server logs at localhost:5178

---

**Once table is created, all analytics will automatically flow into Supabase!** ✨
