import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SupabaseClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createSupabaseClient(): Promise<SupabaseClient> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, anonKey);

  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
    if (error) {
      throw new Error(`Admin authentication failed: ${error.message}`);
    }
  }

  return supabase;
}

async function seed() {
  const supabase = await createSupabaseClient();
  const { seedCategories } = await import('./seed.ts');

  const { error } = await supabase
    .from('categories')
    .upsert(
      seedCategories.map((c: { name: string; slug: string; display_order: number }) => ({
        name: c.name,
        slug: c.slug,
        display_order: c.display_order,
      })),
      { onConflict: 'slug' }
    );

  if (error) {
    console.error('Failed to seed categories:', error);
    throw error;
  }

  console.log('Categories seeded successfully');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
