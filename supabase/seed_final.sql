-- ============================================================================
-- MONUMENTUM SEED DATA - READY TO RUN
-- ============================================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nkwmfqbuhvtloihbrwef/sql/new
-- ============================================================================

-- ============================================================================
-- 1. ADMIN ACCOUNT (Super User)
-- ============================================================================

-- Create admin business profile
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

-- Create admin subscription (Enterprise tier, no Stripe)
INSERT INTO subscriptions (
  user_id,
  customer_id,
  tier,
  status,
  stripe_subscription_id,
  stripe_customer_id,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  'a1234567-89ab-cdef-0123-456789abcdef',
  'admin-super-user',
  'enterprise',
  'active',
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '10 years',
  NOW(),
  NOW()
);

-- ============================================================================
-- 2. TEST CUSTOMER ACCOUNT
-- ============================================================================

-- Create test business profile
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

-- Create test subscription (Enterprise tier, no Stripe)
INSERT INTO subscriptions (
  user_id,
  customer_id,
  tier,
  status,
  stripe_subscription_id,
  stripe_customer_id,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'enterprise',
  'active',
  NULL,
  NULL,
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
-- 4. TEST PROSPECT (Email will be sent to your Gmail)
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
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '=== BUSINESS PROFILES ===' as info;
SELECT user_id, customer_id, business_name FROM business_profiles;

SELECT '=== SUBSCRIPTIONS ===' as info;
SELECT user_id, customer_id, tier, status FROM subscriptions;

SELECT '=== CAMPAIGNS ===' as info;
SELECT id, campaign_name, sender_name, status FROM outbound_campaigns;

SELECT '=== PROSPECTS ===' as info;
SELECT id, prospect_name, prospect_email, email_status FROM outbound_prospects;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ SEED DATA CREATED SUCCESSFULLY!' as status;
SELECT 'To send test email, use these IDs:' as next_step;
SELECT 'prospect_id: cccccccc-5555-6666-7777-888888888888' as prospect_id;
SELECT 'campaign_id: bbbbbbbb-1111-2222-3333-444444444444' as campaign_id;
SELECT 'user_id: 3cc701a5-eee4-44ed-926e-7d9cc956f223' as user_id;
