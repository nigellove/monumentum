-- ============================================================================
-- FIX AUDIT LOG RLS POLICIES
-- ============================================================================
-- The current policy is failing because it tries to query auth.users table
-- We'll use a simpler approach with a helper function
-- ============================================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_log;

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'is_admin' = 'true'
     FROM auth.users
     WHERE id = auth.uid()),
    false
  );
$$;

-- Create new policy using the helper function
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (is_admin());

SELECT '✅ Audit log RLS policy fixed!' as status;
