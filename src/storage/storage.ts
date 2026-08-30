import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipes as localRecipes, categories as localCategories } from '../data/recipes';
import { fetchAllRecipes, fetchCategories as fetchRemoteCategories, fetchFeaturedRecipes, fetchPopularRecipes, fetchRecipesByCategory, searchRecipes as searchRemoteRecipes, fetchRecipeById } from '../services/recipeService';
import type { Recipe } from '../types';

const FAVORITES_KEY = 'arike-favorites';
const SHOPPING_KEY = 'arike-shopping-list';
const RECENT_KEY = 'arike-recently-viewed';
const RECIPE_CACHE_KEY = 'olatiwa-recipe-cache';
const RECIPE_CACHE_TS_KEY = 'olatiwa-recipe-cache-ts';
const RECIPE_CACHE_VERSION_KEY = 'olatiwa-recipe-cache-version';
const CATEGORY_CACHE_KEY = 'olatiwa-category-cache';
const CATEGORY_CACHE_TS_KEY = 'olatiwa-category-cache-ts';

// Bump this whenever the Recipe/Category shape or dataset format changes, so
// stale cached payloads from older app versions are discarded gracefully.
const CACHE_VERSION = '1';
// Cache is considered fresh for this long before remote data takes priority
// again (ms). 24 hours.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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

async function isCacheVersionCurrent(): Promise<boolean> {
  try {
    const version = await AsyncStorage.getItem(RECIPE_CACHE_VERSION_KEY);
    return version === CACHE_VERSION;
  } catch {
    return false;
  }
}

async function getCachedRecipes(): Promise<Recipe[] | null> {
  try {
    const [cached, ts] = await Promise.all([
      AsyncStorage.getItem(RECIPE_CACHE_KEY),
      AsyncStorage.getItem(RECIPE_CACHE_TS_KEY),
    ]);
    if (!cached) return null;
    // Version guard: discard data from a different (older) app build.
    if (!(await isCacheVersionCurrent())) return null;
    // TTL guard: only treat fresh cache as usable; stale data falls back to
    // local bundled recipes rather than permanently authoritative old data.
    if (ts && Date.now() - Number(ts) > CACHE_TTL_MS) return null;
    return JSON.parse(cached) as Recipe[];
  } catch {
    return null;
  }
}

async function setCachedRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(RECIPE_CACHE_KEY, JSON.stringify(recipes)),
      AsyncStorage.setItem(RECIPE_CACHE_TS_KEY, String(Date.now())),
      AsyncStorage.setItem(RECIPE_CACHE_VERSION_KEY, CACHE_VERSION),
    ]);
  } catch {
    // ignore cache write failures
  }
}

async function getCachedCategories(): Promise<string[] | null> {
  try {
    const [cached, ts] = await Promise.all([
      AsyncStorage.getItem(CATEGORY_CACHE_KEY),
      AsyncStorage.getItem(CATEGORY_CACHE_TS_KEY),
    ]);
    if (!cached) return null;
    if (!(await isCacheVersionCurrent())) return null;
    if (ts && Date.now() - Number(ts) > CACHE_TTL_MS) return null;
    return JSON.parse(cached) as string[];
  } catch {
    return null;
  }
}

async function setCachedCategories(categories: string[]): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CATEGORY_CACHE_TS_KEY, String(Date.now())),
      AsyncStorage.setItem(RECIPE_CACHE_VERSION_KEY, CACHE_VERSION),
    ]);
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
    const names = remote.map((c) => c.name);
    if (names.length > 0) {
      await setCachedCategories(names);
    }
    return names.length > 0 ? names : localCategories;
  } catch {
    const cached = await getCachedCategories();
    if (cached && cached.length > 0) return cached;
    return localCategories;
  }
}

// ============================================================================
// Theme Preference
// ============================================================================

const THEME_PREFERENCE_KEY = 'olatiwa-theme-preference';

export async function loadThemePreference(): Promise<'light' | 'dark' | 'system'> {
  try {
    const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(mode: 'light' | 'dark' | 'system'): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
  } catch {
    // ignore
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

