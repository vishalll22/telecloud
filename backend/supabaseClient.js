import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

if (isSupabaseEnabled) {
  console.log('⚡ Connected to Supabase Cloud PostgreSQL Database');
} else {
  console.log('💡 Using Local Lowdb filesystem database (set SUPABASE_URL and SUPABASE_KEY in .env to enable Supabase)');
}
