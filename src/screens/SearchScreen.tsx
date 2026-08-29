import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchRecipes } from '../data/recipes';
import { theme } from '../theme';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchRecipes(query), [query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes..."
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
      />

      {results.length === 0 ? (
        <Text style={styles.emptyText}>No results found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.category} • {item.cuisine}</Text>
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
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    height: 48,
    color: theme.colors.text,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
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
