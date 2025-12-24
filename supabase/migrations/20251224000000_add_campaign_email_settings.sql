-- ============================================================================
-- ADD EMAIL SETTINGS TO CAMPAIGNS
-- ============================================================================
-- Adds sender identity and email configuration fields to campaigns
-- Created: 2024-12-24

-- Add email settings columns to outbound_campaigns
ALTER TABLE outbound_campaigns
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
ADD COLUMN IF NOT EXISTS calendar_link TEXT,
ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Add comment explaining these fields
COMMENT ON COLUMN outbound_campaigns.sender_name IS 'Name that appears in "From" field (e.g., "John Smith via Monumentum")';
COMMENT ON COLUMN outbound_campaigns.reply_to_email IS 'Email address where prospect replies will be sent (user''s email)';
COMMENT ON COLUMN outbound_campaigns.calendar_link IS 'Optional meeting booking link (Calendly, Cal.com, etc.) to include in emails';
COMMENT ON COLUMN outbound_campaigns.email_signature IS 'Optional signature to append to all emails in this campaign';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
