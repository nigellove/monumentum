-- ============================================================================
-- MONUMENTUM SEED DATA
-- ============================================================================
-- Creates admin and test accounts for development and testing
-- Run this manually in Supabase SQL Editor or via: psql < seed.sql
--
-- IMPORTANT: Only run this in development/staging environments
-- ============================================================================

-- ============================================================================
-- 1. CREATE ADMIN USER (Super Admin - Full Access)
-- ============================================================================
-- This user has god-mode access to all features and all customer data
-- Email: admin@monumentum.ai
-- Password: MonumentumAdmin2025! (change this after first login!)
-- ============================================================================

-- Note: In production, you'd create this via Supabase Auth Dashboard
-- For now, we'll create the business profile and subscription assuming the auth user exists
-- You'll need to sign up via the UI first, then run this script

-- Placeholder: Replace this UUID with your actual user_id after signing up
-- Get your user_id from: https://supabase.com/dashboard/project/nkwmfqbuhvtloihbrwef/auth/users
DO $$
DECLARE
  admin_user_id UUID := 'REPLACE_WITH_YOUR_USER_ID'; -- TODO: Replace this
  admin_customer_id TEXT := 'admin-super-user';
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM business_profiles WHERE customer_id = admin_customer_id) THEN

    -- Create admin business profile
    INSERT INTO business_profiles (
      user_id,
      customer_id,
      business_name,
      industry,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      admin_customer_id,
      'Monumentum Admin',
      'SaaS Platform',
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
      admin_user_id,
      admin_customer_id,
      'enterprise',
      'active',
      NULL, -- No Stripe for admin
      NULL,
      NOW(),
      NOW() + INTERVAL '10 years', -- Never expires
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin account created for user_id: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin account already exists';
  END IF;
END $$;


-- ============================================================================
-- 2. CREATE TEST CUSTOMER ACCOUNT (For Testing Customer Experience)
-- ============================================================================
-- This simulates a real customer account with Enterprise features
-- Email: test@monumentum.ai
-- Password: TestCustomer2025! (change this after first login!)
-- ============================================================================

DO $$
DECLARE
  test_user_id UUID := 'REPLACE_WITH_TEST_USER_ID'; -- TODO: Replace this
  test_customer_id TEXT := 'test-customer-001';
  test_campaign_id UUID;
  test_prospect_id UUID;
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM business_profiles WHERE customer_id = test_customer_id) THEN

    -- Create test business profile
    INSERT INTO business_profiles (
      user_id,
      customer_id,
      business_name,
      industry,
      company_size,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      test_customer_id,
      'Test Customer Inc',
      'Technology',
      '11-50',
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
      test_user_id,
      test_customer_id,
      'enterprise',
      'active',
      NULL, -- No Stripe for test account
      NULL,
      NOW(),
      NOW() + INTERVAL '1 year',
      NOW(),
      NOW()
    );

    -- Create test campaign
    test_campaign_id := gen_random_uuid();
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
      test_campaign_id,
      test_user_id,
      test_customer_id,
      'Test Campaign - AWS SES Verification',
      'Test Sender',
      'test@monumentum.ai', -- Change this to your email
      E'Best regards,\nTest Sender\nTest Customer Inc',
      'active',
      ARRAY['Technology', 'SaaS'],
      ARRAY['11-50', '51-200'],
      ARRAY['CEO', 'CTO', 'VP of Sales'],
      NOW(),
      NOW()
    );

    -- Create test prospect (send to yourself for testing)
    test_prospect_id := gen_random_uuid();
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
      test_prospect_id,
      test_user_id,
      test_customer_id,
      test_campaign_id,
      'Test Prospect (You)',
      'YOUR_EMAIL_HERE@gmail.com', -- TODO: Replace with your email
      'Test Company',
      'Test Role',
      'Technology',
      '11-50',
      'Test Email from Monumentum',
      E'Hi there,\n\nThis is a test email sent via AWS SES from Monumentum.\n\nIf you receive this, the email sending is working correctly!\n\nPlease verify:\n1. From field shows: "Test Sender" via Monumentum <sales@monumentum.ai>\n2. Reply-To is set to: test@monumentum.ai\n3. Email doesn''t go to spam',
      'approved',
      'draft',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Test customer account created for user_id: %', test_user_id;
    RAISE NOTICE 'Test campaign created: %', test_campaign_id;
    RAISE NOTICE 'Test prospect created: %', test_prospect_id;
    RAISE NOTICE 'To send test email, use prospect_id: % and campaign_id: %', test_prospect_id, test_campaign_id;
  ELSE
    RAISE NOTICE 'Test customer account already exists';
  END IF;
END $$;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the seed data was created correctly
-- ============================================================================

-- Check business profiles
SELECT user_id, customer_id, business_name, industry
FROM business_profiles
ORDER BY created_at DESC;

-- Check subscriptions
SELECT user_id, customer_id, tier, status, current_period_end
FROM subscriptions
ORDER BY created_at DESC;

-- Check campaigns
SELECT id, campaign_name, sender_name, reply_to_email, status
FROM outbound_campaigns
ORDER BY created_at DESC;

-- Check prospects
SELECT id, prospect_name, prospect_email, company_name, draft_subject, review_status, email_status
FROM outbound_prospects
ORDER BY created_at DESC;

-- ============================================================================
-- CLEANUP (Optional - only run if you need to start over)
-- ============================================================================
-- Uncomment and run this to delete all seed data
-- ============================================================================

/*
DELETE FROM outbound_email_logs WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM outbound_prospects WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM outbound_campaigns WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM subscriptions WHERE customer_id IN ('admin-super-user', 'test-customer-001');
DELETE FROM business_profiles WHERE customer_id IN ('admin-super-user', 'test-customer-001');
*/
