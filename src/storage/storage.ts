import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipes as localRecipes, categories as localCategories } from '../data/recipes';
import { fetchAllRecipes, fetchCategories as fetchRemoteCategories, fetchFeaturedRecipes, fetchPopularRecipes, fetchRecipesByCategory, searchRecipes as searchRemoteRecipes, fetchRecipeById } from '../services/recipeService';
import type { Recipe } from '../types';

const FAVORITES_KEY = 'arike-favorites';
const SHOPPING_KEY = 'arike-shopping-list';
const RECENT_KEY = 'arike-recently-viewed';
const RECIPE_CACHE_KEY = 'olatiwa-recipe-cache';
const RECIPE_CACHE_TS_KEY = 'olatiwa-recipe-cache-ts';

// ============================================================================
// Local Storage Functions (AsyncStorage)
// ============================================================================

export const loadFavorites = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn('Failed to load favorites', error);
    return [];
  }
};

export const saveFavorites = async (favorites: string[]) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Failed to save favorites', error);
  }
};

export const loadShoppingList = async () => {
  try {
    const value = await AsyncStorage.getItem(SHOPPING_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn('Failed to load shopping list', error);
    return [];
  }
};

export const saveShoppingList = async (shoppingList: unknown[]) => {
  try {
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(shoppingList));
  } catch (error) {
    console.warn('Failed to save shopping list', error);
  }
};

export const loadRecentlyViewed = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(RECENT_KEY);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn('Failed to load recently viewed', error);
    return [];
  }
};

export const saveRecentlyViewed = async (recentlyViewed: string[]) => {
  try {
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.warn('Failed to save recently viewed', error);
  }
};

// ============================================================================
// Recipe Cache Helpers
// ============================================================================

async function getCachedRecipes(): Promise<Recipe[] | null> {
  try {
    const cached = await AsyncStorage.getItem(RECIPE_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as Recipe[];
  } catch {
    return null;
  }
}

async function setCachedRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECIPE_CACHE_KEY, JSON.stringify(recipes));
    await AsyncStorage.setItem(RECIPE_CACHE_TS_KEY, String(Date.now()));
  } catch {
    // ignore cache write failures
  }
}

// ============================================================================
// Remote-first recipe functions with local fallback
// ============================================================================

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const remote = await fetchAllRecipes();
    await setCachedRecipes(remote);
    return remote;
  } catch (remoteError) {
    console.warn('Remote recipe load failed, falling back to cache then local data:', remoteError);
    const cached = await getCachedRecipes();
    if (cached && cached.length > 0) return cached;
    return localRecipes;
  }
}

export async function loadFeaturedRecipes(): Promise<Recipe[]> {
  try {
    return await fetchFeaturedRecipes();
  } catch {
    return localRecipes.filter((r) => r.featured);
  }
}

export async function loadPopularRecipes(): Promise<Recipe[]> {
  try {
    return await fetchPopularRecipes();
  } catch {
    return localRecipes.filter((r) => r.popular);
  }
}

export async function loadRecipesByCategory(category: string): Promise<Recipe[]> {
  try {
    return await fetchRecipesByCategory(category);
  } catch {
    return localRecipes.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }
}

export async function searchRecipesFromStorage(query: string): Promise<Recipe[]> {
  try {
    return await searchRemoteRecipes(query);
  } catch {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return localRecipes;

    return localRecipes.filter((recipe) => {
      const searchable = [
        recipe.title,
        recipe.category,
        recipe.cuisine,
        recipe.description,
        ...recipe.tags,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }
}

export async function loadRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    const remote = await fetchRecipeById(recipeId);
    if (remote) return remote;
  } catch {
    // fall through to local lookup
  }

  return localRecipes.find((r) => r.id === recipeId) || null;
}

export async function loadCategories(): Promise<string[]> {
  try {
    const remote = await fetchRemoteCategories();
    return remote.map((c) => c.name);
  } catch {
    return localCategories;
  }
}

// ============================================================================
// Legacy helper functions for compatibility
// ============================================================================

export const getFeaturedRecipes = () => localRecipes.filter((recipe) => recipe.featured);

export const getPopularRecipes = () => localRecipes.filter((recipe) => recipe.popular);

export const getRecipesByCategory = (category: string) =>
  localRecipes.filter((recipe) => recipe.category.toLowerCase() === category.toLowerCase());

export const searchRecipes = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return localRecipes;

  return localRecipes.filter((recipe) => {
    const searchable = [
      recipe.title,
      recipe.category,
      recipe.cuisine,
      recipe.description,
      ...recipe.tags,
      ...recipe.ingredients.map((ingredient: any) => ingredient.name),
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalized);
  });
};

