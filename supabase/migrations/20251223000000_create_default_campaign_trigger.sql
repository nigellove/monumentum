-- ============================================================================
-- AUTO-CREATE DEFAULT CAMPAIGN ON BUSINESS PROFILE CREATION
-- ============================================================================
-- This trigger automatically creates a default outbound campaign when a
-- business profile is created, pre-populated with sensible defaults.

CREATE OR REPLACE FUNCTION create_default_outbound_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a default campaign for the new business profile
  INSERT INTO outbound_campaigns (
    user_id,
    customer_id,
    campaign_name,
    target_product,
    target_icp,
    status
  ) VALUES (
    NEW.user_id,
    NEW.customer_id,
    'Default Campaign',
    NULL, -- No specific product targeting by default
    jsonb_build_object(
      'industries', ARRAY['All'],
      'company_size', ARRAY[50, 10000],
      'job_titles', ARRAY[
        'VP of HR',
        'Chief People Officer',
        'Head of HR',
        'VP of Product',
        'Head of Product',
        'VP of Finance',
        'Head of Finance',
        'Chief Financial Officer'
      ]
    ),
    'draft'
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_create_default_campaign ON business_profiles;

CREATE TRIGGER trigger_create_default_campaign
  AFTER INSERT ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_outbound_campaign();

-- ============================================================================
-- Backfill: Create default campaigns for existing business profiles
-- ============================================================================
-- This creates default campaigns for any existing profiles that don't have one

DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN
    SELECT DISTINCT bp.user_id, bp.customer_id
    FROM business_profiles bp
    LEFT JOIN outbound_campaigns oc
      ON bp.customer_id = oc.customer_id
      AND oc.campaign_name = 'Default Campaign'
    WHERE oc.id IS NULL
  LOOP
    INSERT INTO outbound_campaigns (
      user_id,
      customer_id,
      campaign_name,
      target_product,
      target_icp,
      status
    ) VALUES (
      profile_record.user_id,
      profile_record.customer_id,
      'Default Campaign',
      NULL,
      jsonb_build_object(
        'industries', ARRAY['All'],
        'company_size', ARRAY[50, 10000],
        'job_titles', ARRAY[
          'VP of HR',
          'Chief People Officer',
          'Head of HR',
          'VP of Product',
          'Head of Product',
          'VP of Finance',
          'Head of Finance',
          'Chief Financial Officer'
        ]
      ),
      'draft'
    );
  END LOOP;
END;
$$;
