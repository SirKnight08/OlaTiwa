import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { categories, getRecipesByCategory, recipes } from '../data/recipes';
import { theme } from '../theme';

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const selected = route.params?.category ?? 'Nigerian';
  const categoryRecipes = getRecipesByCategory(selected);

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Categories</Text>
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
            style={[styles.chip, item === selected && styles.activeChip]}
          >
            <Text style={[styles.chipText, item === selected && styles.activeChipText]}>{item}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.sectionTitle}>{selected}</Text>

      {categoryRecipes.length > 0 ? (
        <FlatList
          data={categoryRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              key={item.id}
              style={styles.recipeRow}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeMeta}>{item.cuisine} • {item.totalTime} min</Text>
            </Pressable>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No recipes in this category yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  chips: {
    paddingBottom: 16,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
  },
  recipeRow: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  recipeMeta: {
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: 12,
  },
});
