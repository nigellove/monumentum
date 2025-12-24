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
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user's email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Create a default campaign for the new business profile
  INSERT INTO outbound_campaigns (
    user_id,
    customer_id,
    campaign_name,
    target_product,
    target_icp,
    status,
    sender_name,
    reply_to_email,
    calendar_link,
    email_signature
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
    'draft',
    NEW.business_name, -- Default sender name from business profile
    COALESCE(NEW.business_email, v_user_email), -- Reply-to email (user's email)
    NULL, -- No default calendar link
    NULL  -- No default signature
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
  v_user_email TEXT;
BEGIN
  FOR profile_record IN
    SELECT DISTINCT bp.user_id, bp.customer_id
    FROM business_profiles bp
    LEFT JOIN outbound_campaigns oc
      ON bp.customer_id = oc.customer_id
      AND oc.campaign_name = 'Default Campaign'
    WHERE oc.id IS NULL
  LOOP
    -- Get user's email for this profile
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = profile_record.user_id;

    INSERT INTO outbound_campaigns (
      user_id,
      customer_id,
      campaign_name,
      target_product,
      target_icp,
      status,
      sender_name,
      reply_to_email,
      calendar_link,
      email_signature
    )
    SELECT
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
      'draft',
      bp.business_name, -- Get sender name from business profile
      COALESCE(bp.business_email, v_user_email), -- Reply-to email (user's email)
      NULL, -- No calendar link
      NULL  -- No signature
    FROM business_profiles bp
    WHERE bp.user_id = profile_record.user_id
    LIMIT 1;
  END LOOP;
END;
$$;
