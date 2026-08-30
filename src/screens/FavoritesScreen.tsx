import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { recipes } from '../data/recipes';
import { useTheme } from '../theme/ThemeContext';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { favorites } = useAppContext();
  const favoriteRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Favorites</Text>

      {favoriteRecipes.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Your favorite recipes will appear here.</Text>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{item.category} • {item.totalTime} min</Text>
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
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
  },
});
