import { supabase } from '../config/supabase';
import type { DatabaseCategory, DatabaseRecipe, DatabaseRecipeStep, DatabaseIngredient, DatabaseRecipeImage, DatabaseRecipeTag } from '../config/database.types';
import type { Recipe, Ingredient, RecipeStep, Difficulty } from '../types';

type RemoteCategory = DatabaseCategory;
type RemoteRecipe = DatabaseRecipe;
type RemoteRecipeStep = DatabaseRecipeStep;
type RemoteIngredient = DatabaseIngredient;
type RemoteRecipeImage = DatabaseRecipeImage;
type RemoteRecipeTag = DatabaseRecipeTag;

function toDifficulty(value: string | null): Difficulty | undefined {
  if (value === 'Easy' || value === 'Medium' || value === 'Hard') {
    return value;
  }
  return undefined;
}

export async function fetchAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to fetch recipes');
  }

  return (data as RemoteRecipe[]).map((recipe) => mapRecipe(recipe));
}

export async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('id', recipeId)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRecipe(data as RemoteRecipe);
}

export async function fetchFeaturedRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to fetch featured recipes');
  }

  return (data as RemoteRecipe[]).map((recipe) => mapRecipe(recipe));
}

export async function fetchPopularRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('status', 'published')
    .eq('popular', true)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to fetch popular recipes');
  }

  return (data as RemoteRecipe[]).map((recipe) => mapRecipe(recipe));
}

export async function fetchRecipesByCategory(category: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('status', 'published')
    .eq('category_id', category)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to fetch recipes by category');
  }

  return (data as RemoteRecipe[]).map((recipe) => mapRecipe(recipe));
}

export async function fetchCategories(): Promise<RemoteCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to fetch categories');
  }

  return data as RemoteCategory[];
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredients(*), recipe_steps(*), recipe_images(*), recipe_tags(*)')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to search recipes');
  }

  return (data as RemoteRecipe[]).map((recipe) => mapRecipe(recipe));
}

export async function fetchAppSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.value;
}

type JoinedRecipe = RemoteRecipe & {
  ingredients?: RemoteIngredient[];
  recipe_steps?: RemoteRecipeStep[];
  recipe_images?: RemoteRecipeImage[];
  recipe_tags?: RemoteRecipeTag[];
};

function mapRecipe(recipe: JoinedRecipe): Recipe {
  const ingredients = (recipe.ingredients ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity ?? 0,
      unit: item.unit ?? '',
    }));

  const steps = (recipe.recipe_steps ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => ({
      id: item.id,
      instruction: item.instruction,
      duration: item.duration ?? undefined,
      optionalTimer: item.optional_timer,
    }));

  const images = (recipe.recipe_images ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => item.storage_path);

  const tags = (recipe.recipe_tags ?? []).map((item) => item.tag);

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? '',
    category: recipe.category_id ?? '',
    cuisine: recipe.cuisine ?? '',
    image: images[0] ?? '',
    images,
    preparationTime: recipe.preparation_time ?? 0,
    cookingTime: recipe.cooking_time ?? 0,
    totalTime: recipe.total_time ?? 0,
    difficulty: toDifficulty(recipe.difficulty) ?? 'Easy',
    servings: recipe.servings ?? 1,
    ingredients,
    steps,
    tags,
    featured: recipe.featured,
    popular: recipe.popular,
    tips: recipe.tips ?? undefined,
    notes: recipe.notes ?? undefined,
  };
}
