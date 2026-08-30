import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { createAdminRecipe, updateAdminRecipe, fetchAdminCategories, type RecipeInput } from '../services/adminService';
import { fetchRecipeById } from '../services/recipeService';
import type { DatabaseCategory } from '../config/database.types';

type IngredientDraft = { name: string; quantity: string; unit: string };
type StepDraft = { instruction: string; duration: string };

export default function AdminRecipeFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const recipeId: string | undefined = route.params?.recipeId;
  const { theme } = useTheme();

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [prep, setPrep] = useState('10');
  const [cook, setCook] = useState('20');
  const [servings, setServings] = useState('4');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tips, setTips] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([{ name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState<StepDraft[]>([{ instruction: '', duration: '' }]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = await fetchAdminCategories();
      setCategories(cats);
      if (cats.length > 0) setCategoryId((current) => current || cats[0].id);

      if (recipeId) {
        const recipe = await fetchRecipeById(recipeId);
        if (recipe) {
          setTitle(recipe.title);
          setDescription(recipe.description);
          setCuisine(recipe.cuisine);
          setDifficulty(recipe.difficulty);
          setPrep(String(recipe.preparationTime));
          setCook(String(recipe.cookingTime));
          setServings(String(recipe.servings));
          setFeatured(recipe.featured);
          setTips(recipe.tips ?? '');
          setImage(recipe.image);
          setIngredients(
            recipe.ingredients.map((ing) => ({
              name: ing.name,
              quantity: String(ing.quantity),
              unit: ing.unit,
            }))
          );
          setSteps(
            recipe.steps.map((step) => ({
              instruction: step.instruction,
              duration: step.duration ? String(step.duration) : '',
            }))
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? 'Could not load form data.' : 'Load failed.');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateIngredient = (index: number, field: keyof IngredientDraft, value: string) => {
    setIngredients((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const updateStep = (index: number, field: keyof StepDraft, value: string) => {
    setSteps((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Recipe title is required.');
      return;
    }
    const cleanIngredients: RecipeInput['ingredients'] = ingredients
      .filter((ing) => ing.name.trim().length > 0)
      .map((ing, index) => ({
        id: `${recipeId ?? 'new'}-ing-${index}`,
        name: ing.name.trim(),
        quantity: Number(ing.quantity) > 0 ? Number(ing.quantity) : 1,
        unit: ing.unit.trim() || 'unit',
      }));
    const cleanSteps: RecipeInput['steps'] = steps
      .filter((step) => step.instruction.trim().length > 0)
      .map((step, index) => ({
        id: `${recipeId ?? 'new'}-step-${index}`,
        instruction: step.instruction.trim(),
        duration: Number(step.duration) > 0 ? Number(step.duration) : undefined,
      }));

    if (cleanIngredients.length === 0 || cleanSteps.length === 0) {
      setError('Add at least one ingredient and one step.');
      return;
    }

    const input: RecipeInput = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      cuisine: cuisine.trim(),
      difficulty,
      preparation_time: Number(prep) > 0 ? Number(prep) : 0,
      cooking_time: Number(cook) > 0 ? Number(cook) : 0,
      total_time: (Number(prep) > 0 ? Number(prep) : 0) + (Number(cook) > 0 ? Number(cook) : 0),
      servings: Number(servings) > 0 ? Number(servings) : 1,
      featured,
      status,
      tips: tips.trim() || null,
      notes: null,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      image,
    };

    setSaving(true);
    setError(null);
    try {
      if (recipeId) {
        await updateAdminRecipe(recipeId, input);
      } else {
        await createAdminRecipe(input);
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? 'Could not save recipe.' : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{recipeId ? 'Edit Recipe' : 'New Recipe'}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loading} />
        ) : (
          <>
            <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Recipe title" placeholderTextColor={theme.colors.textMuted} style={inputStyle} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Short description" placeholderTextColor={theme.colors.textMuted} style={inputStyle} multiline />

            <Text style={[styles.label, { color: theme.colors.text }]}>Cuisine</Text>
            <TextInput value={cuisine} onChangeText={setCuisine} placeholder="e.g. Nigerian, Japanese" placeholderTextColor={theme.colors.textMuted} style={inputStyle} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[styles.chip, { backgroundColor: categoryId === cat.id ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.chipText, { color: categoryId === cat.id ? '#fff' : theme.colors.text }]}>{cat.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Difficulty</Text>
            <View style={styles.chipRow}>
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setDifficulty(level)}
                  style={[styles.chip, { backgroundColor: difficulty === level ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.chipText, { color: difficulty === level ? '#fff' : theme.colors.text }]}>{level}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.row3}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Prep (min)</Text>
                <TextInput value={prep} onChangeText={setPrep} keyboardType="number-pad" style={inputStyle} />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Cook (min)</Text>
                <TextInput value={cook} onChangeText={setCook} keyboardType="number-pad" style={inputStyle} />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Serves</Text>
                <TextInput value={servings} onChangeText={setServings} keyboardType="number-pad" style={inputStyle} />
              </View>
            </View>

            <View style={styles.toggleRow}>
              <Pressable onPress={() => setFeatured((value) => !value)} style={[styles.toggle, { backgroundColor: featured ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.toggleText, { color: featured ? '#fff' : theme.colors.text }]}>{featured ? '★ Featured' : '☆ Not featured'}</Text>
              </Pressable>
              <Pressable onPress={() => setStatus((value) => (value === 'published' ? 'draft' : 'published'))} style={[styles.toggle, { backgroundColor: status === 'published' ? theme.colors.success : theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.toggleText, { color: status === 'published' ? '#fff' : theme.colors.text }]}>{status === 'published' ? 'Published' : 'Draft'}</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Image URL</Text>
            <TextInput value={image} onChangeText={setImage} placeholder="https://..." placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" style={inputStyle} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Tips</Text>
            <TextInput value={tips} onChangeText={setTips} placeholder="Optional cooking tips" placeholderTextColor={theme.colors.textMuted} style={inputStyle} multiline />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ingredients</Text>
            {ingredients.map((ing, index) => (
              <View key={index} style={styles.dynamicRow}>
                <TextInput value={ing.name} onChangeText={(value) => updateIngredient(index, 'name', value)} placeholder="Ingredient" placeholderTextColor={theme.colors.textMuted} style={[inputStyle, styles.dynamicName]} />
                <TextInput value={ing.quantity} onChangeText={(value) => updateIngredient(index, 'quantity', value)} placeholder="Qty" placeholderTextColor={theme.colors.textMuted} keyboardType="decimal-pad" style={[inputStyle, styles.dynamicQty]} />
                <TextInput value={ing.unit} onChangeText={(value) => updateIngredient(index, 'unit', value)} placeholder="Unit" placeholderTextColor={theme.colors.textMuted} style={[inputStyle, styles.dynamicUnit]} />
                <Pressable onPress={() => setIngredients((current) => current.filter((_, i) => i !== index))} style={styles.removeButton}>
                  <Text style={[styles.removeText, { color: theme.colors.danger }]}>✕</Text>
                </Pressable>
              </View>
            ))}
            <Pressable onPress={() => setIngredients((current) => [...current, { name: '', quantity: '', unit: '' }])} style={[styles.addButton, { borderColor: theme.colors.primary }]}>
              <Text style={[styles.addText, { color: theme.colors.primary }]}>+ Add ingredient</Text>
            </Pressable>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Steps</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.dynamicRow}>
                <TextInput value={step.instruction} onChangeText={(value) => updateStep(index, 'instruction', value)} placeholder="Step instruction" placeholderTextColor={theme.colors.textMuted} style={[inputStyle, styles.stepText]} multiline />
                <TextInput value={step.duration} onChangeText={(value) => updateStep(index, 'duration', value)} placeholder="Min" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" style={[inputStyle, styles.dynamicQty]} />
                <Pressable onPress={() => setSteps((current) => current.filter((_, i) => i !== index))} style={styles.removeButton}>
                  <Text style={[styles.removeText, { color: theme.colors.danger }]}>✕</Text>
                </Pressable>
              </View>
            ))}
            <Pressable onPress={() => setSteps((current) => [...current, { instruction: '', duration: '' }])} style={[styles.addButton, { borderColor: theme.colors.primary }]}>
              <Text style={[styles.addText, { color: theme.colors.primary }]}>+ Add step</Text>
            </Pressable>

            {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}

            <Pressable onPress={handleSave} disabled={saving} style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Recipe'}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
  },
  loading: {
    marginVertical: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  row3: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  field: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dynamicName: {
    flex: 2,
  },
  dynamicQty: {
    flex: 1,
  },
  dynamicUnit: {
    flex: 1,
  },
  stepText: {
    flex: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  addText: {
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
