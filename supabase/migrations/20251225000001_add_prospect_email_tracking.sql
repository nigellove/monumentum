-- ============================================================================
-- ADD EMAIL TRACKING COLUMNS TO OUTBOUND_PROSPECTS
-- ============================================================================

-- Add email status tracking
ALTER TABLE outbound_prospects
ADD COLUMN IF NOT EXISTS email_status TEXT CHECK (email_status IN ('draft', 'pending_review', 'approved', 'sent', 'bounced', 'failed')),
ADD COLUMN IF NOT EXISTS engagement_level TEXT CHECK (engagement_level IN ('not_sent', 'sent', 'opened', 'clicked', 'replied')),
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- Set default values for existing rows
UPDATE outbound_prospects
SET email_status = 'pending_review',
    engagement_level = 'not_sent'
WHERE email_status IS NULL;

-- Create index for filtering by email status
CREATE INDEX IF NOT EXISTS idx_prospects_email_status ON outbound_prospects(email_status);
CREATE INDEX IF NOT EXISTS idx_prospects_engagement_level ON outbound_prospects(engagement_level);

-- Comments
COMMENT ON COLUMN outbound_prospects.email_status IS 'Email workflow status: draft, pending_review, approved, sent, bounced, failed';
COMMENT ON COLUMN outbound_prospects.engagement_level IS 'Prospect engagement tracking: not_sent, sent, opened, clicked, replied';
COMMENT ON COLUMN outbound_prospects.last_contacted_at IS 'Timestamp of last outbound email sent to this prospect';
