import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipes as localRecipes, categories as localCategories } from '../data/recipes';
import type { Recipe } from '../types';

const FAVORITES_KEY = 'arike-favorites';
const SHOPPING_KEY = 'arike-shopping-list';
const RECENT_KEY = 'arike-recently-viewed';

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
// Recipe Functions (Using Local Data - No Supabase Required)
// ============================================================================

/**
 * Load all recipes from local data (Supabase-ready for future upgrades)
 */
export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    return localRecipes;
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return localRecipes;
  }
};

/**
 * Load featured recipes from local data
 */
export const loadFeaturedRecipes = async (): Promise<Recipe[]> => {
  try {
    return localRecipes.filter((r) => r.featured);
  } catch (error) {
    console.error('Failed to load featured recipes:', error);
    return [];
  }
};

/**
 * Load popular recipes from local data
 */
export const loadPopularRecipes = async (): Promise<Recipe[]> => {
  try {
    return localRecipes.filter((r) => r.popular);
  } catch (error) {
    console.error('Failed to load popular recipes:', error);
    return [];
  }
};

/**
 * Load recipes by category from local data
 */
export const loadRecipesByCategory = async (category: string): Promise<Recipe[]> => {
  try {
    return localRecipes.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  } catch (error) {
    console.error(`Failed to load recipes for category ${category}:`, error);
    return [];
  }
};

/**
 * Search recipes from local data
 */
export const searchRecipesFromStorage = async (query: string): Promise<Recipe[]> => {
  try {
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
  } catch (error) {
    console.error('Failed to search recipes:', error);
    return [];
  }
};

/**
 * Load a single recipe by ID from local data
 */
export const loadRecipeById = async (recipeId: string): Promise<Recipe | null> => {
  try {
    return localRecipes.find((r) => r.id === recipeId) || null;
  } catch (error) {
    console.error(`Failed to load recipe ${recipeId}:`, error);
    return null;
  }
};

/**
 * Load all available categories from local data
 */
export const loadCategories = async (): Promise<string[]> => {
  try {
    return localCategories;
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
};

/**
 * Legacy helper function for compatibility
 */
export const getFeaturedRecipes = () => localRecipes.filter((recipe) => recipe.featured);

/**
 * Legacy helper function for compatibility
 */
export const getPopularRecipes = () => localRecipes.filter((recipe) => recipe.popular);

/**
 * Legacy helper function for compatibility
 */
export const getRecipesByCategory = (category: string) =>
  localRecipes.filter((recipe) => recipe.category.toLowerCase() === category.toLowerCase());

/**
 * Legacy helper function for compatibility
 */
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
      ...recipe.ingredients.map((ingredient) => ingredient.name),
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalized);
  });
};

