import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categories, getFeaturedRecipes, getPopularRecipes, recipes, searchRecipes } from '../data/recipes';
import { useAppContext } from '../AppContext';
import { theme } from '../theme';
import type { Recipe } from '../types';

const featured = getFeaturedRecipes();
const popular = getPopularRecipes();

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

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const results = useMemo(() => (search ? searchRecipes(search) : recipes).slice(0, 6), [search]);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.headerWrap}>
        <Text style={styles.eyebrow}>Arike Recipe</Text>
        <Text style={styles.headerTitle}>Discover something delicious.</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search recipes..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          accessibilityLabel="Search recipes"
        />
      </View>

      {search ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
            />
          ) : (
            <Text style={styles.emptyText}>No recipes match your search.</Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featured.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                >
                  <Image source={{ uri: recipe.image }} style={styles.featuredImage} />
                  <View style={styles.featuredOverlay} />
                  <Text style={styles.featuredTitle}>{recipe.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={styles.categoryPill}
                  onPress={() => navigation.navigate('Categories', { category })}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular</Text>
            <View style={styles.recipeGrid}>
              {popular.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  headerWrap: {
    paddingTop: 32,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 34,
    lineHeight: 40,
    color: theme.colors.text,
    fontWeight: '800',
    marginTop: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.text,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 260,
    height: 180,
    marginRight: 12,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
  },
  featuredTitle: {
    position: 'absolute',
    left: 16,
    right: 12,
    bottom: 16,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  categoryPill: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  recipeGrid: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 190,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  cardCategory: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  cardTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  favoriteText: {
    fontSize: 20,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
});
