import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categories, getFeaturedRecipes, getPopularRecipes, recipes, searchRecipes } from '../data/recipes';
import { useAppContext } from '../AppContext';
import { useTheme } from '../theme/ThemeContext';
import { useMenu } from '../theme/MenuContext';
import Icon from '../components/Icon';
import type { Recipe } from '../types';

const featured = getFeaturedRecipes();
const popular = getPopularRecipes();

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const navigation = useNavigation<any>();
  const { favorites, toggleFavorite } = useAppContext();
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.recipeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
    >
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <Pressable
        accessibilityLabel={`Toggle favorite for ${recipe.title}`}
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(recipe.id)}
      >
        <Text style={[styles.favoriteText, { color: theme.colors.primary }]}>
          {favorites.includes(recipe.id) ? '♥' : '♡'}
        </Text>
      </Pressable>
      <View style={styles.cardMeta}>
        <Text style={[styles.cardCategory, { color: theme.colors.primary }]}>{recipe.category}</Text>
        <Text style={[styles.cardTime, { color: theme.colors.textMuted }]}>{recipe.totalTime} min</Text>
      </View>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{recipe.title}</Text>
    </Pressable>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { theme } = useTheme();
  const { toggleMenu } = useMenu();

  const results = useMemo(() => (search ? searchRecipes(search) : recipes).slice(0, 6), [search]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Pressable onPress={toggleMenu} style={styles.menuButton}>
          <Icon name="menu" size={28} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>OlaTiwa-Recipe</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Discover something delicious.</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.searchIcon, { color: theme.colors.textMuted }]}>⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search recipes..."
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.text }]}
          accessibilityLabel="Search recipes"
        />
      </View>

      {search ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Results</Text>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No recipes match your search.</Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featured.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={[styles.featuredCard, { backgroundColor: theme.colors.surface }]}
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
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={[styles.categoryPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => navigation.navigate('Categories', { category })}
                >
                  <Text style={[styles.categoryText, { color: theme.colors.text }]}>{category}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular</Text>
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
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 260,
    height: 180,
    marginRight: 12,
    borderRadius: 24,
    overflow: 'hidden',
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
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '600',
  },
  recipeGrid: {
    gap: 12,
  },
  recipeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
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
    fontWeight: '700',
    fontSize: 12,
  },
  cardTime: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 15,
  },
});
