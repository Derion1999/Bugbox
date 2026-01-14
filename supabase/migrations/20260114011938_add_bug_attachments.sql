/*
  # Add Bug Attachments Support

  1. New Tables
    - `bug_attachments`
      - `id` (uuid, primary key)
      - `bug_id` (uuid, foreign key to bugs table)
      - `file_name` (text, original file name)
      - `file_path` (text, storage path)
      - `file_type` (text, mime type)
      - `file_size` (bigint, size in bytes)
      - `created_at` (timestamptz)

  2. Storage
    - Create `bug-attachments` storage bucket for images and videos

  3. Security
    - Enable RLS on `bug_attachments` table
    - Add policies for authenticated users to manage their own bug attachments
    - Configure storage bucket policies
*/

CREATE TABLE IF NOT EXISTS bug_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id uuid NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bug_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for their bugs"
  ON bug_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for their bugs"
  ON bug_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for their bugs"
  ON bug_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-attachments', 'bug-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bug-attachments');

CREATE POLICY "Users can view their attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'bug-attachments');

CREATE POLICY "Users can delete their attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'bug-attachments');