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
