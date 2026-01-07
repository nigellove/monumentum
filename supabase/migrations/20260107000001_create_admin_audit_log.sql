-- ============================================================================
-- CREATE ADMIN AUDIT LOG
-- ============================================================================
-- Tracks all admin actions for compliance and security monitoring
-- ============================================================================

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'update', 'block', 'unblock', 'pause', 'resume', 'delete'
  resource_type TEXT NOT NULL, -- 'user', 'subscription', 'prospect', 'campaign'
  resource_id TEXT, -- UUID or identifier
  changes JSONB, -- Before/after state
  metadata JSONB, -- Additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
  );

-- Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Force use of service role for inserts

SELECT '✅ Admin audit log table created!' as status;
