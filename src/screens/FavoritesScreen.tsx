import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { recipes } from '../data/recipes';
import { theme } from '../theme';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { favorites } = useAppContext();
  const favoriteRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Favorites</Text>

      {favoriteRecipes.length === 0 ? (
        <Text style={styles.emptyText}>Your favorite recipes will appear here.</Text>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.category} • {item.totalTime} min</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});
