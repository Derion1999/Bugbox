/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes on foreign keys
    - Optimize RLS policies with auth function caching

  2. Missing Indexes
    - Add index on `bug_attachments.bug_id`
    - Add index on `public_issue_reports.converted_bug_id`
    - Add index on `public_issue_reports.project_owner_id`

  3. RLS Optimization
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS bug_attachments_bug_id_idx ON bug_attachments(bug_id);
CREATE INDEX IF NOT EXISTS public_issue_reports_converted_bug_id_idx ON public_issue_reports(converted_bug_id);
CREATE INDEX IF NOT EXISTS public_issue_reports_project_owner_id_idx ON public_issue_reports(project_owner_id);

-- Drop and recreate bugs table policies with optimized auth checks
DROP POLICY IF EXISTS "Users can view own bug reports" ON bugs;
DROP POLICY IF EXISTS "Users can create own bug reports" ON bugs;
DROP POLICY IF EXISTS "Users can update own bug reports" ON bugs;
DROP POLICY IF EXISTS "Users can delete own bug reports" ON bugs;

CREATE POLICY "Users can view own bug reports"
  ON bugs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR approved = true);

CREATE POLICY "Users can create own bug reports"
  ON bugs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own bug reports"
  ON bugs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own bug reports"
  ON bugs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimize stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimize stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = (select auth.uid())
    )
  );

-- Optimize stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = (select auth.uid())
    )
  );

-- Optimize bug_attachments policies
DROP POLICY IF EXISTS "Users can view attachments for their bugs" ON bug_attachments;
DROP POLICY IF EXISTS "Users can insert attachments for their bugs" ON bug_attachments;
DROP POLICY IF EXISTS "Users can delete attachments for their bugs" ON bug_attachments;

CREATE POLICY "Users can view attachments for their bugs"
  ON bug_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert attachments for their bugs"
  ON bug_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete attachments for their bugs"
  ON bug_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bugs
      WHERE bugs.id = bug_attachments.bug_id
      AND bugs.user_id = (select auth.uid())
    )
  );

-- Optimize user_settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimize public_issue_reports policies
DROP POLICY IF EXISTS "Project owners can view their issue reports" ON public_issue_reports;
DROP POLICY IF EXISTS "Project owners can update their issue reports" ON public_issue_reports;
DROP POLICY IF EXISTS "Project owners can delete their issue reports" ON public_issue_reports;

CREATE POLICY "Project owners can view their issue reports"
  ON public_issue_reports FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = project_owner_id);

CREATE POLICY "Project owners can update their issue reports"
  ON public_issue_reports FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = project_owner_id)
  WITH CHECK ((select auth.uid()) = project_owner_id);

CREATE POLICY "Project owners can delete their issue reports"
  ON public_issue_reports FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = project_owner_id);

-- Optimize tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimize calendar_events policies
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);