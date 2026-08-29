import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadFavorites, loadRecentlyViewed, loadShoppingList, saveFavorites, saveRecentlyViewed, saveShoppingList, loadRecipes, loadCategories } from './storage/storage';
import type { Recipe, ShoppingItem } from './types';

type AppContextValue = {
  // Recipe state
  recipes: Recipe[];
  categories: string[];
  recipesLoading: boolean;
  recipesError: Error | null;
  recipesInitialized: boolean;

  // User preferences
  favorites: string[];
  shoppingList: ShoppingItem[];
  recentlyViewed: string[];

  // Recipe actions
  toggleFavorite: (recipeId: string) => void;
  addRecipeIngredientsToShoppingList: (recipe: Recipe) => void;

  // Shopping list actions
  addShoppingItem: (name: string, quantity?: string) => void;
  toggleShoppingItem: (itemId: string) => void;
  removeShoppingItem: (itemId: string) => void;
  clearShoppingList: () => void;

  // Recently viewed actions
  markRecipeViewed: (recipeId: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState<Error | null>(null);
  const [recipesInitialized, setRecipesInitialized] = useState(false);

  // User preference state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load recipes and user data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setRecipesLoading(true);
        setRecipesError(null);

        // Load recipes and categories
        const [recipesData, categoriesData, loadedFavorites, loadedShoppingList, loadedRecentlyViewed] = await Promise.all([
          loadRecipes(),
          loadCategories(),
          loadFavorites(),
          loadShoppingList(),
          loadRecentlyViewed(),
        ]);

        setRecipes(recipesData);
        setCategories(categoriesData);
        setFavorites(loadedFavorites);
        setShoppingList(loadedShoppingList);
        setRecentlyViewed(loadedRecentlyViewed);
        setRecipesInitialized(true);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load data');
        console.error('Error loading app data:', err);
        setRecipesError(err);
        setRecipesInitialized(true);
      } finally {
        setRecipesLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Persist user preferences
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveShoppingList(shoppingList);
  }, [shoppingList]);

  useEffect(() => {
    saveRecentlyViewed(recentlyViewed);
  }, [recentlyViewed]);

  const toggleFavorite = (recipeId: string) => {
    setFavorites((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    );
  };

  const addRecipeIngredientsToShoppingList = (recipe: Recipe) => {
    setShoppingList((current) => {
      const existing = new Map(current.map((item) => [item.name.toLowerCase(), item]));
      const next = [...current];

      recipe.ingredients.forEach((ingredient) => {
        const key = ingredient.name.toLowerCase();
        if (existing.has(key)) {
          const existingItem = existing.get(key)!;
          const existingIndex = next.findIndex((item) => item.id === existingItem.id);
          next[existingIndex] = {
            ...existingItem,
            quantity: `${ingredient.quantity} ${ingredient.unit}`.trim(),
            recipeId: recipe.id,
          };
          return;
        }

        next.push({
          id: `${recipe.id}-${ingredient.id}`,
          name: ingredient.name,
          quantity: `${ingredient.quantity} ${ingredient.unit}`.trim(),
          checked: false,
          recipeId: recipe.id,
        });
      });

      return next;
    });
  };

  const addShoppingItem = (name: string, quantity = '1 item') => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setShoppingList((current) => [
      ...current,
      {
        id: `${Date.now()}-${trimmed}`,
        name: trimmed,
        quantity,
        checked: false,
      },
    ]);
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const removeShoppingItem = (itemId: string) => {
    setShoppingList((current) => current.filter((item) => item.id !== itemId));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const markRecipeViewed = (recipeId: string) => {
    setRecentlyViewed((current) => {
      const updated = [recipeId, ...current.filter((id) => id !== recipeId)];
      return updated.slice(0, 8);
    });
  };

  const value = useMemo<AppContextValue>(
    () => ({
      recipes,
      categories,
      recipesLoading,
      recipesError,
      recipesInitialized,
      favorites,
      shoppingList,
      recentlyViewed,
      toggleFavorite,
      addRecipeIngredientsToShoppingList,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      clearShoppingList,
      markRecipeViewed,
    }),
    [recipes, categories, recipesLoading, recipesError, recipesInitialized, favorites, shoppingList, recentlyViewed],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
