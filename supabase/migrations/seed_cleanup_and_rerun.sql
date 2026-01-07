-- ============================================================================
-- CLEANUP AND RE-RUN SEED DATA
-- ============================================================================
-- This script deletes existing seed data and recreates it
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Delete existing seed data (if any)
DELETE FROM outbound_email_logs WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM outbound_prospects WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM outbound_campaigns WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM subscriptions WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM business_profiles WHERE customer_id IN ('admin-super-user', 'test-customer-001');

-- ============================================================================
-- 1. ADMIN ACCOUNT (Super User)
-- ============================================================================

INSERT INTO business_profiles (
  user_id,
  customer_id,
  business_name,
  created_at,
  updated_at
) VALUES (
  'a1234567-89ab-cdef-0123-456789abcdef',
  'admin-super-user',
  'Monumentum Admin',
  NOW(),
  NOW()
);

INSERT INTO subscriptions (
  user_id,
  customer_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  'a1234567-89ab-cdef-0123-456789abcdef',
  'admin-super-user',
  'enterprise',
  'active',
  NOW(),
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
);

-- ============================================================================
-- 2. TEST CUSTOMER ACCOUNT
-- ============================================================================

INSERT INTO business_profiles (
  user_id,
  customer_id,
  business_name,
  created_at,
  updated_at
) VALUES (
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'Test Customer Inc',
  NOW(),
  NOW()
);

INSERT INTO subscriptions (
  user_id,
  customer_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'enterprise',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- ============================================================================
-- 3. TEST CAMPAIGN
-- ============================================================================

INSERT INTO outbound_campaigns (
  id,
  user_id,
  customer_id,
  campaign_name,
  sender_name,
  reply_to_email,
  email_signature,
  status,
  target_industries,
  target_company_sizes,
  target_job_titles,
  created_at,
  updated_at
) VALUES (
  'bbbbbbbb-1111-2222-3333-444444444444',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'Test Campaign - AWS SES Verification',
  'Nigel Love',
  'nigel@monumentum.ai',
  E'Best regards,\nNigel Love\nTest Customer Inc',
  'active',
  ARRAY['Technology', 'SaaS'],
  ARRAY['11-50', '51-200'],
  ARRAY['CEO', 'CTO', 'VP of Sales'],
  NOW(),
  NOW()
);

-- ============================================================================
-- 4. TEST PROSPECT
-- ============================================================================

INSERT INTO outbound_prospects (
  id,
  user_id,
  customer_id,
  campaign_id,
  prospect_name,
  prospect_email,
  company_name,
  job_title,
  industry,
  company_size,
  draft_subject,
  draft_message,
  review_status,
  email_status,
  created_at,
  updated_at
) VALUES (
  'cccccccc-5555-6666-7777-888888888888',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'Nigel Love (Test)',
  'nigel@monumentum.ai',
  'Test Company',
  'CEO',
  'Technology',
  '11-50',
  'Test Email from Monumentum - AWS SES Verification',
  E'Hi Nigel,\n\nThis is a test email sent via AWS SES from Monumentum.\n\nIf you receive this, the email sending infrastructure is working correctly!\n\n✅ Please verify:\n1. From field shows: "Nigel Love via Monumentum <sales@monumentum.ai>"\n2. Reply-To is set to: nigel@monumentum.ai\n3. Email doesn''t go to spam\n4. Tracking pixel loads (check email logs for opened_at)\n\nThis confirms:\n- AWS SES integration ✓\n- Edge Function deployment ✓\n- Email routing ✓\n- Tenant isolation ✓',
  'approved',
  'draft',
  NOW(),
  NOW()
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '✅ SEED DATA CREATED SUCCESSFULLY!' as status;
SELECT 'Ready to send test email!' as next_step;
