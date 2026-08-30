/**
 * Deterministic, repeatable recipe seeding script.
 *
 * - Requires the schema from supabase/migrations/001_create_recipe_schema.sql to
 *   already exist in the target Supabase project.
 * - Categories are upserted by slug, recipes are upserted by slug (== app recipe id).
 * - Recipe child rows (ingredients, steps, images, tags) are replaced on every run,
 *   so re-running is safe and always reflects the bundled dataset.
 *
 * Run:  npm run seed:recipes
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SupabaseClient } from '@supabase/supabase-js';
import { seedCategories } from './seed.ts';
import { recipes } from '../src/recipes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

async function ensureCategories(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { error } = await supabase.from('categories').upsert(
    seedCategories.map((category) => ({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order,
    })),
    { onConflict: 'slug' }
  );
  if (error) {
    throw new Error(`Failed to seed categories: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from('categories')
    .select('id, slug');
  if (fetchError || !data) {
    throw new Error(`Failed to fetch categories: ${fetchError?.message ?? 'no data'}`);
  }

  return new Map(data.map((category) => [category.slug, category.id]));
}

async function replaceRecipeChildren(supabase: SupabaseClient, recipeId: string): Promise<void> {
  for (const table of ['ingredients', 'recipe_steps', 'recipe_images', 'recipe_tags'] as const) {
    const { error } = await supabase.from(table).delete().eq('recipe_id', recipeId);
    if (error) {
      throw new Error(`Failed to clear ${table} for ${recipeId}: ${error.message}`);
    }
  }
}

async function seed() {
  const supabase = await createSupabaseClient();
  const categoryIdBySlug = await ensureCategories(supabase);

  let processed = 0;
  let skipped = 0;

  for (const recipe of recipes) {
    const slug = recipe.id;
    const categoryId = categoryIdBySlug.get(slugify(recipe.category)) ?? null;

    const { data: row, error: upsertError } = await supabase
      .from('recipes')
      .upsert(
        {
          slug,
          title: recipe.title,
          description: recipe.description,
          category_id: categoryId,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
          preparation_time: recipe.preparationTime,
          cooking_time: recipe.cookingTime,
          total_time: recipe.totalTime,
          servings: recipe.servings,
          featured: recipe.featured,
          popular: recipe.popular,
          tips: recipe.tips ?? null,
          notes: recipe.notes ?? null,
          status: 'published',
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();

    if (upsertError || !row) {
      console.warn(`[SKIP] ${recipe.title}: ${upsertError?.message ?? 'no row returned'}`);
      skipped += 1;
      continue;
    }

    await replaceRecipeChildren(supabase, row.id);

    const { error: ingredientError } = await supabase.from('ingredients').insert(
      recipe.ingredients.map((ingredient, index) => ({
        recipe_id: row.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        display_order: index,
      }))
    );
    if (ingredientError) {
      throw new Error(`Failed to insert ingredients for ${recipe.title}: ${ingredientError.message}`);
    }

    const { error: stepError } = await supabase.from('recipe_steps').insert(
      recipe.steps.map((step, index) => ({
        recipe_id: row.id,
        step_number: index + 1,
        instruction: step.instruction,
        duration: step.duration ?? null,
        optional_timer: step.optionalTimer ?? false,
        display_order: index,
      }))
    );
    if (stepError) {
      throw new Error(`Failed to insert steps for ${recipe.title}: ${stepError.message}`);
    }

    const imagePaths = recipe.images && recipe.images.length > 0
      ? recipe.images
      : (recipe.image ? [recipe.image] : []);
    if (imagePaths.length > 0) {
      const { error: imageError } = await supabase.from('recipe_images').insert(
        imagePaths.map((storagePath, index) => ({
          recipe_id: row.id,
          storage_path: storagePath,
          is_primary: index === 0,
          display_order: index,
        }))
      );
      if (imageError) {
        throw new Error(`Failed to insert images for ${recipe.title}: ${imageError.message}`);
      }
    }

    if (recipe.tags.length > 0) {
      const { error: tagError } = await supabase.from('recipe_tags').insert(
        recipe.tags.map((tag) => ({ recipe_id: row.id, tag }))
      );
      if (tagError) {
        throw new Error(`Failed to insert tags for ${recipe.title}: ${tagError.message}`);
      }
    }

    processed += 1;
  }

  console.log(`Recipe seed complete: ${processed} processed, ${skipped} skipped.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
