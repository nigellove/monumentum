-- ============================================================================
-- ADD ADMIN FIELDS TO USERS
-- ============================================================================
-- Adds is_admin flag to user metadata for simple admin access control
-- ============================================================================

-- Add admin flag to existing users (default to false)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": false}'::jsonb
WHERE raw_user_meta_data->>'is_admin' IS NULL;

-- Manually set first admin via Supabase dashboard or:
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
-- WHERE email = 'nigel@monumentum.ai';

SELECT '✅ Admin fields added to users!' as status;
