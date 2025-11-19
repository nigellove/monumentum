/*
  # Add Business Profile Fields
  
  1. New Table
    - `business_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `business_name` (text, required)
      - `business_address` (text)
      - `business_city` (text)
      - `business_state` (text)
      - `business_zip` (text)
      - `business_country` (text)
      - `business_description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `business_profiles` table
    - Add policy for users to read their own business profile
    - Add policy for users to update their own business profile
    - Add policy for users to insert their own business profile
*/

CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name text NOT NULL,
  business_address text,
  business_city text,
  business_state text,
  business_zip text,
  business_country text DEFAULT 'United States',
  business_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business profile"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS business_profiles_user_id_idx ON business_profiles(user_id);