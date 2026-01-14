/*
  # Create BugBox Database Schema

  1. New Tables
    - `bugs`
      - `id` (uuid, primary key) - Unique identifier for each bug report
      - `title` (text) - Bug title/summary
      - `steps` (text) - Steps to reproduce the bug
      - `expected` (text) - Expected behavior
      - `actual` (text) - Actual behavior observed
      - `severity` (text) - Bug severity level (low, medium, high, critical)
      - `status` (text) - Bug status (open, in_progress, closed)
      - `user_id` (uuid) - Foreign key to auth.users
      - `created_at` (timestamptz) - Timestamp when bug was created
      - `updated_at` (timestamptz) - Timestamp when bug was last updated

  2. Security
    - Enable RLS on `bugs` table
    - Add policy for users to view their own bug reports
    - Add policy for users to create their own bug reports
    - Add policy for users to update their own bug reports
    - Add policy for users to delete their own bug reports
*/

CREATE TABLE IF NOT EXISTS bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  steps text NOT NULL,
  expected text NOT NULL,
  actual text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bug reports"
  ON bugs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bug reports"
  ON bugs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bug reports"
  ON bugs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bug reports"
  ON bugs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bugs_user_id_idx ON bugs(user_id);
CREATE INDEX IF NOT EXISTS bugs_severity_idx ON bugs(severity);
CREATE INDEX IF NOT EXISTS bugs_status_idx ON bugs(status);