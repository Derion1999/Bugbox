/*
  # Add User Settings

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `app_name` (text, customizable app name)
      - `theme` (text, light/dark/auto)
      - `notifications_enabled` (boolean)
      - `email_notifications` (boolean)
      - `push_notifications` (boolean)
      - `language` (text, language preference)
      - `timezone` (text, timezone)
      - `auto_close_bugs` (boolean, auto-close resolved bugs after X days)
      - `default_severity` (text, default severity for new bugs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for users to manage only their own settings
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name text DEFAULT 'My Bug Tracker',
  theme text DEFAULT 'light',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  auto_close_bugs boolean DEFAULT false,
  default_severity text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);