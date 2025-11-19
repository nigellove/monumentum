/*
  # Add Business Email Field
  
  1. Changes
    - Add `business_email` field to `business_profiles` table
    - Optional field for when business email differs from user account email
  
  2. Notes
    - This allows businesses to have a separate contact email
    - Defaults to NULL if not provided
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'business_email'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN business_email text;
  END IF;
END $$;