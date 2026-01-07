-- ============================================================================
-- CREATE ADMIN TABLES
-- ============================================================================
-- Run this in Supabase SQL Editor to create admin panel tables
-- ============================================================================

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'update', 'block', 'unblock', 'pause', 'resume', 'delete'
  resource_type TEXT NOT NULL, -- 'user', 'subscription', 'prospect', 'campaign'
  resource_id TEXT, -- UUID or identifier
  changes JSONB, -- Before/after state
  metadata JSONB, -- Additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_log;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
  );

-- Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Force use of service role for inserts

-- Create usage summary table
CREATE TABLE IF NOT EXISTS usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Email usage
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,

  -- Prospect usage
  prospects_generated INTEGER DEFAULT 0,
  prospects_approved INTEGER DEFAULT 0,

  -- Storage usage (bytes)
  storage_used BIGINT DEFAULT 0,

  -- API calls (if tracked)
  api_calls INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, period_start, period_end)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_summary_user ON usage_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_summary_customer ON usage_summary(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_summary_period ON usage_summary(period_start, period_end);

-- Enable RLS
ALTER TABLE usage_summary ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admins can view all usage" ON usage_summary;

-- Admins can view all usage
CREATE POLICY "Admins can view all usage"
  ON usage_summary FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
  );

-- Function to calculate daily usage (run daily via cron or manually)
CREATE OR REPLACE FUNCTION calculate_daily_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO usage_summary (
    user_id,
    customer_id,
    period_start,
    period_end,
    emails_sent,
    emails_opened,
    emails_clicked,
    emails_replied,
    prospects_generated,
    prospects_approved
  )
  SELECT
    user_id,
    customer_id,
    CURRENT_DATE - INTERVAL '1 day' as period_start,
    CURRENT_DATE - INTERVAL '1 day' as period_end,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as emails_sent,
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as emails_opened,
    COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as emails_clicked,
    COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as emails_replied,
    (SELECT COUNT(*) FROM outbound_prospects p WHERE p.user_id = el.user_id AND DATE(p.created_at) = CURRENT_DATE - INTERVAL '1 day') as prospects_generated,
    (SELECT COUNT(*) FROM outbound_prospects p WHERE p.user_id = el.user_id AND p.review_status = 'approved' AND DATE(p.reviewed_at) = CURRENT_DATE - INTERVAL '1 day') as prospects_approved
  FROM outbound_email_logs el
  WHERE DATE(sent_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY user_id, customer_id
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    emails_sent = EXCLUDED.emails_sent,
    emails_opened = EXCLUDED.emails_opened,
    emails_clicked = EXCLUDED.emails_clicked,
    emails_replied = EXCLUDED.emails_replied,
    prospects_generated = EXCLUDED.prospects_generated,
    prospects_approved = EXCLUDED.prospects_approved,
    updated_at = NOW();
END;
$$;

SELECT '✅ Admin tables created successfully!' as status;
