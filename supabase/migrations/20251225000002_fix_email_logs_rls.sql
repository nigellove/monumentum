-- ============================================================================
-- FIX RLS POLICIES FOR OUTBOUND_EMAIL_LOGS
-- ============================================================================
-- Ensures proper tenant isolation using customer_id validation

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own email logs" ON outbound_email_logs;

-- Create proper tenant-isolated policy
CREATE POLICY "Users can view email logs for their customer"
  ON outbound_email_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.customer_id = outbound_email_logs.customer_id
      AND business_profiles.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view email logs for their customer" ON outbound_email_logs IS 'Ensures users can only view email logs for their own customer_id (tenant isolation)';
