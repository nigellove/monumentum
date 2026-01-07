-- ============================================================================
-- SET ADMIN FLAG FOR YOUR ACCOUNT
-- ============================================================================
-- Run this in Supabase SQL Editor to grant yourself admin access
-- ============================================================================

-- Set admin flag to true for your account (admin@monumentum.ai)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@monumentum.ai';

-- Also set for nigel@monumentum.ai if needed
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'nigel@monumentum.ai';

-- Verify the updates
SELECT
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email IN ('admin@monumentum.ai', 'nigel@monumentum.ai');

SELECT '✅ Admin flag set!' as status;
