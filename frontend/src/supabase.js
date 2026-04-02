import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'CRITICAL: Supabase environment variables are missing! ' +
    'If this is a production build, ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'are set in your Render environment variables dashboard BEFORE building.';
  console.error(errorMsg);
}

// Initialize with an empty string if missing to trigger a clear initialization error
// rather than a "Failed to fetch" from a placeholder domain.
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
