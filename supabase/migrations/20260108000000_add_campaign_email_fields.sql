-- Add email-related fields to outbound_campaigns table
-- These fields are needed for sending emails via the send-outbound-email Edge Function

ALTER TABLE outbound_campaigns
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
  ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Add comments to explain the fields
COMMENT ON COLUMN outbound_campaigns.sender_name IS 'Name shown in "From:" field when sending emails (e.g., company name or sender name)';
COMMENT ON COLUMN outbound_campaigns.reply_to_email IS 'Email address for replies (typically the company/business email)';
COMMENT ON COLUMN outbound_campaigns.email_signature IS 'Optional email signature appended to all outbound emails in this campaign';
