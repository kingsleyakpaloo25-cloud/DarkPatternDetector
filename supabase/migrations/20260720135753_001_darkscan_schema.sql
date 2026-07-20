/*
# DarkScan - Core Schema

## Overview
Creates the full data model for the DarkScan dark-pattern detection platform:
user profiles, scan records, detected dark patterns, and contact messages.
Includes an admin role mechanism (a profiles.is_admin flag) so a designated
admin account can view all user activity and download the user database.

## 1. New Tables

- `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text, nullable)
  - `phone` (text, nullable) - phone number for phone-auth users
  - `avatar_url` (text, nullable)
  - `is_admin` (boolean, default false) - marks the admin account
  - `created_at` (timestamptz, default now())

- `scans`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, default auth.uid())
  - `scan_type` (text) - 'website' | 'screenshot' | 'ai'
  - `target` (text) - URL or image filename
  - `title` (text, nullable)
  - `status` (text, default 'completed')
  - `pattern_count` (integer, default 0)
  - `created_at` (timestamptz, default now())

- `detected_patterns`
  - `id` (uuid, primary key)
  - `scan_id` (uuid, references scans ON DELETE CASCADE)
  - `user_id` (uuid, references profiles, default auth.uid())
  - `type` (text) - e.g. 'Confirmshaming', 'Fake Countdown', 'Hidden Costs'
  - `confidence` (integer) - 0-100
  - `severity` (text) - 'Low' | 'Medium' | 'High'
  - `description` (text)
  - `evidence` (text, nullable) - matched text/snippet
  - `recommendation` (text)
  - `created_at` (timestamptz, default now())

- `contact_messages`
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable, references profiles)
  - `name` (text)
  - `email` (text)
  - `subject` (text, nullable)
  - `message` (text)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz, default now())

## 2. Security (RLS)

- `profiles`: users can read/update own row; admins can read all.
- `scans`: owner-scoped CRUD; admins can read all.
- `detected_patterns`: owner-scoped CRUD; admins can read all.
- `contact_messages`: any authenticated user can insert; admins can read all.

## 3. Important Notes

1. The admin account (AndrewsOsei1@gmail.com) is created from the frontend
   sign-up flow, then promoted to admin via the `setup-admin` edge function
   using the service role key (never exposed to the client).
2. Owner columns default to `auth.uid()` so client inserts omitting them
   still satisfy RLS WITH CHECK.
3. All policies are idempotent (DROP IF EXISTS before CREATE).
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- scans
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  scan_type text NOT NULL,
  target text NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'completed',
  pattern_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scans" ON scans;
CREATE POLICY "select_own_scans" ON scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scans" ON scans;
CREATE POLICY "insert_own_scans" ON scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_scans" ON scans;
CREATE POLICY "update_own_scans" ON scans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_scans" ON scans;
CREATE POLICY "delete_own_scans" ON scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_scans" ON scans;
CREATE POLICY "admin_select_all_scans" ON scans FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- detected_patterns
CREATE TABLE IF NOT EXISTS detected_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  confidence integer NOT NULL DEFAULT 0,
  severity text NOT NULL DEFAULT 'Medium',
  description text NOT NULL,
  evidence text,
  recommendation text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_patterns" ON detected_patterns;
CREATE POLICY "select_own_patterns" ON detected_patterns FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_patterns" ON detected_patterns;
CREATE POLICY "insert_own_patterns" ON detected_patterns FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_patterns" ON detected_patterns;
CREATE POLICY "delete_own_patterns" ON detected_patterns FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_patterns" ON detected_patterns;
CREATE POLICY "admin_select_all_patterns" ON detected_patterns FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_contact_messages" ON contact_messages;
CREATE POLICY "insert_contact_messages" ON contact_messages FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_all_messages" ON contact_messages;
CREATE POLICY "admin_select_all_messages" ON contact_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_all_messages" ON contact_messages;
CREATE POLICY "admin_update_all_messages" ON contact_messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_scan_id ON detected_patterns(scan_id);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_user_id ON detected_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Helper: ensure a profile row exists for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
