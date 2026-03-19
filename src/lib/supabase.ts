import { createClient } from '@supabase/supabase-js'

/**
 * Oitii Zero-Config Supabase Client
 * 
 * Provides out-of-the-box read-only access to the central Oitii job database.
 * Users can override these by providing their own NEXT_PUBLIC_SUPABASE_URL 
 * and NEXT_PUBLIC_SUPABASE_ANON_KEY in their local .env files.
 * 
 * Primary Table: public.verified_jobs
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzjqjnsdirbjfvbuohse.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6anFqbnNkaXJiamZ2YnVvaHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5MDM3MzEsImV4cCI6MjA0NDQ3OTczMX0.ylkASw0MZQyo1BfuGfot_N6ifsPgSFQ0adCDu9ZWNRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
