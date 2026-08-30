import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategoryInput,
} from '../services/adminService';
import type { DatabaseCategory } from '../config/database.types';

export default function AdminCategoriesScreen() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DatabaseCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setCategories(await fetchAdminCategories());
    } catch (err) {
      setError(err instanceof Error ? 'Could not load categories.' : 'Load failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setOrder('0');
  };

  const slugify = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const startEdit = (category: DatabaseCategory) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setOrder(String(category.display_order));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }
    const input: AdminCategoryInput = {
      name: trimmedName,
      slug: slug.trim() || slugify(trimmedName),
      display_order: Number(order) || 0,
    };
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateAdminCategory(editing.id, input);
      } else {
        await createAdminCategory(input);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? 'Could not save category.' : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setSaving(true);
    try {
      await deleteAdminCategory(categoryId);
      setConfirmDeleteId(null);
      await load();
    } catch {
      setError('Could not delete category. It may still have recipes assigned.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Categories</Text>

      <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.formLabel, { color: theme.colors.text }]}>{editing ? 'Edit category' : 'New category'}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
        />
        <TextInput
          value={slug}
          onChangeText={(value) => setSlug(slugify(value))}
          placeholder="slug (auto)"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
        />
        <TextInput
          value={order}
          onChangeText={setOrder}
          placeholder="Display order"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="number-pad"
          style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
        />
        <View style={styles.formActions}>
          <Pressable onPress={handleSave} disabled={saving} style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
          {editing ? (
            <Pressable onPress={resetForm} style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.cancelText, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
        {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.rowSlug, { color: theme.colors.textMuted }]}>{item.slug} · order {item.display_order}</Text>
              </View>
              {confirmDeleteId === item.id ? (
                <View style={styles.rowActions}>
                  <Pressable onPress={() => handleDelete(item.id)} style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}>
                    <Text style={styles.actionTextLight}>Delete</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmDeleteId(null)} style={styles.actionButton}>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.rowActions}>
                  <Pressable onPress={() => startEdit(item)} style={styles.actionButton}>
                    <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => setConfirmDeleteId(item.id)} style={styles.actionButton}>
                    <Text style={[styles.actionText, { color: theme.colors.danger }]}>Delete</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 14,
  },
  form: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    marginTop: 10,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  rowInfo: {
    flex: 1,
    marginRight: 10,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowSlug: {
    fontSize: 13,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextLight: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
