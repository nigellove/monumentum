-- ============================================================================
-- SIMPLE SEED SCRIPT - Uses only existing tables
-- ============================================================================

-- Clean up any existing test data
DELETE FROM outbound_email_logs WHERE customer_id = 'test-customer-001';
DELETE FROM outbound_prospects WHERE customer_id = 'test-customer-001';
DELETE FROM outbound_campaigns WHERE customer_id = 'test-customer-001';
DELETE FROM business_profiles WHERE customer_id = 'test-customer-001';

-- Create business profile for test user
INSERT INTO business_profiles (
  user_id,
  customer_id,
  business_name
) VALUES (
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'Test Customer Inc'
);

-- Create test campaign
INSERT INTO outbound_campaigns (
  id,
  user_id,
  customer_id,
  campaign_name,
  sender_name,
  reply_to_email,
  email_signature,
  status
) VALUES (
  'bbbbbbbb-1111-2222-3333-444444444444',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'Test Campaign - AWS SES',
  'Nigel Love',
  'nigel@monumentum.ai',
  E'Best regards,\nNigel Love\nTest Customer Inc',
  'active'
);

-- Create test prospect
INSERT INTO outbound_prospects (
  id,
  user_id,
  customer_id,
  campaign_id,
  prospect_name,
  prospect_email,
  company_name,
  draft_subject,
  draft_message,
  review_status
) VALUES (
  'cccccccc-5555-6666-7777-888888888888',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'Nigel Love (Test)',
  'nigel@monumentum.ai',
  'Test Company',
  'Test Email from Monumentum',
  E'Hi Nigel,\n\nThis is a test email from Monumentum AWS SES.\n\nIf you receive this, it works!',
  'approved'
);

SELECT '✅ Test data created!' as status;
