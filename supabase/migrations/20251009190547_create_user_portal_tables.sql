/*
  # User Portal Schema Setup

  ## Overview
  Creates tables for user file management and product/subscription tracking.
  
  ## New Tables
  
  ### `user_files`
  - `id` (uuid, primary key) - Unique identifier for each file record
  - `user_id` (uuid, foreign key) - References auth.users, the owner of the file
  - `file_name` (text) - Original name of the uploaded file
  - `file_url` (text) - Storage URL or path to the file
  - `file_size` (integer) - Size of the file in bytes
  - `file_type` (text) - MIME type of the file
  - `uploaded_at` (timestamptz) - When the file was uploaded
  - `description` (text, nullable) - Optional description of the file
  
  ### `user_products`
  - `id` (uuid, primary key) - Unique identifier for each product record
  - `user_id` (uuid, foreign key) - References auth.users, the owner of the subscription
  - `product_name` (text) - Name of the product/service
  - `status` (text) - Status: 'active', 'cancelled', 'expired'
  - `started_at` (timestamptz) - When the subscription started
  - `expires_at` (timestamptz, nullable) - When the subscription expires (null for lifetime)
  - `price` (text) - Price information (stored as text for simplicity)
  - `description` (text, nullable) - Optional description of the product
  
  ## Security
  
  ### Row Level Security (RLS)
  - Both tables have RLS enabled
  - Users can only view, insert, update, and delete their own records
  - All policies require authentication
  - Policies check that auth.uid() matches the user_id column
  
  ## Notes
  - File storage integration can be added later
  - Product/subscription management is manual for now (admin updates via SQL)
  - All timestamps use timestamptz for proper timezone handling
*/

-- Create user_files table
CREATE TABLE IF NOT EXISTS user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer DEFAULT 0,
  file_type text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  description text
);

-- Create user_products table
CREATE TABLE IF NOT EXISTS user_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  price text DEFAULT '',
  description text
);

-- Enable RLS on user_files
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_products
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_files
CREATE POLICY "Users can view own files"
  ON user_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
  ON user_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON user_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON user_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_products
CREATE POLICY "Users can view own products"
  ON user_products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON user_products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON user_products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON user_products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON user_files(user_id);
CREATE INDEX IF NOT EXISTS user_products_user_id_idx ON user_products(user_id);