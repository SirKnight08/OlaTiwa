import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const { supabase } = await import('../src/config/supabase.ts');
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
