/*
  # Update Bug View Policy for Pending Approvals

  1. Security Changes
    - Update the view policy to allow users to see both approved and unapproved bugs that belong to them
    - This allows users to see pending submissions for review
*/

DROP POLICY IF EXISTS "Users can view own bug reports" ON bugs;

CREATE POLICY "Users can view own bug reports"
  ON bugs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
