import { supabase } from '../src/config/supabase';
import { seedCategories } from './seed';

async function seed() {
  const { error } = await supabase.from('categories').upsert(
    seedCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      display_order: c.display_order,
    })),
    { onConflict: 'slug' }
  );

  if (error) {
    console.error('Failed to seed categories:', error);
    process.exit(1);
  }

  console.log('Categories seeded successfully');
}

seed();
