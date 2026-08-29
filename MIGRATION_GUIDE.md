/**
 * Migration Guide: Moving from Hardcoded Recipes to Supabase
 * 
 * This file demonstrates how to update screens from using hardcoded recipes
 * to using recipes from Supabase via AppContext.
 */

// BEFORE: Importing from hardcoded data
// import { recipes, getFeaturedRecipes, getPopularRecipes, searchRecipes } from '../data/recipes';

// AFTER: Using AppContext and custom hooks
// import { useRecipes, useRecipeSearch, useFeaturedRecipes, usePopularRecipes } from '../hooks/useRecipes';
// import { useAppContext } from '../AppContext';

// Example 1: Display all recipes with loading state
// ============================================
// BEFORE:
// const allRecipes = recipes;
//
// AFTER:
// const { recipes: allRecipes, isLoading, error, isEmpty } = useRecipes();
// 
// if (isLoading) return <LoadingIndicator />;
// if (error) return <ErrorView error={error} />;
// if (isEmpty) return <EmptyView />;

// Example 2: Featured recipes
// ============================================
// BEFORE:
// const featured = getFeaturedRecipes();
//
// AFTER:
// const { recipes: featured, isLoading } = useFeaturedRecipes();

// Example 3: Popular recipes
// ============================================
// BEFORE:
// const popular = getPopularRecipes();
//
// AFTER:
// const { recipes: popular, isLoading } = usePopularRecipes();

// Example 4: Search recipes
// ============================================
// BEFORE:
// const [search, setSearch] = useState('');
// const results = useMemo(() => (search ? searchRecipes(search) : recipes).slice(0, 6), [search]);
//
// AFTER:
// const [search, setSearch] = useState('');
// const { recipes: results, isLoading } = useRecipeSearch(search);
// const displayedResults = results.slice(0, 6);

// Example 5: Filter by category
// ============================================
// BEFORE:
// const categoryRecipes = getRecipesByCategory(category);
//
// AFTER:
// const { recipes: categoryRecipes, isLoading } = useRecipesByCategory(category);

// Example 6: Get a single recipe
// ============================================
// BEFORE:
// const recipe = recipes.find(r => r.id === recipeId);
//
// AFTER:
// const { recipe, isLoading } = useRecipeById(recipeId);

// Example 7: Favorite recipes
// ============================================
// BEFORE:
// const favorites = useAppContext().favorites;
// const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));
//
// AFTER:
// const { recipes: favoriteRecipes, isLoading } = useFavoriteRecipes();
// const isFavorite = useIsFavorite(recipeId);

// ============================================
// Updated HomeScreen Example
// ============================================

import React, { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { useRecipeSearch, useFeaturedRecipes, usePopularRecipes } from '../hooks/useRecipes';
import { theme } from '../theme';
import type { Recipe } from '../types';

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const navigation = useNavigation<any>();
  const { favorites, toggleFavorite } = useAppContext();

  return (
    <Pressable
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
    >
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <Pressable
        accessibilityLabel={`Toggle favorite for ${recipe.title}`}
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(recipe.id)}
      >
        <Text style={styles.favoriteText}>{favorites.includes(recipe.id) ? '♥' : '♡'}</Text>
      </Pressable>
      <View style={styles.cardMeta}>
        <Text style={styles.cardCategory}>{recipe.category}</Text>
        <Text style={styles.cardTime}>{recipe.totalTime} min</Text>
      </View>
      <Text style={styles.cardTitle}>{recipe.title}</Text>
    </Pressable>
  );
};

export function HomeScreenExample() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  // Use the new hooks with Supabase data
  const { recipes: searchResults, isLoading: searchLoading } = useRecipeSearch(search);
  const { recipes: featured, isLoading: featuredLoading } = useFeaturedRecipes();
  const { recipes: popular, isLoading: popularLoading } = usePopularRecipes();

  const results = searchResults.slice(0, 6);
  const isLoading = searchLoading || featuredLoading || popularLoading;

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.headerWrap}>
        <Text style={styles.eyebrow}>Arike Recipe</Text>
        <Text style={styles.headerTitle}>Discover something delicious.</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={theme.muted}
        />
      </View>

      {search ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.column}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featured.slice(0, 5).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Popular</Text>
          <FlatList
            data={popular.slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.column}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrap: {
    padding: 16,
    paddingTop: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.muted,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  recipeCard: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.card,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: theme.muted,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 16,
    color: 'white',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.muted,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.muted,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  column: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
});
