-- Create table to store a single row of carousel settings
-- Run this in your Supabase SQL editor or via psql connected to the database.

CREATE TABLE IF NOT EXISTS public.carousel_settings (
  id text PRIMARY KEY,
  settings jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Optional: grant access to anon/public role if you want client-side upserts
-- WARNING: granting write permissions to anon is insecure for production.
-- Use RLS or a dedicated API key with limited privileges instead.

-- Example: allow authenticated users role (replace with your role if different)
-- GRANT SELECT, INSERT, UPDATE ON public.carousel_settings TO authenticated;

-- Create an index on updated_at for queries
CREATE INDEX IF NOT EXISTS idx_carousel_settings_updated_at ON public.carousel_settings (updated_at DESC);
