import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
}

function getSupabaseAnonKey(): string | undefined {
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

const url = getSupabaseUrl();
const anonKey = getSupabaseAnonKey();

if (!url || !anonKey) {
  console.warn('Supabase credentials are not configured. The app will run in offline mode with local recipe data.');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-key');
