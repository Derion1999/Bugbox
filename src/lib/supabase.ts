import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Bug = {
  id: string;
  title: string;
  steps?: string;
  expected?: string;
  actual?: string;
  description?: string;
  reporter_name?: string;
  reporter_email?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'closed';
  user_id: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export type BugAttachment = {
  id: string;
  bug_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export type UserSettings = {
  id: string;
  user_id: string;
  app_name: string;
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  timezone: string;
  auto_close_bugs: boolean;
  default_severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: 'call' | 'meeting' | 'other';
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string;
  created_at: string;
  updated_at: string;
}