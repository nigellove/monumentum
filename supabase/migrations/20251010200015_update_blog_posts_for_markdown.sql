/*
  # Update Blog Posts Table for Markdown Support

  1. Schema Changes
    - Add `content_markdown` column for storing raw markdown
    - Add `content_html` column for storing rendered HTML
    - Rename `author_id` to `user_id` for consistency
    - Add `status` column to replace `published` boolean
    - Add `meta_keywords` for SEO

  2. Data Migration
    - Copy existing content to content_markdown
    - Convert published boolean to status

  3. Security
    - Update RLS policies for new schema
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'content_markdown'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_markdown text;
    UPDATE blog_posts SET content_markdown = content WHERE content_markdown IS NULL;
    ALTER TABLE blog_posts ALTER COLUMN content_markdown SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'content_html'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_html text;
    UPDATE blog_posts SET content_html = content WHERE content_html IS NULL;
    ALTER TABLE blog_posts ALTER COLUMN content_html SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE blog_posts SET user_id = author_id WHERE user_id IS NULL;
    ALTER TABLE blog_posts ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
    UPDATE blog_posts SET status = CASE WHEN published = true THEN 'published' ELSE 'draft' END WHERE status IS NULL;
    ALTER TABLE blog_posts ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_keywords text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN featured_image_url text;
  END IF;
END $$;

DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can create own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can update own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can delete own blog posts" ON blog_posts;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Users can view own blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
