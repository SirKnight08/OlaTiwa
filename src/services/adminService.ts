import { supabase } from '../config/supabase';
import type { DatabaseCategory } from '../config/database.types';
import type { Recipe, Ingredient, RecipeStep } from '../types';

// ============================================================================
// Admin authentication (Supabase Auth)
// ============================================================================

export type AdminSession = {
  email: string;
  isAdmin: boolean;
};

/**
 * Signs in with email/password. After a successful sign-in we verify the
 * user's app_metadata.role === 'admin' before granting dashboard access.
 * Passwords are never hardcoded in the app — they live only in Supabase Auth.
 */
function getAdminRole(user: { app_metadata?: Record<string, any>; user_metadata?: Record<string, any> }): string | undefined {
  return user.app_metadata?.role ?? user.user_metadata?.role;
}

export async function adminSignIn(email: string, password: string): Promise<AdminSession> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in succeeded but no user was returned.');

  const isAdmin = getAdminRole(data.user) === 'admin';
  return { email: data.user.email ?? email, isAdmin };
}

export async function adminSignOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('Admin sign out failed:', error);
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const isAdmin = getAdminRole(data.user) === 'admin';
    return { email: data.user.email ?? '', isAdmin };
  } catch {
    return null;
  }
}

// ============================================================================
// Dashboard stats
// ============================================================================

export type AdminStats = {
  totalRecipes: number;
  publishedRecipes: number;
  draftRecipes: number;
  totalCategories: number;
  featuredRecipes: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const [recipes, published, drafts, categories, featured] = await Promise.all([
    supabase.from('recipes').select('id', { count: 'exact', head: true }),
    supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('featured', true),
  ]);

  const count = (res: { count: number | null }) => res.count ?? 0;
  return {
    totalRecipes: count(recipes),
    publishedRecipes: count(published),
    draftRecipes: count(drafts),
    totalCategories: count(categories),
    featuredRecipes: count(featured),
  };
}

// ============================================================================
// Recipe management
// ============================================================================

export type AdminRecipeListItem = {
  id: string;
  title: string;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  difficulty: string | null;
  updated_at: string;
};

export async function fetchAdminRecipes(): Promise<AdminRecipeListItem[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, category_id, status, featured, difficulty, updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminRecipeListItem[];
}

export type RecipeInput = {
  title: string;
  description: string;
  category_id: string | null;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  preparation_time: number;
  cooking_time: number;
  total_time: number;
  servings: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  tips: string | null;
  notes: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  image: string;
};

async function replaceChildren(recipeId: string, recipe: RecipeInput): Promise<void> {
  for (const table of ['ingredients', 'recipe_steps', 'recipe_images', 'recipe_tags'] as const) {
    await supabase.from(table).delete().eq('recipe_id', recipeId);
  }

  const ingredients = recipe.ingredients.map((ing, index) => ({
    recipe_id: recipeId,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    display_order: index,
  }));
  if (ingredients.length > 0) {
    const { error } = await supabase.from('ingredients').insert(ingredients);
    if (error) throw error;
  }

  const steps = recipe.steps.map((step, index) => ({
    recipe_id: recipeId,
    step_number: index + 1,
    instruction: step.instruction,
    duration: step.duration ?? null,
    optional_timer: step.optionalTimer ?? false,
    display_order: index,
  }));
  if (steps.length > 0) {
    const { error } = await supabase.from('recipe_steps').insert(steps);
    if (error) throw error;
  }

  if (recipe.image && recipe.image.trim().length > 0) {
    const { error } = await supabase.from('recipe_images').insert({
      recipe_id: recipeId,
      storage_path: recipe.image.trim(),
      is_primary: true,
      display_order: 0,
    });
    if (error) throw error;
  }
}

export async function createAdminRecipe(recipe: RecipeInput): Promise<string> {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title: recipe.title,
      slug: recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: recipe.description,
      category_id: recipe.category_id,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      preparation_time: recipe.preparation_time,
      cooking_time: recipe.cooking_time,
      total_time: recipe.total_time,
      servings: recipe.servings,
      featured: recipe.featured,
      status: recipe.status,
      tips: recipe.tips,
      notes: recipe.notes,
    })
    .select('id')
    .single();
  if (error) throw error;

  await replaceChildren(data.id, recipe);
  return data.id;
}

export async function updateAdminRecipe(recipeId: string, recipe: RecipeInput): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update({
      title: recipe.title,
      slug: recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: recipe.description,
      category_id: recipe.category_id,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      preparation_time: recipe.preparation_time,
      cooking_time: recipe.cooking_time,
      total_time: recipe.total_time,
      servings: recipe.servings,
      featured: recipe.featured,
      status: recipe.status,
      tips: recipe.tips,
      notes: recipe.notes,
    })
    .eq('id', recipeId);
  if (error) throw error;

  await replaceChildren(recipeId, recipe);
}

export async function deleteAdminRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
  if (error) throw error;
}

// ============================================================================
// Category management
// ============================================================================

export type AdminCategoryInput = {
  name: string;
  slug: string;
  display_order: number;
};

export async function fetchAdminCategories(): Promise<DatabaseCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DatabaseCategory[];
}

export async function createAdminCategory(input: AdminCategoryInput): Promise<void> {
  const { error } = await supabase.from('categories').insert(input);
  if (error) throw error;
}

export async function updateAdminCategory(categoryId: string, input: AdminCategoryInput): Promise<void> {
  const { error } = await supabase.from('categories').update(input).eq('id', categoryId);
  if (error) throw error;
}

export async function deleteAdminCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) throw error;
}