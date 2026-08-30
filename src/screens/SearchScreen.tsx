import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchRecipes } from '../data/recipes';
import { useTheme } from '../theme/ThemeContext';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchRecipes(query), [query]);
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes..."
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
      />

      {results.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No results found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{item.category} • {item.cuisine}</Text>
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
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
  },
});
