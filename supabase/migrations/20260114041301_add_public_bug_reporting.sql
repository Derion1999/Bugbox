/*
  # Add Public Bug Reporting Support

  1. Schema Changes
    - Add `description` (text) - Simple description field for public bug reports
    - Add `reporter_name` (text) - Optional name of external reporter
    - Add `reporter_email` (text) - Optional email of external reporter
    - Make `steps`, `expected`, `actual` nullable to support simpler public reports

  2. Security Changes
    - Add policy to allow anonymous users to submit bug reports
    - Public can only INSERT bugs, not view/update/delete them
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bugs' AND column_name = 'description'
  ) THEN
    ALTER TABLE bugs ADD COLUMN description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bugs' AND column_name = 'reporter_name'
  ) THEN
    ALTER TABLE bugs ADD COLUMN reporter_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bugs' AND column_name = 'reporter_email'
  ) THEN
    ALTER TABLE bugs ADD COLUMN reporter_email text;
  END IF;
END $$;

ALTER TABLE bugs ALTER COLUMN steps DROP NOT NULL;
ALTER TABLE bugs ALTER COLUMN expected DROP NOT NULL;
ALTER TABLE bugs ALTER COLUMN actual DROP NOT NULL;

DROP POLICY IF EXISTS "Public users can submit bug reports" ON bugs;

CREATE POLICY "Public users can submit bug reports"
  ON bugs FOR INSERT
  TO anon
  WITH CHECK (true);
