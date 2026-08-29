import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

function getSupabaseAnonKey(): string {
  const fromEnv = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
