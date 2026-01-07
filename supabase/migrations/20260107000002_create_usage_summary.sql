-- ============================================================================
-- CREATE USAGE SUMMARY TABLE
-- ============================================================================
-- Aggregates daily usage metrics for admin monitoring and reporting
-- ============================================================================

CREATE TABLE usage_summary (
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
CREATE INDEX idx_usage_summary_user ON usage_summary(user_id);
CREATE INDEX idx_usage_summary_customer ON usage_summary(customer_id);
CREATE INDEX idx_usage_summary_period ON usage_summary(period_start, period_end);

-- Enable RLS
ALTER TABLE usage_summary ENABLE ROW LEVEL SECURITY;

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

SELECT '✅ Usage summary table and function created!' as status;
