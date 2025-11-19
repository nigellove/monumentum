/*
  # Add Stripe Integration Fields to User Products

  ## Overview
  Adds Stripe-specific fields to track subscriptions and payments.

  ## Changes to `user_products` Table
  
  ### New Columns
  - `stripe_customer_id` (text, nullable) - Stripe customer ID for this user
  - `stripe_subscription_id` (text, nullable) - Stripe subscription ID
  - `stripe_price_id` (text, nullable) - Stripe price ID for the product
  - `product_id` (text) - Internal product identifier (e.g., 'sales_agent')
  - `billing_cycle` (text) - Billing cycle: 'monthly', 'yearly', etc.
  - `trial_ends_at` (timestamptz, nullable) - When free trial ends
  
  ## Notes
  - Existing data remains intact
  - All new fields are nullable to support existing records
  - product_id will help identify which product type the user purchased
*/

-- Add Stripe and product tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE user_products ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE user_products ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE user_products ADD COLUMN stripe_price_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE user_products ADD COLUMN product_id text DEFAULT 'sales_agent';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE user_products ADD COLUMN billing_cycle text DEFAULT 'monthly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE user_products ADD COLUMN trial_ends_at timestamptz;
  END IF;
END $$;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS user_products_stripe_customer_id_idx ON user_products(stripe_customer_id);
CREATE INDEX IF NOT EXISTS user_products_stripe_subscription_id_idx ON user_products(stripe_subscription_id);
