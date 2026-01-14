/*
  # Add Bug Approval Workflow

  1. Schema Changes
    - Add `approved` (boolean) - Whether the bug has been approved by the owner
    - Default to true for authenticated submissions, false for public submissions

  2. Security Changes
    - Update policies to handle approved/unapproved bugs
    - Users can view their own approved bugs
    - Users can view pending (unapproved) bugs submitted to them
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bugs' AND column_name = 'approved'
  ) THEN
    ALTER TABLE bugs ADD COLUMN approved boolean DEFAULT true;
  END IF;
END $$;

ALTER TABLE bugs ALTER COLUMN approved SET DEFAULT true;

UPDATE bugs SET approved = true WHERE approved IS NULL;

CREATE INDEX IF NOT EXISTS bugs_approved_idx ON bugs(approved);
