-- ============================================================================
-- OUTBOUND SALES AGENT SCHEMA
-- ============================================================================
-- This migration creates all tables and functions needed for the Outbound Sales Agent product.
-- Multi-tenant architecture with user_id and customer_id isolation.
-- Created: 2024-12-22

-- ============================================================================
-- 1. CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outbound_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,

  campaign_name TEXT NOT NULL,
  target_product TEXT,
  target_icp JSONB DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outbound_campaigns_user_id ON outbound_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_campaigns_customer_id ON outbound_campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_outbound_campaigns_status ON outbound_campaigns(status);

-- RLS Policies
ALTER TABLE outbound_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns"
  ON outbound_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON outbound_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON outbound_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON outbound_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service_role (n8n) to manage campaigns
CREATE POLICY "Service role can manage all campaigns"
  ON outbound_campaigns FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- 2. PROSPECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outbound_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  campaign_id UUID REFERENCES outbound_campaigns(id) ON DELETE SET NULL,

  -- Prospect info
  prospect_name TEXT,
  prospect_email TEXT,
  prospect_title TEXT,
  prospect_linkedin_url TEXT,

  -- Company info
  company_name TEXT,
  company_size INTEGER,
  company_industry TEXT,
  company_website TEXT,
  company_location TEXT,

  -- Enrichment
  enrichment_data JSONB DEFAULT '{}'::jsonb,
  enrichment_provider TEXT,
  enrichment_confidence DECIMAL(3,2),

  -- AI-generated content
  channel TEXT CHECK (channel IN ('email', 'linkedin', 'phone')),
  draft_subject TEXT,
  draft_message TEXT,
  personalization_notes TEXT,
  matched_product TEXT,
  match_score DECIMAL(3,2),

  -- Review workflow
  review_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    review_status IN (
      'pending_review',
      'approved',
      'rejected',
      'sent',
      'opened',
      'clicked',
      'replied',
      'bounced',
      'unsubscribed'
    )
  ),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  edited_message TEXT,
  edited_subject TEXT,
  rejection_reason TEXT,

  -- Tracking
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  unsubscribed_at TIMESTAMPTZ,

  -- Follow-up
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_user_id ON outbound_prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_customer_id ON outbound_prospects(customer_id);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_campaign_id ON outbound_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_review_status ON outbound_prospects(review_status);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_matched_product ON outbound_prospects(matched_product);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_channel ON outbound_prospects(channel);
CREATE INDEX IF NOT EXISTS idx_outbound_prospects_email ON outbound_prospects(prospect_email);

-- RLS Policies
ALTER TABLE outbound_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prospects"
  ON outbound_prospects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prospects"
  ON outbound_prospects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
  ON outbound_prospects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
  ON outbound_prospects FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service_role (n8n) to manage prospects
CREATE POLICY "Service role can manage all prospects"
  ON outbound_prospects FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- 3. SEQUENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outbound_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  campaign_id UUID REFERENCES outbound_campaigns(id) ON DELETE CASCADE,

  sequence_name TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  auto_advance BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outbound_sequences_user_id ON outbound_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_sequences_customer_id ON outbound_sequences(customer_id);
CREATE INDEX IF NOT EXISTS idx_outbound_sequences_campaign_id ON outbound_sequences(campaign_id);

-- RLS Policies
ALTER TABLE outbound_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sequences"
  ON outbound_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sequences"
  ON outbound_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sequences"
  ON outbound_sequences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sequences"
  ON outbound_sequences FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service_role (n8n) to manage sequences
CREATE POLICY "Service role can manage all sequences"
  ON outbound_sequences FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- 4. USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outbound_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,

  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'

  prospects_processed INTEGER DEFAULT 0,
  enrichment_credits_used INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  linkedin_messages_sent INTEGER DEFAULT 0,
  phone_calls_made INTEGER DEFAULT 0,

  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(customer_id, month_year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outbound_usage_user_id ON outbound_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_usage_customer_id ON outbound_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_outbound_usage_month_year ON outbound_usage(month_year);

-- RLS Policies
ALTER TABLE outbound_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON outbound_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service_role (n8n) to manage usage
CREATE POLICY "Service role can manage all usage"
  ON outbound_usage FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Update prospect status and track metrics
CREATE OR REPLACE FUNCTION update_prospect_status(
  p_prospect_id UUID,
  p_new_status TEXT,
  p_tracking_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prospect outbound_prospects%ROWTYPE;
  v_month_year TEXT;
BEGIN
  -- Get current prospect
  SELECT * INTO v_prospect
  FROM outbound_prospects
  WHERE id = p_prospect_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect not found';
  END IF;

  -- Update prospect status
  UPDATE outbound_prospects
  SET
    review_status = p_new_status,
    sent_at = CASE WHEN p_new_status = 'sent' THEN COALESCE(sent_at, now()) ELSE sent_at END,
    opened_at = CASE WHEN p_new_status = 'opened' THEN COALESCE(opened_at, now()) ELSE opened_at END,
    clicked_at = CASE WHEN p_new_status = 'clicked' THEN COALESCE(clicked_at, now()) ELSE clicked_at END,
    replied_at = CASE WHEN p_new_status = 'replied' THEN COALESCE(replied_at, now()) ELSE replied_at END,
    bounced_at = CASE WHEN p_new_status = 'bounced' THEN COALESCE(bounced_at, now()) ELSE bounced_at END,
    unsubscribed_at = CASE WHEN p_new_status = 'unsubscribed' THEN COALESCE(unsubscribed_at, now()) ELSE unsubscribed_at END,
    reply_content = COALESCE((p_tracking_data->>'reply_content')::TEXT, reply_content),
    bounce_reason = COALESCE((p_tracking_data->>'bounce_reason')::TEXT, bounce_reason),
    updated_at = now()
  WHERE id = p_prospect_id;

  -- Update usage metrics
  v_month_year := to_char(now(), 'YYYY-MM');

  -- Increment usage counters based on status
  IF p_new_status = 'sent' AND v_prospect.review_status != 'sent' THEN
    INSERT INTO outbound_usage (user_id, customer_id, month_year, emails_sent)
    VALUES (v_prospect.user_id, v_prospect.customer_id, v_month_year, 1)
    ON CONFLICT (customer_id, month_year)
    DO UPDATE SET
      emails_sent = outbound_usage.emails_sent + 1,
      updated_at = now();
  END IF;

  IF p_new_status = 'opened' AND v_prospect.review_status != 'opened' THEN
    INSERT INTO outbound_usage (user_id, customer_id, month_year, emails_opened)
    VALUES (v_prospect.user_id, v_prospect.customer_id, v_month_year, 1)
    ON CONFLICT (customer_id, month_year)
    DO UPDATE SET
      emails_opened = outbound_usage.emails_opened + 1,
      updated_at = now();
  END IF;

  IF p_new_status = 'clicked' AND v_prospect.review_status != 'clicked' THEN
    INSERT INTO outbound_usage (user_id, customer_id, month_year, emails_clicked)
    VALUES (v_prospect.user_id, v_prospect.customer_id, v_month_year, 1)
    ON CONFLICT (customer_id, month_year)
    DO UPDATE SET
      emails_clicked = outbound_usage.emails_clicked + 1,
      updated_at = now();
  END IF;

  IF p_new_status = 'replied' AND v_prospect.review_status != 'replied' THEN
    INSERT INTO outbound_usage (user_id, customer_id, month_year, emails_replied)
    VALUES (v_prospect.user_id, v_prospect.customer_id, v_month_year, 1)
    ON CONFLICT (customer_id, month_year)
    DO UPDATE SET
      emails_replied = outbound_usage.emails_replied + 1,
      updated_at = now();
  END IF;

  IF p_new_status = 'bounced' AND v_prospect.review_status != 'bounced' THEN
    INSERT INTO outbound_usage (user_id, customer_id, month_year, emails_bounced)
    VALUES (v_prospect.user_id, v_prospect.customer_id, v_month_year, 1)
    ON CONFLICT (customer_id, month_year)
    DO UPDATE SET
      emails_bounced = outbound_usage.emails_bounced + 1,
      updated_at = now();
  END IF;
END;
$$;

-- Check usage limits
CREATE OR REPLACE FUNCTION check_outbound_limits(
  p_customer_id TEXT,
  p_limit_type TEXT
)
RETURNS TABLE(
  limit_type TEXT,
  current_usage INTEGER,
  limit INTEGER,
  remaining INTEGER,
  percentage_used NUMERIC,
  is_over_limit BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_year TEXT;
  v_usage outbound_usage%ROWTYPE;
  v_limit INTEGER;
  v_current INTEGER;
BEGIN
  v_month_year := to_char(now(), 'YYYY-MM');

  -- Get usage for current month
  SELECT * INTO v_usage
  FROM outbound_usage
  WHERE customer_id = p_customer_id
    AND month_year = v_month_year;

  -- Set limits based on type (these should come from subscription/plan)
  -- For now, using default limits
  CASE p_limit_type
    WHEN 'prospects' THEN
      v_limit := 1000;
      v_current := COALESCE(v_usage.prospects_processed, 0);
    WHEN 'enrichment' THEN
      v_limit := 500;
      v_current := COALESCE(v_usage.enrichment_credits_used, 0);
    WHEN 'emails' THEN
      v_limit := 1000;
      v_current := COALESCE(v_usage.emails_sent, 0);
    WHEN 'linkedin' THEN
      v_limit := 200;
      v_current := COALESCE(v_usage.linkedin_messages_sent, 0);
    ELSE
      RAISE EXCEPTION 'Invalid limit type';
  END CASE;

  RETURN QUERY SELECT
    p_limit_type,
    v_current,
    v_limit,
    GREATEST(v_limit - v_current, 0),
    ROUND((v_current::NUMERIC / v_limit::NUMERIC) * 100, 2),
    v_current >= v_limit;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outbound_campaigns_updated_at
  BEFORE UPDATE ON outbound_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outbound_prospects_updated_at
  BEFORE UPDATE ON outbound_prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outbound_sequences_updated_at
  BEFORE UPDATE ON outbound_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outbound_usage_updated_at
  BEFORE UPDATE ON outbound_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
