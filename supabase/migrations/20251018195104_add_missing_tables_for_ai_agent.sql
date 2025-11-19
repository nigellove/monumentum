/*
  # Add Missing Tables for AI Agent System

  1. New Tables
    - `conversations` - Store chat conversations
    - `user_leads` - Store captured leads
    
  2. Schema Updates
    - Add `customer_id` to business_profiles
    - Add `ai_prompt`, `config_data`, `platform` to user_products

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id text NOT NULL,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations for their customer_id"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.customer_id = conversations.customer_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update conversations"
  ON conversations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id text,
  message text,
  lead_json jsonb,
  csv_key text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their leads"
  ON user_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.customer_id = user_leads.customer_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert leads"
  ON user_leads
  FOR INSERT
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN customer_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'ai_prompt'
  ) THEN
    ALTER TABLE user_products ADD COLUMN ai_prompt text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'config_data'
  ) THEN
    ALTER TABLE user_products ADD COLUMN config_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_products' AND column_name = 'platform'
  ) THEN
    ALTER TABLE user_products ADD COLUMN platform text DEFAULT 'custom'::text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_user_leads_customer_id ON user_leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_customer_id ON business_profiles(customer_id);
