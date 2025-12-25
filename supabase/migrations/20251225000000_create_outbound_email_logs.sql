-- ============================================================================
-- OUTBOUND EMAIL LOGS TABLE
-- ============================================================================
-- Tracks all outbound sales emails sent via Monumentum SaaS infrastructure
-- Used for usage limits, analytics, and deliverability monitoring

CREATE TABLE IF NOT EXISTS outbound_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  prospect_id UUID REFERENCES outbound_prospects(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outbound_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,

  -- Email details
  subject TEXT,
  message_id TEXT, -- AWS SES Message ID

  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'complained')),
  error_message TEXT,

  -- Engagement tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON outbound_email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON outbound_email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_prospect_id ON outbound_email_logs(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON outbound_email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON outbound_email_logs(status);

-- Index for daily usage limit checks
CREATE INDEX IF NOT EXISTS idx_email_logs_user_sent_date ON outbound_email_logs(user_id, sent_at) WHERE status = 'sent';

-- RLS Policies
ALTER TABLE outbound_email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON outbound_email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all logs (for sending function)
CREATE POLICY "Service role can manage email logs"
  ON outbound_email_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Update timestamp trigger
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON outbound_email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE outbound_email_logs IS 'Logs all outbound sales emails sent via Monumentum SaaS infrastructure';
COMMENT ON COLUMN outbound_email_logs.message_id IS 'AWS SES Message ID for tracking deliverability';
COMMENT ON COLUMN outbound_email_logs.status IS 'Email delivery status: sent, failed, bounced, complained';
COMMENT ON COLUMN outbound_email_logs.opened_at IS 'Timestamp when prospect opened the email (via tracking pixel)';
COMMENT ON COLUMN outbound_email_logs.clicked_at IS 'Timestamp when prospect clicked a link in the email';
COMMENT ON COLUMN outbound_email_logs.replied_at IS 'Timestamp when prospect replied to the email';
