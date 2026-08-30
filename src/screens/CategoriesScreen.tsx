import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { categories, getRecipesByCategory, recipes } from '../data/recipes';
import { useTheme } from '../theme/ThemeContext';

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requested = route.params?.category;
  const selected = requested && categories.includes(requested) ? requested : categories[0];
  const categoryRecipes = getRecipesByCategory(selected);
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Categories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <Pressable
            key={item}
            onPress={() => navigation.navigate('Categories', { category: item })}
            style={[styles.chip, item === selected && styles.activeChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.chipText, { color: theme.colors.text }, item === selected && styles.activeChipText]}>{item}</Text>
          </Pressable>
        )}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{selected}</Text>

      {categoryRecipes.length > 0 ? (
        <FlatList
          data={categoryRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              key={item.id}
              style={[styles.recipeRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Text style={[styles.recipeTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.recipeMeta, { color: theme.colors.textMuted }]}>{item.cuisine} • {item.totalTime} min</Text>
            </Pressable>
          )}
        />
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No recipes in this category yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  chips: {
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#E66A3D',
    borderColor: '#E66A3D',
  },
  chipText: {
    fontWeight: '600',
  },
  activeChipText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
  },
  recipeRow: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  recipeMeta: {
    marginTop: 4,
  },
  emptyText: {
    marginTop: 12,
  },
});
