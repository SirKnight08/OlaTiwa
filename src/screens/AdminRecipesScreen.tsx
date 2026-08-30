import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { deleteAdminRecipe, fetchAdminRecipes, type AdminRecipeListItem } from '../services/adminService';

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export default function AdminRecipesScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState<AdminRecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setRecipes(await fetchAdminRecipes());
    } catch (err) {
      setError(err instanceof Error ? 'Could not load recipes.' : 'Load failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (filter !== 'all' && recipe.status !== filter) return false;
      if (!q) return true;
      return recipe.title.toLowerCase().includes(q);
    });
  }, [recipes, query, filter]);

  const toggleStatus = async (recipe: AdminRecipeListItem) => {
    const next = recipe.status === 'published' ? 'draft' : 'published';
    const { supabase } = await import('../config/supabase');
    await supabase.from('recipes').update({ status: next }).eq('id', recipe.id);
    load();
  };

  const toggleFeatured = async (recipe: AdminRecipeListItem) => {
    const { supabase } = await import('../config/supabase');
    await supabase.from('recipes').update({ featured: !recipe.featured }).eq('id', recipe.id);
    load();
  };

  const handleDelete = async (recipeId: string) => {
    try {
      await deleteAdminRecipe(recipeId);
      setConfirmDeleteId(null);
      load();
    } catch {
      setError('Could not delete recipe.');
    }
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Recipes</Text>
        <Pressable
          onPress={() => navigation.navigate('AdminRecipeForm', {})}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.addText}>+ New</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes by title..."
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
        accessibilityLabel="Search recipes"
      />

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? '#fff' : theme.colors.text }]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          <Pressable onPress={load} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No recipes match.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Pressable style={styles.rowMain} onPress={() => navigation.navigate('AdminRecipeForm', { recipeId: item.id })}>
                <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <View style={styles.rowMeta}>
                  <Text style={[styles.rowStatus, { color: theme.colors.textMuted }]}>{item.status}</Text>
                  {item.featured ? <Text style={[styles.rowFeatured, { color: theme.colors.primary }]}>★ Featured</Text> : null}
                </View>
              </Pressable>

              {confirmDeleteId === item.id ? (
                <View style={styles.confirmRow}>
                  <Pressable onPress={() => handleDelete(item.id)} style={[styles.confirmButton, { backgroundColor: theme.colors.danger }]}>
                    <Text style={styles.confirmText}>Delete</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmDeleteId(null)} style={[styles.confirmButton, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.confirmText, { color: theme.colors.text }]}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.actions}>
                  <Pressable onPress={() => toggleStatus(item)} style={[styles.actionButton, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>{item.status === 'published' ? 'Unpublish' : 'Publish'}</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleFeatured(item)} style={[styles.actionButton, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>{item.featured ? 'Unfeature' : 'Feature'}</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmDeleteId(item.id)} style={styles.deleteButton}>
                    <Text style={[styles.deleteText, { color: theme.colors.danger }]}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </View>
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
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
  },
  search: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 15,
  },
  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  rowStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  rowFeatured: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  confirmButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  confirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
